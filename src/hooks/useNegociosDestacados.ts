import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";

interface NegocioDestacado {
  business_id: string;
  contador_contactos: number;
  ultimo_contacto: string | null;
}

export const useNegociosDestacados = (limit: number = 6) => {
  const [destacados, setDestacados] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true);

        // Obtener negocios más contactados desde la vista
        const { data, error } = await supabase
          .from("vista_negocios_destacados")
          .select("*")
          .order("contador_contactos", { ascending: false })
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
