import { Link } from "react-router-dom";
import {
  MapPin,
} from "lucide-react";

const Footer = () => {
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
              en las hermosas Islas de la Bahía. Tu puerta de entrada al paraíso
              caribeño de Honduras.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-pink-600 tracking-wide">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Inicio", to: "/" },
                { label: "Directorio de Negocios", to: "/directorio" },
                { label: "Sobre las Islas", to: "/sobre-las-islas" },
                { label: "Contacto", to: "/contacto" },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Islas */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-pink-600 tracking-wide">
              Nuestras Islas
            </h3>
            <ul className="space-y-2 text-gray-600">
              {[
                { name: "Roatán", desc: "La isla principal" },
                { name: "Utila", desc: "Paraíso del buceo" },
                { name: "Guanaja", desc: "La isla verde" },
              ].map(({ name, desc }) => (
                <li
                  key={name}
                  className="hover:text-pink-600 transition-colors cursor-default"
                >
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-pink-200 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 space-y-2 md:space-y-0">
          <p>© 2025 RoaBusiness. Todos los derechos reservados.</p>
          <div className="flex space-x-4">
            <Link
              to="/privacidad"
              className="hover:text-pink-600 transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              to="/terminos"
              className="hover:text-pink-600 transition-colors"
            >
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
