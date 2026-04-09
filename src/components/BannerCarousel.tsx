import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useBanners, focalPointToCSS } from "@/hooks/useBanners";
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad (clsx + tailwind-merge), o usa template literals normales

const DEFAULT_BANNERS = [
  {
    id: "default-1",
    title: "Descubre el Paraíso",
    description: "Hoteles, tours, restaurantes y mucho más.",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    link_url: "/directorio",
    link_label: "Explorar Directorio",
    focal_point: "center" as const,
    zoom_scale: 1,
  },
];

const AUTOPLAY_MS = 4500; // Un poco más lento para mejor lectura

const BannerCarousel = () => {
  const { banners, loading } = useBanners();
  const activeBanners = useMemo(
    () => (banners?.length ? banners : DEFAULT_BANNERS),
    [banners]
  );

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Autoplay con pausa en Hover
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [goNext, activeBanners.length, isPaused]);

  // Skeletons de carga unificados
  if (loading) {
    return (
      <div className="w-full relative rounded-[24px] overflow-hidden bg-slate-100 animate-pulse aspect-[2/1] md:aspect-[4/1] shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
    );
  }

  return (
    <section
      className="relative w-full rounded-[24px] overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Contenedor principal con aspect ratio responsivo */}
      <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] md:aspect-[4/1] lg:aspect-[5/1] overflow-hidden bg-slate-900">
        
        {/* Renderizamos TODAS las imágenes superpuestas para lograr el Crossfade perfecto */}
        {activeBanners.map((banner, i) => {
          const isActive = i === index;
          const objectPos = focalPointToCSS(banner.focal_point);
          const zoom = (banner as any).zoom_scale ?? 1;

          return (
            <div
              key={banner.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              {/* MÓVIL */}
              <img
                src={(banner as any).mobile_image_url || banner.image_url}
                alt={banner.title}
                className={cn(
                  "block md:hidden w-full h-full object-cover transition-transform duration-[4000ms] ease-out",
                  isActive ? "scale-100" : "scale-105"
                )}
                style={{ objectPosition: objectPos }}
                draggable={false}
              />
              
              {/* DESKTOP */}
              <img
                src={banner.image_url}
                alt={banner.title}
                className={cn(
                  "hidden md:block w-full h-full object-cover transition-transform duration-[4000ms] ease-out",
                  isActive ? "scale-100" : "scale-[1.03]"
                )}
                style={{
                  objectPosition: objectPos,
                  transform: isActive ? `scale(${zoom})` : `scale(${zoom + 0.05})`,
                  transformOrigin: objectPos,
                }}
                draggable={false}
              />

              {/* Gradiente oscuro inferior para legibilidad de textos/botones */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />

              {/* Botón CTA */}
              {banner.link_url && (
                <a
                  href={banner.link_url}
                  target={banner.link_url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={cn(
                    "absolute bottom-4 right-4 md:bottom-6 md:right-6 z-30",
                    "flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg",
                    "text-white font-bold text-xs sm:text-sm whitespace-nowrap",
                    "transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto"
                  )}
                  style={{
                    backgroundColor: (banner as any).link_button_color || "#059669", // Esmeralda por defecto
                  }}
                  onClick={(e) => e.stopPropagation()} // Previene clicks accidentales si la tarjeta entera fuera clickeable
                >
                  {banner.link_label || "Ver más"}
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                </a>
              )}
            </div>
          );
        })}

        {/* ─── CONTROLES DE NAVEGACIÓN ─── */}
        {activeBanners.length > 1 && (
          <>
            {/* Flecha Izquierda */}
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95"
              aria-label="Anterior banner"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Flecha Derecha */}
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95"
              aria-label="Siguiente banner"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Indicadores (Puntitos) */}
            <div className="absolute bottom-4 sm:bottom-6 left-6 z-20 flex items-center gap-2">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                    i === index 
                      ? "w-6 sm:w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
                      : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
                  )}
                  aria-label={`Ir al banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BannerCarousel;