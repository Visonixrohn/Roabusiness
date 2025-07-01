import { Link } from "react-router-dom";
import { Search, MapPin, Star, ChevronRight, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import IslandsSection from "@/components/Islansection";
import HeroSection from "@/components/Hero";
import AboutPage from "./AboutPage";
const HomePage = () => {
  // Usar negocios más seguidos y destacados dinámicamente
  const { mostFollowedBusinesses, loading, followersMap } = useBusinesses();
  // Nuevo: obtener todos los negocios públicos
  const { businesses } = useBusinesses();
  const publicCount = businesses.filter((b) => b.is_public !== false).length;
  const [displayedCount, setDisplayedCount] = useState(0);
  const installPromptRef = useRef<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  // Estado para animación de imagen hero
  const [imgLoaded, setImgLoaded] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);

  // Al cargar la imagen, activa el ripple
  const handleImageLoad = () => {
    setImgLoaded(true);
    setTimeout(() => setRippleActive(true), 50); // Pequeño delay para el efecto
  };

  useEffect(() => {
    // Detectar si ya está instalada como PWA
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
    );
    // Capturar el evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      installPromptRef.current = e;
    });
  }, []);

  // Animación de incremento para el conteo de negocios públicos
  useEffect(() => {
    let start = 0;
    if (publicCount === 0) {
      setDisplayedCount(0);
      return;
    }
    const duration = 1200; // ms
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

  return (
    <div className="min-h-screen">
      <Header />
 <HeroSection/>
      {/* Estadísticas */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
       <h2 className="text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight font-display">
  Lo que te espera
</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
            <div className="space-y-2 hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-blue-600">3</div>
              <p className="text-gray-700">Islas Principales</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-blue-600">
                {displayedCount}
              </div>
              <p className="text-gray-700">Negocios Destacados</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-blue-600">∞</div>
              <p className="text-gray-700">Experiencias Únicas</p>
            </div>
          </div>
        </div>
      </section>
      {/* Negocios Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto px-4">
  <h2 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-md">
    Negocios Destacados
  </h2>
  <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
    Descubre los negocios con más <span className="font-semibold text-teal-600">seguidores</span> en las Islas de la Bahía
  </p>
  <div className="mt-6 flex justify-center space-x-3">
    <span className="inline-block w-20 h-1 bg-teal-500 rounded-full animate-pulse"></span>
    <span className="inline-block w-12 h-1 bg-teal-300 rounded-full animate-pulse delay-150"></span>
    <span className="inline-block w-8 h-1 bg-teal-200 rounded-full animate-pulse delay-300"></span>
  </div>
</div>


          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostFollowedBusinesses
                .filter((business) => business.is_public !== false)
                .slice(0, 6)
                .map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    followers={followersMap[business.id] || 0}
                  />
                ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/directorio">
            <div className="flex justify-center">
  <Button
    size="lg"
    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
  >
    Ver Todos los Negocios
    <ChevronRight className="ml-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
  </Button>
</div>

            </Link>
          </div>
        </div>
      </section>
<AboutPage />
      {/* Islas */}
      <IslandsSection isStandalone={isStandalone} installPromptRef={installPromptRef} />

      <Footer />
    </div>
  );
};

export default HomePage;
