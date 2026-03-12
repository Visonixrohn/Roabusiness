import { createContext, useContext, ReactNode } from "react";
import { useCountry, CountryDetectStatus } from "@/hooks/useCountry";

interface CountryContextType {
  /** Nombre del país activo (ej. "Honduras", "México", "Guatemala") */
  country: string;
  status: CountryDetectStatus;
  /** Cambia el país manualmente */
  setManualCountry: (name: string) => void;
  /** Re-detecta por GPS */
  detectCountry: () => void;
  /** Resetea a Honduras y borra caché */
  resetCountry: () => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const hook = useCountry();
  return (
    <CountryContext.Provider value={hook}>{children}</CountryContext.Provider>
  );
};

export const useCountryContext = (): CountryContextType => {
  const ctx = useContext(CountryContext);
  if (!ctx)
    throw new Error("useCountryContext debe usarse dentro de CountryProvider");
  return ctx;
};
