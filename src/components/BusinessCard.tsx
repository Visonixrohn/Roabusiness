import { useState } from "react";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Heart,
  Eye,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Users,
  TrendingUp,
  Share2,
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContactModal from "@/components/ContactModal";
import GalleryModal from "@/components/GalleryModal";
import QRModal from "@/components/QRModal";
import { StarRating } from "@/components/StarRating";
import { cn } from "@/lib/utils";
import { useContacts } from "@/hooks/useContacts";
import { useRatings } from "@/hooks/useRatings";
import {
  copyBusinessLink,
  getBusinessUrl,
  shareBusinessLink,
} from "@/lib/shareUtils";

interface BusinessCardProps {
  business: Business;
  followers?: number;
  variant?: "default" | "compact";
}

const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  followers,
  variant = "default",
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const { contacts, loading: loadingContacts } = useContacts(business.id);
  const { average, totalRatings } = useRatings(business.id);

  // Fallback para contactos: si no hay en la tabla contacts, usar los del objeto business.contact
  const fallbackContacts = business.contact || null;

  const getPriceRangeText = (priceRange: string) => {
    switch (priceRange) {
      case "$":
        return "Económico";
      case "$$":
        return "Moderado";
      case "$$$":
        return "Caro";
      case "$$$$":
        return "Muy Caro";
      default:
        return "No especificado";
    }
  };

  const islandColors = {
    Roatán: "bg-gradient-to-r from-teal-500 to-teal-600",
    Utila: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    Guanaja: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    "Jose Santos Guardiola": "bg-gradient-to-r from-pink-500 to-pink-600",
  };

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group relative cursor-pointer border border-gray-100",
          "transform hover:-translate-y-1",
        )}
        onClick={() => {
          if (!showContactModal) {
            setShowContactModal(true);
          }
        }}
      >
        {/* Imagen de portada con aspect ratio fijo */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 group-hover:from-black/40 transition-all duration-300" />

          {/* Badge de departamento/isla - arriba izquierda */}
          <div className="absolute top-3 right-1">
            <Badge
              className={cn(
                "text-xs font-semibold shadow-lg px-2.5 py-1 text-white border-0",
                islandColors[
                  (business.departamento ||
                    business.island) as keyof typeof islandColors
                ] || "bg-gradient-to-r from-gray-500 to-gray-600",
              )}
            >
              <MapPin className="h-3 w-3 mr-1 inline" />
              {business.departamento || business.island}
            </Badge>
          </div>

          {/* Galería indicator - abajo derecha (ligeramente desplazado para dejar espacio a las estrellas) */}
          {business.gallery && business.gallery.length > 1 && (
            <div className="absolute bottom-3 right-16">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGalleryModal(true);
                }}
                className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white rounded-full px-2.5 sm:px-3 py-1.5 text-xs h-auto font-medium shadow-lg"
              >
                <Eye className="h-3.5 w-3.5 mr-1 sm:mr-1.5" />
                <span>
                  {business.gallery?.length} foto
                  {business.gallery.length !== 1 ? "s" : ""}
                </span>
              </Button>
            </div>
          )}

          {/* Rating overlay - esquina inferior derecha sobre la imagen (fondo transparente) */}
          <div className="absolute bottom-3 right-3 z-20">
            <div className="px-2 py-1 flex flex-col items-center gap-0">
              <div className="text-sm font-semibold text-white drop-shadow-lg">
                {(average || 0).toFixed(1)}
              </div>
              <StarRating
                value={average || 0}
                readOnly
                size={14}
                showValue={false}
                className="!leading-none text-white drop-shadow-lg"
              />
              <span className="text-xs text-white drop-shadow mt-1">
                {totalRatings || 0} personas calificaron
              </span>
            </div>
          </div>

          {/* Logo flotante */}
          <div className="absolute -bottom-1 left-4">
            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
              <img
                src={business.logo}
                alt={`${business.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 pt-8">
          {/* Header con nombre y categoría */}
          <div className="mb-3">
            {/* Nombre completo y centrado (sin truncar) */}
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 text-center group-hover:text-teal-600 transition-colors">
              {business.name}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {(business.categories && business.categories.length > 0
                ? business.categories
                : [business.category]
              )
                .filter(Boolean)
                .map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="text-teal-600 border-teal-300 bg-teal-50 text-[10px] sm:text-xs px-2 py-0.5 font-medium"
                  >
                    {cat}
                  </Badge>
                ))}
            </div>
          </div>
          {/* Amenidades */}
          {business.amenities && business.amenities.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {business.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-[9px] sm:text-xs bg-gray-100 text-gray-700 px-1.5 sm:px-2 py-0.5 font-normal"
                  >
                    {amenity}
                  </Badge>
                ))}
                {business.amenities.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] sm:text-xs bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 px-1.5 sm:px-2 py-0.5 font-medium"
                  >
                    +{business.amenities.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Ubicación */}
          <div className="flex items-start gap-2 mb-3 text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {[business.municipio || business.location, business.colonia]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>

          {/* Descripción */}
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
            {business.description ||
              "Descubre este increíble negocio en Honduras"}
          </p>

          {/* Stats (seguidores si existe) */}
          {followers !== undefined && followers > 0 && (
            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500" />
                <span className="font-semibold text-gray-900">{followers}</span>
                <span className="text-[10px] sm:text-xs">seguidores</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowContactModal(true);
              }}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl h-9 sm:h-10 font-medium shadow-md hover:shadow-lg transition-all text-xs sm:text-sm px-2 sm:px-4"
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline ml-1.5 sm:ml-0">Contactar</span>
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                shareBusinessLink(
                  business.profile_name || business.id,
                  business.name,
                );
              }}
              variant="outline"
              className="px-2.5 sm:px-4 border-2 border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 rounded-xl h-9 sm:h-10 font-medium transition-all min-w-[2.25rem] sm:min-w-[2.5rem] flex items-center justify-center"
              aria-label="Compartir enlace del negocio"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modales — fuera del div con transform para evitar que fixed quede contenido dentro */}
      <ContactModal
        business={business}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contacts={contacts || fallbackContacts}
      />
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
    </>
  );
};

export default BusinessCard;
