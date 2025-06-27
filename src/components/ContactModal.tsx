import { useState } from "react";
import { X, Phone, Mail, Globe, MapPin, Send } from "lucide-react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Facebook, Instagram, Twitter } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";

interface ContactModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  contacts?: { phone: string; email: string; website: string } | null;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("¡Mensaje enviado exitosamente!");
    setFormData({ name: "", email: "", phone: "", message: "" });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg px-6 py-5 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
            <img
              src={business.logo}
              alt={business.name}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <span>Contactar a {business.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Info del negocio */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-gray-700 shadow-inner">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>
                {business.location}, {business.island}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <a
                href={`tel:${contacts?.phone || ""}`}
                className="text-blue-600 hover:underline"
              >
                {contacts?.phone || "No disponible"}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <a
                href={`mailto:${contacts?.email || ""}`}
                className="text-blue-600 hover:underline"
              >
                {contacts?.email || "No disponible"}
              </a>
            </div>
            {contacts?.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a
                  href={`https://${contacts.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {contacts.website}
                </a>
              </div>
            )}
          </div>

          {/* Botones rápidos */}
          <div className="border-t pt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`tel:${contacts?.phone || ""}`)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" /> Llamar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${contacts?.email || ""}`)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" /> Email
            </Button>
            {contacts?.website && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`https://${contacts.website}`, "_blank")
                }
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Globe className="h-4 w-4" /> Web
              </Button>
            )}
            {contacts?.phone && (
              <Button
                size="sm"
                onClick={() => {
                  const phone = contacts.phone.replace(/\D/g, "");
                  window.open(`https://wa.me/${phone}`);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                aria-label="Contactar por WhatsApp"
              >
                <svg
                  viewBox="0 0 32 32"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="mr-1"
                >
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.34 7.09L4 29l7.18-2.31A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.52-5.54-1.5l-.39-.23-4.27 1.37 1.4-4.15-.25-.4A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.28-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"></path>
                </svg>
                WhatsApp
              </Button>
            )}
          </div>

          {/* Redes sociales desde las columnas principales del negocio */}
          {(business.facebook ||
            business.instagram ||
            business.twitter ||
            business.tiktok) && (
            <div className="flex gap-3 mt-2 justify-center">
              {business.facebook && (
                <a
                  href={business.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:scale-110 transition-transform"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                </a>
              )}
              {business.instagram && (
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:scale-110 transition-transform"
                >
                  <Instagram className="h-5 w-5 text-pink-500" />
                </a>
              )}
              {business.twitter && (
                <a
                  href={business.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="hover:scale-110 transition-transform"
                >
                  <Twitter className="h-5 w-5 text-blue-400" />
                </a>
              )}
              {business.tiktok && (
                <a
                  href={business.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="hover:scale-110 transition-transform"
                >
                  <TikTokIcon className="h-5 w-5 text-black" />
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
