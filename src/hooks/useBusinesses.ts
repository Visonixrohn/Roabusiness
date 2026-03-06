import { useState, useEffect, useMemo } from "react";
import { Business, SearchFilters } from "@/types/business";
import { supabase } from "@/lib/supabaseClient";
import { isSubscriptionActive } from "@/lib/subscription";

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
    departamento: "",
    municipio: "",
    colonia: "",
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
          .select(`*, followers(count)`)
          .returns<Business & { followers: { count: number }[] }[]>();

        if (error) throw error;
        // Mapear followers
        const followers: Record<string, number> = {};
        const businesses: Business[] = data.map((b: any) => {
          followers[String(b.id)] = b.followers?.[0]?.count || 0;

          const priceRange = b.price_range || b.priceRange || "";
          const coverImage = b.cover_image || b.coverImage || "";
          const google_maps_url =
            b.google_maps_url || b.contact?.google_maps_url || "";
          const latitude =
            typeof b.latitude === "number"
              ? b.latitude
              : b.coordinates?.lat || null;
          const longitude =
            typeof b.longitude === "number"
              ? b.longitude
              : b.coordinates?.lng || null;

          // Debug: verificar si viene profile_name
          if (!b.profile_name) {
            console.warn("⚠️ Negocio sin profile_name:", {
              id: b.id,
              name: b.name,
              tiene_profile_name: !!b.profile_name,
              campos_disponibles: Object.keys(b),
            });
          }

          return {
            ...b,
            profile_name: b.profile_name, // Asegurar que se incluya
            priceRange,
            coverImage,
            google_maps_url: google_maps_url || undefined,
            latitude: latitude ?? undefined,
            longitude: longitude ?? undefined,
            coordinates:
              latitude != null && longitude != null
                ? { lat: latitude, lng: longitude }
                : undefined,
          } as Business;
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

  // Categorías únicas (incluyendo soporte para arrays de categorías)
  const categories = useMemo(() => {
    if (!businessData) return [];
    const catSet = new Set<string>();
    businessData.businesses.forEach((b) => {
      if (b.categories && b.categories.length > 0) {
        b.categories.forEach((c) => c?.trim() && catSet.add(c.trim()));
      } else if (b.category?.trim()) {
        catSet.add(b.category.trim());
      }
    });
    return Array.from(catSet).sort();
  }, [businessData]);

  // Departamentos únicos (ex-islands)
  const departamentos = useMemo(() => {
    if (!businessData) return [];
    return Array.from(
      new Set(
        businessData.businesses.map((b) =>
          (b.departamento || b.island)?.trim(),
        ),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [businessData]);

  // Alias para compatibilidad con código antiguo
  const islands = departamentos;

  // Municipios únicos (todos)
  const municipios = useMemo(() => {
    if (!businessData) return [];
    return Array.from(
      new Set(
        businessData.businesses.map((b) => (b.municipio || b.location)?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [businessData]);

  // Municipios filtrados por departamento seleccionado
  const municipiosFiltrados = useMemo(() => {
    if (!businessData || !filters.departamento) return municipios;
    return Array.from(
      new Set(
        businessData.businesses
          .filter((b) => (b.departamento || b.island) === filters.departamento)
          .map((b) => (b.municipio || b.location)?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [businessData, filters.departamento, municipios]);

  // Colonias filtradas por departamento y municipio seleccionados
  const coloniasFiltradas = useMemo(() => {
    if (!businessData) return [];

    // Si no hay departamento ni municipio, mostrar todas las colonias
    if (!filters.departamento && !filters.municipio) {
      return Array.from(
        new Set(
          businessData.businesses.map((b) => b.colonia?.trim()).filter(Boolean),
        ),
      ).sort() as string[];
    }

    // Filtrar por departamento y/o municipio
    return Array.from(
      new Set(
        businessData.businesses
          .filter((b) => {
            const matchesDept =
              !filters.departamento ||
              (b.departamento || b.island) === filters.departamento;
            const matchesMuni =
              !filters.municipio ||
              (b.municipio || b.location) === filters.municipio;
            return matchesDept && matchesMuni;
          })
          .map((b) => b.colonia?.trim())
          .filter(Boolean),
      ),
    ).sort() as string[];
  }, [businessData, filters.departamento, filters.municipio]);

  // Aplicar filtros
  const filteredBusinesses = useMemo(() => {
    if (!businessData) return [];
    const q = normalizeText(filters.query);

    return businessData.businesses.filter((b) => {
      // Solo negocios públicos
      if (b.is_public === false) return false;
      if (!isSubscriptionActive(b)) return false;

      const name = normalizeText(b.name);
      const desc = normalizeText(b.description || "");
      const dept = normalizeText(b.departamento || b.island || "");
      const muni = normalizeText(b.municipio || b.location || "");
      const col = normalizeText(b.colonia || "");

      const matchesQuery =
        !q ||
        name.includes(q) ||
        desc.includes(q) ||
        dept.includes(q) ||
        muni.includes(q);
      const matchesCategory =
        !filters.category ||
        (b.categories && b.categories.length > 0
          ? b.categories.some(
              (c) => normalizeText(c) === normalizeText(filters.category),
            )
          : normalizeText(b.category) === normalizeText(filters.category));
      const matchesDepartamento =
        !filters.departamento || dept === normalizeText(filters.departamento);
      const matchesMunicipio =
        !filters.municipio || muni.includes(normalizeText(filters.municipio));
      const matchesColonia =
        !filters.colonia || col.includes(normalizeText(filters.colonia));
      const matchesPrice =
        !filters.priceRange || b.priceRange === filters.priceRange;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesDepartamento &&
        matchesMunicipio &&
        matchesColonia &&
        matchesPrice
      );
    });
  }, [businessData, filters]);

  // Ordenar por más seguidores y etiquetar destacados
  const mostFollowedBusinesses = useMemo(() => {
    if (!businessData) return [];
    return [...businessData.businesses]
      .filter((business) => business.is_public !== false)
      .filter((business) => isSubscriptionActive(business))
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
    [mostFollowedBusinesses],
  );

  const totalActiveBusinesses = useMemo(() => {
    if (!businessData) return 0;
    return businessData.businesses.filter((business) => {
      return business.is_public !== false && isSubscriptionActive(business);
    }).length;
  }, [businessData]);

  // Filtros
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => {
      // Si se cambia el departamento, resetear municipio y colonia
      if (
        "departamento" in newFilters &&
        newFilters.departamento !== prev.departamento
      ) {
        const nextMunicipio =
          "municipio" in newFilters ? (newFilters.municipio ?? "") : "";
        const nextColonia =
          "colonia" in newFilters ? (newFilters.colonia ?? "") : "";
        return {
          ...prev,
          ...newFilters,
          municipio: nextMunicipio,
          colonia: nextColonia,
        };
      }
      // Si se cambia el municipio, resetear colonia
      if (
        "municipio" in newFilters &&
        newFilters.municipio !== prev.municipio
      ) {
        const nextColonia =
          "colonia" in newFilters ? (newFilters.colonia ?? "") : "";
        return { ...prev, ...newFilters, colonia: nextColonia };
      }
      return { ...prev, ...newFilters };
    });
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      departamento: "",
      municipio: "",
      colonia: "",
      priceRange: "",
    });
  };

  const getBusinessById = (id: string): Business | undefined => {
    return businessData?.businesses.find((b) => b.id === id);
  };

  return {
    businesses: filteredBusinesses,
    allBusinesses: businessData?.businesses || [],
    featuredBusinesses,
    mostFollowedBusinesses,
    categories,
    departamentos,
    municipios,
    municipiosFiltrados,
    coloniasFiltradas,
    islands, // alias backward-compat
    filters,
    loading,
    error,
    updateFilters,
    clearFilters,
    getBusinessById,
    totalBusinesses: totalActiveBusinesses,
    filteredCount: filteredBusinesses.length,
    followersMap,
  };
};
