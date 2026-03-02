-- ============================================
-- Actualización de renovar_suscripcion para generar recibo
-- ============================================
-- Fecha: 2 de marzo de 2026
-- Propósito: Modificar la función renovar_suscripcion para que retorne
-- datos del recibo en formato JSONB, similar a process_business_payment
-- ============================================

-- Eliminar la función existente primero (necesario para cambiar el tipo de retorno)
DROP FUNCTION IF EXISTS public.renovar_suscripcion(UUID, INTEGER, DECIMAL, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.renovar_suscripcion(
  p_business_id UUID,
  p_new_months INTEGER,
  p_amount_paid DECIMAL,
  p_payment_method TEXT DEFAULT NULL,
  p_admin_user TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_expires_at TIMESTAMPTZ;
  v_new_started_at TIMESTAMPTZ;
  v_business_name TEXT;
  v_profile_name TEXT;
  v_transaction_id BIGINT;
  v_was_active BOOLEAN;
  v_old_expiry TIMESTAMPTZ;
BEGIN
  -- Obtener datos del negocio
  SELECT 
    name, 
    profile_name,
    subscription_started_at,
    (subscription_started_at + (subscription_months || ' months')::interval)
  INTO 
    v_business_name,
    v_profile_name,
    v_new_started_at,
    v_current_expires_at
  FROM public.businesses
  WHERE id = p_business_id;
  
  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'Negocio no encontrado';
  END IF;
  
  -- Guardar estado anterior
  v_old_expiry := v_current_expires_at;
  v_was_active := (v_current_expires_at > NOW());
  
  -- Si la suscripción ya venció, empezar desde ahora
  -- Si aún está activa, empezar desde la fecha de expiración
  IF v_current_expires_at > NOW() THEN
    v_new_started_at := v_current_expires_at;
  ELSE
    v_new_started_at := NOW();
  END IF;
  
  -- Registrar el historial de la suscripción anterior SOLO si existe
  INSERT INTO public.subscription_history (
    business_id,
    subscription_months,
    started_at,
    expires_at,
    amount_paid,
    status
  )
  SELECT 
    id,
    subscription_months,
    COALESCE(subscription_started_at, NOW()), -- Usar NOW() si es NULL
    COALESCE(
      (subscription_started_at + (subscription_months || ' months')::interval),
      NOW()
    ),
    0, -- No guardamos el monto de la suscripción anterior
    CASE 
      WHEN subscription_started_at IS NULL THEN 'vencida'
      WHEN (subscription_started_at + (subscription_months || ' months')::interval) > NOW() 
      THEN 'renovada'
      ELSE 'vencida'
    END
  FROM public.businesses
  WHERE id = p_business_id
    AND subscription_months > 0; -- Solo registrar si hay meses
  
  -- Actualizar el negocio con la nueva suscripción
  UPDATE public.businesses
  SET 
    subscription_months = p_new_months,
    subscription_started_at = v_new_started_at,
    pago = 'ejecutado',
    is_public = true, -- Hacer visible el negocio al renovar
    grace_period_expires = NULL -- Limpiar periodo de gracia si existía
  WHERE id = p_business_id;
  
  -- Registrar la transacción
  INSERT INTO public.transactions (
    business_id,
    tipo,
    concepto,
    monto,
    metodo_pago,
    created_by,
    notas
  ) VALUES (
    p_business_id,
    'ingreso',
    'Renovación de suscripción - ' || p_new_months || ' meses',
    p_amount_paid,
    p_payment_method,
    p_admin_user,
    CASE 
      WHEN v_was_active THEN 'Renovación con días acumulados'
      ELSE 'Renovación después de expiración'
    END
  )
  RETURNING id INTO v_transaction_id;
  
  -- Registrar la nueva suscripción en el historial
  INSERT INTO public.subscription_history (
    business_id,
    subscription_months,
    started_at,
    expires_at,
    amount_paid,
    status
  ) VALUES (
    p_business_id,
    p_new_months,
    v_new_started_at,
    (v_new_started_at + (p_new_months || ' months')::interval),
    p_amount_paid,
    'activa'
  );
  
  -- Retornar información para el recibo
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'business_id', p_business_id,
    'business_name', v_business_name,
    'profile_name', v_profile_name,
    'plan_months', p_new_months,
    'amount_paid', p_amount_paid,
    'payment_method', COALESCE(p_payment_method, 'efectivo'),
    'payment_date', NOW(),
    'expires_at', (v_new_started_at + (p_new_months || ' months')::interval),
    'was_grace_period', false,
    'was_renewal', true,
    'had_remaining_days', v_was_active,
    'days_accumulated', CASE 
      WHEN v_was_active THEN EXTRACT(DAY FROM (v_old_expiry - NOW()))
      ELSE 0
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Comentario
COMMENT ON FUNCTION public.renovar_suscripcion IS 
'Renueva una suscripción, acumula días si está activa, y retorna datos para el recibo en formato JSONB';

-- Verificación
SELECT 'Función renovar_suscripcion actualizada correctamente' as status;
