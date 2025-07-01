import { useState } from "react";
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
import PostCard from "@/components/PostCard";
import MapView from "@/components/MapView";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useRecentPosts } from "@/hooks/useRecentPosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import businessCategories from "@/data/businessCategories";

const DirectoryPage = () => {
  const {
    businesses,
    categories,
    islands,
    filters,
    loading: loadingBusinesses,
    error: businessError,
    updateFilters,
    clearFilters,
    filteredCount,
    totalBusinesses,
  } = useBusinesses();

  const { posts, loading: loadingPosts, error: postsError } = useRecentPosts();
  const [viewMode, setViewMode] = useState<"grid" | "map" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [islandInput, setIslandInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  const priceRanges = [
    { value: "$", label: "Económico ($)" },
    { value: "$$", label: "Moderado ($$)" },
    { value: "$$$", label: "Caro ($$$)" },
    { value: "$$$$", label: "Muy Caro ($$$$)" },
  ];

  const hasActiveFilters =
    filters.query || filters.category || filters.island || filters.priceRange;

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
        {/* Header del directorio */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger
                value="businesses"
                className="flex items-center gap-2"
              >
                <Layout className="h-4 w-4" />
                Negocios
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                Publicaciones Recientes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="businesses">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Directorio de Negocios
                  </h1>
                  <p className="text-gray-600">
                    Descubre {totalBusinesses} negocios únicos en las Islas de
                    la Bahía
                  </p>
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

                {/* Filtros rápidos - Móvil */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros {hasActiveFilters && "(activos)"}
                  </Button>
                </div>

                {/* Filtros - Desktop y Móvil expandido */}
                <div
                  className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${
                    showFilters || "hidden lg:grid"
                  }`}
                >
                  {/* Isla con autocompletado */}
                  <Combobox
                    value={filters.island}
                    onInputChange={setIslandInput}
                    onChange={(value) => {
                      updateFilters({ island: value });
                      setIslandInput("");
                    }}
                    options={islands.filter((island) =>
                      island.toLowerCase().includes(islandInput.toLowerCase())
                    )}
                    placeholder="Todas las islas"
                    inputValue={islandInput}
                    clearable
                  />
                  {/* Categoría con autocompletado */}
                  <Combobox
                    value={filters.category}
                    onInputChange={setCategoryInput}
                    onChange={(value) => {
                      updateFilters({ category: value });
                      setCategoryInput("");
                    }}
                    options={categories.filter((cat) =>
                      cat.toLowerCase().includes(categoryInput.toLowerCase())
                    )}
                    placeholder="Todas las categorías"
                    inputValue={categoryInput}
                    clearable
                  />
                  {/* Precio igual que antes */}
                  <Select
                    value={filters.priceRange || "all"}
                    onValueChange={(value) =>
                      updateFilters({
                        priceRange: value === "all" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los precios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los precios</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Limpiar Filtros
                    </Button>
                  )}
                </div>

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
                    {filters.island && (
                      <Badge variant="secondary" className="gap-1">
                        Isla: {filters.island}
                        <button
                          onClick={() => updateFilters({ island: "" })}
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
                            (p) => p.value === filters.priceRange
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

              {/* Resultados */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredCount} de {totalBusinesses} negocios
                </p>
                {filteredCount === 0 && filters.query && (
                  <p className="text-sm text-orange-600">
                    ¿No encuentras lo que buscas?{" "}
                    <button className="underline">Contáctanos</button>
                  </p>
                )}
              </div>
            </div>

            {/* Contenido principal */}
            {loadingBusinesses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <a href={`/negocio/${business.id}`}>Ver Perfil</a>
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

          <TabsContent value="posts">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Publicaciones Recientes
                </h2>
                <p className="text-gray-600">
                  Descubre las últimas novedades de los negocios en las Islas de
                  la Bahía
                </p>
              </div>

              {loadingPosts ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-6 animate-pulse"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/5"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : postsError ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-red-600">{postsError}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-600">
                    No hay publicaciones recientes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DirectoryPage;
