-- Script simplificado para forzar actualización de profile_names
-- Ejecutar línea por línea para ver el progreso

-- 1. Ver el estado actual
SELECT 
    id,
    name,
    profile_name,
    CASE 
        WHEN profile_name IS NULL THEN '❌ NULL'
        WHEN profile_name = '' THEN '❌ VACÍO'
        ELSE '✅ OK'
    END as estado
FROM businesses
LIMIT 10;

-- 2. Contar negocios por estado
SELECT 
    CASE 
        WHEN profile_name IS NULL THEN 'SIN PROFILE_NAME (NULL)'
        WHEN profile_name = '' THEN 'SIN PROFILE_NAME (VACÍO)'
        ELSE 'CON PROFILE_NAME'
    END as estado,
    COUNT(*) as cantidad
FROM businesses
GROUP BY 
    CASE 
        WHEN profile_name IS NULL THEN 'SIN PROFILE_NAME (NULL)'
        WHEN profile_name = '' THEN 'SIN PROFILE_NAME (VACÍO)'
        ELSE 'CON PROFILE_NAME'
    END;

-- 3. Actualizar TODOS los negocios forzando el trigger
-- (Cambiar cualquier campo dispara el trigger)
UPDATE businesses
SET name = name
WHERE profile_name IS NULL OR profile_name = '';

-- 4. Si el trigger no funciona, actualizar manualmente todos
UPDATE businesses
SET profile_name = CASE
    WHEN profile_name IS NULL OR profile_name = '' THEN
        -- Generar profile_name manualmente
        LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(name, '[áàäâ]', 'a', 'gi'),
                                '[éèëê]', 'e', 'gi'
                            ),
                            '[íìïî]', 'i', 'gi'
                        ),
                        '[óòöô]', 'o', 'gi'
                    ),
                    '[úùüû]', 'u', 'gi'
                ),
                '[^a-z0-9]+', '', 'gi'
            )
        )
    ELSE profile_name
END
WHERE profile_name IS NULL OR profile_name = '';

-- 5. Manejar duplicados agregando sufijo numérico
WITH duplicates AS (
    SELECT profile_name, COUNT(*) as count
    FROM businesses
    WHERE profile_name IS NOT NULL
    GROUP BY profile_name
    HAVING COUNT(*) > 1
),
numbered AS (
    SELECT 
        b.id,
        b.profile_name,
        ROW_NUMBER() OVER (PARTITION BY b.profile_name ORDER BY b.id) - 1 as row_num
    FROM businesses b
    INNER JOIN duplicates d ON b.profile_name = d.profile_name
)
UPDATE businesses b
SET profile_name = n.profile_name || n.row_num
FROM numbered n
WHERE b.id = n.id AND n.row_num > 0;

-- 6. Verificar resultados finales
SELECT 
    id,
    name,
    profile_name,
    CASE 
        WHEN profile_name IS NULL THEN '❌ NULL'
        WHEN profile_name = '' THEN '❌ VACÍO'
        ELSE '✅ OK'
    END as estado
FROM businesses
ORDER BY name
LIMIT 20;

-- 7. Estadísticas finales
SELECT 
    CASE 
        WHEN profile_name IS NULL THEN 'NULL'
        WHEN profile_name = '' THEN 'VACÍO'
        ELSE 'OK'
    END as estado,
    COUNT(*) as cantidad
FROM businesses
GROUP BY 
    CASE 
        WHEN profile_name IS NULL THEN 'NULL'
        WHEN profile_name = '' THEN 'VACÍO'
        ELSE 'OK'
    END;
