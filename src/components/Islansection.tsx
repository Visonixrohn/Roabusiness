import { Link } from "react-router-dom";
import { Building2, ArrowRight, Sparkles } from "lucide-react";

const IslandsSection = () => {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        {/* Card CTA Premium */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.15)] transition-all duration-500">
          
          {/* Elementos decorativos de fondo (Glow effects) */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />

          {/* Contenido */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            
            {/* Texto e Icono */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6">
              {/* Icono Flotante */}
              <div className="flex items-center justify-center w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 transform transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 mb-3 md:hidden">
                  <Sparkles className="h-3.5 w-3.5" />
                  Únete a la plataforma
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  ¿Quieres registrar tu negocio?
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
                  Únete al directorio más importante de la región. Destaca tus servicios y conecta rápidamente con miles de visitantes y residentes locales.
                </p>
              </div>
            </div>

            {/* Botón de Acción */}
            <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <Link
                to="/registro-negocio"
                className="group/btn inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-[15px] font-bold text-white shadow-sm transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                aria-label="Registrar mi negocio"
              >
                <span>Comenzar ahora</span>
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default IslandsSection;