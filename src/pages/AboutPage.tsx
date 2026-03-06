import {
  MapPin,
  Users,
  Waves,
  Fish,
  TreePine,
  Camera,
  LocateFixed,
  Search,
  Store,
  Info,
  Share2,
} from "lucide-react"; // Añadí LocateFixed, Search, Store, Info, Share2 para iconos
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useBusinesses } from "@/hooks/useBusinesses";
import ContactModal from "@/components/ContactModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Añadí Shadcn Button para los controles
import { StarRating } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";
import { shareBusinessLink } from "@/lib/shareUtils";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header y Footer irían aquí si los usas en el layout principal */}
      {/* <Header /> */}

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-20">
        {/* Negocios cerca de ti */}
        <section className="py-8 sm:py-12 md:py-20 animate-fadeInUp delay-200">
          <div className="text-center mb-12 sm:mb-16 relative">
            {" "}
            {/* Más margen inferior y posición relativa para el adorno */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-3 sm:mb-4 tracking-tight px-4">
              Negocios Cercanos
            </h2>
            {/* Adorno sutil */}
          </div>

          <NearbyBusinesses />
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

/* Component: BusinessRatingCompact - Muestra calificación en tarjetas pequeñas */
const BusinessRatingCompact = ({ businessId }: { businessId: string }) => {
  const { average, totalRatings, loading } = useRatings(businessId);

  if (loading) {
    return (
      <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 animate-pulse rounded" />
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <StarRating
        value={average || 0}
        readOnly
        size={12}
        showValue={false}
        className="sm:hidden"
      />
      <StarRating
        value={average || 0}
        readOnly
        size={14}
        showValue={false}
        className="hidden sm:block"
      />
      <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
        {average ? average.toFixed(1) : "0.0"}
      </span>
      <span className="text-[10px] sm:text-xs text-gray-500">
        ({totalRatings})
      </span>
    </div>
  );
};

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
    if (!userCoords || !mostFollowedBusinesses) {
      setNearby([]);
      return;
    }
    const list = (mostFollowedBusinesses || [])
      .map((b: any) => {
        const lat = b.coordinates?.lat ?? b.latitude;
        const lng = b.coordinates?.lng ?? b.longitude;
        if (lat == null || lng == null) {
          return null;
        }
        const d = distanceKm(userCoords.lat, userCoords.lng, lat, lng);
        return { ...b, distance: d };
      })
      .filter(Boolean)
      .filter((b: any) => b.distance <= radiusKm)
      .sort((a: any, b: any) => a.distance - b.distance);
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
    // Añadí un estado de carga para la ubicación
    // setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // setLoadingLocation(false);
      },
      (err) => {
        alert("No se pudo obtener la ubicación: " + err.message);
        // setLoadingLocation(false);
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
    setIsPaused(true); // Pausar auto-scroll al iniciar drag
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    setIsPaused(true); // Pausar auto-scroll al iniciar drag
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Ajuste para sensibilidad
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Ajuste para sensibilidad
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    updateCurrentIndex();
    // Reanudar auto-scroll después de un breve delay para interacción manual
    setTimeout(() => setIsPaused(false), 2000);
  };

  const updateCurrentIndex = () => {
    if (!carouselRef.current || nearby.length === 0) return;
    const scrollPosition = carouselRef.current.scrollLeft;
    // Calcular ancho dinámicamente basado en el viewport
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;
    const cardWidth = isMobile ? 260 : isTablet ? 300 : 320;
    const gap = isMobile ? 16 : 24; // 4 = 16px, 6 = 24px
    const cardWidthWithGap = cardWidth + gap;
    const index = Math.round(scrollPosition / cardWidthWithGap);
    setCurrentIndex(index % nearby.length);
  };

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    // Calcular ancho dinámicamente basado en el viewport
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;
    const cardWidth = isMobile ? 260 : isTablet ? 300 : 320;
    const gap = isMobile ? 16 : 24;
    const cardWidthWithGap = cardWidth + gap;
    carouselRef.current.scrollTo({
      left: index * cardWidthWithGap,
      behavior: "smooth",
    });
    setCurrentIndex(index);
    setIsPaused(true); // Pausar auto-scroll al usar los botones
    setTimeout(() => setIsPaused(false), 2000); // Reanudar después de un delay
  };

  const nextSlide = () => {
    if (nearby.length === 0) return;
    const nextIndex = (currentIndex + 1) % nearby.length;
    scrollToIndex(nextIndex);
  };

  const prevSlide = () => {
    if (nearby.length === 0) return;
    const prevIndex = currentIndex === 0 ? nearby.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (nearby.length === 0 || isPaused) {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
      return;
    }

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
    <div className="max-w-7xl mx-auto">
      {" "}
      {/* Aumenté el max-w */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 p-3 sm:p-4 bg-white rounded-xl shadow-md">
        {" "}
        {/* Controles en un panel */}
        {/* Controles de radio de búsqueda */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1 w-full md:w-auto justify-center md:justify-start mb-1 md:mb-0">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            Distancia:
          </span>
          <Button
            variant={radiusKm === 2 ? "default" : "outline"}
            onClick={() => setRadiusKm(2)}
            className={`${radiusKm === 2 ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-700 border-gray-300 hover:bg-gray-50"} rounded-full px-3 sm:px-4 py-1.5 sm:py-2 h-auto text-xs sm:text-sm`}
          >
            2 km
          </Button>
          <Button
            variant={radiusKm === 5 ? "default" : "outline"}
            onClick={() => setRadiusKm(5)}
            className={`${radiusKm === 5 ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-700 border-gray-300 hover:bg-gray-50"} rounded-full px-3 sm:px-4 py-1.5 sm:py-2 h-auto text-xs sm:text-sm`}
          >
            5 km
          </Button>
          <Button
            variant={radiusKm === 10 ? "default" : "outline"}
            onClick={() => setRadiusKm(10)}
            className={`${radiusKm === 10 ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-700 border-gray-300 hover:bg-gray-50"} rounded-full px-3 sm:px-4 py-1.5 sm:py-2 h-auto text-xs sm:text-sm`}
          >
            10 km
          </Button>
        </div>
        {/* Botón de ubicación */}
        <div className="w-full md:w-auto">
          {!userCoords ? (
            <Button
              onClick={requestLocation}
              className="w-full md:w-auto px-4 sm:px-6 py-1.5 sm:py-2 h-auto bg-green-500 hover:bg-green-600 text-white rounded-full font-medium flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
            >
              <LocateFixed className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Usar mi ubicación</span>
              <span className="xs:hidden">Mi ubicación</span>
            </Button>
          ) : (
            <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1 sm:gap-1.5 p-2 rounded-full bg-blue-50 border border-blue-200">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              Ubicación activa
              {/* Aquí podrías añadir una indicación de la ubicación actual si la tuvieras con una ciudad, por ejemplo */}
            </div>
          )}
        </div>
      </div>
      <div>
        {/* Indicadores de estado */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 sm:h-48 bg-white rounded-xl shadow-md text-gray-500 animate-pulse px-4">
            <Store className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base md:text-lg font-medium text-center">
              Buscando negocios cercanos...
            </p>
          </div>
        )}
        {!loading && (!userCoords || nearby.length === 0) && (
          <div className="flex flex-col items-center justify-center h-40 sm:h-48 bg-white rounded-xl shadow-md text-gray-500 px-4">
            <Info className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400 mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base md:text-lg font-medium text-center">
              {userCoords
                ? `No se encontraron negocios dentro de ${radiusKm} km. Intenta expandir el radio.`
                : "Activa tu ubicación para ver negocios cercanos y la magia sucederá."}
            </p>
          </div>
        )}

        {/* Carrusel */}
        {nearby.length > 0 && (
          <div className="relative group">
            {" "}
            {/* Añadí group para botones que aparecen al hover */}
            {/* Botones de navegación del carrusel */}
            <Button
              onClick={prevSlide}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-1.5 sm:p-2.5 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:left-0 focus:opacity-100"
              aria-label="Anterior"
              variant="outline"
              size="icon"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </Button>
            <Button
              onClick={nextSlide}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-1.5 sm:p-2.5 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:right-0 focus:opacity-100"
              aria-label="Siguiente"
              variant="outline"
              size="icon"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </Button>
            {/* Carrusel arrastrable */}
            <div
              ref={carouselRef}
              className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing scroll-smooth px-2 sm:px-4" // Padding horizontal para ver parcialmente la siguiente tarjeta
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={() => {
                // Modificado para reanudar solo si no hay dragging activo
                if (!isDragging) {
                  handleDragEnd();
                  setIsPaused(false);
                }
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
              <div className="flex gap-4 sm:gap-6 py-4">
                {" "}
                {/* Gap y padding para las tarjetas */}
                {nearby.map((b: any, idx: number) => (
                  <div
                    key={b.id + "-" + idx}
                    className="w-[260px] sm:w-[300px] md:w-[320px] flex-shrink-0 business-card" // Ancho responsivo
                  >
                    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:shadow-2xl hover:border-blue-200 transform hover:-translate-y-1 transition-all duration-500 group h-[400px] sm:h-[430px] md:h-[450px]">
                      {" "}
                      {/* Altura fija y efectos */}
                      {/* Imagen con overlay gradiente */}
                      <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden">
                        {" "}
                        {/* Altura de la imagen */}
                        <img
                          src={
                            b.coverImage ||
                            "https://via.placeholder.com/400x250?text=Negocio"
                          } // Placeholder si no hay imagen
                          alt={b.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Distancia y estado */}
                        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1.5 sm:gap-2">
                          {/* Distancia */}
                          <Badge className="bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold text-gray-800">
                            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                            {b.distance.toFixed(1)} km
                          </Badge>
                          {/* Botón de estado (Ej: Abierto/Cerrado) */}
                          {/* <Badge className="bg-green-500/90 text-white px-2 py-1.5 rounded-full text-xs font-bold shadow-md">Abierto</Badge> */}
                        </div>
                        {/* Nombre superpuesto en la imagen */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                          <h4 className="font-bold text-base sm:text-lg md:text-xl text-white drop-shadow-md line-clamp-1">
                            {" "}
                            {/* Texto más grande */}
                            {b.name}
                          </h4>
                        </div>
                        {/* Logo flotante */}
                        <div className="absolute -bottom-5 sm:-bottom-6 left-2 sm:left-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-white shadow-xl overflow-hidden bg-white">
                            <img
                              src={
                                b.logo ||
                                b.coverImage ||
                                "https://via.placeholder.com/150"
                              }
                              alt={`${b.name} logo`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Contenido de la tarjeta */}
                      <div className="p-3 sm:p-4 pt-6 sm:pt-7 md:pt-8 flex flex-col justify-between h-[calc(100%-176px)] sm:h-[calc(100%-208px)] md:h-[calc(100%-224px)]">
                        {" "}
                        {/* Altura ajustada con pt-8 para el logo */}
                        {/* Descripción */}
                        <div className="mb-2 sm:mb-3 flex-grow">
                          {" "}
                          {/* flex-grow para que ocupe espacio disponible */}
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                            {b.description ||
                              "Un negocio increíble con productos y servicios de calidad. ¡Descúbrelo ahora!"}
                          </p>
                        </div>
                        {/* Calificaciones */}
                        <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100">
                          <BusinessRatingCompact businessId={b.id} />
                        </div>
                        {/* Categoría e isla */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {(b.categories && b.categories.length > 0
                            ? b.categories
                            : [b.category || "General"]
                          )
                            .filter(Boolean)
                            .map((cat: string) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                              >
                                {cat}
                              </Badge>
                            ))}
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                          >
                            {b.departamento || b.island || "Honduras"}
                          </Badge>
                        </div>
                        {/* Botones de acción */}
                        <div className="flex gap-1.5 sm:gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBiz(b);
                              setShowContactModal(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold text-xs sm:text-sm md:text-base shadow-md sm:shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2"
                          >
                            <span>Contactar</span>
                            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareBusinessLink(b.id, b.name, b.description);
                            }}
                            variant="outline"
                            className="px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 rounded-lg sm:rounded-xl font-medium sm:font-semibold shadow-md sm:shadow-lg transition-all duration-300 min-w-[2.25rem] sm:min-w-[2.5rem] flex items-center justify-center"
                            aria-label="Compartir negocio"
                          >
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Indicadores de posición */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
              {" "}
              {/* Más margen superior */}
              {nearby.length > 0 &&
                Array.from({ length: Math.min(nearby.length, 10) }).map(
                  (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToIndex(idx)}
                      className={`transition-all duration-300 ${
                        idx === currentIndex % nearby.length
                          ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-blue-600 rounded-full" // Indicador activo más largo y redondeado
                          : "w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 bg-gray-300 hover:bg-gray-400 rounded-full" // Indicador inactivo circular
                      }`}
                      aria-label={`Ir a diapositiva ${idx + 1}`}
                    />
                  ),
                )}
              {nearby.length > 10 && (
                <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                  +{nearby.length - 10}
                </span>
              )}
            </div>
          </div>
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
        /* Animación para el botón de ubicación */
        @keyframes pulse-green {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
       .animate-pulse-green {
          animation: pulse-green 1.5s infinite ease-in-out;
        }

        /* Animación de entrada para las tarjetas */
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
        /* Fade in para la sección */
       .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
