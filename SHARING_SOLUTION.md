# Solución para Compartir en Redes Sociales

## Problema

Las SPAs (Single Page Applications) con React no generan meta tags dinámicos en el servidor, por lo que redes sociales como WhatsApp, Facebook y Twitter no pueden leer la información personalizada de cada negocio.

## Soluciones Implementadas

### 1. Función Serverless `/api/negocio.js`

- Detecta automáticamente bots de redes sociales (WhatsApp, Facebook, Twitter, etc.)
- Consulta la base de datos de Supabase para obtener información del negocio
- Genera HTML con Open Graph meta tags personalizados
- Sirve este HTML a los bots para que puedan extraer la información

### 2. Rewrites en `vercel.json`

```json
{
  "rewrites": [
    { "source": "/negocio/@:profileName", "destination": "/api/negocio" },
    { "source": "/negocio/:profileName", "destination": "/api/negocio" }
  ]
}
```

## Cómo Funciona

1. Usuario comparte: `https://www.roabusiness.com/negocio/@lacocinadejorge`
2. Bot de WhatsApp/Facebook accede a la URL
3. Vercel redirige la petición a `/api/negocio.js`
4. La función detecta que es un bot (por User-Agent)
5. Consulta Supabase y genera HTML con:
   - `og:title`: Nombre del negocio
   - `og:description`: Descripción del negocio
   - `og:image`: Logo del negocio
   - Información adicional (ubicación, categoría, etc.)
6. El bot lee estos meta tags y genera la card de previsualización

## Validar Implementación

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Ingresa: `https://www.roabusiness.com/negocio/@lacocinadejorge`
   - Click en "Scrape Again" para actualizar cache

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Ingresa: `https://www.roabusiness.com/negocio/@lacocinadejorge`

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Ingresa la URL del perfil

## Limitaciones Actuales

- Los usuarios normales que acce den directamente a la URL ven un redirect temporal
- La función solo se activa para bots detectados
- Si un bot no está en la lista de detección, verá la SPA normal

## Bots Detectados

- facebookexternalhit
- WhatsApp
- Twitterbot
- LinkedInBot
- Slackbot
- TelegramBot
- Discordbot
- Pinterest
- Skype
- Y otros que incluyan "bot", "crawler", "spider" en su User-Agent

## Alternativas Futuras

1. **Migrar a Next.js**: SSR nativo con meta tags dinámicos
2. **Prerender.io**: Servicio de pre-rendering para bots
3. **Static Site Generation**: Generar páginas HTML estáticas para cada negocio
