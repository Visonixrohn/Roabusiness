-- ============================================================
-- FIX: Agregar columna categories[] a businesses y actualizar vista
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna categories (TEXT[]) si no existe
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- 2. Migrar datos existentes: poner category en categories si categories está vacío
UPDATE businesses
SET categories = ARRAY[category]
WHERE
  (categories IS NULL OR array_length(categories, 1) IS NULL OR array_length(categories, 1) = 0)
  AND category IS NOT NULL
  AND TRIM(category) <> '';

-- 3. Crear índice GIN para búsquedas eficientes por categoría (si no existe)
CREATE INDEX IF NOT EXISTS idx_businesses_categories
  ON businesses USING GIN (categories);

-- 4. Recrear la vista (DROP + CREATE refresca el SELECT b.* para incluir categories)
DROP VIEW IF EXISTS vista_negocios_destacados;

CREATE VIEW vista_negocios_destacados AS
SELECT
  b.*,
  COALESCE(nd.contador, 0)        AS contador_contactos,
  nd.updated_at                   AS ultimo_contacto,
  COALESCE(brs.average_rating, 0) AS average_rating,
  COALESCE(brs.total_ratings, 0)  AS total_ratings
FROM businesses b
LEFT JOIN negocio_destacado nd       ON b.id = nd.business_id
LEFT JOIN business_ratings_stats brs ON b.id = brs.business_id
WHERE b.is_public = true
ORDER BY
  COALESCE(brs.total_ratings, 0)  DESC,
  COALESCE(brs.average_rating, 0) DESC,
  COALESCE(nd.contador, 0)        DESC;

COMMENT ON VIEW vista_negocios_destacados IS
  'Vista de negocios destacados con columna categories[] incluida.';

-- 5. Verificar resultado
SELECT id, name, category, categories
FROM businesses
ORDER BY created_at DESC
LIMIT 10;
