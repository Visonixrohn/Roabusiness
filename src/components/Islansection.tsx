import { useState, useRef } from "react";
import { Download } from "lucide-react";
import RegisterBusinessModal from "@/components/RegisterBusinessModal";

const IslandsSection = ({ isStandalone, installPromptRef }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Botón de instalación y registro */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-16">
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
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-full shadow-lg flex items-center gap-3 text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 transition-transform transform hover:scale-105 active:scale-95"
            aria-label="Instalar RoaBusiness en tu dispositivo"
            type="button"
          >
            <Download className="h-6 w-6 text-white transition-transform duration-500 group-hover:animate-bounce" />
            Instalar RoaBusiness (Acceso Directo)
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-4 rounded-full shadow-lg flex items-center justify-center gap-3 text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400 transition-transform transform hover:scale-105 active:scale-95"
            aria-label="Registrar negocio"
            type="button"
          >
            Registrar Negocio
          </button>
        </div>

        {/* Modal Tutorial */}
        {showTutorial && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl relative animate-fadeInUp">
              <button
                onClick={() => setShowTutorial(false)}
                aria-label="Cerrar tutorial"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              >
                ✕
              </button>

              <img
                src="https://cdn-icons-png.flaticon.com/512/2288/2288494.png"
                alt="Icono RoaBusiness"
                className="w-20 h-20 mx-auto mb-4 rounded-full shadow"
                style={{ background: "#fff" }}
              />

              <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
                ¿Cómo agregar RoaBusiness a tu pantalla de inicio?
              </h3>

              <ol className="list-decimal list-inside space-y-2 text-gray-700 text-left">
                <li>
                  Abre el menú <b>⋮</b> o <b>Compartir</b> de tu navegador.
                </li>
                <li>
                  Selecciona <b>"Agregar a pantalla de inicio"</b> o{" "}
                  <b>"Instalar app"</b>.
                </li>
                <li>Confirma la instalación. ¡Listo!</li>
              </ol>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-blue-600 hover:underline font-semibold focus:outline-none"
                >
                  Cerrar
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
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease forwards;
        }
      `}</style>
    </section>
  );
};

export default IslandsSection;
