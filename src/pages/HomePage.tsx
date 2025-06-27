import { Link } from "react-router-dom";
import { Search, MapPin, Star, ChevronRight, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const HomePage = () => {
  // Usar negocios más seguidos y destacados dinámicamente
  const { mostFollowedBusinesses, loading, followersMap } = useBusinesses();
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

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section Mejorado */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Imagen de fondo */}
        <img
          src="https://i.imgur.com/IyMgElg.jpeg"
          alt="Islas de la Bahía"
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleImageLoad}
          style={{ zIndex: 1 }}
        />
        {/* Ripple SVG animado */}
        {!rippleActive && (
          <svg
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="60" r="1" fill="rgba(255,255,255,0.15)">
              <animate
                attributeName="r"
                from="1"
                to="80"
                dur="1s"
                begin="0s"
                fill="freeze"
                keySplines="0.4 0 0.2 1"
                calcMode="spline"
              />
              <animate
                attributeName="opacity"
                from="0.7"
                to="0"
                dur="1s"
                begin="0s"
                fill="freeze"
              />
            </circle>
          </svg>
        )}
        {/* Máscara circular para revelar la imagen */}
        <div
          className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-1000 ${rippleActive ? "mask-reveal" : ""}`}
          style={{
            background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6))",
            zIndex: 2,
            maskImage: rippleActive
              ? "radial-gradient(circle at 50% 60%, white 100%, transparent 100%)"
              : "radial-gradient(circle at 50% 60%, white 0%, transparent 0%)",
            WebkitMaskImage: rippleActive
              ? "radial-gradient(circle at 50% 60%, white 100%, transparent 100%)"
              : "radial-gradient(circle at 50% 60%, white 0%, transparent 0%)",
            transition: "mask-image 1s, -webkit-mask-image 1s",
          }}
        />
        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-lg leading-tight">
            Descubre las
            <span className="text-blue-400 block animate-pulse">
              Islas de la Bahía
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-100 drop-shadow-md">
            El paraíso caribeño de Honduras te espera. Explora los mejores
            negocios, restaurantes, hoteles y actividades en Roatán, Utila y
            Guanaja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/directorio">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 shadow-xl px-8 py-4 text-lg transition-transform hover:scale-105"
              >
                <Search className="mr-2 h-5 w-5" />
                Explorar Directorio
              </Button>
            </Link>
            <Link to="/sobre-las-islas">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg transition-transform hover:scale-105"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Conoce las Islas
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Estadísticas */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-12">
            Lo que te espera
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
            <div className="space-y-2 hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-blue-600">3</div>
              <p className="text-gray-700">Islas Principales</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-blue-600">5+</div>
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
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Negocios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre los negocios con más seguidores en las Islas de la Bahía
            </p>
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
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ver Todos los Negocios
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Islas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explora Nuestras Islas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cada isla tiene su propia personalidad y atractivos únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl h-64">
                <img
                  src="/images/roatan-beach.png"
                  alt="Roatán"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">Roatán</h3>
                  <p className="text-white opacity-90">La isla principal</p>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl h-64">
                <img
                  src="/images/utila-diving.jpg"
                  alt="Utila"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">Utila</h3>
                  <p className="text-white opacity-90">Paraíso del buceo</p>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl h-64">
                <img
                  src="/images/guanaja-beach.jpeg"
                  alt="Guanaja"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">Guanaja</h3>
                  <p className="text-white opacity-90">La isla verde</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button
              onClick={async () => {
                if (isStandalone) {
                  alert("¡Ya tienes RoaBusiness como app en tu dispositivo!");
                  return;
                }
                if (installPromptRef.current) {
                  installPromptRef.current.prompt();
                  const { outcome } = await installPromptRef.current.userChoice;
                  if (outcome === "accepted") return;
                }
                setShowTutorial(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg flex items-center justify-center gap-2 shadow-lg mt-2 rounded-full border-2 border-blue-400 hover:border-blue-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95"
            >
              <Download className="h-5 w-5" />
              Instalar RoaBusiness (Acceso Directo)
            </button>
            {showTutorial && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 mt-4 max-w-md mx-auto text-gray-800 text-left shadow-lg animate-fade-in flex flex-col items-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2288/2288494.png"
                  alt="Icono RoaBusiness"
                  className="w-16 h-16 mb-2 rounded-full shadow"
                  style={{ background: "#fff" }}
                />
                <h3 className="font-bold mb-2 text-lg text-center">
                  ¿Cómo agregar RoaBusiness a tu pantalla de inicio?
                </h3>
                <ol className="list-decimal ml-5 space-y-1 text-left">
                  <li>
                    Abre el menú <b>⋮</b> o <b>Compartir</b> de tu navegador.
                  </li>
                  <li>
                    Selecciona <b>"Agregar a pantalla de inicio"</b> o{" "}
                    <b>"Instalar app"</b>.
                  </li>
                  <li>Confirma la instalación. ¡Listo!</li>
                </ol>
                <div className="flex justify-end mt-2 w-full">
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
