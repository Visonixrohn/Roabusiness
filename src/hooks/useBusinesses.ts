import { useState, useEffect, useMemo } from "react";
import { Business, SearchFilters } from "@/types/business";
import { supabase } from "@/lib/supabaseClient";

// Utilidad para normalizar textos (sin acentos ni mayúsculas)
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

export const useBusinesses = () => {
  const [businessData, setBusinessData] = useState<{
    businesses: Business[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followersMap, setFollowersMap] = useState<Record<string, number>>({});

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    island: "",
    priceRange: "",
  });

  // Cargar negocios desde Supabase
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        // Obtener negocios desde Supabase
        const { data, error } = await supabase
          .from("businesses")
          .select(`*, followers(count)`) // Asume relación followers
          .returns<Business & { followers: { count: number }[] }[]>();
        if (error) throw error;
        // Mapear followers
        const followers: Record<string, number> = {};
        const businesses: Business[] = data.map((b: any) => {
          followers[String(b.id)] = b.followers?.[0]?.count || 0;
          // Elimina solo la propiedad followers, pero conserva id y demás campos
          const { followers: _f, ...rest } = b;
          return rest as Business;
        });
        setBusinessData({ businesses });
        setFollowersMap(followers);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  // Categorías únicas
  const categories = useMemo(() => {
    if (!businessData) return [];
    return Array.from(
      new Set(businessData.businesses.map((b) => b.category?.trim()))
    )
      .filter(Boolean)
      .sort();
  }, [businessData]);

  // Islas únicas
  const islands = useMemo(() => {
    if (!businessData) return [];
    return Array.from(
      new Set(businessData.businesses.map((b) => b.island?.trim()))
    )
      .filter(Boolean)
      .sort();
  }, [businessData]);

  // Aplicar filtros
  const filteredBusinesses = useMemo(() => {
    if (!businessData) return [];
    const q = normalizeText(filters.query);

    return businessData.businesses.filter((b) => {
      // Solo negocios públicos
      if (b.is_public === false) return false;

      const name = normalizeText(b.name);
      const desc = normalizeText(b.description || "");
      const loc = normalizeText(b.location || "");

      const matchesQuery =
        !q || name.includes(q) || desc.includes(q) || loc.includes(q);
      const matchesCategory =
        !filters.category ||
        normalizeText(b.category) === normalizeText(filters.category);
      const matchesIsland =
        !filters.island ||
        normalizeText(b.island) === normalizeText(filters.island);
      const matchesPrice =
        !filters.priceRange || b.priceRange === filters.priceRange;

      return matchesQuery && matchesCategory && matchesIsland && matchesPrice;
    });
  }, [businessData, filters]);

  // Ordenar por más seguidores y etiquetar destacados
  const mostFollowedBusinesses = useMemo(() => {
    if (!businessData) return [];
    return [...businessData.businesses]
      .sort((a, b) => (followersMap[b.id] || 0) - (followersMap[a.id] || 0))
      .map((b, idx) => ({
        ...b,
        featured: idx < 6,
        followers: followersMap[b.id] || 0,
      }));
  }, [businessData, followersMap]);

  // Destacados (top 6)
  const featuredBusinesses = useMemo(
    () => mostFollowedBusinesses.filter((b) => b.featured),
    [mostFollowedBusinesses]
  );

  // Filtros
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ query: "", category: "", island: "", priceRange: "" });
  };

  const getBusinessById = (id: string): Business | undefined => {
    return businessData?.businesses.find((b) => b.id === id);
  };

  return {
    businesses: filteredBusinesses,
    featuredBusinesses,
    mostFollowedBusinesses,
    categories,
    islands,
    filters,
    loading,
    error,
    updateFilters,
    clearFilters,
    getBusinessById,
    totalBusinesses: businessData?.businesses.length || 0,
    filteredCount: filteredBusinesses.length,
    followersMap,
  };
};
