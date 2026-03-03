-- ============================================================
-- TABLA: banner_ads
-- Almacena los banners publicitarios del carousel principal
-- ============================================================

CREATE TABLE IF NOT EXISTS public.banner_ads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT NOT NULL,          -- URL pública en Supabase Storage
  image_path    TEXT,                   -- Ruta interna en el bucket (para poder eliminarla)
  link_url      TEXT,                   -- URL de destino al hacer click
  link_label    TEXT DEFAULT 'Ver más', -- Texto del botón CTA
  active        BOOLEAN NOT NULL DEFAULT true,
  order_index   INTEGER NOT NULL DEFAULT 0, -- Orden de aparición
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_banner_ads_active ON public.banner_ads (active);
CREATE INDEX IF NOT EXISTS idx_banner_ads_order  ON public.banner_ads (order_index ASC, created_at ASC);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- TRIGGER: updated_at en banner_ads
DROP TRIGGER IF EXISTS trg_banner_ads_updated_at ON public.banner_ads;
CREATE TRIGGER trg_banner_ads_updated_at
  BEFORE UPDATE ON public.banner_ads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- NOTA SOBRE ELIMINACIÓN DE IMÁGENES EN STORAGE
-- ============================================================
-- Supabase Storage no puede ser gestionado directamente
-- desde triggers SQL. La lógica de eliminación de la imagen
-- anterior se maneja a nivel de aplicación (useBanners.ts):
--
--   1. Al actualizar un banner con nueva imagen:
--      - Se lee el `image_path` actual del registro
--      - Se llama a supabase.storage.from('banner-images').remove([oldPath])
--      - Se sube la nueva imagen
--      - Se actualiza image_url e image_path en la tabla
--
-- Esta función RPC auxilia el proceso desde el lado del servidor:
-- ============================================================

-- Función auxiliar para obtener el image_path actual antes de actualizar
CREATE OR REPLACE FUNCTION public.get_banner_image_path(p_banner_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT image_path FROM public.banner_ads WHERE id = p_banner_id;
$$;

-- ============================================================
-- BUCKET DE STORAGE: banner-images
-- Ejecutar desde el Dashboard de Supabase o con la API:
-- ============================================================
-- IMPORTANTE: Crear el bucket desde Storage > New Bucket:
--   Nombre: banner-images
--   Public: true  (para que las URLs sean accesibles)
--   Tamaño máx. por archivo: 5 MB recomendado
--
-- Políticas RLS sugeridas para el bucket:
-- ============================================================

-- Permitir lectura pública
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Política: solo admins pueden subir/eliminar
-- CREATE POLICY "Admins pueden gestionar banner-images"
-- ON storage.objects FOR ALL
-- TO authenticated
-- USING (bucket_id = 'banner-images' AND auth.jwt() ->> 'role' = 'admin')
-- WITH CHECK (bucket_id = 'banner-images' AND auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- RLS para la tabla banner_ads
-- ============================================================

ALTER TABLE public.banner_ads ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para mostrarlo en el sitio)
CREATE POLICY "Lectura pública de banners"
  ON public.banner_ads FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo admins autenticados pueden insertar, actualizar, eliminar
CREATE POLICY "Admins gestionan banners - INSERT"
  ON public.banner_ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins gestionan banners - UPDATE"
  ON public.banner_ads FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins gestionan banners - DELETE"
  ON public.banner_ads FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================
-- DATOS DE EJEMPLO (opcionales, para pruebas)
-- ============================================================
/*
INSERT INTO public.banner_ads (title, description, image_url, link_url, link_label, order_index) VALUES
(
  'Descubre Roatán',
  'El destino caribeño más fascinante de Honduras. Playas, arrecifes de coral y una cultura única te esperan.',
  'https://i.imgur.com/b41QZLs.png',
  '/directorio',
  'Ver Directorio',
  1
),
(
  'Publica tu Negocio',
  'Llega a miles de turistas y locales. Registra tu negocio en RoaBusiness hoy mismo.',
  'https://i.imgur.com/b41QZLs.png',
  '/registrar-negocio',
  'Registrar Negocio',
  2
);
*/
