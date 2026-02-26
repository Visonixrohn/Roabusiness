-- ========================================
-- Script para agregar columna profile_name
-- y rellenarla automáticamente
-- ========================================

-- 1. Agregar la columna profile_name (única, no nula)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS profile_name TEXT;

-- 2. Crear función para generar el profile_name desde el nombre
CREATE OR REPLACE FUNCTION generate_profile_name(business_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_name TEXT;
  final_name TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir a minúsculas y quitar espacios/caracteres especiales
  base_name := LOWER(TRIM(business_name));
  
  -- Reemplazar espacios por nada, quitar acentos y caracteres especiales
  base_name := REGEXP_REPLACE(base_name, '[áàäâ]', 'a', 'g');
  base_name := REGEXP_REPLACE(base_name, '[éèëê]', 'e', 'g');
  base_name := REGEXP_REPLACE(base_name, '[íìïî]', 'i', 'g');
  base_name := REGEXP_REPLACE(base_name, '[óòöô]', 'o', 'g');
  base_name := REGEXP_REPLACE(base_name, '[úùüû]', 'u', 'g');
  base_name := REGEXP_REPLACE(base_name, '[ñ]', 'n', 'g');
  
  -- Quitar espacios y caracteres especiales, mantener solo letras y números
  base_name := REGEXP_REPLACE(base_name, '[^a-z0-9]', '', 'g');
  
  -- Limitar a 50 caracteres
  base_name := SUBSTRING(base_name FROM 1 FOR 50);
  
  -- Si queda vacío, usar 'negocio'
  IF base_name = '' THEN
    base_name := 'negocio';
  END IF;
  
  -- Verificar si ya existe, si es así agregar número
  final_name := base_name;
  WHILE EXISTS (SELECT 1 FROM businesses WHERE profile_name = final_name) LOOP
    counter := counter + 1;
    final_name := base_name || counter;
  END LOOP;
  
  RETURN final_name;
END;
$$ LANGUAGE plpgsql;

-- 3. Rellenar todos los profile_name basándose en el nombre del negocio
UPDATE businesses
SET profile_name = generate_profile_name(name)
WHERE profile_name IS NULL OR profile_name = '';

-- 4. Hacer la columna NOT NULL y UNIQUE
ALTER TABLE businesses
ALTER COLUMN profile_name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_profile_name ON businesses(profile_name);

-- 5. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_businesses_profile_name_lower ON businesses(LOWER(profile_name));

-- 6. Comentarios para documentación
COMMENT ON COLUMN businesses.profile_name IS 'Nombre de perfil único para URLs amigables (@nombredeperfil)';

-- ========================================
-- Trigger para generar automáticamente
-- profile_name en nuevos registros
-- ========================================

CREATE OR REPLACE FUNCTION set_profile_name_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Si no se proporciona profile_name, generarlo automáticamente
  IF NEW.profile_name IS NULL OR NEW.profile_name = '' THEN
    NEW.profile_name := generate_profile_name(NEW.name);
  ELSE
    -- Si se proporciona, sanitizarlo
    NEW.profile_name := LOWER(TRIM(NEW.profile_name));
    NEW.profile_name := REGEXP_REPLACE(NEW.profile_name, '[^a-z0-9_]', '', 'g');
    
    -- Verificar unicidad y agregar número si es necesario
    DECLARE
      counter INTEGER := 0;
      base_name TEXT := NEW.profile_name;
    BEGIN
      WHILE EXISTS (
        SELECT 1 FROM businesses 
        WHERE profile_name = NEW.profile_name 
        AND id != NEW.id
      ) LOOP
        counter := counter + 1;
        NEW.profile_name := base_name || counter;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_set_profile_name ON businesses;
CREATE TRIGGER trigger_set_profile_name
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_name_on_insert();

-- ========================================
-- Verificación
-- ========================================

-- Ver algunos ejemplos de profile_name generados
SELECT id, name, profile_name 
FROM businesses 
LIMIT 10;
