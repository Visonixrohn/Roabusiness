import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo y descripción */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-yellow-400 via-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-md shadow-pink-300/50">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-pink-600 leading-none">
                  RoaBusiness
                </h2>
                <p className="text-pink-400 text-xs -mt-0.5">
                  Tu guía completa de Honduras
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm max-w-lg leading-relaxed">
              Descubre los mejores negocios, restaurantes, hoteles y actividades
              en las hermosas Islas de la Bahía y Honduras. Tu puerta de entrada
              al paraíso caribeño de Honduras.
            </p>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-pink-200 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>© 2026 RoaBusiness. {t("footer.allRightsReserved")}.</p>
            <LanguageSwitcher />
          </div>
          <div className="flex space-x-4">
            <Link
              to="/privacidad"
              className="hover:text-pink-600 transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              to="/terminos"
              className="hover:text-pink-600 transition-colors"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
