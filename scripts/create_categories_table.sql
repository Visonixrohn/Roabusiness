-- Migración: Crear tabla categories para gestionar categorías de negocios
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla categories
CREATE TABLE IF NOT EXISTS categories (
  id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT categories_name_unique UNIQUE (name)
);

-- 2. Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Política: lectura pública (todos pueden ver categorías)
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

-- 4. Política: solo admins pueden insertar/actualizar/eliminar
--    (ajusta la condición según tu sistema de roles)
CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  USING (true);

-- 5. Poblar con categorías existentes del archivo businessCategories.ts
INSERT INTO categories (name) VALUES
  ('Servicios legales'),
  ('Contadores'),
  ('Notarías'),
  ('Consultores empresariales'),
  ('Recursos Humanos'),
  ('Traductores'),
  ('Arquitectos'),
  ('Ingenieros'),
  ('Asesoría migratoria'),
  ('Hoteles'),
  ('Hostales'),
  ('Casas vacacionales'),
  ('Tours'),
  ('Agencias de viajes'),
  ('Operadores turísticos'),
  ('Rentas vacacionales'),
  ('Bares'),
  ('Discotecas'),
  ('Parques y atracciones'),
  ('Transporte turístico'),
  ('Restaurantes'),
  ('Cafeterías'),
  ('Comida rápida'),
  ('Panaderías'),
  ('Supermercados'),
  ('Catering'),
  ('Tiendas de abarrotes'),
  ('Tiendas de ropa'),
  ('Tiendas de zapatos'),
  ('Electrónica'),
  ('Librerías'),
  ('Papelerías'),
  ('Tiendas de conveniencia'),
  ('Ferreterías'),
  ('Mueblerías'),
  ('Floristerías'),
  ('Joyerías'),
  ('Tiendas de souvenirs'),
  ('Plomería'),
  ('Electricistas'),
  ('Albañiles'),
  ('Carpintería'),
  ('Aire acondicionado'),
  ('Jardinería'),
  ('Cerrajería'),
  ('Reparación de electrodomésticos'),
  ('Talleres mecánicos'),
  ('Repuestos automotrices'),
  ('Lavado de autos'),
  ('Transporte privado'),
  ('Taxi'),
  ('Moto taxi'),
  ('Alquiler de vehículos'),
  ('Estacionamientos'),
  ('Transporte marítimo'),
  ('Barberías'),
  ('Salones de belleza'),
  ('Spa'),
  ('Masajes'),
  ('Yoga'),
  ('Gimnasios'),
  ('Farmacias'),
  ('Clínicas'),
  ('Médicos generales'),
  ('Dentistas'),
  ('Psicólogos'),
  ('Inmobiliarias'),
  ('Agentes de bienes raíces'),
  ('Venta de propiedades'),
  ('Alquiler de propiedades'),
  ('Decoración de interiores'),
  ('Mudanzas'),
  ('Escuelas'),
  ('Colegios'),
  ('Centros de idiomas'),
  ('Tutorías'),
  ('Capacitación técnica'),
  ('Universidades'),
  ('Cursos online'),
  ('Academias de arte'),
  ('Academias de música'),
  ('Tiendas de celulares'),
  ('Reparación de computadoras'),
  ('Servicios de internet'),
  ('Cibercafés'),
  ('Diseño web'),
  ('Marketing digital'),
  ('Soporte técnico'),
  ('Agencias de publicidad'),
  ('Veterinarias'),
  ('Tiendas de mascotas'),
  ('Peluquería canina'),
  ('Adiestramiento de mascotas'),
  ('Galerías'),
  ('Estudios de arte'),
  ('Escuelas de música'),
  ('Grupos de danza'),
  ('Organizadores de eventos'),
  ('Fotografía'),
  ('Servicios de video'),
  ('Alquiler de sonido'),
  ('Alquiler de luces')
ON CONFLICT (name) DO NOTHING;

-- 6. También importar categorías únicas ya usadas en negocios existentes
--    que no estén aún en la tabla
INSERT INTO categories (name)
SELECT DISTINCT TRIM(category)
FROM businesses
WHERE
  category IS NOT NULL
  AND TRIM(category) <> ''
ON CONFLICT (name) DO NOTHING;

-- 7. Verificar resultado
SELECT name FROM categories ORDER BY name;
