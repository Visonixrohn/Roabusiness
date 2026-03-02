-- ============================================
-- Script para poblar transacciones históricas
-- ============================================
-- Fecha: 2 de marzo de 2026
-- Propósito: 
-- 1. Insertar transacciones históricas para negocios existentes
-- 2. Basarse en los planes de suscripción registrados
-- 3. Crear vista con nombres de negocios en transacciones
-- ============================================

-- ============================================
-- PASO 1: Insertar transacciones históricas
-- ============================================
-- Insertar una transacción de ingreso por cada negocio que ya tiene suscripción
-- y que aún no tiene transacción registrada

INSERT INTO transactions (
  business_id,
  tipo,
  concepto,
  monto,
  fecha,
  metodo_pago,
  created_by,
  notas
)
SELECT 
  b.id,
  'ingreso',
  'Pago de suscripción - Plan de ' || b.subscription_months || ' meses',
  sp.price_lempiras,
  b.subscription_started_at,
  CASE 
    WHEN b.pago = 'ejecutado' THEN 'efectivo'
    ELSE 'pendiente'
  END,
  'admin',
  'Transacción histórica - Migración de datos existentes (' || b.name || ')'
FROM businesses b
INNER JOIN subscription_plans sp ON sp.months = b.subscription_months
WHERE b.subscription_started_at IS NOT NULL
  AND b.subscription_months IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM transactions t 
    WHERE t.business_id = b.id
  );

-- ============================================
-- PASO 2: Crear vista de transacciones con nombre de negocio
-- ============================================
DROP VIEW IF EXISTS transactions_with_business CASCADE;

CREATE VIEW transactions_with_business AS
SELECT 
  t.id,
  t.business_id,
  b.name as business_name,
  b.profile_name as business_profile,
  t.tipo,
  t.concepto,
  t.monto,
  t.fecha,
  t.metodo_pago,
  t.notas,
  t.created_by,
  t.created_at,
  CASE 
    WHEN t.tipo = 'ingreso' THEN '✅ Ingreso'
    WHEN t.tipo = 'egreso' THEN '❌ Egreso'
    WHEN t.tipo = 'reembolso' THEN '🔄 Reembolso'
    ELSE t.tipo
  END as tipo_display
FROM transactions t
INNER JOIN businesses b ON b.id = t.business_id
ORDER BY t.fecha DESC, t.created_at DESC;

-- ============================================
-- PASO 3: Vista de resumen por negocio
-- ============================================
DROP VIEW IF EXISTS business_transactions_summary CASCADE;

CREATE VIEW business_transactions_summary AS
SELECT 
  b.id as business_id,
  b.name as business_name,
  b.profile_name,
  COUNT(t.id) as total_transactions,
  SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END) as total_ingresos,
  SUM(CASE WHEN t.tipo = 'egreso' THEN t.monto ELSE 0 END) as total_egresos,
  SUM(CASE WHEN t.tipo = 'reembolso' THEN t.monto ELSE 0 END) as total_reembolsos,
  SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END) - 
  SUM(CASE WHEN t.tipo = 'egreso' THEN t.monto ELSE 0 END) as balance_neto,
  MAX(t.fecha) as ultima_transaccion
FROM businesses b
LEFT JOIN transactions t ON t.business_id = b.id
GROUP BY b.id, b.name, b.profile_name
ORDER BY balance_neto DESC;

-- ============================================
-- PASO 4: Verificación de resultados
-- ============================================
-- Ver cuántas transacciones se insertaron
SELECT 
  COUNT(*) as total_transacciones_insertadas
FROM transactions 
WHERE notas LIKE '%Migración de datos existentes%';

-- Ver resumen de transacciones por tipo
SELECT 
  tipo,
  COUNT(*) as cantidad,
  SUM(monto) as monto_total
FROM transactions
GROUP BY tipo
ORDER BY monto_total DESC;

-- Ver las últimas 10 transacciones con nombre de negocio
SELECT 
  business_name,
  tipo,
  concepto,
  monto,
  fecha,
  metodo_pago
FROM transactions_with_business
LIMIT 10;

-- Ver resumen por negocio (top 10 por ingresos)
SELECT 
  business_name,
  total_transactions,
  total_ingresos,
  total_egresos,
  balance_neto,
  ultima_transaccion
FROM business_transactions_summary
ORDER BY total_ingresos DESC
LIMIT 10;
