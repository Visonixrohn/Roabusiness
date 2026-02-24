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
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContactModal from "@/components/ContactModal";
import GalleryModal from "@/components/GalleryModal";
import { cn } from "@/lib/utils";
import { useContacts } from "@/hooks/useContacts";

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

  const { contacts, loading: loadingContacts } = useContacts(business.id);

  // Fallback para contactos: si no hay en la tabla contacts, usar los del objeto business.contact
  const fallbackContacts = business.contact || null;

  // Show contact modal when clicking the card (no navigation)

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
    Roatán: "bg-teal-100 text-teal-800",
    Utila: "bg-emerald-100 text-emerald-800",
    Guanaja: "bg-indigo-100 text-indigo-800",
    "Jose Santos Guardiola": "bg-pink-100 text-pink-800",
  };
  const islands = ["Roatán", "Utila", "Guanaja", "Jose Santos Guardiola"];

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative cursor-pointer",
          "w-full min-w-0",
        )}
        style={{ minWidth: 0 }}
        onClick={() => {
          if (!showContactModal) {
            setShowContactModal(true);
          }
        }}
      >
        {/* Header */}
        <div className="p-2 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center space-x-2">
            <img
              src={business.logo}
              alt={`${business.name} logo`}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-200 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-900 truncate">
                {business.name}
              </h3>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 text-teal-500 flex-shrink-0" />
                <span className="ml-1 truncate">{business.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen principal */}
        <div className="relative">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-32 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
            onClick={(e) => {
              e.stopPropagation();
              setShowGalleryModal(true);
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge
              className={cn(
                "text-xs font-semibold shadow-sm px-1.5 py-0.5",
                islandColors[
                  (business.departamento ||
                    business.island) as keyof typeof islandColors
                ] || "bg-gray-200 text-gray-700",
              )}
            >
              {business.departamento || business.island}
            </Badge>
          </div>
          {business.gallery && business.gallery.length > 1 && (
            <div className="absolute bottom-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowGalleryModal(true)}
                className="bg-black bg-opacity-60 text-white hover:bg-opacity-80 rounded-full px-2 py-0.5 text-xs h-6"
              >
                <Eye className="h-3 w-3 mr-0.5" /> +
                {(business.gallery?.length || 0) - 1}
              </Button>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-2">
          {/* Categoría y precio */}
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant="outline"
              className="text-teal-600 border-teal-600 text-xs px-1.5 py-0.5"
            >
              {business.category}
            </Badge>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-600">
                {getPriceRangeText(business.priceRange)}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {business.description || "Sin descripción disponible"}
          </p>

          {/* Amenidades */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {business.amenities && business.amenities.length > 0 ? (
                <>
                  {business.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-700"
                    >
                      {amenity}
                    </Badge>
                  ))}
                  {business.amenities.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-700"
                    >
                      +{(business.amenities?.length || 0) - 3}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400">Sin amenidades</span>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex space-x-3"></div>
            </div>

            {/* Botones de contacto */}
            <div className="flex space-x-1.5 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContactModal(true);
                }}
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full text-xs h-7 px-2"
              >
                <Phone className="h-3 w-3 mr-0.5" />
                Contactar
              </Button>
              {contacts?.website && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://${contacts.website}`, "_blank");
                  }}
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full text-xs h-7 px-2"
                >
                  <Globe className="h-3 w-3 mr-0.5" />
                  Web
                </Button>
              )}
            </div>
            {/* Botón de seguidores alineado abajo, mismo diseño que los otros botones */}
          </div>
        </div>

        {/* Modales */}
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
      </div>
    </>
  );
};

export default BusinessCard;
