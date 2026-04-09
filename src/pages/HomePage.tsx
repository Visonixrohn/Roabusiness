import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, MapPin, Star, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNegociosDestacados } from "@/hooks/useNegociosDestacados";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import IslandsSection from "@/components/Islansection";
import BannerCarousel from "@/components/BannerCarousel";
import { useCountryContext } from "@/contexts/CountryContext";

// Componente de estructura interna
const SectionShell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`w-full ${className}`}>
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6">{children}</div>
  </section>
);

const HomePage = () => {
  const { country } = useCountryContext();
  const navigate = useNavigate();
  const { destacados, loading: loadingDestacados } = useNegociosDestacados(6, country);
  const { businesses, followersMap } = useBusinesses();

  const [displayedCount, setDisplayedCount] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // Filtrar negocios públicos
  const featuredBusinesses = (destacados || [])
    .filter((b) => b.is_public !== false)
    .slice(0, 6);

  const publicCount = businesses.filter((b) => b.is_public !== false).length;

  // Animación de contador
  useEffect(() => {
    if (publicCount === 0) return;
    const interval = setInterval(() => {
      setDisplayedCount((prev) => (prev < publicCount ? prev + 1 : prev));
    }, 20);
    return () => clearInterval(interval);
  }, [publicCount]);

  // Timer del Hero
  useEffect(() => {
    if (featuredBusinesses.length <= 1) return;
    const id = setInterval(() => {
      setHeroIndex((s) => (s + 1) % featuredBusinesses.length);
    }, 5000);
    return () => clearInterval(id);
  }, [featuredBusinesses.length]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Header />

     

      {/* Banner Carousel */}
      <SectionShell className="pb-10">
        <BannerCarousel />
      </SectionShell>

      {/* Negocios Destacados - AQUÍ ESTÁ EL GRID DE 2 COLUMNAS */}
      <SectionShell className="pb-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold">Directorio <span className="text-emerald-600">Digital</span></h2>
        </div>

        {loadingDestacados ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {featuredBusinesses.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                followers={followersMap[business.id] || 0} 
              />
            ))}
          </div>
        )}
      </SectionShell>

      <SectionShell className="pb-16">
        <IslandsSection />
      </SectionShell>
 {/* Hero Section */}
      <SectionShell className="pt-6 pb-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white p-8 md:p-12">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Los mejores negocios de <span className="text-emerald-400">{country || "tu zona"}</span>
            </h1>
            <p className="mt-4 text-slate-300 text-lg">Explora la guía más completa de servicios y comercios locales.</p>
            <div className="mt-8">
              <Link to="/directorio">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-12">
                  <Search className="mr-2 h-4 w-4" /> Explorar ahora
                </Button>
              </Link>
            </div>
          </div>
          {/* Imagen de fondo sutil para el Hero */}
          <div className="absolute inset-0 opacity-30">
            {featuredBusinesses[heroIndex] && (
              <img 
                src={featuredBusinesses[heroIndex].coverImage} 
                className="w-full h-full object-cover" 
                alt="bg"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          </div>
        </div>
      </SectionShell>
    </div>
  );
};

export default HomePage;