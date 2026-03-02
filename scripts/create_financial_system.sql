-- ========================================
-- SISTEMA DE GESTIÓN FINANCIERA
-- ========================================

-- 1. TABLA DE PLANES DE SUSCRIPCIÓN
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  months INTEGER NOT NULL UNIQUE,
  price_lempiras DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar planes iniciales
INSERT INTO public.subscription_plans (months, price_lempiras, description)
VALUES 
  (6, 300.00, 'Plan de 6 meses'),
  (12, 550.00, 'Plan de 12 meses (descuento)'),
  (18, 800.00, 'Plan de 18 meses'),
  (24, 1000.00, 'Plan de 24 meses (mejor precio)')
ON CONFLICT (months) DO NOTHING;

-- 2. TABLA DE TRANSACCIONES/PAGOS
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso', 'reembolso')),
  concepto TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metodo_pago TEXT, -- efectivo, transferencia, tarjeta
  notas TEXT,
  created_by TEXT, -- usuario admin que registró
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_business ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_fecha ON public.transactions(fecha);
CREATE INDEX IF NOT EXISTS idx_transactions_tipo ON public.transactions(tipo);

-- 3. TABLA DE COSTOS DE PUBLICIDAD
CREATE TABLE IF NOT EXISTS public.advertising_costs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  plataforma TEXT, -- Facebook, Instagram, Google Ads, etc.
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advertising_costs_fecha ON public.advertising_costs(fecha);

-- 4. TABLA DE HISTORIAL DE SUSCRIPCIONES
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  subscription_months INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('activa', 'vencida', 'cancelada', 'renovada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_business ON public.subscription_history(business_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_status ON public.subscription_history(status);
CREATE INDEX IF NOT EXISTS idx_subscription_history_expires ON public.subscription_history(expires_at);

-- 5. VISTA: NEGOCIOS CON INFORMACIÓN FINANCIERA
CREATE OR REPLACE VIEW public.businesses_financial_view AS
SELECT 
  b.id,
  b.name,
  b.profile_name,
  b.pago,
  b.subscription_months,
  b.subscription_started_at,
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) AS subscription_expires_at,
  CASE 
    WHEN (b.subscription_started_at + (b.subscription_months || ' months')::interval) > NOW() 
    THEN 'activa'
    ELSE 'vencida'
  END AS subscription_status,
  EXTRACT(DAY FROM (b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()) AS days_until_expiration,
  sp.price_lempiras AS subscription_price,
  b.subscription_started_at AS registered_at
FROM public.businesses b
LEFT JOIN public.subscription_plans sp ON sp.months = b.subscription_months;

-- 6. VISTA: RESUMEN FINANCIERO
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  -- Ingresos totales
  (SELECT COALESCE(SUM(monto), 0) FROM public.transactions WHERE tipo = 'ingreso') AS ingresos_totales,
  
  -- Egresos totales
  (SELECT COALESCE(SUM(monto), 0) FROM public.transactions WHERE tipo = 'egreso') AS egresos_totales,
  
  -- Costos de publicidad totales
  (SELECT COALESCE(SUM(monto), 0) FROM public.advertising_costs) AS costos_publicidad,
  
  -- Balance total
  (
    (SELECT COALESCE(SUM(monto), 0) FROM public.transactions WHERE tipo = 'ingreso') -
    (SELECT COALESCE(SUM(monto), 0) FROM public.transactions WHERE tipo = 'egreso') -
    (SELECT COALESCE(SUM(monto), 0) FROM public.advertising_costs)
  ) AS balance_total,
  
  -- Negocios con pago pendiente
  (SELECT COUNT(*) FROM public.businesses WHERE pago = 'sin pagar') AS negocios_sin_pagar,
  
  -- Negocios con pago ejecutado
  (SELECT COUNT(*) FROM public.businesses WHERE pago = 'ejecutado') AS negocios_pagados,
  
  -- Suscripciones vencidas
  (SELECT COUNT(*) FROM public.businesses 
   WHERE (subscription_started_at + (subscription_months || ' months')::interval) < NOW()) AS suscripciones_vencidas,
  
  -- Suscripciones activas
  (SELECT COUNT(*) FROM public.businesses 
   WHERE (subscription_started_at + (subscription_months || ' months')::interval) >= NOW()) AS suscripciones_activas;

-- 7. VISTA: INGRESOS POR MES
CREATE OR REPLACE VIEW public.ingresos_por_mes AS
SELECT 
  DATE_TRUNC('month', fecha) AS mes,
  COUNT(*) AS cantidad_transacciones,
  SUM(monto) AS ingresos_mes
FROM public.transactions
WHERE tipo = 'ingreso'
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;

-- 8. VISTA: SUSCRIPCIONES POR VENCER (próximos 30 días)
CREATE OR REPLACE VIEW public.suscripciones_por_vencer AS
SELECT 
  b.id,
  b.name,
  b.profile_name,
  b.subscription_months,
  b.subscription_started_at,
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) AS expires_at,
  EXTRACT(DAY FROM (b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()) AS days_remaining,
  CASE 
    WHEN b.contact::jsonb ? 'phone' THEN b.contact::jsonb->>'phone'
    ELSE NULL
  END AS phone,
  CASE 
    WHEN b.contact::jsonb ? 'email' THEN b.contact::jsonb->>'email'
    ELSE NULL
  END AS email
FROM public.businesses b
WHERE 
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY expires_at ASC;

-- 9. FUNCIÓN: Registrar renovación de suscripción
CREATE OR REPLACE FUNCTION public.renovar_suscripcion(
  p_business_id UUID,
  p_new_months INTEGER,
  p_amount_paid DECIMAL,
  p_payment_method TEXT DEFAULT NULL,
  p_admin_user TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_expires_at TIMESTAMPTZ;
  v_new_started_at TIMESTAMPTZ;
BEGIN
  -- Obtener fecha de expiración actual
  SELECT (subscription_started_at + (subscription_months || ' months')::interval)
  INTO v_current_expires_at
  FROM public.businesses
  WHERE id = p_business_id;
  
  -- Si la suscripción ya venció, empezar desde ahora
  -- Si aún está activa, empezar desde la fecha de expiración
  IF v_current_expires_at > NOW() THEN
    v_new_started_at := v_current_expires_at;
  ELSE
    v_new_started_at := NOW();
  END IF;
  
  -- Registrar el historial de la suscripción anterior
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
    subscription_started_at,
    (subscription_started_at + (subscription_months || ' months')::interval),
    0, -- No guardamos el monto de la suscripción anterior
    CASE 
      WHEN (subscription_started_at + (subscription_months || ' months')::interval) > NOW() 
      THEN 'renovada'
      ELSE 'vencida'
    END
  FROM public.businesses
  WHERE id = p_business_id;
  
  -- Actualizar el negocio con la nueva suscripción
  UPDATE public.businesses
  SET 
    subscription_months = p_new_months,
    subscription_started_at = v_new_started_at,
    pago = 'ejecutado'
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
    'Renovación automática'
  );
  
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
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCIÓN: Cancelar suscripción
CREATE OR REPLACE FUNCTION public.cancelar_suscripcion(
  p_business_id UUID,
  p_razon TEXT DEFAULT NULL,
  p_admin_user TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Registrar en historial como cancelada
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
    subscription_started_at,
    (subscription_started_at + (subscription_months || ' months')::interval),
    0,
    'cancelada'
  FROM public.businesses
  WHERE id = p_business_id;
  
  -- Registrar transacción de cancelación
  INSERT INTO public.transactions (
    business_id,
    tipo,
    concepto,
    monto,
    created_by,
    notas
  ) VALUES (
    p_business_id,
    'egreso',
    'Cancelación de suscripción',
    0,
    p_admin_user,
    COALESCE(p_razon, 'Sin razón especificada')
  );
END;
$$ LANGUAGE plpgsql;

-- 11. Políticas RLS (Row Level Security)
-- Solo los administradores pueden ver datos financieros

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertising_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Política para admin (necesitarás ajustar esto según tu autenticación de admin)
CREATE POLICY "Admin can view subscription_plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admin can manage subscription_plans" ON public.subscription_plans FOR ALL USING (true);

CREATE POLICY "Admin can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Admin can manage transactions" ON public.transactions FOR ALL USING (true);

CREATE POLICY "Admin can view advertising_costs" ON public.advertising_costs FOR SELECT USING (true);
CREATE POLICY "Admin can manage advertising_costs" ON public.advertising_costs FOR ALL USING (true);

CREATE POLICY "Admin can view subscription_history" ON public.subscription_history FOR SELECT USING (true);
CREATE POLICY "Admin can manage subscription_history" ON public.subscription_history FOR ALL USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.subscription_plans IS 'Planes de suscripción disponibles para los negocios';
COMMENT ON TABLE public.transactions IS 'Registro de todas las transacciones financieras (ingresos y egresos)';
COMMENT ON TABLE public.advertising_costs IS 'Costos de publicidad de la plataforma';
COMMENT ON TABLE public.subscription_history IS 'Historial de todas las suscripciones de los negocios';
COMMENT ON VIEW public.businesses_financial_view IS 'Vista con información financiera de cada negocio';
COMMENT ON VIEW public.financial_summary IS 'Resumen general de la situación financiera de la plataforma';
