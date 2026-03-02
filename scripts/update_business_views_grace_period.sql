-- ============================================
-- Actualización de vistas para manejar negocios con 0 meses y período de gracia
-- ============================================
-- Fecha: 2 de marzo de 2026
-- Propósito: Actualizar las vistas para manejar correctamente negocios
-- con subscription_months = 0 y que dependan de grace_period_expires
-- ============================================

-- Vista actualizada de negocios activos
DROP VIEW IF EXISTS businesses_active CASCADE;

CREATE VIEW businesses_active AS
SELECT 
  b.*,
  CASE 
    -- Negocios con 0 meses dependen solo del período de gracia
    WHEN b.subscription_months = 0 AND b.pago = 'sin pagar' THEN
      CASE 
        WHEN b.grace_period_expires IS NOT NULL AND b.grace_period_expires >= NOW() THEN true
        ELSE false
      END
    -- Sin pagar con período de gracia vencido
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL AND b.grace_period_expires < NOW() THEN false
    -- Ejecutado pero suscripción vencida
    WHEN b.pago = 'ejecutado' AND b.subscription_months > 0 AND b.subscription_started_at IS NOT NULL 
      AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() THEN false
    -- Todos los demás están activos
    ELSE true
  END as is_active,
  CASE 
    -- Para negocios con 0 meses, usar grace_period_expires
    WHEN b.subscription_months = 0 AND b.grace_period_expires IS NOT NULL THEN
      EXTRACT(DAY FROM (b.grace_period_expires - NOW()))
    -- Para negocios sin pagar con período de gracia
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL THEN
      EXTRACT(DAY FROM (b.grace_period_expires - NOW()))
    -- Para negocios ejecutados con suscripción activa
    WHEN b.pago = 'ejecutado' AND b.subscription_months > 0 AND b.subscription_started_at IS NOT NULL THEN
      EXTRACT(DAY FROM ((b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()))
    ELSE NULL
  END as days_remaining,
  CASE 
    -- Para negocios con 0 meses, usar grace_period_expires como fecha de expiración
    WHEN b.subscription_months = 0 AND b.grace_period_expires IS NOT NULL THEN
      b.grace_period_expires
    -- Para negocios sin pagar, usar grace_period_expires
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL THEN
      b.grace_period_expires
    -- Para negocios ejecutados, calcular fecha de expiración
    WHEN b.pago = 'ejecutado' AND b.subscription_months > 0 AND b.subscription_started_at IS NOT NULL THEN
      (b.subscription_started_at + (b.subscription_months || ' months')::interval)
    ELSE NULL
  END as expiry_date
FROM businesses b;

COMMENT ON VIEW businesses_active IS 
'Vista de negocios activos que maneja correctamente negocios con 0 meses y período de gracia';

-- Vista actualizada de negocios próximos a vencer
DROP VIEW IF EXISTS businesses_expiring_soon CASCADE;

CREATE VIEW businesses_expiring_soon AS
SELECT 
  b.id,
  b.name,
  b.profile_name,
  b.pago,
  b.subscription_months,
  CASE 
    -- Para negocios con 0 meses, usar grace_period_expires
    WHEN b.subscription_months = 0 AND b.grace_period_expires IS NOT NULL THEN b.grace_period_expires
    -- Para negocios sin pagar, usar grace_period_expires
    WHEN b.pago = 'sin pagar' THEN b.grace_period_expires
    -- Para negocios ejecutados, calcular fecha de expiración
    WHEN b.subscription_started_at IS NOT NULL AND b.subscription_months > 0 THEN 
      (b.subscription_started_at + (b.subscription_months || ' months')::interval)
    ELSE NULL
  END as expires_at,
  CASE 
    -- Para negocios con 0 meses, calcular días desde grace_period_expires
    WHEN b.subscription_months = 0 AND b.grace_period_expires IS NOT NULL THEN 
      EXTRACT(DAY FROM (b.grace_period_expires - NOW()))
    -- Para negocios sin pagar con período de gracia activo
    WHEN b.pago = 'sin pagar' AND b.grace_period_expires IS NOT NULL THEN 
      EXTRACT(DAY FROM (b.grace_period_expires - NOW()))
    -- Para negocios ejecutados
    WHEN b.subscription_started_at IS NOT NULL AND b.subscription_months > 0 THEN 
      EXTRACT(DAY FROM ((b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()))
    ELSE NULL
  END as days_remaining,
  b.pago as status
FROM businesses b
WHERE 
  (
    -- Negocios con 0 meses próximos a vencer (3 días)
    (b.subscription_months = 0 AND b.grace_period_expires > NOW() 
     AND b.grace_period_expires < NOW() + INTERVAL '3 days')
    OR
    -- Negocios sin pagar con periodo de gracia activo próximo a vencer (3 días)
    (b.pago = 'sin pagar' AND b.grace_period_expires > NOW() 
     AND b.grace_period_expires < NOW() + INTERVAL '3 days')
    OR
    -- Negocios ejecutados próximos a vencer (7 días)
    (b.pago = 'ejecutado' AND b.subscription_months > 0 AND b.subscription_started_at IS NOT NULL 
     AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) > NOW() 
     AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() + INTERVAL '7 days')
  )
ORDER BY days_remaining ASC;

COMMENT ON VIEW businesses_expiring_soon IS 
'Vista de negocios próximos a vencer que maneja correctamente el período de gracia y 0 meses';

-- Función para actualizar is_public basado en estado de pago y expiración
CREATE OR REPLACE FUNCTION update_business_visibility()
RETURNS void AS $$
BEGIN
  -- Ocultar negocios con 0 meses y período de gracia expirado
  UPDATE businesses
  SET is_public = false
  WHERE subscription_months = 0 
    AND pago = 'sin pagar'
    AND grace_period_expires IS NOT NULL 
    AND grace_period_expires < NOW()
    AND is_public = true;
  
  -- Ocultar negocios sin pagar con período de gracia expirado
  UPDATE businesses
  SET is_public = false
  WHERE pago = 'sin pagar'
    AND grace_period_expires IS NOT NULL 
    AND grace_period_expires < NOW()
    AND is_public = true;
  
  -- Ocultar negocios ejecutados con suscripción vencida
  UPDATE businesses
  SET is_public = false
  WHERE pago = 'ejecutado'
    AND subscription_months > 0
    AND subscription_started_at IS NOT NULL
    AND (subscription_started_at + (subscription_months || ' months')::interval) < NOW()
    AND is_public = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_business_visibility IS 
'Actualiza is_public a false para negocios con período de gracia o suscripción expirada';

-- Verificación
SELECT 'Vistas actualizadas correctamente para manejar 0 meses y período de gracia' as status;

-- Ejecutar actualización de visibilidad
SELECT update_business_visibility();
