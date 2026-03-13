/**
 * CountrySelector (Diseño Mejorado y Responsivo)
 * Requiere: npm i react-world-flags
 */
import React, { useState, useRef, useEffect } from "react";
import { Globe, MapPin, Loader2, RefreshCw, ChevronDown, Check } from "lucide-react";
import Flag from "react-world-flags";
import { PAISES_LATAM } from "@/data/countries";
import { useCountryContext } from "@/contexts/CountryContext";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  compact?: boolean;
  value?: string;
  onChange?: (country: string) => void;
  className?: string;
}

const countryToIsoMap: Record<string, string> = {
    "Honduras": "HN", "Guatemala": "GT", "El Salvador": "SV", "Nicaragua": "NI",
    "Costa Rica": "CR", "Panamá": "PA", "Panama": "PA", "México": "MX", "Mexico": "MX",
    "Colombia": "CO", "Venezuela": "VE", "Ecuador": "EC", "Perú": "PE", "Peru": "PE",
    "Bolivia": "BO", "Chile": "CL", "Argentina": "AR", "Uruguay": "UY", "Paraguay": "PY",
    "Brasil": "BR", "Brazil": "BR", "República Dominicana": "DO", "Republica Dominicana": "DO",
    "Cuba": "CU", "Puerto Rico": "PR", "Todos los países": "WORLD", "Todos": "WORLD","Jamaica": "JM",
    "Haití": "HT", "Haiti": "HT",
    "Belice": "BZ", "Belize": "BZ",
    "España": "ES",
    "Estados Unidos": "US", "USA": "US",
    "Canadá": "CA", "Canada": "CA",
};

const FlagCircle = ({ country, size = "md" }: { country: string, size?: "sm" | "md" | "lg" }) => {
  const isoCode = countryToIsoMap[country];
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-11 w-11",
  };

  if (!isoCode || isoCode === "WORLD") {
    return (
      <div className={cn("flex items-center justify-center rounded-full bg-blue-50 text-blue-500 shadow-sm ring-1 ring-black/5", sizeClasses[size])}>
        <Globe className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-full shadow-sm ring-1 ring-black/10 bg-white shrink-0", sizeClasses[size])}>
      <Flag code={isoCode} className="h-full w-full object-cover scale-125" fallback={<span>🌍</span>} />
    </div>
  );
};

const getShortCountryLabel = (country: string) => {
  const map: Record<string, string> = {
    "Honduras": "HN", "Guatemala": "GT", "El Salvador": "SV", "Nicaragua": "NI",
    "Costa Rica": "CR", "Panamá": "PA", "Panama": "PA", "México": "MX",
    "Mexico": "MX", "Colombia": "CO", "Venezuela": "VE", "Ecuador": "EC",
    "Perú": "PE", "Peru": "PE", "Bolivia": "BO", "Chile": "CL",
    "Argentina": "AR", "Uruguay": "UY", "Paraguay": "PY", "Brasil": "BR",
    "Brazil": "BR", "República Dominicana": "RD", "Republica Dominicana": "RD",
    "Cuba": "CU", "Puerto Rico": "PR", "Todos los países": "LATAM", "Todos": "LATAM",
  };
  return map[country] || country;
};

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  compact = false,
  value,
  onChange,
  className,
}) => {
  const { country, status, setManualCountry, detectCountry } = useCountryContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue = value ?? country;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (v: string) => {
    if (onChange) onChange(v);
    else setManualCountry(v);
    setIsOpen(false);
  };

  const shortLabel = getShortCountryLabel(currentValue);

  return (
    <div className={cn("flex flex-col gap-3 transition-all relative", className)} ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex w-full items-center justify-between rounded-full border bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 outline-none",
            "hover:bg-white/95 hover:shadow-md hover:border-teal-200",
            isOpen ? "border-teal-400 ring-2 ring-teal-400/30 bg-white" : "border-white/40",
            compact ? "h-10 pl-10 pr-3" : "h-12 pl-14 pr-5"
          )}
        >
          <div className={cn("absolute top-1/2 -translate-y-1/2 transition-all", compact ? "left-2" : "left-3")}>
             <FlagCircle country={currentValue} size={compact ? "sm" : "md"} />
          </div>

          <span className={cn("font-semibold text-gray-800 truncate transition-all", compact ? "text-sm" : "text-base")}>
            {compact ? shortLabel : currentValue}
          </span>

          <ChevronDown
            className={cn(
              "text-gray-400 transition-transform duration-300 shrink-0",
              isOpen ? "rotate-180 text-teal-600" : "group-hover:text-gray-600",
              compact ? "h-4 w-4 ml-2" : "h-5 w-5 ml-3",
            )}
          />
        </button>

        {isOpen && (
          <div 
            className={cn(
              // El cambio clave está aquí: Anclamos a la derecha si es compact (para evitar overflow), y controlamos el ancho
              "absolute z-50 mt-3 w-[280px] sm:w-[320px] transition-all duration-200 animate-in fade-in slide-in-from-top-2",
              compact ? "right-0 origin-top-right" : "left-0 origin-top-left"
            )}
          >
            <div className={cn(
                "max-h-[60vh] sm:max-h-[32rem] overflow-y-auto rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-2xl shadow-teal-900/10 backdrop-blur-xl ring-1 ring-black/5",
                "custom-scrollbar"
            )}>
              <div className="space-y-1">
                {PAISES_LATAM.map((p) => {
                  const isSelected = p === currentValue;
                  return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 group",
                      isSelected ? "bg-teal-50/80" : "hover:bg-gray-100/80"
                    )}
                  >
                    <div className="shrink-0">
                        <FlagCircle country={p} size="lg" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <p className={cn("truncate text-base font-bold", isSelected ? "text-teal-900" : "text-gray-800 group-hover:text-black")}>
                        {p}
                      </p>
                      <p className={cn("text-sm font-medium", isSelected ? "text-teal-600/80" : "text-gray-500")}>
                        {getShortCountryLabel(p)}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm animate-in zoom-in-50">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )})}
              </div>
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="rounded-2xl border border-teal-100/50 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md transition-all">
          {status === "loading" && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
              <span className="font-medium">Detectando ubicación...</span>
            </div>
          )}

          {status === "ready" && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 text-gray-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100/50 ring-1 ring-teal-200/50">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                </div>
                <span className="font-medium truncate">Sincronizado con GPS</span>
              </div>
              <button
                type="button"
                onClick={detectCountry}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm ring-1 ring-gray-200/50 transition hover:bg-teal-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          )}

          {(status === "denied" || status === "error") && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100/50 ring-1 ring-amber-200/50">
                <Globe className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="font-medium text-amber-800/90 leading-tight">
                Ubicación no disponible. Selecciónalo manualmente.
              </span>
            </div>
          )}

          {status === "idle" && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-gray-600 truncate">¿Usar tu ubicación?</span>
              <button
                type="button"
                onClick={detectCountry}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                <MapPin className="h-3.5 w-3.5" />
                Detectar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;