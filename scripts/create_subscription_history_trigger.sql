-- ============================================
-- Trigger para registrar automáticamente en subscription_history
-- ============================================
-- Fecha: 2 de marzo de 2026
-- Propósito: Crear trigger que inserte automáticamente en subscription_history
--            cuando se crea o actualiza un negocio con suscripción
-- ============================================

-- ============================================
-- FUNCIÓN: Registrar nueva suscripción en historial
-- ============================================
CREATE OR REPLACE FUNCTION register_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
  v_amount DECIMAL(10,2);
BEGIN
  -- Solo procesar si hay datos de suscripción
  IF NEW.subscription_months IS NOT NULL AND NEW.subscription_started_at IS NOT NULL THEN
    
    -- Obtener el precio según los meses
    SELECT price_lempiras 
    INTO v_amount
    FROM subscription_plans 
    WHERE months = NEW.subscription_months
    LIMIT 1;
    
    -- Si es un INSERT o si cambió la fecha de inicio de suscripción
    IF (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND OLD.subscription_started_at IS DISTINCT FROM NEW.subscription_started_at) THEN
      
      -- Insertar en subscription_history
      INSERT INTO subscription_history (
        business_id,
        subscription_months,
        started_at,
        expires_at,
        amount_paid,
        status
      ) VALUES (
        NEW.id,
        NEW.subscription_months,
        NEW.subscription_started_at,
        (NEW.subscription_started_at + (NEW.subscription_months || ' months')::interval),
        COALESCE(v_amount, 0),
        CASE 
          WHEN (NEW.subscription_started_at + (NEW.subscription_months || ' months')::interval) < NOW() THEN 'vencida'
          ELSE 'activa'
        END
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Ejecutar función en INSERT y UPDATE
-- ============================================
DROP TRIGGER IF EXISTS trigger_register_subscription ON businesses;

CREATE TRIGGER trigger_register_subscription
AFTER INSERT OR UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION register_subscription_change();

-- ============================================
-- Verificación
-- ============================================
COMMENT ON FUNCTION register_subscription_change() IS 
'Función de trigger que registra automáticamente en subscription_history cuando se crea o modifica una suscripción en businesses';

COMMENT ON TRIGGER trigger_register_subscription ON businesses IS 
'Trigger que dispara el registro automático de suscripciones en el historial';

-- ============================================
-- Prueba del trigger (puedes descomentar para probar)
-- ============================================
-- INSERT INTO businesses (
--   name, 
--   category, 
--   departamento, 
--   municipio,
--   subscription_months,
--   subscription_started_at,
--   subscription_expires_at
-- ) VALUES (
--   'Negocio de Prueba',
--   'Restaurante',
--   'Francisco Morazán',
--   'Tegucigalpa',
--   12,
--   NOW(),
--   NOW() + INTERVAL '12 months'
-- );

-- Ver el resultado
-- SELECT * FROM subscription_history ORDER BY created_at DESC LIMIT 1;
