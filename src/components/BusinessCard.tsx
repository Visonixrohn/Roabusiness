import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Business } from "@/types/business";
import ContactModal from "@/components/ContactModal";
import GalleryModal from "@/components/GalleryModal";
import QRModal from "@/components/QRModal";
import { useContacts } from "@/hooks/useContacts";
import { useRatings } from "@/hooks/useRatings";
import { getBusinessUrl } from "@/lib/shareUtils";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  business: Business;
  followers?: number;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const { contacts } = useContacts(business.id);
  const { average } = useRatings(business.id);

  return (
    <>
      <div
        className="group relative flex flex-col h-full cursor-pointer overflow-hidden bg-white rounded-[24px] md:rounded-[28px] border border-slate-200/50 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_30px_-10px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
        onClick={() => navigate(`/negocio/${business.profile_name || business.id}`)}
      >
        {/* IMAGEN DE PORTADA */}
        <div className="relative h-28 sm:h-32 md:h-48 w-full overflow-hidden bg-slate-100 shrink-0">
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />
          
          {/* Badge Ubicación Flotante */}
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
            <div className="bg-white/95 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <MapPin className="h-2.5 w-2.5 text-emerald-500" />
              <span className="truncate max-w-[50px] sm:max-w-[100px]">{business.departamento || business.island}</span>
            </div>
          </div>
        </div>

        {/* CONTENIDO INFERIOR - Paddings ultra compactos en móvil (p-2.5) */}
        <div className="relative flex flex-col flex-1 p-2.5 md:p-5">
          {/* Nombre y Estrellas */}
          <div className="flex justify-between items-start gap-1 mb-1">
            <h3 className="text-[13px] md:text-[17px] font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {business.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 shrink-0">
              <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-[10px] md:text-xs font-bold text-amber-700">{(average || 0).toFixed(1)}</span>
            </div>
          </div>

          {/* Categoría y Ciudad */}
          <div className="flex items-center gap-1 text-[10px] md:text-[12px] font-medium text-slate-500 mb-3 truncate">
            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded truncate max-w-[70%]">{business.category || business.categories?.[0]}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
            <span className="truncate">{business.municipio || business.location}</span>
          </div>

          {/* Descripción (Oculta en móvil) */}
          <p className="hidden md:block text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {business.description || "Descubre más sobre este negocio..."}
          </p>

          {/* Botón Inferior */}
          <div className="mt-auto pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] md:text-[13px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
              <span>Ver perfil completo</span>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      <ContactModal business={business} isOpen={showContactModal} onClose={() => setShowContactModal(false)} contacts={contacts} />
      <GalleryModal business={business} isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} />
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} businessName={business.name} businessLogo={business.logo} url={getBusinessUrl(business.profile_name || business.id)} />
    </>
  );
};

export default BusinessCard;