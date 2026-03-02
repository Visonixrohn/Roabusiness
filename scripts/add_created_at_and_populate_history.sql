-- ============================================
-- Script para agregar columna created_at y poblar subscription_history
-- ============================================
-- Fecha: 2 de marzo de 2026
-- Propósito: 
-- 1. Agregar columna created_at a businesses
-- 2. Copiar datos de subscription_started_at a created_at
-- 3. Insertar registros históricos en subscription_history
-- ============================================

-- ============================================
-- PASO 1: Agregar columna created_at
-- ============================================
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- ============================================
-- PASO 2: Copiar datos de subscription_started_at a created_at
-- ============================================
UPDATE businesses 
SET created_at = subscription_started_at 
WHERE created_at IS NULL AND subscription_started_at IS NOT NULL;

-- Para negocios sin subscription_started_at, usar la fecha actual como fallback
UPDATE businesses 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- ============================================
-- PASO 3: Poblar subscription_history con datos históricos
-- ============================================
-- Insertar registros históricos para negocios que tienen suscripción activa pero no tienen registro en subscription_history

INSERT INTO subscription_history (
  business_id,
  subscription_months,
  started_at,
  expires_at,
  amount_paid,
  status
)
SELECT 
  b.id,
  b.subscription_months,
  b.subscription_started_at,
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) as expires_at,
  sp.price_lempiras,
  CASE 
    WHEN (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() THEN 'vencida'
    ELSE 'activa'
  END
FROM businesses b
INNER JOIN subscription_plans sp ON sp.months = b.subscription_months
WHERE b.subscription_started_at IS NOT NULL
  AND b.subscription_months IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM subscription_history sh 
    WHERE sh.business_id = b.id
  );

-- ============================================
-- PASO 4: Actualizar vista businesses_financial_view para usar created_at
-- ============================================
DROP VIEW IF EXISTS businesses_financial_view CASCADE;

CREATE VIEW businesses_financial_view AS
SELECT 
  b.id,
  b.name,
  b.profile_name,
  b.pago,
  b.subscription_months,
  b.subscription_started_at,
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) as subscription_expires_at,
  b.created_at,
  sp.description as plan_name,
  sp.price_lempiras as plan_price,
  CASE 
    WHEN b.subscription_started_at IS NULL THEN 'Sin suscripción'
    WHEN (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() THEN 'Vencida'
    WHEN (b.subscription_started_at + (b.subscription_months || ' months')::interval) < NOW() + INTERVAL '7 days' THEN 'Por vencer'
    ELSE 'Activa'
  END as subscription_status,
  CASE 
    WHEN b.subscription_started_at IS NOT NULL 
      AND (b.subscription_started_at + (b.subscription_months || ' months')::interval) > NOW() 
    THEN (b.subscription_started_at + (b.subscription_months || ' months')::interval) - NOW()
    ELSE NULL
  END as days_until_expiry
FROM businesses b
LEFT JOIN subscription_plans sp ON sp.months = b.subscription_months;

-- ============================================
-- PASO 5: Verificación de resultados
-- ============================================
-- Ver cuántos negocios se actualizaron
SELECT 
  COUNT(*) as total_businesses,
  COUNT(created_at) as businesses_with_created_at,
  COUNT(*) - COUNT(created_at) as businesses_without_created_at
FROM businesses;

-- Ver cuántos registros se insertaron en subscription_history
SELECT 
  COUNT(*) as total_registros_historicos
FROM subscription_history;

-- Ver resumen de negocios y sus suscripciones
SELECT 
  b.id,
  b.name,
  b.created_at,
  b.subscription_started_at,
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) as subscription_expires_at,
  b.subscription_months,
  b.pago,
  COUNT(sh.id) as registros_en_historial
FROM businesses b
LEFT JOIN subscription_history sh ON sh.business_id = b.id
GROUP BY b.id, b.name, b.created_at, b.subscription_started_at, b.subscription_months, b.pago
ORDER BY b.created_at DESC;
