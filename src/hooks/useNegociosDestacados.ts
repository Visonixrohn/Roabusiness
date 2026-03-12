import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";
import { isSubscriptionActive } from "@/lib/subscription";

interface NegocioDestacado extends Business {
  contador_contactos: number;
  ultimo_contacto: string | null;
  average_rating: number;
  total_ratings: number;
}

export const useNegociosDestacados = (limit: number = 6, pais?: string) => {
  const [destacados, setDestacados] = useState<NegocioDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true);

        // Traemos más registros para poder filtrar por suscripción activa en cliente
        let query = supabase
          .from("vista_negocios_destacados")
          .select("*")
          .eq("is_public", true)
          .order("total_ratings", { ascending: false })
          .order("average_rating", { ascending: false })
          .limit(limit * 8);

        // Filtrar por país si se proporciona
        if (pais) {
          query = query.eq("pais", pais);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filtrar por suscripción activa y ordenar:
        // 1. Mayor número de valoraciones (total_ratings DESC)
        // 2. Mayor estrellas (average_rating DESC)
        const filtrados = (data || ([] as NegocioDestacado[]))
          .filter((b) => isSubscriptionActive(b))
          .sort((a, b) => {
            const totalRatingsDiff =
              (b.total_ratings || 0) - (a.total_ratings || 0);
            if (totalRatingsDiff !== 0) return totalRatingsDiff;
            return (b.average_rating || 0) - (a.average_rating || 0);
          })
          .slice(0, limit);

        setDestacados(filtrados);
        setError(null);
      } catch (err) {
        console.error("Error al cargar negocios destacados:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchDestacados();
  }, [limit, pais]);

  return { destacados, loading, error };
};
