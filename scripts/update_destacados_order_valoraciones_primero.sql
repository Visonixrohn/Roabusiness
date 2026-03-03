-- Actualizar vista de negocios destacados para ordenar por:
-- 1. Total de valoraciones (DESC)
-- 2. Calificación promedio (DESC)
-- 3. Contador de contactos (DESC)

DROP VIEW IF EXISTS vista_negocios_destacados;

CREATE OR REPLACE VIEW vista_negocios_destacados AS
SELECT 
  b.*,
  COALESCE(nd.contador, 0) AS contador_contactos,
  nd.updated_at AS ultimo_contacto,
  COALESCE(brs.average_rating, 0) AS average_rating,
  COALESCE(brs.total_ratings, 0) AS total_ratings
FROM businesses b
LEFT JOIN negocio_destacado nd ON b.id = nd.business_id
LEFT JOIN business_ratings_stats brs ON b.id = brs.business_id
WHERE b.is_public = true
ORDER BY 
  COALESCE(brs.total_ratings, 0) DESC,     -- Primero: cantidad de valoraciones
  COALESCE(brs.average_rating, 0) DESC,    -- Segundo: promedio de estrellas
  COALESCE(nd.contador, 0) DESC;           -- Tercero: contactos

COMMENT ON VIEW vista_negocios_destacados IS 'Vista de negocios destacados ordenados por total de valoraciones, luego por calificación promedio (rating), y finalmente por contactos. Incluye profile_name para URLs amigables.';
