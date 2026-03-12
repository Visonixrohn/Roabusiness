/**
 * useCountry
 * Detecta el país del usuario a partir de GPS usando la API de reverse geocoding
 * de BigDataCloud (gratuita, sin clave API).
 *
 * El resultado se almacena en localStorage para evitar peticiones repetitivas.
 */
import { useState, useEffect, useCallback } from "react";
import { normalizeCountryName } from "@/data/countries";

export type CountryDetectStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "error";

const CACHE_KEY = "roa_detected_country";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

interface CacheEntry {
  country: string;
  ts: number;
}

function loadCache(): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.country;
  } catch {
    return null;
  }
}

function saveCache(country: string) {
  try {
    const entry: CacheEntry = { country, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // silenciar errores de storage
  }
}

/**
 * Llama a la API de BigDataCloud para obtener el nombre del país
 * a partir de coordenadas. Devuelve el nombre en español.
 */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Reverse geocoding falló");
  const json = await res.json();
  return json.countryName as string;
}

export function useCountry() {
  const [status, setStatus] = useState<CountryDetectStatus>("idle");
  const [country, setCountry] = useState<string>(() => loadCache() || "Honduras");

  /** Solicita la ubicación y detecta el país */
  const detectCountry = useCallback(() => {
    // Usar caché si está disponible
    const cached = loadCache();
    if (cached) {
      setCountry(cached);
      setStatus("ready");
      return;
    }

    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const raw = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          const detected = normalizeCountryName(raw);
          if (detected) {
            setCountry(detected);
            saveCache(detected);
            setStatus("ready");
          } else {
            setStatus("error");
          }
        } catch {
          setStatus("error");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  }, []);

  /** Cambia el país manualmente y lo guarda en caché */
  const setManualCountry = useCallback((name: string) => {
    setCountry(name);
    saveCache(name);
    setStatus("ready");
  }, []);

  /** Limpia la caché y fuerza nueva detección */
  const resetCountry = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setStatus("idle");
    setCountry("Honduras");
  }, []);

  // Auto-detectar al montar si no hay caché
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setCountry(cached);
      setStatus("ready");
    } else {
      detectCountry();
    }
  }, [detectCountry]);

  return { country, status, detectCountry, setManualCountry, resetCountry };
}
