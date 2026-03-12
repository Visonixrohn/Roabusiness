import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useViews } from "@/hooks/useViews";
import { useRatings } from "@/hooks/useRatings";
import { useContacts } from "@/hooks/useContacts";
import { translateAmenity } from "@/lib/translations";
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
} from "lucide-react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import GalleryModal from "@/components/GalleryModal";
import QRModal from "@/components/QRModal";
import { toast } from "sonner";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { StarRating } from "@/components/StarRating";
import { getBusinessUrl, shareBusinessLink } from "@/lib/shareUtils";

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

const isUUID = (str: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// ========== UI BASE ==========

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={`rounded-[28px] border border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] ${className}`}
    >
      {children}
    </section>
  );
};

// ========== COMPONENTES HIJOS ==========

interface HeroSectionProps {
  business: Business;
  average: number | null;
  totalRatings: number;
  onOpenGallery: () => void;
}

const HeroSection = ({
  business,
  average,
  totalRatings,
  onOpenGallery,
}: HeroSectionProps) => {
  const { t } = useLanguage();
  const galleryCount = business.gallery?.length || 0;

  return (
    <div className="relative overflow-hidden rounded-[32px] min-h-[340px] md:min-h-[500px] group shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
      <img
        src={business.coverImage}
        alt={business.name}
        onClick={onOpenGallery}
        className="absolute inset-0 h-full w-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_28%)]" />

      <div className="absolute top-5 left-5 flex flex-wrap gap-3">
        <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur-md shadow-lg hover:bg-white/10">
          <MapPin className="mr-1.5 h-4 w-4" />
          {business.departamento || business.island}
        </Badge>

        {(business.categories?.length ? business.categories : [business.category])
          .filter(Boolean)
          .slice(0, 2)
          .map((cat) => (
            <Badge
              key={cat}
              className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-white backdrop-blur-md hover:bg-black/20"
            >
              {cat}
            </Badge>
          ))}
      </div>

      {galleryCount > 1 && (
        <Button
          onClick={onOpenGallery}
          size="sm"
          className="absolute top-5 right-5 rounded-full border border-white/15 bg-white/10 px-4 text-white backdrop-blur-md hover:bg-white/20"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {t("business.gallery")} ({galleryCount})
        </Button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          <div className="h-24 w-24 md:h-28 md:w-28 rounded-[26px] overflow-hidden border border-white/20 bg-white shadow-2xl shrink-0">
            <img
              src={business.logo}
              alt={`${business.name} logo`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              {business.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md hover:bg-black/20">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                {business.municipio || business.location}
              </Badge>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                <StarRating
                  value={average || 0}
                  readOnly
                  size={18}
                  showValue={false}
                  totalRatings={totalRatings}
                  className="justify-start"
                />
                <div className="mt-1 text-sm text-white/85">
                  {average && average > 0 ? average.toFixed(1) : "Nuevo"} ·{" "}
                  {totalRatings > 0
                    ? `${totalRatings} ${totalRatings === 1 ? "valoración" : "valoraciones"}`
                    : "Sin valoraciones"}
                </div>
              </div>

              {business.description && (
                <p className="max-w-2xl text-sm md:text-base text-white/80 leading-relaxed line-clamp-2">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuickActionsBarProps {
  business: Business;
  contacts?: any;
  onOpenQRModal: () => void;
}

const QuickActionsBar = ({
  business,
  contacts,
  onOpenQRModal,
}: QuickActionsBarProps) => {
  const { t } = useLanguage();
  const contactData = contacts || business.contact || {};
  const phoneSource = contactData?.phone || "";
  const firstPhone = phoneSource.split(/[,;]+/)[0]?.trim();

  const handleWhatsApp = () => {
    const phone = firstPhone?.replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/${phone}`, "_blank");
    } else {
      toast.error(t("business.noWhatsApp"));
    }
  };

  const handleCall = () => {
    if (firstPhone) {
      window.location.href = `tel:${firstPhone}`;
    } else {
      toast.error(t("business.noPhone"));
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Button
        onClick={handleCall}
        className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md"
      >
        <Phone className="mr-2 h-4 w-4" />
        {t("business.call")}
      </Button>

      <Button
        onClick={handleWhatsApp}
        className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          shareBusinessLink(business.profile_name || business.id, business.name)
        }
        className="h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
      >
        <Share2 className="mr-2 h-4 w-4" />
        {t("business.share")}
      </Button>

      <Button
        variant="outline"
        onClick={onOpenQRModal}
        className="h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
      >
        <Globe className="mr-2 h-4 w-4" />
        QR
      </Button>
    </div>
  );
};

interface BusinessDescriptionProps {
  business: Business;
}

const BusinessDescription = ({ business }: BusinessDescriptionProps) => {
  const { t } = useLanguage();

  return (
    <SectionCard className="p-6 md:p-7">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("business.about")}
        </h3>
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Globe className="h-5 w-5 text-emerald-600" />
        </div>
      </div>

      <p className="text-[15px] leading-7 text-slate-600">
        {business.description || t("business.noDescription")}
      </p>
    </SectionCard>
  );
};

interface ContactInfoSectionProps {
  business: Business;
  contacts?: any;
}

const ContactInfoSection = ({
  business,
  contacts,
}: ContactInfoSectionProps) => {
  const { t } = useLanguage();
  const contactData = contacts || business.contact || {};

  return (
    <SectionCard className="p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("business.contactInfo")}
        </h3>
        <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Mail className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4 flex items-start gap-3">
          <MapPin className="h-4 w-4 text-slate-500 mt-1" />
          <span className="text-sm text-slate-700">
            {business.municipio || business.location},{" "}
            {business.departamento || business.island}
          </span>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 flex items-start gap-3">
          <Phone className="h-4 w-4 text-slate-500 mt-1" />
          <div className="flex flex-wrap gap-2">
            {contactData?.phone ? (
              contactData.phone.split(/[,;]+/).map((tel: string, idx: number) => {
                const trimmedTel = tel.trim();
                return trimmedTel ? (
                  <a
                    key={idx}
                    href={`tel:${trimmedTel}`}
                    className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-800 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 transition"
                  >
                    {trimmedTel}
                  </a>
                ) : null;
              })
            ) : (
              <span className="text-sm italic text-slate-400">
                {t("business.notAvailable")}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 flex items-start gap-3">
          <Mail className="h-4 w-4 text-slate-500 mt-1" />
          {contactData?.email ? (
            <a
              href={`mailto:${contactData.email}`}
              className="text-sm text-slate-700 hover:text-emerald-700 transition"
            >
              {contactData.email}
            </a>
          ) : (
            <span className="text-sm italic text-slate-400">
              {t("business.notAvailable")}
            </span>
          )}
        </div>

        {contactData?.website && (
          <div className="rounded-2xl bg-slate-50 p-4 flex items-start gap-3">
            <Globe className="h-4 w-4 text-slate-500 mt-1" />
            <a
              href={formatUrl(contactData.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-700 hover:text-emerald-700 transition break-all"
            >
              {contactData.website}
            </a>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

interface SocialMediaLinksProps {
  business: Business;
}

const SocialMediaLinks = ({ business }: SocialMediaLinksProps) => {
  const { t } = useLanguage();
  const hasSocials =
    business.facebook ||
    business.instagram ||
    business.twitter ||
    business.tiktok ||
    business.tripadvisor;

  if (!hasSocials) return null;

  const itemClass =
    "group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all";

  return (
    <SectionCard className="p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("business.socialMedia")}
        </h3>
        <div className="h-10 w-10 rounded-2xl bg-sky-50 flex items-center justify-center">
          <Globe className="h-5 w-5 text-sky-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {business.facebook && (
          <a
            href={business.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Facebook className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Facebook</p>
                <p className="text-xs text-slate-500">Visita nuestro perfil</p>
              </div>
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-700">↗</span>
          </a>
        )}

        {business.instagram && (
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-pink-50 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Instagram</p>
                <p className="text-xs text-slate-500">Fotos y novedades</p>
              </div>
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-700">↗</span>
          </a>
        )}

        {business.twitter && (
          <a
            href={business.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Twitter className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">X (Twitter)</p>
                <p className="text-xs text-slate-500">Noticias y actividad</p>
              </div>
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-700">↗</span>
          </a>
        )}

        {business.tiktok && (
          <a
            href={business.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-950 flex items-center justify-center">
                <TikTokIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">TikTok</p>
                <p className="text-xs text-slate-500">Videos y contenido</p>
              </div>
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-700">↗</span>
          </a>
        )}
      </div>
    </SectionCard>
  );
};

interface MapSectionProps {
  business: Business;
}

const MapSection = ({ business }: MapSectionProps) => {
  const { t, language } = useLanguage();
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    language,
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

  const googleMapsUrl =
    business.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${mapPosition.lat},${mapPosition.lng}`;

  if (loadError) {
    return (
      <SectionCard className="p-6 md:p-7">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-600">
          Error al cargar el mapa
        </div>
      </SectionCard>
    );
  }

  if (!isLoaded) {
    return (
      <SectionCard className="p-6 md:p-7">
        <div className="rounded-2xl bg-slate-100 p-10 text-center text-slate-500 animate-pulse">
          Cargando mapa...
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("business.location")}
        </h3>
        <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-rose-500" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "260px" }}
          center={mapPosition}
          zoom={17}
          options={{
            mapTypeId: mapType,
            styles:
              mapType === "roadmap"
                ? GOOGLE_MAPS_CONFIG.cleanMapStyle
                : undefined,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            clickableIcons: false,
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

        <div className="flex gap-2 p-3 bg-white border-t border-slate-200">
          <Button
            className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800"
            onClick={() => window.open(googleMapsUrl, "_blank")}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Ver en Google Maps
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() =>
              setMapType((prev) => (prev === "roadmap" ? "hybrid" : "roadmap"))
            }
          >
            <Satellite className="mr-2 h-4 w-4" />
            {mapType === "roadmap" ? "Satélite" : "Mapa"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};

interface RatingsSectionProps {
  businessId: string;
}

// Catálogo de etiquetas predefinidas
const RATING_TAGS = {
  positive: [
    "Lo recomiendo",
    "Me gustó",
    "Buena atención",
    "Buen servicio",
    "Buen ambiente",
    "Precio justo",
    "Volvería",
  ],
  neutral: ["Cumple lo esperado", "Más o menos"],
  negative: [
    "No lo recomiendo",
    "Mala atención",
    "Muy caro",
    "No volvería",
    "No cumplió expectativas",
  ],
};

const ALL_POSITIVE = new Set(RATING_TAGS.positive);
const ALL_NEGATIVE = new Set(RATING_TAGS.negative);

const RatingsSection = ({ businessId }: RatingsSectionProps) => {
  const { average, totalRatings, deviceRating, deviceTags, tagStats, rate, loading } =
    useRatings(businessId);
  const [isRating, setIsRating] = useState(false);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [step, setStep] = useState<"stars" | "tags" | "done">("stars");

  // Inicializar estado al cargar valoración existente
  useEffect(() => {
    if (deviceRating && deviceRating > 0) {
      setPendingRating(deviceRating);
      setSelectedTags(deviceTags || []);
      setStep("done");
    }
  }, [deviceRating, deviceTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);

      // Máximo 3 tags
      if (prev.length >= 3) return prev;

      // No mezclar positivas con negativas
      const hasPositive = prev.some((t) => ALL_POSITIVE.has(t));
      const hasNegative = prev.some((t) => ALL_NEGATIVE.has(t));
      if (ALL_POSITIVE.has(tag) && hasNegative) return prev;
      if (ALL_NEGATIVE.has(tag) && hasPositive) return prev;

      return [...prev, tag];
    });
  };

  const handleSubmit = async () => {
    if (!pendingRating) return;
    setIsRating(true);
    const success = await rate(pendingRating, selectedTags);
    if (success) {
      toast.success(deviceRating ? "¡Opinión actualizada!" : "¡Gracias por tu opinión!");
      setStep("done");
    } else {
      toast.error("No se pudo guardar la calificación");
    }
    setIsRating(false);
  };

  const handleEdit = () => {
    setStep("stars");
    setPendingRating(deviceRating);
    setSelectedTags(deviceTags || []);
  };

  // Calcular top tags para mostrar estadísticas
  const topTags = Object.entries(tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <SectionCard className="p-6 md:p-7 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,251,235,0.96))]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            Califica este negocio
          </h3>
          <p className="text-sm text-slate-500 mt-1">Comparte tu experiencia</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        </div>
      </div>

      {/* Promedio global */}
      <div className="mb-5 rounded-2xl border border-amber-100 bg-white/80 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Calificación promedio</p>
            <div className="mt-2">
              <StarRating value={average || 0} readOnly size={22} showValue={false} className="justify-start" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">{average ? average.toFixed(1) : "—"}</p>
            <p className="text-xs text-slate-500">
              {totalRatings > 0
                ? `${totalRatings} ${totalRatings === 1 ? "valoración" : "valoraciones"}`
                : "Sin valoraciones"}
            </p>
          </div>
        </div>

        {/* Top tags estadísticas */}
        {topTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => {
              const pct = Math.round((count / totalRatings) * 100);
              const isPos = ALL_POSITIVE.has(tag);
              const isNeg = ALL_NEGATIVE.has(tag);
              return (
                <div
                  key={tag}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                    isPos
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isNeg
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <span>{tag}</span>
                  <span className="opacity-60">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PASO 1: Estrellas */}
      {step === "stars" && (
        <div>
          <p className="mb-3 text-sm text-slate-600 font-medium">
            {pendingRating ? "Cambia tu calificación:" : "¿Cuántas estrellas merece?"}
          </p>
          <StarRating
            value={pendingRating || 0}
            onChange={(v) => {
              setPendingRating(v);
              setStep("tags");
            }}
            size={38}
            showValue={false}
            interactive={!isRating && !loading}
            className="justify-start"
          />
        </div>
      )}

      {/* PASO 2: Etiquetas */}
      {step === "tags" && pendingRating && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-600 font-medium">
              ¿Cómo fue tu experiencia?
              <span className="ml-1 text-slate-400">(elige hasta 3)</span>
            </p>
            <button
              onClick={() => setStep("stars")}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← cambiar estrellas
            </button>
          </div>

          {/* Estrellas pequeñas seleccionadas */}
          <div className="flex items-center gap-1.5 mb-4 bg-amber-50 rounded-xl px-3 py-2 w-fit">
            <StarRating value={pendingRating} readOnly size={16} showValue={false} />
            <span className="text-xs text-amber-700 font-semibold ml-1">{pendingRating}/5</span>
          </div>

          {/* Tags positivas */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Positivas</p>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS.positive.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const hasNeg = selectedTags.some((t) => ALL_NEGATIVE.has(t));
                const disabled = !isSelected && (selectedTags.length >= 3 || hasNeg);
                return (
                  <button
                    key={tag}
                    onClick={() => !disabled && handleTagToggle(tag)}
                    disabled={disabled}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : disabled
                        ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                        : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags neutras */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Neutras</p>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS.neutral.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const disabled = !isSelected && selectedTags.length >= 3;
                return (
                  <button
                    key={tag}
                    onClick={() => !disabled && handleTagToggle(tag)}
                    disabled={disabled}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-slate-600 text-white border-slate-600 shadow-sm"
                        : disabled
                        ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags negativas */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Negativas</p>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS.negative.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const hasPos = selectedTags.some((t) => ALL_POSITIVE.has(t));
                const disabled = !isSelected && (selectedTags.length >= 3 || hasPos);
                return (
                  <button
                    key={tag}
                    onClick={() => !disabled && handleTagToggle(tag)}
                    disabled={disabled}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-red-500 text-white border-red-500 shadow-sm"
                        : disabled
                        ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                        : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isRating}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-semibold"
          >
            {isRating ? "Enviando..." : "Enviar opinión"}
          </Button>
        </div>
      )}

      {/* DONE: Resumen de lo enviado */}
      {step === "done" && deviceRating && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              Tu opinión
            </p>
            <button
              onClick={handleEdit}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
            >
              Editar
            </button>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating value={deviceRating} readOnly size={16} showValue={false} />
            <span className="text-xs text-emerald-700 font-medium">{deviceRating}/5</span>
          </div>
          {deviceTags && deviceTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {deviceTags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    ALL_POSITIVE.has(tag)
                      ? "bg-emerald-200 text-emerald-800"
                      : ALL_NEGATIVE.has(tag)
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};

interface AmenitiesSectionProps {
  business: Business;
}

const AmenitiesSection = ({ business }: AmenitiesSectionProps) => {
  const { t, language } = useLanguage();

  if (!business.amenities || business.amenities.length === 0) return null;

  return (
    <SectionCard className="p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("business.amenities")}
        </h3>
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Star className="h-5 w-5 text-emerald-600" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {business.amenities.map((amenity, index) => (
          <Badge
            key={index}
            className="rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50 px-3 py-1.5"
          >
            {translateAmenity(amenity, language)}
          </Badge>
        ))}
      </div>
    </SectionCard>
  );
};

// ========== PREVIEW REDES ==========

interface SocialPreviewBusiness {
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  location?: string;
  municipio?: string;
}

const OGPreviewCard = ({
  url,
  accentColor,
  accentGradient,
  icon,
  platformLabel,
  business,
}: {
  url: string;
  accentColor: string;
  accentGradient: string;
  icon: React.ReactNode;
  platformLabel: string;
  business: SocialPreviewBusiness;
}) => {
  const coverSrc = business.coverImage || business.logo;
  const location = business.municipio || business.location;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group rounded-[26px] border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] transition-all"
    >
      {coverSrc && (
        <div className="relative w-full h-44 overflow-hidden">
          <img
            src={coverSrc}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

          {business.logo && business.coverImage && (
            <div className="absolute bottom-3 left-3">
              <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg overflow-hidden bg-white">
                <img src={business.logo} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow"
            style={{ background: accentGradient }}
          >
            {icon}
            {platformLabel}
          </div>
        </div>
      )}

      <div className="p-5">
        {!coverSrc && (
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow"
            style={{ background: accentGradient }}
          >
            {icon}
          </div>
        )}

        <p className="font-bold text-slate-900 text-base leading-tight">
          {business.name}
        </p>

        {business.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-snug">
            {business.description}
          </p>
        )}

        {location && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: accentColor }}
          >
            <span className="scale-75">{icon}</span>
          </div>
          <span className="text-xs text-slate-400 truncate">
            {url.replace(/^https?:\/\//, "").split("/")[0]}
          </span>
        </div>
      </div>
    </a>
  );
};

const FacebookPageEmbed = ({
  url,
  business,
}: {
  url: string;
  business: SocialPreviewBusiness;
}) => (
  <OGPreviewCard
    url={url}
    accentColor="#1877F2"
    accentGradient="linear-gradient(135deg, #1877F2 0%, #0d5fd1 100%)"
    icon={<Facebook className="h-3.5 w-3.5 text-white" />}
    platformLabel="Facebook"
    business={business}
  />
);

const TwitterTimelineEmbed = ({
  url,
  business,
}: {
  url: string;
  business: SocialPreviewBusiness;
}) => (
  <OGPreviewCard
    url={url}
    accentColor="#000000"
    accentGradient="linear-gradient(135deg, #1a1a1a 0%, #000000 100%)"
    icon={
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    }
    platformLabel="X"
    business={business}
  />
);

const InstagramProfileCard = ({
  url,
  business,
}: {
  url: string;
  business: SocialPreviewBusiness;
}) => (
  <OGPreviewCard
    url={url}
    accentColor="#e1306c"
    accentGradient="linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
    icon={<Instagram className="h-3.5 w-3.5 text-white" />}
    platformLabel="Instagram"
    business={business}
  />
);

const TikTokCreatorEmbed = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState(false);

  const matchAt = url.match(/tiktok\.com\/@([^/?#]+)/);
  const matchNoAt = url.match(/tiktok\.com\/([^@?#][^/?#]*)/);
  const username = matchAt?.[1] ?? matchNoAt?.[1] ?? "";

  useEffect(() => {
    if (!username || !containerRef.current) return;

    setShowSkeleton(true);
    setError(false);

    containerRef.current.innerHTML = `<blockquote
      class="tiktok-embed"
      cite="https://www.tiktok.com/@${username}"
      data-unique-id="${username}"
      data-embed-type="creator"
      style="max-width:100%; min-width:288px; border:none; margin:0;">
      <section>
        <a target="_blank" href="https://www.tiktok.com/@${username}">@${username}</a>
      </section>
    </blockquote>`;

    const processEmbed = () => {
      const win = window as any;
      if (win.tiktok?.embed?.render) {
        win.tiktok.embed.render();
      }
      setTimeout(() => setShowSkeleton(false), 2000);
    };

    const existingScript = document.getElementById("__tiktok-embed-js");
    if (existingScript) {
      processEmbed();
    } else {
      const script = document.createElement("script");
      script.id = "__tiktok-embed-js";
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = processEmbed;
      script.onerror = () => {
        setError(true);
        setShowSkeleton(false);
      };
    }
  }, [username]);

  return (
    <div className="bg-white rounded-[26px] border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-2.5 bg-slate-950">
        <TikTokIcon className="h-5 w-5 text-white flex-shrink-0" />
        <span className="text-sm font-bold text-white flex-1">@{username}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-300 hover:text-white font-medium flex-shrink-0 transition-colors"
        >
          Abrir →
        </a>
      </div>

      {error && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 bg-gradient-to-br from-slate-900 to-black group-hover:from-slate-800 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-[#fe2c55] flex items-center justify-center shadow-lg">
              <TikTokIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-white">@{username}</p>
              <p className="text-sm text-slate-400 mt-1">Ver videos en TikTok</p>
            </div>
            <span className="px-5 py-2 rounded-full bg-[#fe2c55] text-white text-sm font-bold">
              Abrir en TikTok
            </span>
          </div>
        </a>
      )}

      {!error && (
        <div className="relative">
          {showSkeleton && (
            <div className="absolute inset-0 z-10 flex flex-col items-center gap-4 px-6 py-8 animate-pulse bg-slate-950 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-slate-800" />
              <div className="h-4 bg-slate-800 rounded w-28" />
              <div className="h-3 bg-slate-800 rounded w-40" />
              <div className="flex gap-6 mt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 bg-slate-800 rounded w-12" />
                  <div className="h-3 bg-slate-800 rounded w-14" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 bg-slate-800 rounded w-12" />
                  <div className="h-3 bg-slate-800 rounded w-14" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 bg-slate-800 rounded w-12" />
                  <div className="h-3 bg-slate-800 rounded w-14" />
                </div>
              </div>
              <div className="w-24 h-8 bg-slate-800 rounded-full mt-2" />
              <div className="grid grid-cols-3 gap-2 w-full mt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-slate-800 rounded-lg" />
                ))}
              </div>
            </div>
          )}

          <div ref={containerRef} className="overflow-hidden min-h-[200px]" />
        </div>
      )}
    </div>
  );
};

interface SocialEmbedSectionProps {
  business: Business;
}

const SocialEmbedSection = ({ business }: SocialEmbedSectionProps) => {
  const hasSocials =
    business.facebook ||
    business.twitter ||
    business.instagram ||
    business.tiktok;

  if (!hasSocials) return null;

  const items = [
    business.facebook,
    business.twitter,
    business.instagram,
    business.tiktok,
  ].filter(Boolean).length;

  const previewBusiness: SocialPreviewBusiness = {
    name: business.name,
    description: business.description,
    logo: business.logo,
    coverImage: business.coverImage,
    location: business.location,
    municipio: business.municipio,
  };

  return (
    <div className="mt-2">
      <div className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-600" />
          Síguenos en redes sociales
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Descubre más contenido y mantente conectado
        </p>
      </div>

      <div
        className={`grid gap-5 ${
          items === 1 ? "grid-cols-1 max-w-lg" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {business.facebook && (
          <FacebookPageEmbed url={business.facebook} business={previewBusiness} />
        )}

        {business.twitter && (
          <TwitterTimelineEmbed url={business.twitter} business={previewBusiness} />
        )}

        {business.instagram && (
          <InstagramProfileCard url={business.instagram} business={previewBusiness} />
        )}

        {business.tiktok && <TikTokCreatorEmbed url={business.tiktok} />}
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

  const [business, setBusiness] = useState<Business | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const { addView } = useViews({
    businessId,
    userId: user?.id,
  });

  const { average, totalRatings } = useRatings(businessId!);
  const { contacts } = useContacts(businessId!);

  useEffect(() => {
    const fetchBusiness = async () => {
      let searchParam = profileName || id;

      if (!searchParam) {
        setLoadingBusiness(false);
        return;
      }

      searchParam = searchParam.replace(/^@/, "");

      let data = null;
      let error = null;

      if (isUUID(searchParam)) {
        const result = await supabase
          .from("businesses")
          .select("*")
          .eq("id", searchParam)
          .single();

        data = result.data;
        error = result.error;
      } else {
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

  useEffect(() => {
    if (businessId) addView();
  }, [businessId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [profileName, id]);

  if (loadingBusiness) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_25%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_25%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
        <Header />
        <div className="text-center py-20 px-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
            Negocio no encontrado
          </h2>
          <button
            onClick={() => window.history.back()}
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_25%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
      <Helmet>
        <title>{business.name} - RoaBusiness</title>
        <meta
          name="description"
          content={
            business.description?.substring(0, 160) ||
            `Visita ${business.name} en Roatán`
          }
        />

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

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </button>

        <div className="space-y-8">
          <HeroSection
            business={business}
            average={average}
            totalRatings={totalRatings}
            onOpenGallery={() => setShowGalleryModal(true)}
          />

          <SectionCard className="p-4 md:p-5">
            <QuickActionsBar
              business={business}
              contacts={contacts}
              onOpenQRModal={() => setShowQRModal(true)}
            />
          </SectionCard>

          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="space-y-6">
              <BusinessDescription business={business} />
              <AmenitiesSection business={business} />
              <ContactInfoSection business={business} contacts={contacts} />
              <SocialMediaLinks business={business} />
            </div>

            <div className="space-y-6">
              <RatingsSection businessId={business.id} />
              <MapSection business={business} />
            </div>
          </div>

          <SocialEmbedSection business={business} />
        </div>
      </div>

      <GalleryModal
        business={business}
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
      />

      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        businessName={business.name}
        businessLogo={business.logo}
        url={getBusinessUrl(business.profile_name || business.id)}
      />
    </div>
  );
};

export default BusinessProfilePage;