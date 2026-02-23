import { useState, useRef } from 'react';
import { Download } from 'lucide-react';

const IslandsSection = ({ isStandalone, installPromptRef }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6 max-w-7xl">
       

        {/* Botón de instalación y registro */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-16">
          <button
            onClick={async () => {
              if (isStandalone) {
                alert('¡Ya tienes RoaBusiness como app en tu dispositivo!');
                return;
              }
              if (installPromptRef.current) {
                installPromptRef.current.prompt();
                const { outcome } = await installPromptRef.current.userChoice;
                if (outcome === 'accepted') return;
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

          <a
            href="https://wa.me/50488857653?text=Quiero%20registrar%20mi%20negocio%20en%20RoaBusiness"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-4 rounded-full shadow-lg flex items-center justify-center gap-3 text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400 transition-transform transform hover:scale-105 active:scale-95"
            aria-label="Registrar negocio por WhatsApp"
          >
            <svg viewBox="0 0 32 32" className="h-6 w-6 text-white" fill="currentColor">
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.34 7.09L4 29l7.18-2.31A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.52-5.54-1.5l-.39-.23-4.27 1.37 1.4-4.15-.25-.4A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.28-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
            </svg>
            Registrar Negocio
          </a>
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
                style={{ background: '#fff' }}
              />

              <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
                ¿Cómo agregar RoaBusiness a tu pantalla de inicio?
              </h3>

              <ol className="list-decimal list-inside space-y-2 text-gray-700 text-left">
                <li>
                  Abre el menú <b>⋮</b> o <b>Compartir</b> de tu navegador.
                </li>
                <li>
                  Selecciona <b>"Agregar a pantalla de inicio"</b> o <b>"Instalar app"</b>.
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
