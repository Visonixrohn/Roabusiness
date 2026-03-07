import { useState, useEffect, useCallback } from "react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { haversineKm } from "@/utils/geoDistance";
import { Business } from "@/types/business";

export type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "error"; message: string };

interface UseNearbyBusinessesResult {
  /** Estado de la geolocalización */
  geo: GeoState;
  /** Solicita la ubicación del usuario (lazy — no se llama automáticamente) */
  requestLocation: () => void;
  /** Negocios dentro del radio (filtrados además por categoría si se indica) */
  nearbyBusinesses: Business[];
  /** Categorías únicas disponibles en los negocios cercanos */
  nearbyCategories: string[];
  loading: boolean;
}

/**
 * Devuelve negocios dentro de un radio dado (km) usando la ubicación del dispositivo.
 * La geolocalización es LAZY: sólo se solicita al llamar `requestLocation()`.
 *
 * @param radiusKm  Radio máximo en kilómetros (default 15)
 * @param category  Si se indica, filtra además por esa categoría
 */
export function useNearbyBusinesses(
  radiusKm = 15,
  category?: string,
): UseNearbyBusinessesResult {
  const { allBusinesses, loading: busLoading } = useBusinesses();
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const requestLocation = useCallback(() => {
    if (geo.status === "loading" || geo.status === "ready") return;
    setGeo({ status: "loading" });

    if (!navigator.geolocation) {
      setGeo({
        status: "error",
        message: "Tu navegador no soporta geolocalización.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: "ready",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeo({ status: "denied" });
        } else {
          setGeo({ status: "error", message: err.message });
        }
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }, [geo.status]);

  /** Todos los negocios dentro del radio */
  const nearbyBusinesses = (() => {
    if (geo.status !== "ready" || !allBusinesses?.length) return [];

    const { lat, lng } = geo;

    const withinRadius = allBusinesses.filter((b) => {
      const bLat = b.latitude ?? b.coordinates?.lat;
      const bLng = b.longitude ?? b.coordinates?.lng;
      if (!bLat || !bLng) return false;
      return haversineKm(lat, lng, bLat, bLng) <= radiusKm;
    });

    if (!category) return withinRadius;

    // Filtrar por categoría (soporta array de categorías)
    return withinRadius.filter((b) => {
      const cats = b.categories?.length ? b.categories : [b.category];
      return cats.some((c) => c?.toLowerCase() === category.toLowerCase());
    });
  })();

  /** Categorías únicas disponibles en el radio, sin filtrar por categoría */
  const nearbyCategories = (() => {
    if (geo.status !== "ready" || !allBusinesses?.length) return [];
    const { lat, lng } = geo;
    const catSet = new Set<string>();
    allBusinesses.forEach((b) => {
      const bLat = b.latitude ?? b.coordinates?.lat;
      const bLng = b.longitude ?? b.coordinates?.lng;
      if (!bLat || !bLng) return;
      if (haversineKm(lat, lng, bLat, bLng) > radiusKm) return;
      const cats = b.categories?.length ? b.categories : [b.category];
      cats.filter(Boolean).forEach((c) => catSet.add(c!.trim()));
    });
    return Array.from(catSet).sort();
  })();

  return {
    geo,
    requestLocation,
    nearbyBusinesses,
    nearbyCategories,
    loading: busLoading || geo.status === "loading",
  };
}
