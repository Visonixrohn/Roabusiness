import { useState } from "react";
import { PlusCircle } from "lucide-react";
import RegisterBusinessModal from "@/components/RegisterBusinessModal";

const IslandsSection = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
    <section className="py-5 bg-gradient-to-b from-blue-50 ">
      <div className="container mx-auto px-3 max-w-7xl">
        {/* Título y subtítulo para el contexto de la sección */}

        {/* Botón de registro */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-12 sm:mt-16 px-4">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-semibold overflow-hidden
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-2 transition-all duration-300 ease-in-out
                       transform hover:scale-105 active:scale-95 active:shadow-none hover:from-green-600 hover:to-emerald-700 w-full sm:w-auto"
            aria-label="Registrar negocio"
            type="button"
          >
            <PlusCircle className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white transition-transform duration-500 group-hover:rotate-90" />{" "}
            {/* Animación al pasar el mouse */}
            <span className="truncate">Registrar Negocio</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>{" "}
            {/* Subrayado animado */}
          </button>
        </div>
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
