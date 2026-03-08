import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

const IslandsSection = () => {
  return (
    <section className="py-10 bg-gradient-to-b from-blue-50">
      <div className="container mx-auto px-3 max-w-7xl">
        {/* Bloque CTA de registro */}
        <div className="flex flex-col items-center gap-6 mt-12 sm:mt-16 px-4">
          {/* Card de invitación */}
          <div className="w-full max-w-xl bg-white border border-blue-100 rounded-2xl shadow-md px-6 py-7 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                ¿Quieres registrar tu negocio?
              </h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Registra tu negocio en el directorio más importante de la región
                y conecta con miles de visitantes y residentes.
              </p>
            </div>
            <Link
              to="/registro-negocio"
              className="group inline-flex items-center gap-2.5 bg-green-600 hover:bg-blue-700 active:bg-blue-800 text-white
                         px-7 py-3 rounded-xl font-semibold text-sm shadow-md
                         transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2
                         w-full sm:w-auto justify-center"
              aria-label="Registrar mi negocio"
            >
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>Registrar</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
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
