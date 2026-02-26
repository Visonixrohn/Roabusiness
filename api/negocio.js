// Vercel Function que intercepta peticiones a /negocio/*
// Detecta bots y sirve HTML personalizado, usuarios normales ven la SPA

const { createClient } = require('@supabase/supabase-js');

// Verificar variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  try {
    const userAgent = req.headers['user-agent'] || '';
    const urlPath = req.url || '';
    
    console.log('=== API Negocio Called ===');
    console.log('Full URL:', urlPath);
    console.log('User-Agent:', userAgent);
    console.log('Supabase configured:', !!supabaseUrl && !!supabaseKey);
    
    // Extraer originalPath del query param (viene del middleware)
    const url = new URL(urlPath, `https://${req.headers.host || 'localhost'}`);
    const originalPath = url.searchParams.get('originalPath') || urlPath;
    
    console.log('Original Path:', originalPath);
    
    // Extraer profile_name de la URL
    const match = originalPath.match(/\/negocio\/@?([^\/\?&]+)/);
    
    if (!match) {
      console.log('No profile_name match found');
      return res.status(400).send('Invalid URL');
    }

    const profileName = match[1].replace(/^@/, '');
    console.log('Profile Name:', profileName);
    console.log('Is Bot:', isBot(userAgent));

    // Si NO es un bot (no debería llegar aquí por el middleware, pero por seguridad)
    if (!isBot(userAgent)) {
      console.log('Warning: Non-bot reached API function, redirecting');
      return res.redirect(302, originalPath || '/');
    }

    // ES UN BOT: Generar HTML con meta tags
    console.log('Bot detected, fetching business from Supabase');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured');
      return res.status(500).send('Configuration error: Supabase not configured');
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('profile_name', profileName)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send(`Database error: ${error.message}`);
    }

    if (!business) {
      console.log('Business not found:', profileName);
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

    console.log('Business found:', business.name);
    console.log('Logo:', business.logo);
    console.log('Cover Image:', business.cover_image || business.coverimage);

    const title = escapeHtml(`${business.name} - RoaBusiness`);
    const description = escapeHtml(business.description?.substring(0, 200) || `Visita ${business.name} en Roatán`);
    const image = business.logo || business.cover_image || business.coverimage || 'https://www.roabusiness.com/images/roatan-beach.png';
    const category = escapeHtml(business.category || 'Negocio');

    console.log('Generating HTML with image:', image);

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
    console.error('=== UNHANDLED ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
};
