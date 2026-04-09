import { useState, useEffect, useRef } from "react";
import { MapPin, Facebook, Instagram, Twitter, Globe, ArrowRight } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Business } from "@/types/business";
import { cn } from "@/lib/utils";

export interface SocialPreviewBusiness {
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  location?: string;
  municipio?: string;
}

// ========== 1. TARJETA BASE PARA PREVIEWS (FB, IG, X) ==========
export const OGPreviewCard = ({
  url,
  accentColor,
  accentGradient,
  icon,
  platformLabel,
  business,
}: {
  url: string;
  accentColor: string;
  accentGradient: string;
  icon: React.ReactNode;
  platformLabel: string;
  business: SocialPreviewBusiness;
}) => {
  const coverSrc = business.coverImage || business.logo;
  const location = business.municipio || business.location;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[24px] border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-[0_12px_30px_-10px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1"
    >
      {coverSrc && (
        <div className="relative w-full h-40 overflow-hidden bg-slate-100">
          <img
            src={coverSrc}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />

          {business.logo && business.coverImage && (
            <div className="absolute bottom-3 left-4">
              <div className="w-12 h-12 rounded-[14px] border-[3px] border-white shadow-md overflow-hidden bg-white">
                <img src={business.logo} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[11px] font-bold shadow-sm backdrop-blur-md"
            style={{ background: accentGradient }}
          >
            {icon}
            {platformLabel}
          </div>
        </div>
      )}

      <div className="p-5">
        {!coverSrc && (
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4 shadow-sm"
            style={{ background: accentGradient }}
          >
            {icon}
          </div>
        )}

        <p className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-emerald-600 transition-colors">
          {business.name}
        </p>

        {business.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        )}

        {location && (
          <p className="text-[11px] font-bold text-slate-400 mt-3 flex items-center gap-1 uppercase tracking-wide">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: accentColor }}
            >
              <span className="scale-[0.6]">{icon}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">
              {url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
        </div>
      </div>
    </a>
  );
};

// ========== 2. WRAPPERS ESPECÍFICOS ==========
export const FacebookPageEmbed = ({ url, business }: { url: string; business: SocialPreviewBusiness }) => (
  <OGPreviewCard
    url={url}
    accentColor="#1877F2"
    accentGradient="linear-gradient(135deg, #1877F2 0%, #0d5fd1 100%)"
    icon={<Facebook className="h-4 w-4 text-white" />}
    platformLabel="Facebook"
    business={business}
  />
);

export const TwitterTimelineEmbed = ({ url, business }: { url: string; business: SocialPreviewBusiness }) => (
  <OGPreviewCard
    url={url}
    accentColor="#000000"
    accentGradient="linear-gradient(135deg, #1a1a1a 0%, #000000 100%)"
    icon={<Twitter className="h-4 w-4 text-white fill-white" />} // Puedes usar el logo de X si lo tienes
    platformLabel="X"
    business={business}
  />
);

export const InstagramProfileCard = ({ url, business }: { url: string; business: SocialPreviewBusiness }) => (
  <OGPreviewCard
    url={url}
    accentColor="#e1306c"
    accentGradient="linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
    icon={<Instagram className="h-4 w-4 text-white" />}
    platformLabel="Instagram"
    business={business}
  />
);

// ========== 3. TIKTOK EMBED (Lógica intacta, UI mejorada) ==========
export const TikTokCreatorEmbed = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState(false);

  const matchAt = url.match(/tiktok\.com\/@([^/?#]+)/);
  const matchNoAt = url.match(/tiktok\.com\/([^@?#][^/?#]*)/);
  const username = matchAt?.[1] ?? matchNoAt?.[1] ?? "";

  const isNativeWebView = (() => {
    try {
      const { Capacitor } = (window as any);
      if (Capacitor?.isNativePlatform?.()) return true;
    } catch { /* ignore */ }
    const ua = navigator.userAgent || "";
    return /wv|WebView/i.test(ua) && /Android/i.test(ua);
  })();

  useEffect(() => {
    if (isNativeWebView) return;
    if (!username || !containerRef.current) return;

    setShowSkeleton(true);
    setError(false);

    containerRef.current.innerHTML = `<blockquote
      class="tiktok-embed"
      cite="https://www.tiktok.com/@${username}"
      data-unique-id="${username}"
      data-embed-type="creator"
      style="max-width:100%; min-width:288px; border:none; margin:0;">
      <section>
        <a target="_blank" href="https://www.tiktok.com/@${username}">@${username}</a>
      </section>
    </blockquote>`;

    const processEmbed = () => {
      const win = window as any;
      if (win.tiktok?.embed?.render) {
        win.tiktok.embed.render();
      }
      setTimeout(() => {
        setShowSkeleton(false);
        const iframes = containerRef.current?.querySelectorAll("iframe");
        if (!iframes || iframes.length === 0) setError(true);
      }, 4000);
    };

    const existingScript = document.getElementById("__tiktok-embed-js");
    if (existingScript) {
      existingScript.remove();
      delete (window as any).tiktok;
    }
    const script = document.createElement("script");
    script.id = "__tiktok-embed-js";
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = processEmbed;
    script.onerror = () => {
      setError(true);
      setShowSkeleton(false);
    };
  }, [username, isNativeWebView]);

  const openExternal = () => {
    const tiktokUrl = `https://www.tiktok.com/@${username}`;
    window.open(tiktokUrl, "_system") || window.open(tiktokUrl, "_blank");
  };

  const renderFallbackCard = () => (
    <a
      href={`https://www.tiktok.com/@${username}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (isNativeWebView) {
          e.preventDefault();
          openExternal();
        }
      }}
      className="block group"
    >
      <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 bg-slate-950 group-hover:bg-slate-900 transition-colors">
        <div className="w-16 h-16 rounded-[18px] bg-[#fe2c55] flex items-center justify-center shadow-[0_0_20px_rgba(254,44,85,0.4)] transition-transform group-hover:scale-110">
          <TikTokIcon className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <p className="font-bold text-white text-lg">@{username}</p>
          <p className="text-sm font-medium text-slate-400 mt-1">Ver videos en TikTok</p>
        </div>
        <span className="mt-2 px-6 py-2.5 rounded-full bg-[#fe2c55] text-white text-[13px] font-bold shadow-sm">
          Abrir en la App
        </span>
      </div>
    </a>
  );

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="px-5 py-3 flex items-center gap-3 bg-slate-900 border-b border-slate-800">
        <div className="bg-black p-1.5 rounded-lg">
           <TikTokIcon className="h-4 w-4 text-white flex-shrink-0" />
        </div>
        <span className="text-[13px] font-bold text-white flex-1 truncate">@{username}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (isNativeWebView) {
              e.preventDefault();
              openExternal();
            }
          }}
          className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          Abrir ↗
        </a>
      </div>

      {isNativeWebView && renderFallbackCard()}
      {!isNativeWebView && error && renderFallbackCard()}

      {!isNativeWebView && !error && (
        <div className="relative bg-slate-50">
          {showSkeleton && (
            <div className="absolute inset-0 z-10 flex flex-col items-center gap-4 px-6 py-8 animate-pulse bg-white pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-slate-200" />
              <div className="h-5 bg-slate-200 rounded-full w-32" />
              <div className="h-3 bg-slate-100 rounded-full w-48" />
              <div className="flex gap-8 mt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-5 bg-slate-200 rounded-md w-12" />
                    <div className="h-3 bg-slate-100 rounded-md w-14" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={containerRef} className="overflow-hidden min-h-[300px]" />
        </div>
      )}
    </div>
  );
};

// ========== 4. CONTENEDOR PRINCIPAL DE REDES ==========
export const SocialEmbedSection = ({ business }: { business: Business }) => {
  const hasSocials = business.facebook || business.twitter || business.instagram || business.tiktok;

  if (!hasSocials) return null;

  const items = [business.facebook, business.twitter, business.instagram, business.tiktok].filter(Boolean).length;

  const previewBusiness: SocialPreviewBusiness = {
    name: business.name,
    description: business.description,
    logo: business.logo,
    coverImage: business.coverImage,
    location: business.location,
    municipio: business.municipio,
  };

  return (
    <div className="mt-8 md:mt-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50">
          <Globe className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Síguenos en redes
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Descubre más contenido y mantente conectado
          </p>
        </div>
      </div>

      <div className={cn("grid gap-5 md:gap-6", items === 1 ? "grid-cols-1 max-w-lg" : "grid-cols-1 md:grid-cols-2")}>
        {business.facebook && <FacebookPageEmbed url={business.facebook} business={previewBusiness} />}
        {business.twitter && <TwitterTimelineEmbed url={business.twitter} business={previewBusiness} />}
        {business.instagram && <InstagramProfileCard url={business.instagram} business={previewBusiness} />}
        {business.tiktok && <TikTokCreatorEmbed url={business.tiktok} />}
      </div>
    </div>
  );
};