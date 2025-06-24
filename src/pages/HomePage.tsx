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

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://i.imgur.com/IyMgElg.jpeg')`,
          }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Descubre las
            <span className="text-blue-400 block">Islas de la Bahía</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            El paraíso caribeño de Honduras te espera. Explora los mejores
            negocios, restaurantes, hoteles y actividades en Roatán, Utila y
            Guanaja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/directorio">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Explorar Directorio
              </Button>
            </Link>
            <Link to="/sobre-las-islas">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Conoce las Islas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">3</div>
              <div className="text-gray-600">Islas Principales</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">12+</div>
              <div className="text-gray-600">Negocios Destacados</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">∞</div>
              <div className="text-gray-600">Experiencias Únicas</div>
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
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded flex items-center justify-center gap-2 shadow mt-2"
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
                  style={{ background: '#fff' }}
                />
                <h3 className="font-bold mb-2 text-lg text-center">¿Cómo agregar RoaBusiness a tu pantalla de inicio?</h3>
                <ol className="list-decimal ml-5 space-y-1 text-left">
                  <li>Abre el menú <b>⋮</b> o <b>Compartir</b> de tu navegador.</li>
                  <li>Selecciona <b>"Agregar a pantalla de inicio"</b> o <b>"Instalar app"</b>.</li>
                  <li>Confirma la instalación. ¡Listo!</li>
                </ol>
                <div className="flex justify-end mt-2 w-full">
                  <button onClick={() => setShowTutorial(false)} className="text-blue-600 hover:underline text-sm">Cerrar</button>
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
