import { useMemo, useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Grid,
  SlidersHorizontal,
  ListFilter,
  Sparkles,
  ChevronRight,
  X,
  Globe,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import MapView from "@/components/MapView";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BannerCarousel from "@/components/BannerCarousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import businessCategories from "@/data/businessCategories";
import { PAISES_LATAM } from "@/data/countries";
import { useCountryContext } from "@/contexts/CountryContext";
import FiltersModal, { type ModalFilters } from "@/components/FiltersModal";
import { cn } from "@/lib/utils";

// ========== UI BASE ==========
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-slate-200/60 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300",
        className,
      )}
    >
      {children}
    </section>
  );
};

const DirectoryPage = () => {
  const {
    businesses,
    allBusinesses,
    categories,
    departamentos,
    municipios,
    filters,
    loading: loadingBusinesses,
    error: businessError,
    updateFilters,
    clearFilters,
    filteredCount,
    totalBusinesses,
  } = useBusinesses();

  const { country: detectedCountry, setManualCountry } = useCountryContext();

  useEffect(() => {
    if (detectedCountry) {
      updateFilters({ pais: detectedCountry });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewMode, setViewMode] = useState<"grid" | "map" | "list">("grid");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState("");

  const currentModalFilters: ModalFilters = {
    departamento: filters.departamento || "",
    municipio: filters.municipio || "",
    colonia: filters.colonia || "",
    category: filters.category || "",
  };

  const handleApplyModalFilters = (applied: ModalFilters) => {
    updateFilters({ ...applied });
  };

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.departamento ||
    filters.municipio ||
    filters.colonia ||
    filters.priceRange ||
    filters.pais;

  const categoriasInline = useMemo(() => {
    const source = categories.length > 0 ? categories : businessCategories;
    return Array.from(new Set(source.map((c) => c?.trim())))
      .filter(Boolean)
      .sort() as string[];
  }, [categories]);

  if (businessError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex h-[60vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-red-50 border border-red-100">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
              Error al cargar
            </h2>
            <p className="text-slate-500 font-medium">{businessError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 px-8 h-12 font-bold shadow-sm"
            >
              Reintentar
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderActiveFilterBadge = (
    label: string,
    value: string,
    onClear: () => void,
  ) => (
    <Badge
      variant="secondary"
      className="gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 shadow-sm transition-all hover:bg-slate-50"
    >
      <span className="font-bold text-slate-500">{label}:</span>{" "}
      <span className="font-semibold text-slate-900">{value}</span>
      <button
        onClick={onClear}
        className="ml-1 rounded-full p-0.5 hover:bg-slate-200 hover:text-red-600 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-[32px] bg-slate-900 border border-slate-800 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.2),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_40%)] pointer-events-none" />

          <div className="relative p-6 sm:p-10 md:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md mb-6">
                Explorar negocios
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Directorio local, <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  fácil de explorar
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base md:text-lg leading-relaxed text-slate-300 font-medium">
                Encuentra restaurantes, tiendas, hoteles, servicios y mucho más.
                Busca por nombre, categoría o ubicación.
              </p>

              <div className="mt-8 flex gap-4">
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 backdrop-blur-md flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Visibles
                  </p>
                  <p className="text-3xl font-extrabold text-white">
                    {filteredCount}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 backdrop-blur-md flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Directorio
                  </p>
                  <p className="text-3xl font-extrabold text-white">
                    {totalBusinesses}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-[24px] overflow-hidden border border-white/10 shadow-2xl lg:rotate-1 hover:rotate-0 transition-transform duration-500">
              <BannerCarousel />
            </div>
          </div>
        </section>

        {/* BARRA DE FILTROS & VISTAS */}
        <SectionCard className="p-4 sm:p-6 overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Busca lo que necesitas
              </h2>
            </div>

            {/* Controles Segmentados de Vista */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 w-full lg:w-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Grid className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <ListFilter className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  viewMode === "map"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <MapPin className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Mapa</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-center overflow-visible">
            {/* Buscador */}
            <div className="relative group z-10">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por nombre, rubro..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="h-14 rounded-[20px] border-slate-200/60 bg-slate-50 pl-12 text-[15px] font-medium text-slate-900 shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Categoría */}
            <div className="relative z-20">
              <Combobox
                value={filters.category}
                onInputChange={setInlineCategoryInput}
                onChange={(value) => {
                  updateFilters({ category: value });
                  setInlineCategoryInput(value);
                }}
                options={categoriasInline.filter((c) =>
                  c.toLowerCase().includes(inlineCategoryInput.toLowerCase()),
                )}
                placeholder="Categoría"
                inputValue={inlineCategoryInput || filters.category}
                clearable
              />
            </div>

            {/* Selector de País */}
            <div className="relative flex items-center group z-10">
              <Globe className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
              <select
                value={filters.pais || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateFilters({ pais: val });
                  if (val) setManualCountry(val);
                }}
                className="w-full h-14 pl-12 pr-10 rounded-[20px] border border-slate-200/60 bg-slate-50 text-[15px] font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none cursor-pointer transition-all"
              >
                <option value="">Todos los países</option>
                {PAISES_LATAM.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
            </div>

            {/* Botón Más Filtros */}
            <Button
              onClick={() => setShowFiltersModal(true)}
              className="h-14 rounded-[20px] border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all active:scale-95 px-6 z-10"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2 text-emerald-500" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Tags de Filtros Activos */}
          {hasActiveFilters && (
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
              {filters.query &&
                renderActiveFilterBadge("Búsqueda", `"${filters.query}"`, () =>
                  updateFilters({ query: "" }),
                )}
              {filters.departamento &&
                renderActiveFilterBadge(
                  "Departamento",
                  filters.departamento,
                  () => updateFilters({ departamento: "" }),
                )}
              {filters.municipio &&
                renderActiveFilterBadge("Municipio", filters.municipio, () =>
                  updateFilters({ municipio: "" }),
                )}
              {filters.colonia &&
                renderActiveFilterBadge("Sector", filters.colonia, () =>
                  updateFilters({ colonia: "" }),
                )}
              {filters.category &&
                renderActiveFilterBadge("Categoría", filters.category, () =>
                  updateFilters({ category: "" }),
                )}
              {filters.pais &&
                renderActiveFilterBadge("País", filters.pais, () =>
                  updateFilters({ pais: "" }),
                )}

              <button
                onClick={clearFilters}
                className="text-[13px] font-bold text-slate-400 hover:text-red-600 ml-2 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </SectionCard>

        <FiltersModal
          open={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          onApply={handleApplyModalFilters}
          allBusinesses={allBusinesses}
          departamentos={departamentos}
          municipios={municipios}
          initialFilters={currentModalFilters}
        />

        {/* CONTENEDOR DE RESULTADOS */}
        <Tabs defaultValue="businesses" className="space-y-0">
          <TabsContent value="businesses" className="mt-0">
            {loadingBusinesses ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[24px] border border-slate-200/60 bg-white p-3 md:p-5 shadow-sm animate-pulse"
                  >
                    <div className="h-28 md:h-48 bg-slate-100 rounded-2xl mb-4 md:mb-5" />
                    <div className="h-4 md:h-5 bg-slate-100 rounded-md w-3/4 mb-3" />
                    <div className="h-3 md:h-4 bg-slate-100 rounded-md w-1/2 mb-4" />
                    <div className="h-8 md:h-10 bg-slate-100 rounded-xl w-full mt-auto" />
                  </div>
                ))}
              </div>
            ) : filteredCount === 0 ? (
              <SectionCard className="p-12 md:p-20 text-center flex flex-col items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-100 mb-6">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
                  No hay negocios que coincidan con tus filtros actuales.
                  Intenta usar términos más generales o limpia los filtros.
                </p>
                <Button
                  onClick={clearFilters}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 font-bold shadow-sm"
                >
                  Limpiar todos los filtros
                </Button>
              </SectionCard>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="h-full transform transition-transform duration-300 hover:-translate-y-1"
                  >
                    <BusinessCard business={business} />
                  </div>
                ))}
              </div>
            ) : viewMode === "list" ? (
              <div className="flex flex-col gap-4">
                {businesses.map((business) => (
                  <a
                    key={business.id}
                    href={`/negocio/@${business.profile_name || business.id}`}
                    className="group block rounded-[24px] border border-slate-200/60 bg-white p-4 md:p-5 shadow-sm hover:shadow-[0_12px_30px_-10px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-6">
                      {/* Thumbnail Image */}
                      {(business.logo || business.coverImage) && (
                        <div className="h-24 w-24 md:h-28 md:w-28 shrink-0 overflow-hidden rounded-[16px] bg-slate-100 border border-slate-200/60 group-hover:shadow-md transition-shadow">
                          <img
                            src={business.logo || business.coverImage}
                            alt={business.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                            {business.name}
                          </h3>
                          {business.category && (
                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2.5 py-0.5">
                              {business.category}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {business.municipio || business.location}
                            {business.departamento || business.island
                              ? `, ${business.departamento || business.island}`
                              : ""}
                          </span>
                        </div>

                        <p className="text-[15px] leading-relaxed text-slate-500 line-clamp-2">
                          {business.description ||
                            "Sin descripción disponible."}
                        </p>
                      </div>

                      <div className="hidden md:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <SectionCard className="p-2 overflow-hidden h-[600px] border-slate-200/60 shadow-sm">
                <div className="h-full w-full rounded-[20px] overflow-hidden bg-slate-100">
                  <MapView businesses={businesses} />
                </div>
              </SectionCard>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default DirectoryPage;
