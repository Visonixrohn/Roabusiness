-- ============================================
-- Script URGENTE: Remover restricción NOT NULL
-- ============================================
-- Ejecutar PRIMERO antes de add_grace_period_logic.sql
-- Propósito: Permitir NULL en subscription_started_at para negocios "sin pagar"
-- ============================================

-- Remover restricción NOT NULL de subscription_started_at
ALTER TABLE businesses 
ALTER COLUMN subscription_started_at DROP NOT NULL;

-- Verificación
SELECT 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'businesses' 
  AND column_name = 'subscription_started_at';
