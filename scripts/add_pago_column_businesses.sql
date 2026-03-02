-- Agregar columna pago a la tabla businesses
-- Estados: 'ejecutado', 'sin pagar'
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS pago TEXT NOT NULL DEFAULT 'sin pagar' 
  CHECK (pago IN ('ejecutado', 'sin pagar'));

-- Índice para búsquedas rápidas por estado de pago
CREATE INDEX IF NOT EXISTS idx_businesses_pago ON public.businesses(pago);

-- Actualizar negocios existentes según su estado de suscripción
-- (Si tienen subscription_months válida, consideramos que pagaron)
UPDATE public.businesses
SET pago = 'ejecutado'
WHERE subscription_months >= 6 AND pago = 'sin pagar';
