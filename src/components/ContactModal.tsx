import { useEffect, useMemo, useState, useCallback } from "react";
import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  Send,
  Satellite,
  Navigation,
  Save,
  Facebook,
  Instagram,
  Twitter,
  Star,
  Share2,
  User,
} from "lucide-react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import TikTokIcon from "@/components/icons/TikTokIcon"; // Asegúrate de que este componente exista y sea genérico
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";
import { shareBusinessLink } from "@/lib/shareUtils";

// --- Custom Hooks y Utilidades ---

// Define la interfaz ContactData para una mejor tipificación
interface ContactData {
  phone?: string;
  email?: string;
  website?: string;
}

// Hook para geocoding
const useMapPosition = (business: Business, isOpen: boolean) => {
  const [resolvedMapPosition, setResolvedMapPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const islandCenter = useMemo(() => {
    const centers: Record<string, { lat: number; lng: number }> = {
      Roatán: { lat: 16.3156, lng: -86.5889 },
      Utila: { lat: 16.1, lng: -86.9 },
      Guanaja: { lat: 16.45, lng: -85.9 },
      "Jose Santos Guardiola": { lat: 16.36, lng: -86.35 },
    };
    const dep = business.departamento || business.island || "";
    const muni = business.municipio || business.location || "";
    return centers[muni] || centers[dep] || GOOGLE_MAPS_CONFIG.defaultCenter;
  }, [
    business.departamento,
    business.island,
    business.municipio,
    business.location,
  ]);

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

  useEffect(() => {
    if (!isOpen) return;

    const initialLat = parseCoordinate(
      business.latitude ?? business.coordinates?.lat,
    );
    const initialLng = parseCoordinate(
      business.longitude ?? business.coordinates?.lng,
    );

    if (initialLat != null && initialLng != null) {
      setResolvedMapPosition({ lat: initialLat, lng: initialLng });
      return;
    }

    const hasGoogleGeocoder =
      typeof window !== "undefined" && !!window.google?.maps?.Geocoder;

    if (!hasGoogleGeocoder || !business.location) {
      setResolvedMapPosition(islandCenter);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const address = `${business.municipio || business.location}, ${business.departamento || business.island}, Honduras`;

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        setResolvedMapPosition({ lat: location.lat(), lng: location.lng() });
        return;
      }
      setResolvedMapPosition(islandCenter);
    });
  }, [
    isOpen,
    business.latitude,
    business.coordinates,
    business.departamento,
    business.island,
    business.municipio,
    business.location,
    islandCenter,
  ]);

  return resolvedMapPosition;
};

// Utilidad para guardar contacto (VCF)
const sanitizeForVcard = (s?: string) =>
  (s || "").replace(/\r?\n/g, " ").replace(/;/g, ",").trim();

const formatUrl = (url: string) => {
  if (!url) return "";
  const normalizedUrl = url.replace(/^https?:\/\//, "");
  return `https://${normalizedUrl}`;
};

const handleSaveContact = (business: Business, contacts?: ContactData) => {
  try {
    const lines: string[] = [];
    lines.push("BEGIN:VCARD", "VERSION:3.0");
    lines.push(`FN:${sanitizeForVcard(business.name)}`);
    lines.push(`ORG:${sanitizeForVcard(business.name)}`);

    const addrParts = [
      business.location || business.municipio || "",
      business.departamento || business.island || "",
      "Honduras",
    ];
    const adr = addrParts.filter(Boolean).join("; ");
    lines.push(`ADR:;;${sanitizeForVcard(adr)}`);

    if (contacts?.phone) {
      contacts.phone.split(/[,;]+/).forEach((tel) => {
        const t = tel.trim();
        if (t) lines.push(`TEL;TYPE=WORK,VOICE:${t}`);
      });
    }

    if (contacts?.email) {
      lines.push(`EMAIL;TYPE=INTERNET:${sanitizeForVcard(contacts.email)}`);
    }

    if (contacts?.website) {
      lines.push(`URL:${formatUrl(contacts.website)}`);
    }

    const socials: string[] = [];
    if (business.facebook) socials.push(`Facebook: ${business.facebook}`);
    if (business.instagram) socials.push(`Instagram: ${business.instagram}`);
    if (business.twitter) socials.push(`Twitter: ${business.twitter}`);
    if (business.tiktok) socials.push(`TikTok: ${business.tiktok}`);
    if (business.tripadvisor)
      socials.push(`TripAdvisor: ${business.tripadvisor}`);
    if (socials.length)
      lines.push(`NOTE:${sanitizeForVcard(socials.join(" | "))}`);

    lines.push("END:VCARD");

    const vcard = lines.join("\r\n");
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(business.name || "contact").replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success("Contacto guardado (archivo.vcf descargado)");
  } catch (err) {
    console.error(err);
    toast.error("No se pudo guardar el contacto");
  }
};

// --- Componentes hijos ---

interface MapDisplayProps {
  business: Business;
  mapPosition: { lat: number; lng: number } | null;
  mapType: "roadmap" | "satellite";
  setMapType: React.Dispatch<React.SetStateAction<"roadmap" | "satellite">>;
}

const MapDisplay = ({
  business,
  mapPosition,
  mapType,
  setMapType,
}: MapDisplayProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    language: "es",
    region: "HN",
  });

  const googleMapsUrl = mapPosition
    ? `https://www.google.com/maps/search/?api=1&query=${mapPosition.lat},${mapPosition.lng}`
    : "";

  if (loadError)
    return (
      <div className="text-red-500 text-center py-4">
        Error al cargar el mapa.
      </div>
    );
  if (!isLoaded)
    return (
      <div className="text-gray-500 text-center py-4">Cargando mapa...</div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-red-500" />
          Ubicación
        </h4>
      </div>
      {mapPosition ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "180px" }}
            center={mapPosition}
            zoom={18}
            options={{
              mapTypeId: mapType,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
              disableDefaultUI: false,
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
          <div className="p-2 bg-white border-t">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-sm"
              onClick={() => window.open(googleMapsUrl, "_blank")}
              aria-label="Ver en Google Maps"
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
              className="h-8 text-xs px-2"
              aria-label={
                mapType === "roadmap"
                  ? "Ver vista satelital"
                  : "Ver vista de mapa"
              }
            >
              <Satellite className="h-4 w-4 mr-1" />
              {mapType === "roadmap" ? "Satélite" : "Mapa"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">
          No se pudieron cargar las coordenadas del mapa para este negocio.
        </p>
      )}
    </div>
  );
};

interface ContactInfoSectionProps {
  business: Business;
  contacts?: ContactData;
}

const ContactInfoSection = ({
  business,
  contacts,
}: ContactInfoSectionProps) => (
  <div className="border-t pt-4">
    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-base">
      <Mail className="h-5 w-5 text-gray-500" />
      Datos de Contacto
    </h4>
    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-gray-700 shadow-inner">
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
          {contacts?.phone ? (
            contacts.phone.split(/[,;]+/).map((tel, idx) => {
              const trimmedTel = tel.trim();
              return trimmedTel ? (
                <a
                  key={idx}
                  href={`tel:${trimmedTel}`}
                  className="text-blue-600 hover:underline"
                >
                  {trimmedTel}
                </a>
              ) : (
                ""
              );
            })
          ) : (
            <span className="text-gray-500 italic">No disponible</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-gray-500" />
        {contacts?.email ? (
          <a
            href={`mailto:${contacts.email}`}
            className="text-blue-600 hover:underline text-sm"
          >
            {contacts.email}
          </a>
        ) : (
          <span className="text-gray-500 italic text-sm">No disponible</span>
        )}
      </div>
      {contacts?.website && (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <a
            href={formatUrl(contacts.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            {contacts.website}
          </a>
        </div>
      )}
    </div>
  </div>
);

interface QuickActionsProps {
  business: Business;
  contacts?: ContactData;
}

const QuickActions = ({ business, contacts }: QuickActionsProps) => (
  <div className="border-t pt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const firstPhone = contacts?.phone?.split(/[,;]+/)[0]?.trim();
        if (firstPhone) window.open(`tel:${firstPhone}`);
      }}
      className="flex items-center justify-center gap-2 text-sm"
      disabled={!contacts?.phone}
      aria-label="Llamar al negocio"
    >
      <Phone className="h-4 w-4" /> Llamar
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (contacts?.email) window.open(`mailto:${contacts.email}`);
      }}
      className="flex items-center justify-center gap-2 text-sm"
      disabled={!contacts?.email}
      aria-label="Enviar email al negocio"
    >
      <Mail className="h-4 w-4" /> Email
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleSaveContact(business, contacts)} // <-- Se mantiene la función que descarga VCF
      className="flex items-center justify-center gap-2 text-sm"
      aria-label="Guardar contacto (VCF)" // <-- Etiqueta cambiada para ser explícita
    >
      <Save className="h-4 w-4" /> Guardar {/* <-- Texto del botón cambiado */}
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        shareBusinessLink(business.id, business.name, business.description)
      }
      className="flex items-center justify-center gap-2 text-sm"
      aria-label="Compartir enlace del negocio"
    >
      <Share2 className="h-4 w-4" /> Compartir
    </Button>
    {contacts?.website && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(formatUrl(contacts.website), "_blank")}
        className="flex items-center justify-center gap-2 text-sm"
        aria-label="Visitar sitio web"
      >
        <Globe className="h-4 w-4" /> Web
      </Button>
    )}
    {contacts?.phone && (
      <Button
        size="sm"
        onClick={() => {
          const firstPhone = contacts.phone.split(/[,;]+/)[0]?.trim();
          if (firstPhone) {
            const phone = firstPhone.replace(/\D/g, "");
            window.open(`https://wa.me/${phone}`);
          }
        }}
        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm col-span-2 sm:col-span-1"
        aria-label="Contactar por WhatsApp"
      >
        <svg
          viewBox="0 0 32 32"
          width="18"
          height="18"
          fill="currentColor"
          className="mr-1"
        >
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.34 7.09L4 29l7.18-2.31A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.52-5.54-1.5l-.39-.23-4.27 1.37 1.4-4.15-.25-.4A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.28-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"></path>
        </svg>
        WhatsApp
      </Button>
    )}
  </div>
);

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
    <div className="border-t pt-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-base">
        <Globe className="h-5 w-5 text-gray-500" />
        Redes Sociales
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {business.facebook && (
          <a
            href={business.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors duration-200"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <span className="text-sm hidden sm:inline">Facebook</span>
          </a>
        )}
        {business.instagram && (
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-colors duration-200"
          >
            <Instagram className="h-5 w-5 text-pink-500" />
            <span className="text-sm hidden sm:inline">Instagram</span>
          </a>
        )}
        {business.twitter && (
          <a
            href={business.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:border-blue-400 hover:text-blue-400 transition-colors duration-200"
          >
            <Twitter className="h-5 w-5 text-blue-400" />
            <span className="text-sm hidden sm:inline">X (Twitter)</span>
          </a>
        )}
        {business.tiktok && (
          <a
            href={business.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:border-black hover:text-black transition-colors duration-200"
          >
            <TikTokIcon className="h-5 w-5 text-black" />
            <span className="text-sm hidden sm:inline">TikTok</span>
          </a>
        )}
        {business.tripadvisor && (
          <a
            href={business.tripadvisor}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TripAdvisor"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:border-[#34E0A1] hover:text-[#34E0A1] transition-colors duration-200"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-5 9c0-1.1.9-2 2-2s2.9 2 2-.9 2-2 2-2-.9-2-2zm10 0c0 1.1-.9 2-2 2s-2-.9-2-2.9-2 2-2 2.9 2 2z" />
            </svg>
            <span className="text-sm hidden sm:inline">TripAdvisor</span>
          </a>
        )}
      </div>
    </div>
  );
};

// --- Componente de calificación ---

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
    <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Calificaciones</h3>
        </div>
        {average !== null && average > 0 && (
          <span className="text-xl font-bold text-gray-900">
            {average.toFixed(1)}
          </span>
        )}
      </div>

      {/* Mostrar promedio */}
      <div className="mb-3 pb-3 border-b border-yellow-200">
        <div className="flex items-center gap-2">
          <StarRating
            value={average || 0}
            readOnly
            size={16}
            showValue={false}
            className="justify-start"
          />
          <p className="text-xs text-gray-500">
            {totalRatings > 0
              ? `(${totalRatings} ${totalRatings === 1 ? "valoración" : "valoraciones"})`
              : "Sin valoraciones"}
          </p>
        </div>
      </div>

      {/* Calificar */}
      <div>
        {hasAlreadyRated ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-green-800 font-medium flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-green-600 text-green-600" />
              Tu calificación: {deviceRating} estrella{deviceRating === 1 ? "" : "s"}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-700 mb-1.5">
            ¿Qué te pareció este negocio?
          </p>
        )}
        <StarRating
          value={deviceRating || 0}
          onChange={handleRate}
          size={24}
          showValue={false}
          interactive={!isRating && !loading}
          className="justify-start"
        />
        {!hasAlreadyRated && (
          <p className="text-xs text-gray-500 mt-1.5">
            Toca una estrella para calificar
          </p>
        )}
      </div>
    </div>
  );
};

// --- Componente ContactModal principal ---

interface ContactModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  contacts?: ContactData | null;
}

const ContactModal = ({
  business,
  isOpen,
  onClose,
  contacts,
}: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const mapPosition = useMapPosition(business, isOpen);

  // Incrementar contador de contactos cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !business.id) return;

    const incrementarContador = async () => {
      try {
        const { error } = await supabase.rpc("incrementar_contador_destacado", {
          p_business_id: business.id,
        });

        if (error) {
          console.error("Error al incrementar contador destacado:", error);
        }
      } catch (err) {
        console.error("Error al incrementar contador destacado:", err);
      }
    };

    incrementarContador();
  }, [isOpen, business.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("¡Mensaje enviado exitosamente!");
    setFormData({ name: "", email: "", phone: "", message: "" });
    // Aquí iría la lógica para enviar el formulario, por ejemplo, a un backend.
    onClose();
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto p-6 rounded-xl flex flex-col gap-6 shadow-lg">
        <DialogHeader className="relative flex flex-row items-center gap-3 border-b pb-4 -mx-6 -mt-6 px-6 pt-6 mb-2">
          {/* Background: imagen absoluta detrás del título/descr (visible en todas las pantallas) */}
          {business.coverImage && (
            <div className="absolute inset-0 pointer-events-none rounded-t-xl overflow-hidden">
              <img
                src={business.coverImage}
                alt={`${business.name} portada`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-black/60" />
            </div>
          )}
          
          {/* Botón Ver perfil - Siempre visible */}
          <div className="absolute top-3 right-3 z-20">
            <Button
              onClick={() => {
                const profileUrl = business.profile_name
                  ? `/negocio/${business.profile_name}`
                  : `/negocio/${business.id}`;
                window.location.href = profileUrl;
              }}
              className="bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm px-2.5 sm:px-3 py-1.5 h-auto text-xs sm:text-sm font-medium rounded-lg transition-all"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              Ver perfil
            </Button>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <img
              src={business.logo}
              alt={business.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
            />
            <div>
              <DialogTitle className={`text-2xl font-bold leading-tight ${business.coverImage ? 'text-white' : 'text-gray-900'}`}>
                Contactar a {business.name}
              </DialogTitle>
              <DialogDescription className={`text-sm mt-1 ${business.coverImage ? 'text-white/95' : 'text-gray-600'}`}>
                {business.description ||
                  "Encuentra toda la información de contacto y ubicación."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6 text-sm">
          {/* Sección de Información de Contacto */}
          <ContactInfoSection business={business} contacts={contacts} />

          {/* Sección de Redes Sociales - Ahora más destacada y con estilo */}
          <SocialMediaLinks business={business} />

          {/* Sección de Acciones Rápidas */}
          <QuickActions business={business} contacts={contacts} />

          {/* Sección de Calificaciones */}
          <RatingsSection businessId={business.id} />
        </div>
        {/* Sección de Mapa - Solo mostrar si hay coordenadas */}
        {mapPosition && (
          <MapDisplay
            business={business}
            mapPosition={mapPosition}
            mapType={mapType}
            setMapType={setMapType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
