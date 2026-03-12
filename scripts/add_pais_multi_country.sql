-- ============================================================
-- MIGRACIÓN: Soporte Multi-País
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna pais a la tabla businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS pais VARCHAR(100) NOT NULL DEFAULT 'Honduras';

-- 2. Retrocompatibilidad: todos los negocios existentes → Honduras
UPDATE businesses
  SET pais = 'Honduras'
  WHERE pais IS NULL OR pais = '';

-- 3. Índice para filtrar rápido por país
CREATE INDEX IF NOT EXISTS idx_businesses_pais ON businesses(pais);

-- 4. Índice compuesto (país + suscripción activa — consultas frecuentes)
CREATE INDEX IF NOT EXISTS idx_businesses_pais_public
  ON businesses(pais, is_public);

-- 5. Actualizar la vista de negocios destacados para incluir pais y ratings
-- (Primero eliminamos la vista existente y la recreamos)
DROP VIEW IF EXISTS vista_negocios_destacados;

CREATE VIEW vista_negocios_destacados AS
SELECT
  b.*,
  COALESCE(r.average_rating, 0) AS average_rating,
  COALESCE(r.total_ratings, 0)  AS total_ratings
FROM businesses b
LEFT JOIN (
  SELECT
    business_id,
    ROUND(AVG(rating)::numeric, 2) AS average_rating,
    COUNT(*)                        AS total_ratings
  FROM calificaciones
  GROUP BY business_id
) r ON r.business_id = b.id
WHERE b.is_public = true;
-- NOTA: No filtramos por featured=true porque el filtro se hace en la app

-- 6. Verificar resultado
SELECT pais, COUNT(*) AS total
FROM businesses
GROUP BY pais
ORDER BY total DESC;
