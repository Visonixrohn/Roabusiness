import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";

interface NegocioDestacado extends Business {
  contador_contactos: number;
  ultimo_contacto: string | null;
  average_rating: number;
  total_ratings: number;
}

export const useNegociosDestacados = (limit: number = 6) => {
  const [destacados, setDestacados] = useState<NegocioDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true);

        // Obtener negocios mejor calificados desde la vista
        // Nota: La vista ya ordena por average_rating DESC, pero agregamos order aquí también por claridad
        const { data, error } = await supabase
          .from("vista_negocios_destacados")
          .select("*")
          .order("average_rating", { ascending: false })
          .order("total_ratings", { ascending: false })
          .limit(limit);

        if (error) throw error;

        setDestacados(data || []);
        setError(null);
      } catch (err) {
        console.error("Error al cargar negocios destacados:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchDestacados();
  }, [limit]);

  return { destacados, loading, error };
};
