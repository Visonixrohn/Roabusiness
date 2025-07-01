import { useState, useRef } from 'react';
import { Download } from 'lucide-react';

const IslandsSection = ({ isStandalone, installPromptRef }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Título y descripción */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight underline decoration-pink-500 decoration-4 underline-offset-8">
           
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            
          </p>
        </div>

        {/* Grid de Islas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              name: 'Roatán',
              desc: 'La isla principal',
              img: '/images/roatan-beach.png',
            },
            {
              name: 'Utila',
              desc: 'Paraíso del buceo',
              img: '/images/utila-diving.jpg',
            },
            {
              name: 'Guanaja',
              desc: 'La isla verde',
              img: '/images/guanaja-beach.jpeg',
            },
          ].map(({ name, desc, img }) => (
            <div
              key={name}
              className="group cursor-pointer rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 relative"
              tabIndex={0}
              aria-label={`${name} - ${desc}`}
            >
              <img
                src={img}
                alt={name}
                className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute bottom-6 left-6 z-10 text-white">
                <h3 className="text-3xl font-extrabold drop-shadow-md">{name}</h3>
                <p className="text-lg opacity-90 drop-shadow-md">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de instalación */}
        <div className="flex justify-center mt-16">
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
