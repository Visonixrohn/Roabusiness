-- Inserta o actualiza la fila para la tabla `clave`
-- Ejecuta esto en el SQL Editor del proyecto Supabase que coincida con la URL de `VITE_SUPABASE_URL`.

INSERT INTO public.clave (id, nun)
VALUES (1, 152500)
ON CONFLICT (id) DO UPDATE
  SET nun = EXCLUDED.nun;

-- Verificar
SELECT * FROM public.clave;
