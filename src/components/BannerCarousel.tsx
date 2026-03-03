import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useBanners, focalPointToCSS } from "@/hooks/useBanners";

const DEFAULT_BANNERS = [
  {
    id: "default-1",
    title: "Descubre Roatán",
    description:
      "El paraíso caribeño que te espera. Hoteles, tours, restaurantes y mucho más.",
    image_url: "https://i.imgur.com/b41QZLs.png",
    link_url: "/directorio",
    link_label: "Explorar Directorio",
    focal_point: "center" as const,
    zoom_scale: 1,
  },
];

const AUTOPLAY_MS = 6000;
const ANIM_MS = 450;

const BannerCarousel = () => {
  const { banners, loading } = useBanners();
  const activeBanners = useMemo(
    () => (banners?.length ? banners : DEFAULT_BANNERS),
    [banners],
  );

  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (animating || activeBanners.length <= 1) return;
      setAnimating(true);
      setTimeout(() => {
        setIndex(nextIndex);
        setAnimating(false);
      }, ANIM_MS);
    },
    [animating, activeBanners.length],
  );

  const goNext = useCallback(() => {
    const next = (index + 1) % activeBanners.length;
    goTo(next);
  }, [index, activeBanners.length, goTo]);

  const goPrev = useCallback(() => {
    const prev = (index - 1 + activeBanners.length) % activeBanners.length;
    goTo(prev);
  }, [index, activeBanners.length, goTo]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const t = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [goNext, activeBanners.length]);

  if (loading) {
    return (
      <>
        <div className="w-full block md:hidden aspect-[2/1] bg-gradient-to-r from-sky-300 to-cyan-200 animate-pulse rounded-2xl" />
        <div className="w-full hidden md:block aspect-[32/3] bg-gradient-to-r from-sky-300 to-cyan-200 animate-pulse rounded-2xl" />
      </>
    );
  }

  const banner = activeBanners[index];

  return (
    <section className="relative w-full rounded-3xl">
      {/* Imagen con overflow-hidden propio */}
      <div className="relative w-full overflow-hidden rounded-3xl">
        {/* Imagen MÓVIL — visible solo en pantallas pequeñas */}
        <img
          key={`mob-${banner.id}`}
          src={(banner as any).mobile_image_url || banner.image_url}
          alt={banner.title}
          className={`block md:hidden w-full aspect-[2/1] object-cover transition-all duration-500 ${
            animating ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
          style={{ objectPosition: focalPointToCSS(banner.focal_point) }}
          draggable={false}
        />
        {/* Imagen DESKTOP — visible solo en pantallas medianas y grandes */}
        <img
          key={`desk-${banner.id}`}
          src={banner.image_url}
          alt={banner.title}
          className={`hidden md:block w-full aspect-[32/3] object-cover transition-all duration-500 ${
            animating ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
          style={{
            objectPosition: focalPointToCSS(banner.focal_point),
            transform: `scale(${(banner as any).zoom_scale ?? 1})`,
            transformOrigin: focalPointToCSS(banner.focal_point),
          }}
          draggable={false}
        />

        {/* Controles de navegación */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-cyan-700 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-cyan-700 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicadores */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-cyan-500"
                    : "w-2 bg-white/80 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botón de enlace — esquina inferior derecha, fuera del overflow-hidden */}
      {banner.link_url && (
        <a
          href={banner.link_url}
          target={banner.link_url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="absolute bottom-3 right-14 z-30 flex items-center gap-1.5 text-white font-semibold text-sm px-4 py-1.5 rounded-full shadow-lg transition whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: (banner as any).link_button_color || '#06b6d4' }}
        >
          {banner.link_label || 'Ver más'}
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      )}
    </section>
  );
};

export default BannerCarousel;
