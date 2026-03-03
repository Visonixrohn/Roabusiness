-- ============================================================
-- MIGRACIÓN: añadir columna focal_point a banner_ads
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.banner_ads
  ADD COLUMN IF NOT EXISTS focal_point TEXT
    NOT NULL DEFAULT 'center'
    CHECK (focal_point IN (
      'top-left', 'top-center', 'top-right',
      'center-left', 'center', 'center-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ));

-- Actualizar banners existentes al valor por defecto
UPDATE public.banner_ads SET focal_point = 'center' WHERE focal_point IS NULL;

-- ============================================================
-- MIGRACIÓN: añadir columna zoom_scale a banner_ads
-- ============================================================

ALTER TABLE public.banner_ads
  ADD COLUMN IF NOT EXISTS zoom_scale NUMERIC(4,2)
    NOT NULL DEFAULT 1.00
    CHECK (zoom_scale >= 0.50 AND zoom_scale <= 2.50);

-- Si la columna ya existía con el constraint antiguo (>=1.00), actualizar el constraint:
DO $$
BEGIN
  -- Eliminar constraint antiguo si existe
  ALTER TABLE public.banner_ads DROP CONSTRAINT IF EXISTS banner_ads_zoom_scale_check;
  -- Añadir nuevo constraint con rango 0.50 - 2.50
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'banner_ads' AND constraint_name = 'banner_ads_zoom_scale_check2'
  ) THEN
    ALTER TABLE public.banner_ads
      ADD CONSTRAINT banner_ads_zoom_scale_check2
      CHECK (zoom_scale >= 0.50 AND zoom_scale <= 2.50);
  END IF;
END $$;

-- Actualizar banners existentes al valor por defecto
UPDATE public.banner_ads SET zoom_scale = 1.00 WHERE zoom_scale IS NULL;
