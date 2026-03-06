import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import businessCategories from "@/data/businessCategories";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>(businessCategories);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Fusionar con la lista estática para no perder nada
        const dbNames = data.map((c: Pick<Category, "name">) => c.name);
        const merged = Array.from(new Set([...dbNames, ...businessCategories])).sort(
          (a, b) => a.localeCompare(b, "es"),
        );
        setCategories(merged);
      }
      // Si la tabla aún no existe o está vacía, usar la lista estática (ya inicializada)
    } catch {
      // La tabla puede no existir todavía — usar lista estática sin mostrar error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /** Crea una nueva categoría en Supabase y la agrega al estado local */
  const createCategory = useCallback(
    async (name: string): Promise<boolean> => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      // Evitar duplicados locales
      if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        return true; // Ya existe, tratar como éxito
      }

      setCreating(true);
      try {
        const { error } = await supabase
          .from("categories")
          .insert({ name: trimmed });

        if (error) {
          // Si es duplicado a nivel DB también lo consideramos éxito
          if (error.code === "23505") {
            setCategories((prev) =>
              Array.from(new Set([...prev, trimmed])).sort((a, b) =>
                a.localeCompare(b, "es"),
              ),
            );
            return true;
          }
          throw error;
        }

        setCategories((prev) =>
          Array.from(new Set([...prev, trimmed])).sort((a, b) =>
            a.localeCompare(b, "es"),
          ),
        );
        toast.success(`Categoría "${trimmed}" creada`);
        return true;
      } catch (err: any) {
        toast.error("Error al crear categoría: " + (err?.message || err));
        return false;
      } finally {
        setCreating(false);
      }
    },
    [categories],
  );

  /** Elimina una categoría de Supabase */
  const deleteCategory = useCallback(async (name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("name", name);

      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c !== name));
      toast.success(`Categoría "${name}" eliminada`);
      return true;
    } catch (err: any) {
      toast.error("Error al eliminar categoría: " + (err?.message || err));
      return false;
    }
  }, []);

  return { categories, loading, creating, fetchCategories, createCategory, deleteCategory };
};
