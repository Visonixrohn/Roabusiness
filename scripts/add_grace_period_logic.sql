-- ============================================
-- Sistema de Días de Gracia y Actualización de Pagos
-- ============================================
-- Fecha: 2 de marzo de 2026
-- Propósito: 
-- 1. Agregar columna grace_period_expires para negocios sin pagar
-- 2. Función para actualizar plan cuando se registra pago
-- 3. Vista para negocios activos (filtra vencidos)
-- ============================================

-- ============================================
-- PASO 1: Agregar columna para periodo de gracia
-- ============================================
-- Primero, remover restricción NOT NULL de subscription_started_at
ALTER TABLE businesses 
ALTER COLUMN subscription_started_at DROP NOT NULL;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS grace_period_expires TIMESTAMPTZ;

COMMENT ON COLUMN businesses.grace_period_expires IS 
'Fecha de vencimiento del periodo de gracia para negocios "sin pagar". Después de esta fecha, el negocio se oculta automáticamente.';

-- ============================================
-- PASO 2: Función para procesar pago y actualizar plan
-- ============================================
CREATE OR REPLACE FUNCTION process_business_payment(
  p_business_id UUID,
  p_plan_months INTEGER,
  p_amount_paid DECIMAL(10,2),
  p_payment_method TEXT DEFAULT 'efectivo',
  p_created_by TEXT DEFAULT 'admin'
)
RETURNS JSONB AS $$
DECLARE
  v_business_name TEXT;
  v_profile_name TEXT;
  v_transaction_id BIGINT;
  v_old_status TEXT;
BEGIN
  -- Obtener datos del negocio
  SELECT name, profile_name, pago 
  INTO v_business_name, v_profile_name, v_old_status
  FROM businesses 
  WHERE id = p_business_id;
  
  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'Negocio no encontrado';
  END IF;
  
  -- Actualizar el negocio
  UPDATE businesses
  SET 
    pago = 'ejecutado',
    subscription_months = p_plan_months,
    subscription_started_at = NOW(),
    grace_period_expires = NULL -- Limpiar periodo de gracia
  WHERE id = p_business_id;
  
  -- Crear transacción
  INSERT INTO transactions (
    business_id,
    tipo,
    concepto,
    monto,
    fecha,
    metodo_pago,
    created_by,
    notas
  ) VALUES (
    p_business_id,
    'ingreso',
    'Pago de suscripción - Plan de ' || p_plan_months || ' meses',
    p_amount_paid,
    NOW(),
    p_payment_method,
    p_created_by,
    CASE 
      WHEN v_old_status = 'sin pagar' THEN 'Primer pago - Activación de cuenta'
      ELSE 'Renovación de suscripción'
    END
  )
  RETURNING id INTO v_transaction_id;
  
  -- Registrar en historial (el trigger lo hace automáticamente)
  
  -- Retornar información para el recibo
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'business_id', p_business_id,
    'business_name', v_business_name,
    'profile_name', v_profile_name,
    'plan_months', p_plan_months,
    'amount_paid', p_amount_paid,
    'payment_method', p_payment_method,
    'payment_date', NOW(),
    'expires_at', NOW() + (p_plan_months || ' months')::interval,
    'was_grace_period', CASE WHEN v_old_status = 'sin pagar' THEN true ELSE false END
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 3: Vista de negocios activos (filtra vencidos y sin período de gracia)
-- ============================================
DROP VIEW IF EXISTS businesses_active CASCADE;

CREATE VIEW businesses_active AS
SELECT 
  b.*,
  CASE 
    -- Sin pagar y periodo de gracia vencido
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL AND b.grace_period_expires < NOW() THEN false
    -- Ejecutado pero suscripción vencida
    WHEN b.pago = 'ejecutado' AND b.subscription_started_at IS NOT NULL 
      AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() THEN false
    -- Todos los demás están activos
    ELSE true
  END as is_active,
  CASE 
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL THEN
      EXTRACT(DAY FROM (b.grace_period_expires - NOW()))
    WHEN b.pago = 'ejecutado' AND b.subscription_started_at IS NOT NULL THEN
      EXTRACT(DAY FROM ((b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()))
    ELSE NULL
  END as days_remaining
FROM businesses b;

-- ============================================
-- PASO 4: Función para registrar negocio con días de gracia
-- ============================================
CREATE OR REPLACE FUNCTION register_business_with_grace_period(
  p_business_id UUID,
  p_grace_days INTEGER DEFAULT 7
)
RETURNS VOID AS $$
BEGIN
  -- Actualizar negocio con periodo de gracia
  UPDATE businesses
  SET 
    pago = 'sin pagar',
    grace_period_expires = NOW() + (p_grace_days || ' days')::interval
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 5: Configuración de días de gracia por defecto
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_config (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_config (config_key, config_value, description)
VALUES 
  ('grace_period_days', '7', 'Días de gracia para negocios sin pagar'),
  ('logo_url', '/logo.png', 'URL del logo para recibos'),
  ('business_name', 'Roabusiness', 'Nombre de la plataforma'),
  ('business_address', 'Honduras', 'Dirección de la plataforma'),
  ('business_phone', '+504 0000-0000', 'Teléfono de contacto')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- PASO 6: Vista de negocios próximos a vencer
-- ============================================
DROP VIEW IF EXISTS businesses_expiring_soon CASCADE;

CREATE VIEW businesses_expiring_soon AS
SELECT 
  b.id,
  b.name,
  b.profile_name,
  b.pago,
  b.subscription_months,
  CASE 
    WHEN b.pago = 'sin pagar' THEN b.grace_period_expires
    WHEN b.subscription_started_at IS NOT NULL THEN (b.subscription_started_at + (b.subscription_months || ' months')::interval)
    ELSE NULL
  END as expires_at,
  CASE 
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL THEN 
      EXTRACT(DAY FROM (b.grace_period_expires - NOW()))
    WHEN b.subscription_started_at IS NOT NULL THEN 
      EXTRACT(DAY FROM ((b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()))
    ELSE NULL
  END as days_remaining,
  b.pago as status
FROM businesses b
WHERE 
  (
    -- Negocios sin pagar con periodo de gracia activo
    (b.pago = 'sin pagar' AND b.grace_period_expires > NOW() AND b.grace_period_expires < NOW() + INTERVAL '3 days')
    OR
    -- Negocios ejecutados próximos a vencer (7 días)
    (b.pago = 'ejecutado' AND b.subscription_started_at IS NOT NULL 
     AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) > NOW() 
     AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() + INTERVAL '7 days')
  )
ORDER BY days_remaining ASC;

-- ============================================
-- Verificación
-- ============================================
COMMENT ON FUNCTION process_business_payment IS 
'Procesa el pago de un negocio, actualiza su plan y estado, y retorna datos para el recibo';

COMMENT ON FUNCTION register_business_with_grace_period IS 
'Registra un negocio con periodo de gracia (sin pago inmediato)';

COMMENT ON VIEW businesses_active IS 
'Vista de negocios activos (excluye vencidos y sin periodo de gracia)';

COMMENT ON VIEW businesses_expiring_soon IS 
'Vista de negocios próximos a vencer (útil para alertas)';

-- Ver configuración
SELECT * FROM system_config;

-- Ver negocios próximos a vencer
SELECT * FROM businesses_expiring_soon;
