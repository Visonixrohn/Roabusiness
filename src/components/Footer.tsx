import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-blue-400">
                  RoaBusiness
                </span>
                <span className="text-sm text-gray-400 block leading-none">
                  Tu guía completa de Honduras
                </span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Descubre los mejores negocios, restaurantes, hoteles y actividades
              en las hermosas Islas de la Bahía. Tu puerta de entrada al paraíso
              caribeño de Honduras.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              ></a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              ></a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              ></a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/directorio"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Directorio de Negocios
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre-las-islas"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Sobre las Islas
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Islas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nuestras Islas</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">Roatán</span>
                <p className="text-sm text-gray-400">La isla principal</p>
              </li>
              <li>
                <span className="text-gray-300">Utila</span>
                <p className="text-sm text-gray-400">Paraíso del buceo</p>
              </li>
              <li>
                <span className="text-gray-300">Guanaja</span>
                <p className="text-sm text-gray-400">La isla verde</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 RoaBusiness. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="/privacidad"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                to="/terminos"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
