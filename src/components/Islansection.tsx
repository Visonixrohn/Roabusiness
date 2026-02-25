import { useState, useRef } from "react";
import { Download, PlusCircle, X } from "lucide-react"; // Añadí PlusCircle y X para el nuevo diseño del modal
import RegisterBusinessModal from "@/components/RegisterBusinessModal";

const IslandsSection = ({ isStandalone, installPromptRef }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Título y subtítulo para el contexto de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Lleva tu Negocio al Siguiente Nivel
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Descarga nuestra app o registra tu emprendimiento en RoaBusiness.
          </p>
        </div>

        {/* Botón de instalación y registro */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-16"> {/* Aumenté el gap y puse más espaciado arriba */}
          <button
            onClick={async () => {
              if (isStandalone) {
                alert("¡Ya tienes RoaBusiness como app en tu dispositivo!");
                return;
              }
              if (installPromptRef.current) {
                installPromptRef.current.prompt();
                const { outcome } = await installPromptRef.current.userChoice;
                if (outcome === "accepted") return;
              }
              setShowTutorial(true);
            }}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-full shadow-lg flex items-center justify-center gap-3 text-lg font-semibold overflow-hidden
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-all duration-300 ease-in-out
                       transform hover:scale-105 active:scale-95 active:shadow-none hover:from-blue-700 hover:to-blue-800"
            aria-label="Instalar RoaBusiness en tu dispositivo"
            type="button"
          >
            <Download className="h-6 w-6 text-white transition-transform duration-500 group-hover:translate-y-[-2px] group-hover:rotate-[5deg]"/> {/* Animación más sutil */}
            Instalar RoaBusiness
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span> {/* Subrayado animado */}
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-full shadow-lg flex items-center justify-center gap-3 text-lg font-semibold overflow-hidden
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-2 transition-all duration-300 ease-in-out
                       transform hover:scale-105 active:scale-95 active:shadow-none hover:from-green-600 hover:to-emerald-700"
            aria-label="Registrar negocio"
            type="button"
          >
            <PlusCircle className="h-6 w-6 text-white transition-transform duration-500 group-hover:rotate-90" /> {/* Animación al pasar el mouse */}
            Registrar Negocio
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span> {/* Subrayado animado */}
          </button>
        </div>

        {/* Modal Tutorial */}
        {showTutorial && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn" // Fondo más oscuro
          >
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative transform scale-95 opacity-0 animate-scaleInUp"> {/* Bordes más redondeados, sombra más profunda y animación */}
              {/* Botón de cerrar elegante */}
              <button
                onClick={() => setShowTutorial(false)}
                aria-label="Cerrar tutorial"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" /> {/* Icono X de Lucide */}
              </button>

              <div className="flex flex-col items-center mb-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2288/2288494.png"
                  alt="Icono RoaBusiness"
                  className="w-24 h-24 mx-auto mb-4 rounded-full shadow-md p-2 bg-gradient-to-br from-blue-500 to-blue-600" // Icono más grande, con gradiente y sombra
                />
                <h3 className="text-2xl font-bold text-gray-900 text-center leading-snug">
                  ¡Lleva RoaBusiness siempre contigo!
                </h3>
                <p className="text-gray-600 mt-2 text-center text-sm">
                  Agrega la app a tu pantalla de inicio en segundos.
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-3 text-gray-700 text-left pl-4"> {/* Más espaciado y padding */}
                <li>
                  Toca el ícono de <b className="text-blue-600">menú (⋮)</b> o de{" "}
                  <b className="text-blue-600">Compartir</b> en tu navegador.
                </li>
                <li>
                  Busca y selecciona la opción{" "}
                  <b className="text-blue-600">"Agregar a pantalla de inicio"</b> o{" "}
                  <b className="text-blue-600">"Instalar app"</b>.
                </li>
                <li>
                  Confirma la instalación. ¡Así de fácil!
                </li>
              </ol>

              <div className="flex justify-center mt-8"> {/* Centrado y más margen */}
                <button
                  onClick={() => setShowTutorial(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <RegisterBusinessModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />

      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
       .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
       .animate-scaleInUp {
          animation: scaleInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; // Un rebote sutil
        }
      `}</style>
    </section>
  );
};

export default IslandsSection;