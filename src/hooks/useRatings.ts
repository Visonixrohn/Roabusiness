import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  getDeviceId,
  registerRating,
  hasRatedBusiness,
  unregisterRating,
} from "@/lib/deviceId";

/**
 * Hook para manejar calificaciones de negocios usando device_id
 * Permite a usuarios sin login calificar negocios
 */
export function useRatings(businessId: string) {
  const [average, setAverage] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [deviceRating, setDeviceRating] = useState<number | null>(null);
  const [deviceTags, setDeviceTags] = useState<string[]>([]);
  const [tagStats, setTagStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId] = useState<string>(() => getDeviceId());

  async function fetchRatings() {
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener todas las calificaciones del negocio (incluye tags)
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("calificaciones")
        .select("rating, tags")
        .eq("business_id", businessId);

      if (ratingsError) {
        setError(ratingsError.message);
        setLoading(false);
        return;
      }

      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce(
          (acc, curr) => acc + (curr.rating || 0),
          0,
        );
        setAverage(Math.round((sum / ratingsData.length) * 10) / 10);
        setTotalRatings(ratingsData.length);

        // Calcular estadísticas de tags
        const stats: Record<string, number> = {};
        ratingsData.forEach((r) => {
          if (Array.isArray(r.tags)) {
            r.tags.forEach((tag: string) => {
              stats[tag] = (stats[tag] || 0) + 1;
            });
          }
        });
        setTagStats(stats);
      } else {
        setAverage(null);
        setTotalRatings(0);
        setTagStats({});
      }

      // Obtener calificación del dispositivo actual (incluye tags)
      const { data: deviceData, error: deviceError } = await supabase
        .from("calificaciones")
        .select("rating, tags")
        .eq("business_id", businessId)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (deviceError && deviceError.code !== "PGRST116") {
        console.error(
          "Error al obtener calificación del dispositivo:",
          deviceError,
        );
      }

      setDeviceRating(deviceData?.rating ?? null);
      setDeviceTags(deviceData?.tags ?? []);
    } catch (err: any) {
      console.error("Error al cargar calificaciones:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, deviceId]);

  async function rate(rating: number, tags: string[] = []) {
    if (!businessId || rating < 1 || rating > 5) {
      setError("Calificación inválida");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar si ya existe calificación en localStorage
      const hasRated = hasRatedBusiness(businessId);

      // Upsert calificación con tags (actualiza si existe, inserta si no)
      const { error: upsertError } = await supabase
        .from("calificaciones")
        .upsert(
          {
            business_id: businessId,
            device_id: deviceId,
            rating,
            tags,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "business_id,device_id",
          },
        );

      if (upsertError) {
        setError(upsertError.message);
        setLoading(false);
        return false;
      }

      // Registrar en localStorage como capa adicional de control
      registerRating(businessId, rating, deviceId);

      // Refrescar calificaciones
      await fetchRatings();
      return true;
    } catch (err: any) {
      setError(err.message || "Error al guardar calificación");
      setLoading(false);
      return false;
    }
  }

  async function deleteRating() {
    if (!businessId) return false;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("calificaciones")
        .delete()
        .eq("business_id", businessId)
        .eq("device_id", deviceId);

      if (deleteError) {
        setError(deleteError.message);
        setLoading(false);
        return false;
      }

      // Eliminar también del registro local
      unregisterRating(businessId);

      await fetchRatings();
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar calificación");
      setLoading(false);
      return false;
    }
  }

  return {
    average,
    totalRatings,
    deviceRating,
    deviceTags,
    tagStats,
    loading,
    error,
    rate,
    deleteRating,
    deviceId,
  };
}
