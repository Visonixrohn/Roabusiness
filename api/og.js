// Vercel Serverless Function para generar meta tags dinámicos
// Esta función detecta bots y sirve HTML personalizado, o redirige a la SPA

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

const isBot = (userAgent) => {
  return /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Skype/i.test(
    userAgent,
  );
};

module.exports = async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const { profileName } = req.query;

  // Si no es un bot, redirigir a la SPA normal
  if (!isBot(userAgent)) {
    return res.redirect(302, `/negocio/@${profileName}`);
  }

  if (!profileName) {
    return res.status(400).json({ error: "profileName is required" });
  }

  try {
    // Buscar negocio por profile_name
    const cleanProfileName = profileName.replace(/^@/, "");

    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("profile_name", cleanProfileName)
      .single();

    if (error || !business) {
      return res.status(404).send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Negocio no encontrado - RoaBusiness</title>
  <meta http-equiv="refresh" content="0;url=https://www.roabusiness.com">
</head>
<body>
  <h1>Negocio no encontrado</h1>
  <p>Redirigiendo a la página principal...</p>
</body>
</html>
      `);
    }

    // Escapar caracteres especiales para HTML
    const escapeHtml = (text) => {
      if (!text) return "";
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const title = escapeHtml(`${business.name} - RoaBusiness`);
    const description = escapeHtml(
      business.description?.substring(0, 200) ||
        `Visita ${business.name} en Roatán`,
    );
    const image =
      business.logo ||
      business.coverimage ||
      business.cover_image ||
      "https://www.roabusiness.com/images/roatan-beach.png";

    // Generar HTML con meta tags personalizados para bots
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="business.business">
  <meta property="og:url" content="https://www.roabusiness.com/negocio/@${business.profile_name}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="RoaBusiness">
  <meta property="og:locale" content="es_HN">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- WhatsApp específico -->
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:alt" content="${escapeHtml(business.name)}">
</head>
<body>
  <h1>${business.name}</h1>
  <p>${description}</p>
  <a href="https://www.roabusiness.com/negocio/@${business.profile_name}">Ver perfil completo</a>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Error fetching business:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
