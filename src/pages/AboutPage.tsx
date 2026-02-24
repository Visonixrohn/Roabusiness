import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Users, Waves, Fish, TreePine, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useBusinesses } from "@/hooks/useBusinesses";
import BusinessCard from "@/components/BusinessCard";
import ContactModal from "@/components/ContactModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AboutPage = () => {
  const facts = [
    {
      icon: MapPin,
      title: "Ubicación",
      description:
        "Situadas entre 30 y 60 km de la costa norte de Honduras, en el Mar Caribe.",
    },
    {
      icon: Waves,
      title: "Arrecife Mesoamericano",
      description:
        "Forman parte del Sistema Arrecifal Mesoamericano, el segundo arrecife de coral más grande del mundo.",
    },
    {
      icon: Fish,
      title: "Biodiversidad Marina",
      description:
        "Hogar de más de 500 especies marinas, incluyendo peces tropicales, tortugas y manatíes.",
    },
    {
      icon: TreePine,
      title: "Ecosistemas Diversos",
      description:
        "Combina manglares, bosques tropicales y playas, ofreciendo hábitats para flora y fauna únicas.",
    },
    {
      icon: Users,
      title: "Cultura Vibrante",
      description:
        "Una mezcla de raíces garífuna, inglesas, españolas y mayas que se refleja en su música, gastronomía y tradiciones.",
    },
    {
      icon: Camera,
      title: "Destino Turístico",
      description:
        "Principal destino de Honduras para ecoturismo, buceo y turismo de aventura, con un crecimiento sostenible.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6 py-12 space-y-20">
        {/* Negocios cerca de ti */}
        <section className="animate-fadeInUp delay-200">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 underline decoration-purple-400 underline-offset-8 decoration-4">
              Negocios cerca de ti
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Activa tu ubicación para ver negocios cercanos. Filtra por
              distancia y descubre lo mejor de tu área.
            </p>
          </div>

          <NearbyBusinesses />
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

/* Component: NearbyBusinesses (defined below) */
function NearbyBusinesses() {
  const { mostFollowedBusinesses, loading } = useBusinesses() as any;
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [nearby, setNearby] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Estados para el carrusel táctil
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  // Haversine formula
  const distanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const computeNearby = () => {
    if (!userCoords || !mostFollowedBusinesses) return setNearby([]);
    console.log("Total businesses:", mostFollowedBusinesses.length);
    const list = (mostFollowedBusinesses || [])
      .map((b: any) => {
        const lat = b.coordinates?.lat ?? b.latitude;
        const lng = b.coordinates?.lng ?? b.longitude;
        if (lat == null || lng == null) {
          console.log(`Business ${b.name} sin coords:`, {
            lat,
            lng,
            coords: b.coordinates,
          });
          return null;
        }
        const d = distanceKm(userCoords.lat, userCoords.lng, lat, lng);
        console.log(`${b.name}: ${d.toFixed(2)} km`);
        return { ...b, distance: d };
      })
      .filter(Boolean)
      .filter((b: any) => b.distance <= radiusKm)
      .sort((a: any, b: any) => a.distance - b.distance);
    console.log("Nearby businesses:", list.length);
    setNearby(list as any[]);
  };

  useEffect(() => {
    computeNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, mostFollowedBusinesses, radiusKm]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no es soportada por tu navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        alert("No se pudo obtener la ubicación: " + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
    );
  };

  // Solicitar ubicación automáticamente al montar (si el navegador lo permite)
  useEffect(() => {
    if (!navigator.geolocation) return;
    // Intentar usar Permissions API cuando esté disponible para evitar prompts repetidos
    if (
      (navigator as any).permissions &&
      (navigator as any).permissions.query
    ) {
      try {
        (navigator as any).permissions
          .query({ name: "geolocation" })
          .then((permStatus: any) => {
            // Si está granted o prompt, pedimos la ubicación (prompt mostrará al usuario)
            if (
              permStatus.state === "granted" ||
              permStatus.state === "prompt"
            ) {
              requestLocation();
            }
          })
          .catch(() => {
            // En caso de error con Permissions API, todavía intentamos solicitar ubicación
            requestLocation();
          });
      } catch (e) {
        // Fallback: solicitar ubicación
        requestLocation();
      }
    } else {
      // Si no hay Permissions API, intentamos solicitar ubicación directamente
      requestLocation();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers para drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    updateCurrentIndex();
  };

  const updateCurrentIndex = () => {
    if (!carouselRef.current || nearby.length === 0) return;
    const scrollPosition = carouselRef.current.scrollLeft;
    const cardWidth = 344; // 320px + 24px gap
    const index = Math.round(scrollPosition / cardWidth);
    setCurrentIndex(index % nearby.length);
  };

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const cardWidth = 344;
    carouselRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % nearby.length;
    scrollToIndex(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = currentIndex === 0 ? nearby.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (nearby.length === 0 || isPaused) return;

    autoScrollInterval.current = setInterval(() => {
      nextSlide();
    }, 4000); // Cambiar cada 4 segundos

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearby.length, isPaused, currentIndex]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRadiusKm(2)}
            className={`px-3 py-1 rounded-full font-semibold ${radiusKm === 2 ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            2 km
          </button>
          <button
            onClick={() => setRadiusKm(5)}
            className={`px-3 py-1 rounded-full font-semibold ${radiusKm === 5 ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            5 km
          </button>
          <button
            onClick={() => setRadiusKm(10)}
            className={`px-3 py-1 rounded-full font-semibold ${radiusKm === 10 ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            10 km
          </button>
        </div>

        <div>
          {!userCoords ? (
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium"
            >
              Usar mi ubicación
            </button>
          ) : (
            <div className="text-sm text-gray-600"></div>
          )}
        </div>
      </div>

      <div>
        {loading && (
          <div className="text-center text-gray-500">Cargando negocios...</div>
        )}
        {!loading && nearby.length === 0 && (
          <div className="text-center text-gray-500">
            No se encontraron negocios dentro de {radiusKm} km.
          </div>
        )}

        <div className="mt-4">
          {nearby.length > 0 ? (
            <div className="relative">
              {/* Botones de navegación */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>

              {/* Carrusel arrastrable */}
              <div
                ref={carouselRef}
                className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing scroll-smooth"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={(e) => {
                  handleDragEnd();
                  setIsPaused(false);
                }}
                onMouseEnter={() => setIsPaused(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div className="flex gap-6 px-12 py-4">
                  {nearby.map((b: any, idx: number) => (
                    <div
                      key={b.id + "-" + idx}
                      className="w-80 flex-shrink-0 business-card"
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group h-96">
                        {/* Imagen con overlay gradiente */}
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={b.coverImage}
                            alt={b.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          {/* Punto verde pulsante */}
                          <div className="absolute top-4 right-4">
                            <span className="green-dot inline-block w-4 h-4 rounded-full shadow-lg" />
                          </div>

                          {/* Distancia */}
                          <div className="absolute top-4 left-4">
                            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-xs font-bold text-gray-800">
                                {b.distance.toFixed(2)} km
                              </span>
                            </div>
                          </div>

                          {/* Nombre superpuesto en la imagen */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="font-bold text-lg text-white drop-shadow-lg line-clamp-1">
                              {b.name}
                            </h4>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-4 flex flex-col justify-between h-44">
                          {/* Descripción */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                              {b.description ||
                                "Descubre este increíble negocio cerca de ti."}
                            </p>
                          </div>

                          {/* Categoría e isla */}
                          <div className="flex gap-2 mb-3">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                              {b.category}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              {b.departamento || b.island}
                            </span>
                          </div>

                          {/* Botón de contacto */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBiz(b);
                              setShowContactModal(true);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <span>Contactar Ahora</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores de posición */}
              <div className="flex justify-center gap-2 mt-6">
                {nearby.slice(0, Math.min(nearby.length, 10)).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToIndex(idx)}
                    className={`transition-all ${
                      idx === currentIndex % nearby.length
                        ? "w-8 h-2 bg-blue-600"
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    } rounded-full`}
                    aria-label={`Ir a diapositiva ${idx + 1}`}
                  />
                ))}
                {nearby.length > 10 && (
                  <span className="text-xs text-gray-500 ml-2">
                    +{nearby.length - 10}
                  </span>
                )}
              </div>

              {selectedBiz && (
                <ContactModal
                  business={selectedBiz}
                  isOpen={showContactModal}
                  onClose={() => {
                    setShowContactModal(false);
                    setSelectedBiz(null);
                  }}
                  contacts={selectedBiz?.contact}
                />
              )}

              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .green-dot { 
                  background: #16a34a; 
                  box-shadow: 0 0 0 rgba(22,163,74,0.7); 
                  animation: pulse-dot 2s infinite; 
                }
                @keyframes pulse-dot { 
                  0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.7); } 
                  70% { box-shadow: 0 0 0 10px rgba(22,163,74,0); } 
                  100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); } 
                }
                .business-card {
                  animation: slideInUp 0.6s ease-out;
                }
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {userCoords
                ? `No se encontraron negocios dentro de ${radiusKm} km.`
                : "Activa tu ubicación para ver negocios cercanos."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
