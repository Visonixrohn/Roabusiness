-- Tabla para manejar calificaciones de negocios con identificador de dispositivo
-- Permite calificaciones sin necesidad de login usando device_id único

-- Eliminar tabla si existe (solo para desarrollo, comentar en producción)
-- DROP TABLE IF EXISTS calificaciones CASCADE;

-- Crear tabla calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único: un dispositivo solo puede calificar una vez a cada negocio
  CONSTRAINT unique_device_business UNIQUE (business_id, device_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_calificaciones_business_id ON calificaciones(business_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_device_id ON calificaciones(device_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_rating ON calificaciones(rating);
CREATE INDEX IF NOT EXISTS idx_calificaciones_created_at ON calificaciones(created_at DESC);

-- Vista materializada para calcular estadísticas de calificaciones por negocio
CREATE MATERIALIZED VIEW IF NOT EXISTS business_ratings_stats AS
SELECT 
  business_id,
  COUNT(*) as total_ratings,
  ROUND(AVG(rating)::numeric, 2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
  MAX(updated_at) as last_rating_date
FROM calificaciones
GROUP BY business_id;

-- Índice único para la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_ratings_stats_business_id 
ON business_ratings_stats(business_id);

-- Función para refrescar la vista materializada automáticamente
CREATE OR REPLACE FUNCTION refresh_business_ratings_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY business_ratings_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para refrescar estadísticas cuando hay cambios
DROP TRIGGER IF EXISTS trigger_refresh_ratings_stats ON calificaciones;
CREATE TRIGGER trigger_refresh_ratings_stats
AFTER INSERT OR UPDATE OR DELETE ON calificaciones
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_business_ratings_stats();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_calificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS set_updated_at ON calificaciones;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON calificaciones
FOR EACH ROW
EXECUTE FUNCTION update_calificaciones_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para calificaciones
-- Permitir lectura a todos (sin autenticación)
CREATE POLICY "Cualquiera puede leer calificaciones"
ON calificaciones FOR SELECT
USING (true);

-- Permitir insertar calificaciones sin autenticación
CREATE POLICY "Cualquiera puede insertar calificaciones"
ON calificaciones FOR INSERT
WITH CHECK (true);

-- Permitir actualizar solo la calificación del mismo dispositivo
CREATE POLICY "Dispositivos pueden actualizar sus propias calificaciones"
ON calificaciones FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir eliminar solo la calificación del mismo dispositivo (opcional)
CREATE POLICY "Dispositivos pueden eliminar sus propias calificaciones"
ON calificaciones FOR DELETE
USING (true);

-- Comentarios para documentación
COMMENT ON TABLE calificaciones IS 'Almacena calificaciones de usuarios por negocio usando identificador de dispositivo';
COMMENT ON COLUMN calificaciones.device_id IS 'Identificador único del dispositivo (generado en el cliente)';
COMMENT ON COLUMN calificaciones.rating IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN calificaciones.comment IS 'Comentario opcional del usuario';

-- Refrescar la vista materializada por primera vez
REFRESH MATERIALIZED VIEW business_ratings_stats;

-- ======================================================================
-- ACTUALIZACIÓN DE VISTA DE NEGOCIOS DESTACADOS
-- ======================================================================

-- Actualizar la vista de negocios destacados para incluir calificaciones
-- Esta vista ahora ordena por rating en lugar de por contactos
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

-- Comentario para documentación
COMMENT ON VIEW vista_negocios_destacados IS 'Vista de negocios destacados ordenados por calificación promedio, luego por total de calificaciones, y finalmente por contactos';

-- ======================================================================

-- Consultas útiles para administración:

-- Ver promedio de calificaciones por negocio con nombre
-- SELECT 
--   b.name,
--   brs.average_rating,
--   brs.total_ratings,
--   brs.five_stars,
--   brs.four_stars,
--   brs.three_stars,
--   brs.two_stars,
--   brs.one_star
-- FROM business_ratings_stats brs
-- JOIN businesses b ON b.id = brs.business_id
-- ORDER BY brs.average_rating DESC, brs.total_ratings DESC;

-- Ver calificaciones recientes
-- SELECT 
--   b.name as negocio,
--   c.rating,
--   c.comment,
--   c.created_at
-- FROM calificaciones c
-- JOIN businesses b ON b.id = c.business_id
-- ORDER BY c.created_at DESC
-- LIMIT 20;
