// Vercel Function que intercepta peticiones a /negocio/*
// Detecta bots y sirve HTML personalizado, usuarios normales ven la SPA

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const isBot = (userAgent) => {
  return /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Skype|bot|crawler|spider|crawling/i.test(userAgent);
};

const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, ' ');
};

module.exports = async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const urlPath = req.url || '';
  
  console.log('API Negocio called:', { userAgent, urlPath, isBot: isBot(userAgent) });
  
  // Extraer profile_name de la URL
  const match = urlPath.match(/\/negocio\/@?([^\/\?]+)/);
  
  if (!match) {
    // Si NO es un bot Y no hay match, servir un HTML con script de redirección
    if (!isBot(userAgent)) {
      return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script>
    // Redirigir preservando la ruta original
    window.location.href = window.location.pathname;
  </script>
</head>
<body>Cargando...</body>
</html>
      `);
    }
    return res.status(400).send('Invalid URL');
  }

  const profileName = match[1];

  // Si NO es un bot, servir HTML mínimo con redirección a la SPA
  if (!isBot(userAgent)) {
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RoaBusiness</title>
  <script>
    // Redirigir inmediatamente a la ruta del perfil en la SPA
    window.location.href = '/negocio/@${profileName}';
  </script>
</head>
<body>
  <p>Redirigiendo...</p>
</body>
</html>
    `);
  }

  // ES UN BOT: Generar HTML con meta tags
  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('profile_name', profileName)
      .single();

    if (error || !business) {
      console.error('Business not found:', profileName, error);
      return res.status(404).send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Negocio no encontrado - RoaBusiness</title>
  <meta property="og:title" content="RoaBusiness - Directorio de Negocios en Roatán">
  <meta property="og:image" content="https://www.roabusiness.com/images/roatan-beach.png">
</head>
<body><h1>Negocio no encontrado</h1></body>
</html>
      `);
    }

    console.log('Business found:', business.name, 'Logo:', business.logo);

    const title = escapeHtml(`${business.name} - RoaBusiness`);
    const description = escapeHtml(business.description?.substring(0, 200) || `Visita ${business.name} en Roatán`);
    const image = business.logo || business.coverimage || business.cover_image || 'https://www.roabusiness.com/images/roatan-beach.png';
    const category = escapeHtml(business.category || 'Negocio');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="business.business">
  <meta property="og:url" content="https://www.roabusiness.com/negocio/@${business.profile_name}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(business.name)}">
  <meta property="og:site_name" content="RoaBusiness">
  <meta property="og:locale" content="es_HN">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escapeHtml(business.name)}">
  
  <link rel="canonical" href="https://www.roabusiness.com/negocio/@${business.profile_name}">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>${business.name}</h1>
  <p><strong>Categoría:</strong> ${category}</p>
  <p>${description}</p>
  ${business.departamento ? `<p><strong>Ubicación:</strong> ${escapeHtml(business.departamento)}, Honduras</p>` : ''}
  <a href="https://www.roabusiness.com/negocio/@${business.profile_name}" style="display: inline-block; background: #0d9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Ver perfil completo</a>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('Error fetching business:', error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
};
