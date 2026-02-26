-- Script para actualizar profile_names faltantes en negocios existentes
-- Este script genera profile_names para cualquier negocio que no lo tenga

-- Verificar cuántos negocios no tienen profile_name
SELECT COUNT(*) as negocios_sin_profile_name
FROM businesses
WHERE profile_name IS NULL OR profile_name = '';

-- Actualizar negocios sin profile_name usando la función existente
UPDATE businesses
SET profile_name = NULL  -- Esto activará el trigger que lo generará automáticamente
WHERE profile_name IS NULL OR profile_name = '';

-- Verificar los resultados
SELECT 
    id,
    name,
    profile_name,
    CASE 
        WHEN profile_name IS NULL OR profile_name = '' THEN 'SIN PROFILE_NAME'
        ELSE 'OK'
    END as estado
FROM businesses
ORDER BY name
LIMIT 20;

-- Si algunos siguen sin profile_name, forzar la generación manualmente
DO $$
DECLARE
    business_record RECORD;
BEGIN
    FOR business_record IN 
        SELECT id, name 
        FROM businesses 
        WHERE profile_name IS NULL OR profile_name = ''
    LOOP
        UPDATE businesses
        SET profile_name = generate_profile_name(business_record.name, business_record.id)
        WHERE id = business_record.id;
        
        RAISE NOTICE 'Actualizado: % -> @%', 
            business_record.name, 
            (SELECT profile_name FROM businesses WHERE id = business_record.id);
    END LOOP;
END $$;

-- Verificación final
SELECT 
    COUNT(*) FILTER (WHERE profile_name IS NOT NULL AND profile_name != '') as con_profile_name,
    COUNT(*) FILTER (WHERE profile_name IS NULL OR profile_name = '') as sin_profile_name,
    COUNT(*) as total
FROM businesses;
