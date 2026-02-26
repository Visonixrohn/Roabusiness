# Configurar Variables de Entorno en Vercel

## Problema

La función serverless `/api/negocio.js` devuelve error 500 porque no puede acceder a las credenciales de Supabase.

## Solución

### 1. Ir a tu proyecto en Vercel

1. Abre https://vercel.com/
2. Selecciona tu proyecto `Roabusiness`
3. Ve a `Settings` → `Environment Variables`

### 2. Agregar Variables de Entorno

Necesitas agregar estas 2 variables:

**Variable 1:**

```
Name: VITE_SUPABASE_URL
Value: (tu URL de Supabase, algo como https://xxxxx.supabase.co)
```

**Variable 2:**

```
Name: VITE_SUPABASE_ANON_KEY
Value: (tu clave anónima de Supabase, una cadena larga)
```

### 3. Scope de las Variables

- Asegúrate de seleccionar: **Production**, **Preview**, y **Development**
- Esto garantiza que las funciones tengan acceso en todos los ambientes

### 4. Redesplegar

Después de agregar las variables:

1. Ve a `Deployments`
2. Encuentra el último deployment
3. Click en el menú `...` → `Redeploy`
4. **IMPORTANTE**: Marca la casilla "Use existing Build Cache" como **FALSE**

### 5. Verificar que funciona

Después del redespliegue:

1. Ve a https://developers.facebook.com/tools/debug/
2. Ingresa: `https://www.roabusiness.com/negocio/@lacocinadejorge`
3. Click "Scrape Again"
4. Deberías ver el logo y descripción

### Dónde encontrar tus credenciales de Supabase

1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a `Settings` → `API`
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon public` → `VITE_SUPABASE_ANON_KEY`

## Verificar Logs en Vercel

Si sigue sin funcionar:

1. Ve a tu proyecto en Vercel
2. Click en `Functions` (en la barra lateral)
3. Busca `/api/negocio.js`
4. Revisa los logs para ver qué error específico está ocurriendo

Los logs ahora son muy detallados y mostrarán exactamente qué falta.
