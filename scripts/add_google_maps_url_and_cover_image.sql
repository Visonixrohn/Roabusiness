-- Migración: Agregar columnas faltantes a la tabla businesses
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT;
