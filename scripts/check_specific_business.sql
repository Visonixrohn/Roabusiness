-- Verificar el negocio específico que está dando problema
SELECT 
    id,
    name,
    profile_name,
    CASE 
        WHEN profile_name IS NULL THEN '❌ Es NULL'
        WHEN profile_name = '' THEN '❌ Es VACÍO'
        ELSE '✅ Tiene valor: ' || profile_name
    END as estado
FROM businesses
WHERE id = 'eb88301f-7eed-4c93-93b5-35d1402d64e1';

-- Ver TODOS los negocios con sus profile_names
SELECT 
    id,
    name,
    profile_name,
    LENGTH(profile_name) as longitud
FROM businesses
ORDER BY name;
