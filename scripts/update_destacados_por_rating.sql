-- ======================================================================
-- ACTUALIZACIÓN: Negocios Destacados ordenados por Rating
-- ======================================================================
-- Este script actualiza la vista de negocios destacados para que se ordene
-- por calificación (rating) en lugar de por número de contactos.
--
-- Ejecuta este script DESPUÉS de haber ejecutado create_calificaciones_table.sql
-- ======================================================================

-- Eliminar la vista anterior si existe
DROP VIEW IF EXISTS vista_negocios_destacados;

-- Recrear la vista de negocios destacados incluyendo calificaciones
-- Esta vista ahora ordena por:
-- 1. Calificación promedio (average_rating) - descendente
-- 2. Total de calificaciones (total_ratings) - descendente
-- 3. Contador de contactos (como criterio terciario) - descendente
CREATE OR REPLACE VIEW vista_negocios_destacados AS
SELECT 
  b.*,
  COALESCE(nd.contador, 0) as contador_contactos,
  nd.updated_at as ultimo_contacto,
  COALESCE(brs.average_rating, 0) as average_rating,
  COALESCE(brs.total_ratings, 0) as total_ratings
FROM businesses b
LEFT JOIN negocio_destacado nd ON b.id = nd.business_id
LEFT JOIN business_ratings_stats brs ON b.id = brs.business_id
WHERE b.is_public = true
ORDER BY 
  COALESCE(brs.average_rating, 0) DESC,
  COALESCE(brs.total_ratings, 0) DESC,
  COALESCE(nd.contador, 0) DESC;

-- Añadir comentario para documentación
COMMENT ON VIEW vista_negocios_destacados IS 'Vista de negocios destacados ordenados por calificación promedio (rating), luego por total de calificaciones, y finalmente por contactos';

-- ======================================================================
-- Verificación
-- ======================================================================

-- Ver los top 10 negocios destacados con sus calificaciones
SELECT 
  name as "Negocio",
  average_rating as "⭐ Rating",
  total_ratings as "Total Calificaciones",
  contador_contactos as "Contactos",
  departamento as "Departamento",
  category as "Categoría"
FROM vista_negocios_destacados
LIMIT 10;

-- ======================================================================
-- FIN DE LA ACTUALIZACIÓN
-- ======================================================================

-- Notas:
-- - Los negocios sin calificaciones (average_rating = 0) aparecerán al final
-- - Los negocios con la misma calificación se ordenan por total de calificaciones
-- - Si aún hay empate, se ordena por número de contactos
-- - Solo se muestran negocios públicos (is_public = true)
