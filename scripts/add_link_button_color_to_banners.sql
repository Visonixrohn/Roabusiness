-- Migración: agregar columna link_button_color a banner_ads
ALTER TABLE banner_ads
  ADD COLUMN IF NOT EXISTS link_button_color TEXT NOT NULL DEFAULT '#06b6d4';
