import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";
import { isSubscriptionActive } from "@/lib/subscription";

interface NegocioDestacado extends Business {
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

        // 1) Traer todos los negocios públicos con suscripción activa
        const { data: bizData, error: bizError } = await supabase
          .from("businesses")
          .select("*")
          .eq("is_public", true)
          .limit(200);

        if (bizError) throw bizError;

        let lista: any[] = (bizData || []).filter((b) => isSubscriptionActive(b));

        // 2) Filtrar SIEMPRE por país cuando se proporciona
        if (pais) {
          lista = lista.filter((b) => (b.pais || "Honduras") === pais);
        }

        // 3) Traer calificaciones para calcular rating real
        const ids = lista.map((b) => b.id);
        let calMap: Record<string, { total: number; sum: number }> = {};

        if (ids.length > 0) {
          const { data: calData } = await supabase
            .from("calificaciones")
            .select("business_id, rating")
            .in("business_id", ids);

          (calData || []).forEach((c: any) => {
            if (!calMap[c.business_id]) calMap[c.business_id] = { total: 0, sum: 0 };
            calMap[c.business_id].total += 1;
            calMap[c.business_id].sum += c.rating || 0;
          });
        }

        // 4) Ordenar: más valoraciones primero, luego mejor rating
        const resultado = lista
          .map((b) => {
            const cal = calMap[b.id] || { total: 0, sum: 0 };
            return {
              ...b,
              total_ratings: cal.total,
              average_rating: cal.total > 0 ? Math.round((cal.sum / cal.total) * 10) / 10 : 0,
            };
          })
          .sort((a, b) => {
            if (b.total_ratings !== a.total_ratings) return b.total_ratings - a.total_ratings;
            return b.average_rating - a.average_rating;
          })
          .slice(0, limit) as NegocioDestacado[];

        setDestacados(resultado);
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
