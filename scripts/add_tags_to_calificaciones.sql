-- Migración: Agregar columna tags a calificaciones
-- Permite guardar etiquetas predefinidas por reseña

ALTER TABLE calificaciones
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Índice para búsquedas por tags (GIN para arrays)
CREATE INDEX IF NOT EXISTS idx_calificaciones_tags ON calificaciones USING GIN(tags);

-- Comentario explicativo
COMMENT ON COLUMN calificaciones.tags IS
  'Array de etiquetas predefinidas seleccionadas por el usuario (ej: Lo recomiendo, Buena atención, etc.)';
