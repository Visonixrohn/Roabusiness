import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { contacts, loading: loadingContacts } = useContacts(business.id);

  // Fallback para contactos: si no hay en la tabla contacts, usar los del objeto business.contact
  const fallbackContacts = business.contact || null;

  const handleViewProfile = () => {
    navigate(`/negocio/${business.id}`);
  };

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
          "bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative cursor-pointer p-2",
          "w-full max-w-[170px] min-w-0 mx-auto",
          variant === "compact" ? "max-w-[170px] p-2" : "max-w-xs"
        )}
        style={{ minWidth: 0 }}
        onClick={handleViewProfile}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <img
              src={business.logo}
              alt={`${business.name} logo`}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-200 shadow-sm"
            />
            <div className="flex-1">
              <h3
                className="font-bold text-lg text-gray-900 hover:text-teal-600 cursor-pointer transition-colors duration-200"
                onClick={handleViewProfile}
              >
                {business.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <MapPin className="h-4 w-4 text-teal-500" />
                <span>
                  {business.location}, {business.island}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen principal */}
        <div className="relative">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-56 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
            onClick={() => setShowGalleryModal(true)}
          />
          <div className="absolute top-4 right-4">
            <Badge
              className={cn(
                "font-semibold shadow-sm",
                islandColors[business.island as keyof typeof islandColors] || "bg-gray-200 text-gray-700"
              )}
            >
              {business.island}
            </Badge>
          </div>
          {business.gallery && business.gallery.length > 1 && (
            <div className="absolute bottom-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowGalleryModal(true)}
                className="bg-black bg-opacity-60 text-white hover:bg-opacity-80 rounded-full px-3 py-1"
              >
                <Eye className="h-4 w-4 mr-1" /> +
                {(business.gallery?.length || 0) - 1}
              </Button>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Categoría y precio */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="outline"
              className="text-teal-600 border-teal-600 font-medium"
            >
              {business.category}
            </Badge>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 font-medium">
                {getPriceRangeText(business.priceRange)}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {business.description || "Sin descripción disponible"}
          </p>

          {/* Amenidades */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
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
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-3">
                
              </div>
            </div>

            {/* Botones de contacto */}
            <div className="flex space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContactModal(true);
                }}
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full font-semibold"
              >
                <Phone className="h-4 w-4 mr-1" />
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
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full font-semibold"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Sitio Web
                </Button>
              )}
            </div>
            {/* Botón de seguidores alineado abajo, mismo diseño que los otros botones */}
            <div className="flex space-x-2 mt-2">
              {typeof followers === "number" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full font-semibold cursor-default select-none"
                  tabIndex={-1}
                  aria-disabled="true"
                  disabled
                >
                  <span className="font-bold">{followers}</span> seguidores
                </Button>
              )}
            </div>
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
