import { useState, useCallback } from "react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { haversineKm } from "@/utils/geoDistance";
import { Business } from "@/types/business";
import { Capacitor } from "@capacitor/core";
import { Geolocation as CapGeolocation } from "@capacitor/geolocation";

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

    const onSuccess = (lat: number, lng: number) => {
      setGeo({ status: "ready", lat, lng });
    };

    const onError = (code: number, message: string) => {
      // code 1 = PERMISSION_DENIED en la spec web
      if (code === 1) {
        setGeo({ status: "denied" });
      } else {
        setGeo({ status: "error", message });
      }
    };

    // En plataforma nativa (Capacitor): usar plugin nativo para pedir permisos
    if (Capacitor.isNativePlatform()) {
      (async () => {
        try {
          // Verificar estado actual de permisos
          let permStatus = await CapGeolocation.checkPermissions();

          // Si no se ha pedido, solicitar
          if (
            permStatus.location === "prompt" ||
            permStatus.location === "prompt-with-rationale"
          ) {
            permStatus = await CapGeolocation.requestPermissions({
              permissions: ["location"],
            });
          }

          // Si fue denegado explícitamente
          if (permStatus.location === "denied") {
            setGeo({ status: "denied" });
            return;
          }

          // Obtener posición con plugin nativo
          const position = await CapGeolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          });

          onSuccess(position.coords.latitude, position.coords.longitude);
        } catch (err: any) {
          // Manejar errores del plugin nativo
          const msg = err?.message || "Error obteniendo ubicación";
          if (
            msg.toLowerCase().includes("denied") ||
            msg.toLowerCase().includes("permission")
          ) {
            setGeo({ status: "denied" });
          } else {
            onError(2, msg);
          }
        }
      })();
      return;
    }

    // En web/PWA: usar navigator.geolocation con reintentos
    if (!navigator.geolocation) {
      setGeo({
        status: "error",
        message: "Tu navegador no soporta geolocalización.",
      });
      return;
    }

    let retries = 0;
    const maxRetries = 2;

    const attemptLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSuccess(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          // En Android WebView, el primer intento a veces falla con PERMISSION_DENIED
          // aunque el permiso se acaba de conceder. Reintentamos.
          if (err.code === err.PERMISSION_DENIED && retries < maxRetries) {
            retries++;
            setTimeout(attemptLocation, 500);
            return;
          }
          onError(err.code, err.message);
        },
        { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false },
      );
    };

    attemptLocation();
  }, [geo.status]);

  /** Todos los negocios dentro del radio */
  const nearbyBusinesses = (() => {
    if (geo.status !== "ready" || !allBusinesses?.length) return [];

    const { lat, lng } = geo;

    const withinRadius = allBusinesses
      .map((b) => {
        const bLat = b.latitude ?? b.coordinates?.lat;
        const bLng = b.longitude ?? b.coordinates?.lng;
        if (!bLat || !bLng) return null;
        const dist = haversineKm(lat, lng, bLat, bLng);
        if (dist > radiusKm) return null;
        return { ...b, _distance: dist };
      })
      .filter(Boolean) as (Business & { _distance: number })[];

    // Ordenar por distancia ascendente
    withinRadius.sort((a, b) => a._distance - b._distance);

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
