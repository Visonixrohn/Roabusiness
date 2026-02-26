import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useAuth } from "@/contexts/AuthContext";
import { useViews } from "@/hooks/useViews";
import { useRatings } from "@/hooks/useRatings";
import { useContacts } from "@/hooks/useContacts";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Navigation,
  Satellite,
  Facebook,
  Instagram,
  Twitter,
  Clock,
} from "lucide-react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import GalleryModal from "@/components/GalleryModal";
import { toast } from "sonner";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { StarRating } from "@/components/StarRating";
import { shareBusinessLink } from "@/lib/shareUtils";

// ========== UTILIDADES ==========

const formatUrl = (url: string) => {
  if (!url) return "";
  const normalizedUrl = url.replace(/^https?:\/\//, "");
  return `https://${normalizedUrl}`;
};

const parseCoordinate = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

// ========== COMPONENTES HIJOS ==========

// Componente: Hero Section con imagen de portada
interface HeroSectionProps {
  business: Business;
  onOpenGallery: () => void;
}

const HeroSection = ({ business, onOpenGallery }: HeroSectionProps) => {
  const galleryCount = business.gallery?.length || 0;

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-xl shadow-lg">
      <img
        src={business.coverImage}
        alt={business.name}
        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
        onClick={onOpenGallery}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Badge de isla */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-1.5 text-sm font-semibold shadow-lg">
          <MapPin className="h-4 w-4 mr-1 inline" />
          {business.departamento || business.island}
        </Badge>
      </div>

      {/* Botón de galería */}
      {galleryCount > 1 && (
        <Button
          onClick={onOpenGallery}
          size="sm"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Ver galería ({galleryCount})
        </Button>
      )}
    </div>
  );
};

// Componente: Información básica del negocio
interface BusinessInfoHeaderProps {
  business: Business;
  average: number | null;
  totalRatings: number;
}

const BusinessInfoHeader = ({
  business,
  average,
  totalRatings,
}: BusinessInfoHeaderProps) => {
  return (
    <div className="text-center pt-8 pb-6 border-b">
      {/* Logo arriba del nombre */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
          <img
            src={business.logo}
            alt={`${business.name} logo`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {business.name}
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        <Badge variant="secondary" className="text-sm">
          {business.category}
        </Badge>
        <Badge variant="outline" className="text-sm">
          <MapPin className="h-3 w-3 mr-1" />
          {business.municipio || business.location}
        </Badge>
      </div>

      {/* Calificaciones */}
      <div className="flex justify-center">
        <StarRating
          value={average || 0}
          readOnly
          size={20}
          showValue
          totalRatings={totalRatings}
          className="justify-center"
        />
      </div>
    </div>
  );
};

// Componente: Botones de acción rápida
interface QuickActionsBarProps {
  business: Business;
  contacts?: any;
}

const QuickActionsBar = ({ business, contacts }: QuickActionsBarProps) => {
  const contactData = contacts || business.contact || {};

  const handleWhatsApp = () => {
    // Intentar obtener el teléfono de contacts o business.contact
    const phoneSource = contactData?.phone || "";
    const phone = phoneSource.split(/[,;]+/)[0]?.trim().replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}`);
    } else {
      toast.error("No hay número de WhatsApp disponible");
    }
  };

  const handleCall = () => {
    // Intentar obtener el teléfono de contacts o business.contact
    const phoneSource = contactData?.phone || "";
    const phone = phoneSource.split(/[,;]+/)[0]?.trim();
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("No hay número de teléfono disponible");
    }
  };

  return (
    <div className="border-t pt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Button
        onClick={handleCall}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
      >
        <Phone className="h-4 w-4" />
        Llamar
      </Button>

      <Button
        onClick={() => {
          shareBusinessLink(
            business.profile_name || business.id,
            business.name,
            business.description,
          );
        }}
        variant="outline"
        className="flex items-center justify-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Compartir
      </Button>

      <Button
        onClick={handleWhatsApp}
        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white sm:col-span-1"
      >
        <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.34 7.09L4 29l7.18-2.31A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.52-5.54-1.5l-.39-.23-4.27 1.37 1.4-4.15-.25-.4A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.28-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"></path>
        </svg>
        WhatsApp
      </Button>
    </div>
  );
};
// Componente: Información de contacto
interface ContactInfoSectionProps {
  business: Business;
  contacts?: any;
}

const ContactInfoSection = ({
  business,
  contacts,
}: ContactInfoSectionProps) => {
  // Usar contacts de la tabla o fallback a business.contact
  const contactData = contacts || business.contact || {};

  return (
    <div
      id="contact-section"
      className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm"
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-teal-500" />
        Información de Contacto
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-gray-700 shadow-inner">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {business.municipio || business.location},{" "}
            {business.departamento || business.island}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {contactData?.phone ? (
              contactData.phone
                .split(/[,;]+/)
                .map((tel: string, idx: number) => {
                  const trimmedTel = tel.trim();
                  return trimmedTel ? (
                    <a
                      key={idx}
                      href={`tel:${trimmedTel}`}
                      className="text-blue-600 hover:underline"
                    >
                      {trimmedTel}
                    </a>
                  ) : null;
                })
            ) : (
              <span className="text-gray-500 italic">No disponible</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          {contactData?.email ? (
            <a
              href={`mailto:${contactData.email}`}
              className="text-blue-600 hover:underline text-sm"
            >
              {contactData.email}
            </a>
          ) : (
            <span className="text-gray-500 italic text-sm">No disponible</span>
          )}
        </div>

        {contactData?.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <a
              href={formatUrl(contactData.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              {contactData.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


// Componente: Descripción del negocio
interface BusinessDescriptionProps {
  business: Business;
}

const BusinessDescription = ({ business }: BusinessDescriptionProps) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 mb-3">Acerca de</h3>
      <p className="text-gray-700 leading-relaxed">
        {business.description || "Sin descripción disponible"}
      </p>
    </div>
  );
};

// Componente: Redes sociales
interface SocialMediaLinksProps {
  business: Business;
}

const SocialMediaLinks = ({ business }: SocialMediaLinksProps) => {
  const hasSocials =
    business.facebook ||
    business.instagram ||
    business.twitter ||
    business.tiktok ||
    business.tripadvisor;

  if (!hasSocials) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-teal-500" />
        Redes Sociales
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {business.facebook && (
          <a
            href={business.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Facebook</span>
          </a>
        )}

        {business.instagram && (
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition-all"
          >
            <Instagram className="h-5 w-5 text-pink-500" />
            <span className="text-sm font-medium">Instagram</span>
          </a>
        )}

        {business.twitter && (
          <a
            href={business.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <Twitter className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium">X (Twitter)</span>
          </a>
        )}

        {business.tiktok && (
          <a
            href={business.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-black hover:bg-gray-50 transition-all"
          >
            <TikTokIcon className="h-5 w-5 text-black" />
            <span className="text-sm font-medium">TikTok</span>
          </a>
        )}
      </div>
    </div>
  );
};

// Componente: Mapa
interface MapSectionProps {
  business: Business;
}

const MapSection = ({ business }: MapSectionProps) => {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    language: "es",
    region: "HN",
  });

  const initialLat = parseCoordinate(
    business.latitude ?? business.coordinates?.lat,
  );
  const initialLng = parseCoordinate(
    business.longitude ?? business.coordinates?.lng,
  );

  const mapPosition =
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : GOOGLE_MAPS_CONFIG.defaultCenter;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapPosition.lat},${mapPosition.lng}`;

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
        Error al cargar el mapa
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500 animate-pulse">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-red-500" />
        Ubicación
      </h3>

      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "200px" }}
          center={mapPosition}
          zoom={18}
          options={{
            mapTypeId: mapType,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          <Marker
            position={mapPosition}
            title={business.name}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                    <path d="M24 2C16.268 2 10 8.268 10 16c0 9.5 14 28 14 28s14-18.5 14-28c0-7.732-6.268-14-14-14z" fill="#EF4444"/>
                    <circle cx="24" cy="16" r="6" fill="white"/>
                  </g>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 48),
            }}
          />
        </GoogleMap>

        <div className="p-3 bg-white border-t flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => window.open(googleMapsUrl, "_blank")}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Ver en Google Maps
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setMapType((prev) =>
                prev === "roadmap" ? "satellite" : "roadmap",
              )
            }
          >
            <Satellite className="h-4 w-4 mr-1" />
            {mapType === "roadmap" ? "Satélite" : "Mapa"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente: Sección de calificaciones
interface RatingsSectionProps {
  businessId: string;
}

const RatingsSection = ({ businessId }: RatingsSectionProps) => {
  const { average, totalRatings, deviceRating, rate, loading } =
    useRatings(businessId);
  const [isRating, setIsRating] = useState(false);

  const handleRate = async (rating: number) => {
    setIsRating(true);
    const success = await rate(rating);
    if (success) {
      toast.success(
        deviceRating
          ? "¡Calificación actualizada!"
          : "¡Gracias por tu calificación!",
      );
    } else {
      toast.error("No se pudo guardar la calificación");
    }
    setIsRating(false);
  };

  // Verificar si el usuario ya calificó
  const hasAlreadyRated = deviceRating !== null && deviceRating > 0;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        Califica este negocio
      </h3>

      {/* Promedio */}
      <div className="mb-4 pb-4 border-b border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Calificación promedio</span>
          {average !== null && average > 0 && (
            <span className="text-2xl font-bold text-gray-900">
              {average.toFixed(1)}
            </span>
          )}
        </div>
        <StarRating
          value={average || 0}
          readOnly
          size={24}
          showValue={false}
          className="justify-start"
        />
        <p className="text-xs text-gray-500 mt-1">
          {totalRatings > 0
            ? `Basado en ${totalRatings} ${totalRatings === 1 ? "valoración" : "valoraciones"}`
            : "Sé el primero en calificar"}
        </p>
      </div>

      {/* Calificar */}
      <div>
        {hasAlreadyRated ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <Star className="h-4 w-4 fill-green-600 text-green-600" />
              Ya calificaste este negocio con {deviceRating} estrella
              {deviceRating === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Puedes cambiar tu calificación tocando las estrellas abajo
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-700 mb-2">
            ¿Qué te pareció este negocio?
          </p>
        )}
        <StarRating
          value={deviceRating || 0}
          onChange={handleRate}
          size={32}
          showValue={false}
          interactive={!isRating && !loading}
          className="justify-start"
        />
        {!hasAlreadyRated && (
          <p className="text-xs text-gray-500 mt-2">
            Toca una estrella para calificar
          </p>
        )}
      </div>
    </div>
  );
};

// Componente: Amenidades/Servicios
interface AmenitiesSectionProps {
  business: Business;
}

const AmenitiesSection = ({ business }: AmenitiesSectionProps) => {
  if (!business.amenities || business.amenities.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 mb-4">
        Servicios y Amenidades
      </h3>
      <div className="flex flex-wrap gap-2">
        {business.amenities.map((amenity, index) => (
          <Badge key={index} variant="secondary" className="text-sm">
            {amenity}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// ========== COMPONENTE PRINCIPAL ==========

const BusinessProfilePage = () => {
  const { profileName, id } = useParams<{
    profileName?: string;
    id?: string;
  }>();
  const { user } = useAuth();
  const { getBusinessById } = useBusinesses();

  const [business, setBusiness] = useState<Business | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Custom hooks
  const { addView } = useViews({
    businessId: businessId,
    userId: user?.id,
  });
  const { average, totalRatings } = useRatings(businessId!);
  const { contacts } = useContacts(businessId!);

  // Detecta si un string es un UUID
  const isUUID = (str: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Cargar negocio
  useEffect(() => {
    const fetchBusiness = async () => {
      // Determinar si estamos buscando por profile_name o por ID
      let searchParam = profileName || id;
      if (!searchParam) return;

      // Remover @ del inicio si existe (para rutas como /negocio/@username)
      searchParam = searchParam.replace(/^@/, "");

      let data = null;
      let error = null;

      // Si parece un UUID, buscar por ID
      if (isUUID(searchParam)) {
        const result = await supabase
          .from("businesses")
          .select("*")
          .eq("id", searchParam)
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Si no es UUID, buscar por profile_name
        const result = await supabase
          .from("businesses")
          .select("*")
          .eq("profile_name", searchParam)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        setBusiness(null);
        setLoadingBusiness(false);
        return;
      }

      // Asegurar que profile_name existe en el objeto
      const businessData = {
        ...data,
        profile_name: data.profile_name,
      } as Business;

      setBusiness(businessData);
      setBusinessId(data.id);
      setLoadingBusiness(false);
    };
    fetchBusiness();
  }, [profileName, id]);

  // Incrementar visualizaciones
  useEffect(() => {
    if (businessId) addView();
  }, [businessId]);

  // Scroll al inicio
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [profileName, id]);

  // Loading
  if (loadingBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  // Not found
  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="text-center py-16 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Negocio no encontrado
          </h2>
          <button
            onClick={() => window.history.back()}
            className="text-teal-600 hover:underline transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Meta tags dinámicos para compartir en redes sociales */}
      <Helmet>
        <title>{business.name} - RoaBusiness</title>
        <meta
          name="description"
          content={
            business.description?.substring(0, 160) ||
            `Visita ${business.name} en Roatán`
          }
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${business.name} - RoaBusiness`} />
        <meta
          property="og:description"
          content={
            business.description?.substring(0, 200) ||
            `Visita ${business.name} en Roatán`
          }
        />
        <meta
          property="og:image"
          content={
            business.logo ||
            business.coverImage ||
            "https://roabusiness.vercel.app/og-image.jpg"
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={`${business.name} - RoaBusiness`} />
        <meta
          name="twitter:description"
          content={
            business.description?.substring(0, 200) ||
            `Visita ${business.name} en Roatán`
          }
        />
        <meta
          name="twitter:image"
          content={
            business.logo ||
            business.coverImage ||
            "https://roabusiness.vercel.app/og-image.jpg"
          }
        />

        {/* Información adicional del negocio */}
        {business.contact?.phone && (
          <meta
            property="business:contact_data:phone_number"
            content={business.contact.phone}
          />
        )}
        {business.contact?.email && (
          <meta
            property="business:contact_data:email"
            content={business.contact.email}
          />
        )}
        {business.departamento && (
          <meta
            property="business:contact_data:locality"
            content={business.departamento}
          />
        )}
        {business.category && (
          <meta property="business:category" content={business.category} />
        )}
      </Helmet>

      <Header />

      {/* Container principal */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Navigation */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <HeroSection
            business={business}
            onOpenGallery={() => setShowGalleryModal(true)}
          />

          <div className="p-6">
            <BusinessInfoHeader
              business={business}
              average={average}
              totalRatings={totalRatings}
            />

            <QuickActionsBar business={business} contacts={contacts} />
          </div>
        </div>

        {/* Layout Compacto - 2 Columnas en Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-6">
            {/* Redes sociales */}
            <SocialMediaLinks business={business} />

            {/* Descripción */}
            <BusinessDescription business={business} />

            {/* Amenidades */}
            <AmenitiesSection business={business} />

            {/* Contacto */}
            <ContactInfoSection business={business} contacts={contacts} />
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            {/* Calificaciones */}
            <RatingsSection businessId={business.id} />

            {/* Mapa */}
            <MapSection business={business} />
          </div>
        </div>
      </div>

      {/* Modales */}
      <GalleryModal
        business={business}
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
      />
    </div>
  );
};

export default BusinessProfilePage;
