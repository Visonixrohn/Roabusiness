/**
 * CountrySelector
 * Muestra el país actual detectado por GPS y permite cambiarlo manualmente.
 * Se usa tanto en el Directorio como en los formularios de negocio.
 */
import { Globe, MapPin, Loader2, RefreshCw } from "lucide-react";
import { PAISES_LATAM } from "@/data/countries";
import { useCountryContext } from "@/contexts/CountryContext";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  /** Modo compacto: solo el selector, sin el bloque de detección GPS */
  compact?: boolean;
  /** Valor controlado externo (e.g. formulario de registro) */
  value?: string;
  /** Callback controlado externo */
  onChange?: (country: string) => void;
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  compact = false,
  value,
  onChange,
  className,
}) => {
  const { country, status, setManualCountry, detectCountry } =
    useCountryContext();

  const currentValue = value ?? country;
  const handleChange = (v: string) => {
    if (onChange) {
      onChange(v);
    } else {
      setManualCountry(v);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Selector de país */}
      <div className="relative flex items-center gap-2">
        <Globe className="absolute left-3 h-4 w-4 text-teal-500 pointer-events-none" />
        <select
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all appearance-none cursor-pointer"
        >
          {/* Si el valor actual no está en la lista, mostrarlo igual */}
          {!PAISES_LATAM.includes(currentValue) && (
            <option value={currentValue}>{currentValue}</option>
          )}
          {PAISES_LATAM.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {/* Flecha */}
        <svg
          className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Barra de estado GPS — solo en modo no-compacto */}
      {!compact && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {status === "loading" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-teal-500" />
              <span>Detectando país…</span>
            </>
          )}
          {status === "ready" && (
            <>
              <MapPin className="h-3 w-3 text-teal-500" />
              <span>País detectado por GPS</span>
              <button
                onClick={detectCountry}
                className="ml-auto flex items-center gap-1 text-teal-600 hover:text-teal-700 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Actualizar
              </button>
            </>
          )}
          {(status === "denied" || status === "error") && (
            <>
              <Globe className="h-3 w-3 text-amber-500" />
              <span className="text-amber-600">
                No se pudo detectar el país. Selecciónalo manualmente.
              </span>
            </>
          )}
          {status === "idle" && (
            <button
              onClick={detectCountry}
              className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs transition-colors"
            >
              <MapPin className="h-3 w-3" />
              Detectar mi país
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
