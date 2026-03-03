-- Migración: agregar columnas de imagen móvil a banner_ads
ALTER TABLE banner_ads
  ADD COLUMN IF NOT EXISTS mobile_image_url  TEXT,
  ADD COLUMN IF NOT EXISTS mobile_image_path TEXT;
