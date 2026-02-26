// Vercel Function que intercepta todas las peticiones a /negocio/*
// Detecta bots y sirve HTML personalizado

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
  
  // Si NO es un bot, redirigir a la SPA (dejar que Vercel maneje con su rewrite normal)
  if (!isBot(userAgent)) {
    // No hacemos nada, dejamos que el siguiente rewrite lo maneje
    // Esto significa que la petición continuará y Vercel servirá /index.html
    return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=/">
  <script>window.location.href="/";</script>
</head>
<body>Loading...</body>
</html>
    `);
  }

  // Es un bot: extraer profile_name de la URL
  const urlPath = req.url || req.path || '';
  const match = urlPath.match(/\/negocio\/@?([^\/\?]+)/);
  
  if (!match) {
    return res.status(400).send('Invalid URL');
  }

  const profileName = match[1];

  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('profile_name', profileName)
      .single();

    if (error || !business) {
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
  <meta property="business:contact_data:locality" content="${escapeHtml(business.departamento || 'Roatán')}">
  <meta property="business:contact_data:region" content="Islas de la Bahía">
  <meta property="business:contact_data:country_name" content="Honduras">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escapeHtml(business.name)}">
  
  <!-- Additional meta tags -->
  <meta name="keywords" content="${escapeHtml(business.name)}, ${category}, Roatán, Honduras, negocios">
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
    return res.status(500).send('Internal server error');
  }
};
