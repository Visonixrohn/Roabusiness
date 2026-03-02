import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { translations } from "../lib/translations";

export type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Función para detectar el idioma del navegador
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  // Si el idioma del navegador es inglés, usar inglés
  if (browserLang.toLowerCase().startsWith("en")) {
    return "en";
  }
  // Por defecto, español
  return "es";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Intentar cargar idioma guardado o detectar del navegador
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language") as Language;
    return saved || detectBrowserLanguage();
  });

  // Guardar preferencia de idioma
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    // Actualizar el atributo lang del HTML
    document.documentElement.lang = lang;
  };

  // Actualizar el atributo lang al montar
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Función para obtener traducción
  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
