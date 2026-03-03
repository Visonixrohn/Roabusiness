import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Grid,
  Map,
  SlidersHorizontal,
  Layout,
  ListFilter,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import businessCategories from "@/data/businessCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Nota: `useRecentPosts` eliminado para simplificar la página de directorio
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
    { value: "$$$$", label: "Muy Caro ($$$$)" },
  ];

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.departamento ||
    filters.municipio ||
    filters.colonia ||
    filters.priceRange;

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

  if (businessError) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar
            </h2>
            <p className="text-gray-600">{businessError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <BannerCarousel />
        {/* Header del directorio */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsContent value="businesses">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Directorio de Negocios
                  </h1>
                </div>
                <div className="flex gap-2 mt-4 lg:mt-0">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid" ? "bg-blue-600 text-white" : ""
                    }
                  >
                    <Grid className="h-4 w-4 mr-1" /> Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list" ? "bg-blue-600 text-white" : ""
                    }
                  >
                    <ListFilter className="h-4 w-4 mr-1" /> Lista
                  </Button>
                </div>
              </div>

              {/* Búsqueda y filtros */}
              <div className="space-y-4">
                {/* Búsqueda principal */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar negocios, restaurantes, hoteles..."
                    value={filters.query}
                    onChange={(e) => updateFilters({ query: e.target.value })}
                    className="pl-10 py-3 text-base"
                  />
                </div>

                {/* Botón de filtros (móvil y desktop) */}
                <div>
                  <Button
                    variant="outline"
                    onClick={openFiltersModal}
                    className="w-full lg:w-auto"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros {hasActiveFilters && "(activos)"}
                  </Button>
                </div>

                <Dialog
                  open={showFiltersModal}
                  onOpenChange={setShowFiltersModal}
                >
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
                      <DialogTitle className="text-xl font-bold text-gray-900">
                        Filtrar resultados
                      </DialogTitle>
                      <p className="text-sm text-gray-500">
                        Selecciona criterios y pulsa "Filtrar" para aplicar.
                      </p>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-4 bg-gray-50/60">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-sm font-medium text-gray-700">
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
                            inputValue={
                              departamentoInput || modalFilters.departamento
                            }
                            clearable
                          />
                        </div>

                        <div className="space-y-2 bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-sm font-medium text-gray-700">
                            Municipio
                          </p>
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
                            options={municipiosModalFiltrados.filter(
                              (municipio) =>
                                municipio
                                  .toLowerCase()
                                  .includes(municipioInput.toLowerCase()),
                            )}
                            placeholder={
                              modalFilters.departamento
                                ? "Municipio"
                                : "Primero selecciona departamento"
                            }
                            inputValue={
                              municipioInput || modalFilters.municipio
                            }
                            clearable
                            disabled={!modalFilters.departamento}
                          />
                        </div>

                        <div className="space-y-2 bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-sm font-medium text-gray-700">
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
                              modalFilters.departamento ||
                              modalFilters.municipio
                                ? "Colonia / Sector"
                                : "Primero selecciona ubicación"
                            }
                            inputValue={coloniaInput || modalFilters.colonia}
                            clearable
                            disabled={
                              !modalFilters.departamento &&
                              !modalFilters.municipio
                            }
                          />
                        </div>

                        <div className="space-y-2 bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-sm font-medium text-gray-700">
                            Categoría
                          </p>
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
                            options={categoriasModalFiltradas.filter(
                              (category) =>
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
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Limpiar
                      </Button>
                      <div className="flex gap-2 sm:justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowFiltersModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleApplyModalFilters}>
                          Filtrar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Filtros activos */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {filters.query && (
                      <Badge variant="secondary" className="gap-1">
                        Búsqueda: "{filters.query}"
                        <button
                          onClick={() => updateFilters({ query: "" })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.departamento && (
                      <Badge variant="secondary" className="gap-1">
                        Departamento: {filters.departamento}
                        <button
                          onClick={() => updateFilters({ departamento: "" })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.municipio && (
                      <Badge variant="secondary" className="gap-1">
                        Municipio: {filters.municipio}
                        <button
                          onClick={() => updateFilters({ municipio: "" })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.colonia && (
                      <Badge variant="secondary" className="gap-1">
                        Colonia: {filters.colonia}
                        <button
                          onClick={() => updateFilters({ colonia: "" })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="secondary" className="gap-1">
                        Categoría: {filters.category}
                        <button
                          onClick={() => updateFilters({ category: "" })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.priceRange && (
                      <Badge variant="secondary" className="gap-1">
                        Precio:{" "}
                        {
                          priceRanges.find(
                            (p) => p.value === filters.priceRange,
                          )?.label
                        }
                        <button
                          onClick={() => updateFilters({ priceRange: "" })}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Separator className="my-4" />
            </div>

            {/* Contenido principal */}
            {loadingBusinesses ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {businesses.map((business) => (
                      <BusinessCard key={business.id} business={business} />
                    ))}
                  </div>
                ) : viewMode === "list" ? (
                  <div className="flex flex-col gap-4">
                    {businesses.map((business) => (
                      <div
                        key={business.id}
                        className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:gap-6"
                      >
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-800 mb-1">
                            {business.name}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            {business.category} • {business.island}
                          </p>
                          <p className="text-gray-500 text-sm mb-2">
                            {business.location}
                          </p>
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {business.description}
                          </p>
                        </div>
                        <Button asChild className="mt-2 md:mt-0">
                          <a
                            href={`/negocio/@${business.profile_name || business.id}`}
                          >
                            Ver Perfil
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <MapView businesses={businesses} />
                  </div>
                )}

                {filteredCount === 0 && !loadingBusinesses && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No se encontraron negocios
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Intenta ajustar tus filtros o realizar una búsqueda
                        diferente.
                      </p>
                      <Button onClick={clearFilters}>
                        Limpiar todos los filtros
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Se eliminó la pestaña de Publicaciones y su contenido */}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DirectoryPage;
