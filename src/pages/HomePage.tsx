import { Link } from "react-router-dom";
import { ChevronRight, Search, MapPin, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNegociosDestacados } from "@/hooks/useNegociosDestacados";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import IslandsSection from "@/components/Islansection";
import BannerCarousel from "@/components/BannerCarousel";
import AboutPage from "./AboutPage";

const SectionShell = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`w-full ${className}`}>
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6">{children}</div>
  </section>
);

const HomePage = () => {
  const { destacados, loading: loadingDestacados } = useNegociosDestacados(6);
  const { businesses, followersMap } = useBusinesses();

  const publicBusinesses = businesses.filter((b) => b.is_public !== false);
  const publicCount = publicBusinesses.length;

  const [displayedCount, setDisplayedCount] = useState(0);

  useEffect(() => {
    let start = 0;

    if (publicCount === 0) {
      setDisplayedCount(0);
      return;
    }

    const duration = 1200;
    const stepTime = Math.max(Math.floor(duration / publicCount), 20);

    const interval = setInterval(() => {
      start += 1;
      setDisplayedCount((prev) => {
        if (prev < publicCount) return prev + 1;
        clearInterval(interval);
        return prev;
      });

      if (start >= publicCount) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [publicCount]);

  const featuredBusinesses = [...destacados]
    .filter((business) => business.is_public !== false)
    .sort((a, b) => {
      const totalRatingsDiff = (b.total_ratings || 0) - (a.total_ratings || 0);
      if (totalRatingsDiff !== 0) return totalRatingsDiff;
      return (b.average_rating || 0) - (a.average_rating || 0);
    })
    .slice(0, 6);

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (featuredBusinesses.length === 0) return;
    const id = setInterval(() => {
      setHeroIndex((s) => (s + 1) % featuredBusinesses.length);
    }, 4500);
    return () => clearInterval(id);
  }, [featuredBusinesses.length]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.08),transparent_28%),linear-gradient(to_bottom,#f8fafc,#ffffff)] text-slate-900">
      <Header />

      {/* HERO */}
      <SectionShell className="pt-8 md:pt-12 pb-10 md:pb-16">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.14),transparent_24%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_24%)]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center px-6 py-10 md:px-10 md:py-14">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                Descubre lo mejor de Roatán
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-tight text-slate-900">
                El directorio con los
                <span className="block bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  mejores negocios.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base md:text-lg leading-8 text-slate-600">
                Explora restaurantes, tours, hoteles, tiendas y servicios
                locales en un solo lugar. Encuentra negocios destacados,
                descubre nuevas opciones y conecta con lo mejor.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/directorio">
                  <Button
                    size="lg"
                    className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 px-6 shadow-md"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Explorar Directorio
                  </Button>
                </Link>

                <Link to="/directorio">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 px-6"
                  >
                    Ver negocios destacados
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">Destacados</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {featuredBusinesses.length}+
                  </p>
                  <p className="text-sm text-slate-500">
                    Negocios recomendados
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sky-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Cobertura</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900"></p>
                  <p className="text-sm text-slate-500">
                    Lugares y zonas clave
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-violet-600">
                    <Search className="h-4 w-4" />
                    <span className="text-sm font-medium">Directorio</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {displayedCount}+
                  </p>
                  <p className="text-sm text-slate-500">Negocios públicos</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-emerald-200/40 via-cyan-100/20 to-blue-200/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] h-[320px] md:h-[420px]">
                {featuredBusinesses.length > 0 ? (
                  <>
                    <img
                      src={
                        featuredBusinesses[heroIndex]?.coverImage ||
                        featuredBusinesses[heroIndex]?.logo ||
                        ""
                      }
                      alt={featuredBusinesses[heroIndex]?.name || "Destacado"}
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/8 to-transparent" />

                    <button
                      aria-label="Anterior"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroIndex(
                          (i) =>
                            (i - 1 + featuredBusinesses.length) %
                            featuredBusinesses.length,
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-2 py-1 rounded-full shadow-md"
                    >
                      ‹
                    </button>

                    <button
                      aria-label="Siguiente"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroIndex(
                          (i) => (i + 1) % featuredBusinesses.length,
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-2 py-1 rounded-full shadow-md"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4">
                        <p className="text-sm text-white/80">
                          Explora experiencias locales
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white tracking-tight">
                          {featuredBusinesses[heroIndex]?.name ||
                            "Negocio destacado"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                    alt="Roatán"
                    className="h-[320px] md:h-[420px] w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* DESTACADOS */}
      <SectionShell className="pb-8 md:pb-12">
        <div className="rounded-[32px] border border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] overflow-hidden">
          <div className="px-6 pt-8 md:px-10 md:pt-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700">
                Selección especial
              </div>

              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                Negocios Destacados
              </h2>

              <p className="mt-4 text-base md:text-lg text-slate-600 leading-8">
                Una selección de negocios mejor calificados y más recomendados
                por la comunidad.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <span className="inline-block h-1.5 w-16 rounded-full bg-emerald-500" />
                <span className="inline-block h-1.5 w-10 rounded-full bg-emerald-300" />
                <span className="inline-block h-1.5 w-6 rounded-full bg-emerald-200" />
              </div>
            </div>
          </div>

          <div className="px-6 pt-8 md:px-10">
            <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-sm">
              <BannerCarousel />
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            {loadingDestacados ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5 animate-pulse"
                  >
                    <div className="h-44 bg-slate-200 rounded-2xl mb-4" />
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {featuredBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    followers={followersMap[business.id] || 0}
                  />
                ))}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Link to="/directorio">
                <Button
                  size="lg"
                  className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md"
                >
                  Ver todos los negocios
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* ISLAS */}
      <SectionShell className="pb-10 md:pb-14">
        <IslandsSection />
      </SectionShell>

      {/* ABOUT */}
      <SectionShell className="pb-10 md:pb-16">
        <div className="rounded-[32px] border border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] overflow-hidden">
          <AboutPage />
        </div>
      </SectionShell>

      <Footer />
    </div>
  );
};

export default HomePage;
