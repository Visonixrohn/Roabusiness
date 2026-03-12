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
import { Globe } from "lucide-react";
import businessCategories from "@/data/businessCategories";
import { PAISES_LATAM } from "@/data/countries";
import { useCountryContext } from "@/contexts/CountryContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={`rounded-[28px] border border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] ${className}`}
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

  // Aplicar el país detectado como filtro al montar la página
  useEffect(() => {
    if (detectedCountry) {
      updateFilters({ pais: detectedCountry });
    }
    // Solo al montar (no en cada cambio de detectedCountry para no pisar filtros manuales)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewMode, setViewMode] = useState<"grid" | "map" | "list">("grid");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [modalFilters, setModalFilters] = useState({
    departamento: filters.departamento || "",
    municipio: filters.municipio || "",
    colonia: filters.colonia || "",
    category: filters.category || "",
  });
  const [departamentoInput, setDepartamentoInput] = useState("");
  const [municipioInput, setMunicipioInput] = useState("");
  const [coloniaInput, setColoniaInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [inlineCategoryInput, setInlineCategoryInput] = useState("");
  const [clearQueryOnApply, setClearQueryOnApply] = useState(false);

  const openFiltersModal = () => {
    setModalFilters({
      departamento: filters.departamento || "",
      municipio: filters.municipio || "",
      colonia: filters.colonia || "",
      category: filters.category || "",
    });
    setDepartamentoInput(filters.departamento || "");
    setMunicipioInput(filters.municipio || "");
    setColoniaInput(filters.colonia || "");
    setCategoryInput(filters.category || "");
    setClearQueryOnApply(false);
    setShowFiltersModal(true);
  };

  const handleApplyModalFilters = () => {
    updateFilters({
      ...modalFilters,
      query: clearQueryOnApply ? "" : filters.query,
    });
    setShowFiltersModal(false);
    setClearQueryOnApply(false);
  };

  const handleClearModalFilters = () => {
    setModalFilters({
      departamento: "",
      municipio: "",
      colonia: "",
      category: "",
    });
    setDepartamentoInput("");
    setMunicipioInput("");
    setColoniaInput("");
    setCategoryInput("");
    setClearQueryOnApply(false);
  };

  const priceRanges = [
    { value: "$", label: "Económico ($)" },
    { value: "$$", label: "Moderado ($$)" },
    { value: "$$$", label: "Caro ($$$)" },
    { value: "$$$$", label: "Muy caro ($$$$)" },
  ];

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.departamento ||
    filters.municipio ||
    filters.colonia ||
    filters.priceRange ||
    filters.pais;

  const municipiosModalFiltrados = useMemo(() => {
    if (!modalFilters.departamento) return municipios;

    return Array.from(
      new Set(
        allBusinesses
          .filter(
            (business) =>
              (business.departamento || business.island) ===
              modalFilters.departamento,
          )
          .map((business) => (business.municipio || business.location)?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [allBusinesses, municipios, modalFilters.departamento]);

  const coloniasModalFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        allBusinesses
          .filter((business) => {
            const sameDepartamento =
              !modalFilters.departamento ||
              (business.departamento || business.island) ===
                modalFilters.departamento;

            const sameMunicipio =
              !modalFilters.municipio ||
              (business.municipio || business.location) ===
                modalFilters.municipio;

            return sameDepartamento && sameMunicipio;
          })
          .map((business) => business.colonia?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [allBusinesses, modalFilters.departamento, modalFilters.municipio]);

  const categoriasModalFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        allBusinesses
          .filter((business) => {
            const sameDepartamento =
              !modalFilters.departamento ||
              (business.departamento || business.island) ===
                modalFilters.departamento;

            const sameMunicipio =
              !modalFilters.municipio ||
              (business.municipio || business.location) ===
                modalFilters.municipio;

            const sameColonia =
              !modalFilters.colonia ||
              (business.colonia || "") === modalFilters.colonia;

            return sameDepartamento && sameMunicipio && sameColonia;
          })
          .map((business) => business.category?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [
    allBusinesses,
    modalFilters.departamento,
    modalFilters.municipio,
    modalFilters.colonia,
  ]);

  const categoriasInline = useMemo(() => {
    const source = categories.length > 0 ? categories : businessCategories;
    return Array.from(new Set(source.map((category) => category?.trim())))
      .filter(Boolean)
      .sort() as string[];
  }, [categories]);

  if (businessError) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_25%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <X className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Error al cargar el directorio
            </h2>
            <p className="text-slate-600">{businessError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-2xl bg-slate-900 hover:bg-slate-800"
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
      className="gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700"
    >
      <span className="font-medium">{label}:</span> {value}
      <button onClick={onClear} className="hover:text-red-600">
        ×
      </button>
    </Badge>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_25%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
      <Header />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6 md:py-10 space-y-8">
        <SectionCard className="overflow-hidden">
          <div className="relative px-6 py-8 md:px-10 md:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_26%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_24%)]" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  Explorar negocios 
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Directorio de negocios
                  <span className="block bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    local, útil y fácil de explorar
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base md:text-lg leading-8 text-slate-600">
                  Encuentra restaurantes, tiendas, hoteles, servicios y mucho
                  más. Busca por nombre, categoría o ubicación y descubre
                  negocios en distintas zonas.
                </p>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Resultados</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {filteredCount}
                    </p>
                    <p className="text-sm text-slate-500">negocios visibles</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Total publicado</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {totalBusinesses}
                    </p>
                    <p className="text-sm text-slate-500">en el directorio</p>
                  </div>

                  
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                  <BannerCarousel />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="p-5 md:p-6 overflow-visible">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-600 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Búsqueda inteligente</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Encuentra el negocio ideal
              </h2>
              <p className="mt-2 text-slate-600">
                Busca por nombre o filtra por categoría, departamento, municipio
                y sector.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    : "rounded-2xl"
                }
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>

              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    : "rounded-2xl"
                }
              >
                <ListFilter className="h-4 w-4 mr-2" />
                Lista
              </Button>

              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                onClick={() => setViewMode("map")}
                className={
                  viewMode === "map"
                    ? "rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                    : "rounded-2xl"
                }
              >
                <MapPin className="h-4 w-4 mr-2" />
                Mapa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.6fr_0.6fr_auto] gap-4 items-end overflow-visible">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar negocios, restaurantes, hoteles, servicios..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="h-12 rounded-2xl border-slate-200 pl-11 text-base shadow-sm"
              />
            </div>

            <div className="relative">
              <Combobox
                value={filters.category}
                onInputChange={setInlineCategoryInput}
                onChange={(value) => {
                  updateFilters({ category: value });
                  setInlineCategoryInput(value);
                }}
                options={categoriasInline.filter((category) =>
                  category
                    .toLowerCase()
                    .includes(inlineCategoryInput.toLowerCase()),
                )}
                placeholder="Selecciona una categoría"
                inputValue={inlineCategoryInput || filters.category}
                clearable
              />
            </div>

            {/* Selector de país */}
            <div className="relative flex items-center gap-1.5">
              <Globe className="absolute left-3 h-4 w-4 text-teal-500 pointer-events-none z-10" />
              <select
                value={filters.pais || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateFilters({ pais: val });
                  if (val) setManualCountry(val);
                }}
                className="w-full h-12 pl-9 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none cursor-pointer"
              >
                <option value="">Todos los países</option>
                {PAISES_LATAM.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <svg className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <Button
              variant="outline"
              onClick={openFiltersModal}
              className="h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros {hasActiveFilters ? "activos" : ""}
            </Button>
          </div>

          {hasActiveFilters && (
            <div className="mt-5 flex flex-wrap gap-2">
              {filters.query &&
                renderActiveFilterBadge("Búsqueda", `"${filters.query}"`, () =>
                  updateFilters({ query: "" }),
                )}

              {filters.departamento &&
                renderActiveFilterBadge("Departamento", filters.departamento, () =>
                  updateFilters({ departamento: "" }),
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

              {filters.priceRange &&
                renderActiveFilterBadge(
                  "Precio",
                  priceRanges.find((p) => p.value === filters.priceRange)?.label ||
                    filters.priceRange,
                  () => updateFilters({ priceRange: "" }),
                )}

              {filters.pais &&
                renderActiveFilterBadge("País", filters.pais, () =>
                  updateFilters({ pais: "" }),
                )}

              <Button
                variant="ghost"
                onClick={clearFilters}
                className="rounded-full text-slate-600 hover:text-red-600"
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </SectionCard>

        <Dialog open={showFiltersModal} onOpenChange={setShowFiltersModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-[28px] border-0 shadow-2xl">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
              <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Filtrar resultados
              </DialogTitle>
              <p className="text-sm text-slate-500">
                Refina la búsqueda por ubicación y categoría.
              </p>
            </DialogHeader>

            <div className="px-6 py-5 space-y-4 bg-slate-50/70 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">
                    Departamento
                  </p>
                  <Combobox
                    value={modalFilters.departamento}
                    onInputChange={setDepartamentoInput}
                    onChange={(value) => {
                      setModalFilters((prev) => ({
                        ...prev,
                        departamento: value,
                        municipio: "",
                        colonia: "",
                        category: "",
                      }));
                      setDepartamentoInput(value);
                      setMunicipioInput("");
                      setColoniaInput("");
                      setCategoryInput("");
                      setClearQueryOnApply(true);
                    }}
                    options={departamentos.filter((departamento) =>
                      departamento
                        .toLowerCase()
                        .includes(departamentoInput.toLowerCase()),
                    )}
                    placeholder="Departamento"
                    inputValue={departamentoInput || modalFilters.departamento}
                    clearable
                  />
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">Municipio</p>
                  <Combobox
                    value={modalFilters.municipio}
                    onInputChange={setMunicipioInput}
                    onChange={(value) => {
                      setModalFilters((prev) => ({
                        ...prev,
                        municipio: value,
                        colonia: "",
                        category: "",
                      }));
                      setMunicipioInput(value);
                      setColoniaInput("");
                      setCategoryInput("");
                    }}
                    options={municipiosModalFiltrados.filter((municipio) =>
                      municipio
                        .toLowerCase()
                        .includes(municipioInput.toLowerCase()),
                    )}
                    placeholder={
                      modalFilters.departamento
                        ? "Municipio"
                        : "Primero selecciona departamento"
                    }
                    inputValue={municipioInput || modalFilters.municipio}
                    clearable
                    disabled={!modalFilters.departamento}
                  />
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">
                    Colonia / Sector
                  </p>
                  <Combobox
                    value={modalFilters.colonia}
                    onInputChange={setColoniaInput}
                    onChange={(value) => {
                      setModalFilters((prev) => ({
                        ...prev,
                        colonia: value,
                        category: "",
                      }));
                      setColoniaInput(value);
                      setCategoryInput("");
                    }}
                    options={coloniasModalFiltradas.filter((colonia) =>
                      colonia
                        .toLowerCase()
                        .includes(coloniaInput.toLowerCase()),
                    )}
                    placeholder={
                      modalFilters.departamento || modalFilters.municipio
                        ? "Colonia / Sector"
                        : "Primero selecciona ubicación"
                    }
                    inputValue={coloniaInput || modalFilters.colonia}
                    clearable
                    disabled={
                      !modalFilters.departamento && !modalFilters.municipio
                    }
                  />
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-700">Categoría</p>
                  <Combobox
                    value={modalFilters.category}
                    onInputChange={setCategoryInput}
                    onChange={(value) => {
                      setModalFilters((prev) => ({
                        ...prev,
                        category: value,
                      }));
                      setCategoryInput(value);
                    }}
                    options={categoriasModalFiltradas.filter((category) =>
                      category
                        .toLowerCase()
                        .includes(categoryInput.toLowerCase()),
                    )}
                    placeholder="Categoría"
                    inputValue={categoryInput || modalFilters.category}
                    clearable
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-white flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={handleClearModalFilters}
                className="rounded-2xl text-red-600 border-red-200 hover:bg-red-50"
              >
                Limpiar
              </Button>

              <div className="flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowFiltersModal(false)}
                  className="rounded-2xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleApplyModalFilters}
                  className="rounded-2xl bg-slate-900 hover:bg-slate-800"
                >
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {filteredCount} resultados encontrados
            </h3>
            <p className="text-slate-600 mt-1">
              Explora negocios locales por categoría y ubicación.
            </p>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        <Tabs defaultValue="businesses" className="space-y-0">
          <TabsContent value="businesses" className="mt-0">
            {loadingBusinesses ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5 animate-pulse"
                  >
                    <div className="h-44 bg-slate-200 rounded-2xl mb-4" />
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
                    <div className="h-3 bg-slate-200 rounded mb-1" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredCount === 0 ? (
              <SectionCard className="p-10 md:p-14">
                <div className="max-w-md mx-auto text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <MapPin className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                    No se encontraron negocios
                  </h3>
                  <p className="text-slate-600 mb-5">
                    Intenta ajustar tu búsqueda o cambiar los filtros para ver
                    más resultados.
                  </p>
                  <Button
                    onClick={clearFilters}
                    className="rounded-2xl bg-slate-900 hover:bg-slate-800"
                  >
                    Limpiar todos los filtros
                  </Button>
                </div>
              </SectionCard>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : viewMode === "list" ? (
              <div className="flex flex-col gap-4">
                {businesses.map((business) => (
                  <SectionCard
                    key={business.id}
                    className="p-4 md:p-5 transition-shadow hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold tracking-tight text-slate-900">
                            {business.name}
                          </h3>
                          {business.category && (
                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
                              {business.category}
                            </Badge>
                          )}
                        </div>

                        <p className="text-slate-600 mb-1">
                          {business.municipio || business.location}
                          {business.departamento
                            ? ` • ${business.departamento}`
                            : business.island
                              ? ` • ${business.island}`
                              : ""}
                        </p>

                        {business.colonia && (
                          <p className="text-sm text-slate-500 mb-2">
                            Sector: {business.colonia}
                          </p>
                        )}

                        <p className="text-sm leading-6 text-slate-600 line-clamp-2">
                          {business.description}
                        </p>
                      </div>

                      <Button
                        asChild
                        className="mt-4 md:mt-0 rounded-2xl bg-slate-900 hover:bg-slate-800"
                      >
                        <a href={`/negocio/@${business.profile_name || business.id}`}>
                          Ver perfil
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </SectionCard>
                ))}
              </div>
            ) : (
              <SectionCard className="overflow-hidden p-2">
                <div className="overflow-hidden rounded-[22px]">
                  <MapView businesses={businesses} />
                </div>
              </SectionCard>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DirectoryPage;