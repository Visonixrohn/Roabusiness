// Vercel Edge Middleware - Solo intercepta bots
// https://vercel.com/docs/functions/edge-middleware

export default function middleware(request) {
  const { pathname } = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";

  // Solo interceptar rutas de negocio
  if (!pathname.startsWith("/negocio/")) {
    return;
  }

  // Detectar bots
  const isBot =
    /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Skype|bot|crawler|spider|crawling/i.test(
      userAgent,
    );

  // Si es un bot, reescribir a la función serverless
  if (isBot) {
    const url = new URL(request.url);
    url.pathname = "/api/negocio";
    url.searchParams.set("originalPath", pathname);

    return Response.redirect(url, 307); // 307 preserva método y body
  }

  // Si NO es un bot, dejar pasar (Vercel servirá index.html normalmente)
  return;
}

export const config = {
  matcher: "/negocio/:path*",
};
