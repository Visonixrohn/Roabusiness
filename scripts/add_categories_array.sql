-- Migración: Agregar columna categories (array) a la tabla businesses
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar la columna categories como array de texto
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- 2. Migrar datos existentes: copiar el valor de category al array categories
--    Solo para los registros que aún no tienen categories poblado
UPDATE businesses
SET categories = ARRAY[category]
WHERE
  (categories IS NULL OR array_length(categories, 1) IS NULL)
  AND category IS NOT NULL
  AND category <> '';

-- 3. (Opcional) Crear índice GIN para búsquedas eficientes sobre el array
CREATE INDEX IF NOT EXISTS businesses_categories_gin_idx
  ON businesses USING GIN (categories);

-- Verificar resultado
SELECT id, name, category, categories
FROM businesses
LIMIT 10;
