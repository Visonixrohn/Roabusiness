-- ======================================================================
-- MIGRACIÓN: Sistema de ubicación Honduras + Negocios Destacados
-- ======================================================================
-- Fecha: 23 de febrero de 2026
-- Descripción: 
-- 1. Renombrar columnas island → departamento, location → municipio
-- 2. Agregar columna colonia
-- 3. Crear tabla negocio_destacado para rastrear contactos

-- ======================================================================
-- PARTE 1: Actualización de esquema de ubicación
-- ======================================================================

-- Renombrar columna island a departamento
ALTER TABLE businesses RENAME COLUMN island TO departamento;

-- Renombrar columna location a municipio  
ALTER TABLE businesses RENAME COLUMN location TO municipio;

-- Agregar columna colonia (opcional)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS colonia TEXT;

-- ======================================================================
-- PARTE 2: Tabla de negocios destacados
-- ======================================================================

-- Crear tabla para rastrear contactos a negocios
-- La tabla almacena un contador por negocio que se incrementa cada vez
-- que alguien hace clic en "Contactar"
CREATE TABLE IF NOT EXISTS negocio_destacado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contador INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_business_id UNIQUE(business_id)
);

-- Índice para mejorar consultas de negocios más contactados
CREATE INDEX IF NOT EXISTS idx_negocio_destacado_contador 
  ON negocio_destacado(contador DESC);

-- Índice para búsquedas por business_id
CREATE INDEX IF NOT EXISTS idx_negocio_destacado_business_id 
  ON negocio_destacado(business_id);

-- ======================================================================
-- PARTE 3: Función para incrementar contador
-- ======================================================================

-- Función para incrementar el contador cuando se contacta un negocio
-- Esta función se ejecutará desde el frontend
CREATE OR REPLACE FUNCTION incrementar_contador_destacado(p_business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar o actualizar el contador
  INSERT INTO negocio_destacado (business_id, contador, updated_at)
  VALUES (p_business_id, 1, TIMEZONE('utc', NOW()))
  ON CONFLICT (business_id)
  DO UPDATE SET 
    contador = negocio_destacado.contador + 1,
    updated_at = TIMEZONE('utc', NOW());
END;
$$;

-- ======================================================================
-- PARTE 4: Trigger para actualizar updated_at automáticamente
-- ======================================================================

-- Crear función trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla negocio_destacado
DROP TRIGGER IF EXISTS update_negocio_destacado_updated_at ON negocio_destacado;
CREATE TRIGGER update_negocio_destacado_updated_at
  BEFORE UPDATE ON negocio_destacado
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- PARTE 5: Vista para consultar negocios destacados
-- ======================================================================

-- Vista que combina negocios con su contador de contactos
CREATE OR REPLACE VIEW vista_negocios_destacados AS
SELECT 
  b.*,
  COALESCE(nd.contador, 0) as contador_contactos,
  nd.updated_at as ultimo_contacto
FROM businesses b
LEFT JOIN negocio_destacado nd ON b.id = nd.business_id
WHERE b.is_public = true
ORDER BY COALESCE(nd.contador, 0) DESC;

-- ======================================================================
-- PARTE 6: Políticas RLS (Row Level Security)
-- ======================================================================

-- Habilitar RLS en la tabla negocio_destacado
ALTER TABLE negocio_destacado ENABLE ROW LEVEL SECURITY;

-- Permitir a todos leer los contadores
CREATE POLICY "Permitir lectura pública de contadores"
  ON negocio_destacado
  FOR SELECT
  USING (true);

-- Permitir a usuarios autenticados incrementar contadores
CREATE POLICY "Permitir incrementar contador"
  ON negocio_destacado
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar contador"
  ON negocio_destacado
  FOR UPDATE
  USING (true);

-- ======================================================================
-- PARTE 7: Inicializar registros para negocios existentes (opcional)
-- ======================================================================

-- Crear registros con contador 0 para todos los negocios existentes
-- (Esto es opcional - la función incrementar_contador_destacado creará
-- automáticamente el registro la primera vez que se contacte un negocio)
/*
INSERT INTO negocio_destacado (business_id, contador)
SELECT id, 0
FROM businesses
WHERE NOT EXISTS (
  SELECT 1 FROM negocio_destacado WHERE business_id = businesses.id
);
*/

-- ======================================================================
-- FIN DE LA MIGRACIÓN
-- ======================================================================

-- Para ejecutar esta migración:
-- 1. Abre el SQL Editor en tu dashboard de Supabase
-- 2. Copia y pega todo este script
-- 3. Ejecuta el script
--
-- IMPORTANTE: Haz un backup de tu base de datos antes de ejecutar
-- cualquier migración en producción.
