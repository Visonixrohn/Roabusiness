import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  X,
  Check,
  Satellite,
  Navigation,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import RegisterBusinessModalAdmin from "@/components/RegisterBusinessModalAdmin";
import { toast } from "sonner";
import businessCategories from "@/data/businessCategories";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import {
  departamentos,
  getMunicipiosByDepartamento,
} from "@/data/hondurasLocations";
import {
  getSubscriptionExpirationDate,
  isSubscriptionActive,
} from "@/lib/subscription";

interface Business {
  id: string;
  name: string;
  category: string;
  departamento: string;
  municipio: string;
  colonia?: string;
  /** @deprecated */ island?: string;
  /** @deprecated */ location?: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
    tripadvisor?: string;
  };
  price_range: string;
  priceRange?: string; // Soporte para ambos formatos
  amenities: string[];
  cover_image: string;
  coverImage?: string; // Soporte para ambos formatos
  logo: string;
  is_public: boolean;
  created_at?: string; // Opcional porque puede no existir en la DB
  subscription_months?: number | null;
  subscription_started_at?: string | null;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  tripadvisor?: string;
}

interface EditFormData {
  name: string;
  category: string;
  departamento: string;
  municipio: string;
  colonia: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  email: string;
  phones: string[];
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  whatsapp: string;
  tripadvisor: string;
  priceRange: string;
  amenities: string[];
  coverImage: string;
  logo: string;
  is_public: boolean;
  subscriptionMonths: number;
}

const EditBusinessPage = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [editForm, setEditForm] = useState<EditFormData>({
    name: "",
    category: "",
    departamento: "",
    municipio: "",
    colonia: "",
    latitude: null,
    longitude: null,
    description: "",
    email: "",
    phones: [""],
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    whatsapp: "",
    tripadvisor: "",
    priceRange: "",
    amenities: [],
    coverImage: "",
    logo: "",
    is_public: true,
    subscriptionMonths: 1,
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartamento, setFilterDepartamento] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const islands = ["Roatán", "Utila", "Guanaja", "Jose Santos Guardiola"];
  const priceRanges = [
    { value: "$", label: "$ - Económico" },
    { value: "$$", label: "$$ - Moderado" },
    { value: "$$$", label: "$$$ - Caro" },
    { value: "$$$$", label: "$$$$ - Muy Caro" },
  ];
  const categories = businessCategories;
  const islandCenters: Record<string, { lat: number; lng: number }> = {
    Roatán: { lat: 16.3156, lng: -86.5889 },
    Utila: { lat: 16.1, lng: -86.9 },
    Guanaja: { lat: 16.45, lng: -85.9 },
    "Jose Santos Guardiola": { lat: 16.36, lng: -86.35 },
  };
  const [mapCenter, setMapCenter] = useState(GOOGLE_MAPS_CONFIG.defaultCenter);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [municipios, setMunicipios] = useState<string[]>([]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      // Intentar cargar sin ordenamiento primero
      let query = supabase.from("businesses").select("*");

      const { data, error } = await query;

      if (error) throw error;

      // Normalizar datos para soportar ambos formatos (snake_case y camelCase)
      const normalizedData = (data || []).map((business: any) => ({
        ...business,
        cover_image: business.cover_image || business.coverImage || "",
        coverImage: business.coverImage || business.cover_image || "",
        price_range: business.price_range || business.priceRange || "",
        priceRange: business.priceRange || business.price_range || "",
        latitude:
          typeof business.latitude === "number"
            ? business.latitude
            : business.coordinates?.lat || null,
        longitude:
          typeof business.longitude === "number"
            ? business.longitude
            : business.coordinates?.lng || null,
        subscription_months:
          business.subscription_months != null
            ? Number(business.subscription_months)
            : null,
        subscription_started_at: business.subscription_started_at || null,
        created_at: business.created_at || new Date().toISOString(),
      }));

      // Ordenar en el cliente por nombre si no hay created_at
      const sortedData = normalizedData.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        return a.name.localeCompare(b.name);
      });

      setBusinesses(sortedData);
      console.log("Negocios cargados:", sortedData.length);
    } catch (error: any) {
      console.error("Error al cargar negocios:", error);
      toast.error("Error al cargar los negocios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business: Business) => {
    if (business.latitude != null && business.longitude != null) {
      setMapCenter({ lat: business.latitude, lng: business.longitude });
    } else if (
      (business.departamento || business.island) &&
      islandCenters[(business.departamento || business.island)!]
    ) {
      setMapCenter(islandCenters[(business.departamento || business.island)!]);
    }

    setSelectedBusiness(business);
    setEditForm({
      name: business.name || "",
      category: business.category || "",
      departamento: business.departamento || business.island || "",
      municipio: business.municipio || business.location || "",
      colonia: business.colonia || "",
      latitude: business.latitude ?? null,
      longitude: business.longitude ?? null,
      description: business.description || "",
      email: business.contact?.email || "",
      phones: business.contact?.phone
        ? business.contact.phone
            .split(/[,;]+/)
            .map((p) => p.trim())
            .filter(Boolean)
        : [""],
      website: business.contact?.website || "",
      facebook: business.contact?.facebook || "",
      instagram: business.contact?.instagram || "",
      twitter: business.contact?.twitter || "",
      tiktok: business.contact?.tiktok || "",
      whatsapp: business.contact?.whatsapp || "",
      tripadvisor: business.contact?.tripadvisor || business.tripadvisor || "",
      priceRange: business.price_range || business.priceRange || "",
      amenities: business.amenities || [],
      coverImage: business.cover_image || business.coverImage || "",
      logo: business.logo || "",
      is_public: business.is_public !== false,
      subscriptionMonths:
        business.subscription_months && business.subscription_months > 0
          ? business.subscription_months
          : 1,
    });

    // Cargar municipios del departamento seleccionado
    const dept = business.departamento || business.island || "";
    if (dept) {
      setMunicipios(getMunicipiosByDepartamento(dept));
    }

    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(`¿Estás seguro de que deseas eliminar el negocio "${name}"?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Negocio eliminado exitosamente");
      fetchBusinesses();
    } catch (error: any) {
      toast.error("Error al eliminar el negocio: " + error.message);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedBusiness) return;

    setIsSubmitting(true);
    try {
      // Payload en camelCase
      const payloadCamel = {
        name: editForm.name,
        category: editForm.category,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        subscription_months: editForm.subscriptionMonths,
        subscription_started_at: new Date().toISOString(),
        description: editForm.description,
        contact: {
          email: editForm.email,
          phone: editForm.phones.filter((p) => p.trim()).join(", "),
          website: editForm.website,
          facebook: editForm.facebook,
          instagram: editForm.instagram,
          twitter: editForm.twitter,
          tiktok: editForm.tiktok,
          whatsapp: editForm.whatsapp,
          tripadvisor: editForm.tripadvisor,
        },
        // Redes sociales como columnas individuales
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        priceRange: editForm.priceRange,
        amenities: editForm.amenities,
        coverImage: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
      };

      // Payload en snake_case como fallback
      const payloadSnake = {
        name: editForm.name,
        category: editForm.category,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        subscription_months: editForm.subscriptionMonths,
        subscription_started_at: new Date().toISOString(),
        description: editForm.description,
        contact: {
          email: editForm.email,
          phone: editForm.phones.filter((p) => p.trim()).join(", "),
          website: editForm.website,
          facebook: editForm.facebook,
          instagram: editForm.instagram,
          twitter: editForm.twitter,
          tiktok: editForm.tiktok,
          whatsapp: editForm.whatsapp,
          tripadvisor: editForm.tripadvisor,
        },
        // Redes sociales como columnas individuales
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        price_range: editForm.priceRange,
        amenities: editForm.amenities,
        cover_image: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
      };

      // Intentar primero con camelCase
      try {
        const { error } = await supabase
          .from("businesses")
          .update(payloadCamel)
          .eq("id", selectedBusiness.id);

        if (error) throw error;
      } catch (err: any) {
        // Si falla por columnas, intentar con snake_case
        const msg = String(err?.message || err);
        if (
          msg.includes("cover_image") ||
          msg.includes("coverImage") ||
          msg.includes("could not find") ||
          msg.includes("column")
        ) {
          const { error } = await supabase
            .from("businesses")
            .update(payloadSnake)
            .eq("id", selectedBusiness.id);

          if (error) throw error;
        } else {
          throw err;
        }
      }

      toast.success("Negocio actualizado exitosamente");
      setShowEditModal(false);
      fetchBusinesses();
    } catch (error: any) {
      toast.error("Error al actualizar el negocio: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRegisterModal = () => {
    setEditForm({
      name: "",
      category: "",
      departamento: "Islas de la Bahía",
      municipio: "Roatán",
      colonia: "",
      latitude: null,
      longitude: null,
      description: "",
      email: "",
      phones: [""],
      website: "",
      facebook: "",
      instagram: "",
      twitter: "",
      tiktok: "",
      whatsapp: "",
      tripadvisor: "",
      priceRange: "",
      amenities: [],
      coverImage: "",
      logo: "",
      is_public: true,
      subscriptionMonths: 1,
    });
    setMapCenter(islandCenters["Roatán"]);
    setShowRegisterModal(true);
  };

  const handleSubmitRegister = async () => {
    if (!editForm.name || !editForm.category || !editForm.departamento) {
      toast.error("Por favor, completa los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      // Payload en camelCase (intento primero)
      const payloadCamel = {
        name: editForm.name,
        category: editForm.category,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        subscription_months: editForm.subscriptionMonths,
        subscription_started_at: new Date().toISOString(),
        description: editForm.description,
        contact: {
          email: editForm.email,
          phone: editForm.phones.filter((p) => p.trim()).join(", "),
          website: editForm.website,
          facebook: editForm.facebook,
          instagram: editForm.instagram,
          twitter: editForm.twitter,
          tiktok: editForm.tiktok,
          whatsapp: editForm.whatsapp,
          tripadvisor: editForm.tripadvisor,
        },
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        priceRange: editForm.priceRange,
        amenities: editForm.amenities,
        coverImage: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
      };

      // Payload en snake_case (fallback)
      const payloadSnake = {
        name: editForm.name,
        category: editForm.category,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        subscription_months: editForm.subscriptionMonths,
        subscription_started_at: new Date().toISOString(),
        description: editForm.description,
        contact: {
          email: editForm.email,
          phone: editForm.phones.filter((p) => p.trim()).join(", "),
          website: editForm.website,
          facebook: editForm.facebook,
          instagram: editForm.instagram,
          twitter: editForm.twitter,
          tiktok: editForm.tiktok,
          whatsapp: editForm.whatsapp,
          tripadvisor: editForm.tripadvisor,
        },
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        price_range: editForm.priceRange,
        amenities: editForm.amenities,
        cover_image: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
      };

      // Intentar primero con camelCase
      try {
        const { error } = await supabase
          .from("businesses")
          .insert([payloadCamel]);
        if (error) throw error;
      } catch (err: any) {
        // Si falla por columnas, intentar con snake_case
        const msg = String(err?.message || err);
        if (
          msg.includes("cover_image") ||
          msg.includes("coverImage") ||
          msg.includes("price_range") ||
          msg.includes("priceRange") ||
          msg.includes("could not find") ||
          msg.includes("column")
        ) {
          const { error } = await supabase
            .from("businesses")
            .insert([payloadSnake]);
          if (error) throw error;
        } else {
          throw err;
        }
      }

      toast.success("Negocio registrado exitosamente");
      setShowRegisterModal(false);
      fetchBusinesses();
    } catch (error: any) {
      toast.error("Error al registrar el negocio: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !editForm.amenities.includes(newAmenity.trim())) {
      setEditForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter(
        (amenity) => amenity !== amenityToRemove,
      ),
    }));
  };

  const togglePublic = async (business: Business) => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ is_public: !business.is_public })
        .eq("id", business.id);

      if (error) throw error;
      toast.success(
        `Negocio ${!business.is_public ? "publicado" : "ocultado"} exitosamente`,
      );
      fetchBusinesses();
    } catch (error: any) {
      toast.error("Error al cambiar visibilidad: " + error.message);
    }
  };

  const handleRenewSubscription = async (business: Business) => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          subscription_started_at: new Date().toISOString(),
          subscription_months:
            business.subscription_months && business.subscription_months > 0
              ? business.subscription_months
              : 1,
        })
        .eq("id", business.id);

      if (error) throw error;

      toast.success("Suscripción renovada correctamente");
      fetchBusinesses();
    } catch (error: any) {
      toast.error("Error al renovar suscripción: " + error.message);
    }
  };

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = business.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesIsland = filterDepartamento
      ? (business.departamento || business.island) === filterDepartamento
      : true;
    const matchesCategory = filterCategory
      ? business.category === filterCategory
      : true;
    const isActive = isSubscriptionActive(business);
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? isActive
          : !isActive;
    return matchesSearch && matchesIsland && matchesCategory && matchesStatus;
  });

  const activeBusinessesCount = businesses.filter((business) =>
    isSubscriptionActive(business),
  ).length;
  const inactiveBusinessesCount = businesses.length - activeBusinessesCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestionar Negocios
              </h1>
              <p className="text-gray-600">
                Administra todos los negocios registrados en la plataforma
              </p>
            </div>
            <Button
              onClick={handleOpenRegisterModal}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Negocio
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`text-left rounded-lg border p-4 bg-white shadow-sm transition-colors ${
              filterStatus === "all" ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <p className="text-xs text-gray-500">Total negocios</p>
            <p className="text-2xl font-bold text-gray-900">
              {businesses.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("active")}
            className={`text-left rounded-lg border p-4 bg-white shadow-sm transition-colors ${
              filterStatus === "active" ? "border-green-500" : "border-gray-200"
            }`}
          >
            <p className="text-xs text-gray-500">Negocios activos</p>
            <p className="text-2xl font-bold text-green-600">
              {activeBusinessesCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("inactive")}
            className={`text-left rounded-lg border p-4 bg-white shadow-sm transition-colors ${
              filterStatus === "inactive" ? "border-red-500" : "border-gray-200"
            }`}
          >
            <p className="text-xs text-gray-500">Negocios inactivos</p>
            <p className="text-2xl font-bold text-red-600">
              {inactiveBusinessesCount}
            </p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar negocio..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por departamento
              </label>
              <select
                value={filterDepartamento}
                onChange={(e) => setFilterDepartamento(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los departamentos</option>
                {Array.from(
                  new Set(
                    businesses
                      .map((b) => b.departamento || b.island)
                      .filter(Boolean),
                  ),
                )
                  .sort()
                  .map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de suscripción
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de negocios */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando negocios...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay negocios
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterDepartamento || filterCategory
                ? "No se encontraron negocios con los filtros aplicados"
                : "Comienza registrando tu primer negocio"}
            </p>
            {businesses.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartamento("");
                  setFilterCategory("");
                }}
              >
                Limpiar filtros
              </Button>
            )}
            {businesses.length === 0 && (
              <Button
                onClick={handleOpenRegisterModal}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primer Negocio
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              Mostrando {filteredBusinesses.length} de {businesses.length}{" "}
              negocios
            </p>
          </div>
        )}

        {!loading && filteredBusinesses.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Imagen */}
                  <div className="flex-shrink-0">
                    <img
                      src={
                        business.logo ||
                        business.cover_image ||
                        "https://via.placeholder.com/150"
                      }
                      alt={business.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {business.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{business.category}</Badge>
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {business.departamento || business.island}
                          </Badge>
                          <Badge
                            variant={
                              business.is_public ? "default" : "destructive"
                            }
                          >
                            {business.is_public ? "Público" : "Oculto"}
                          </Badge>
                          <Badge
                            variant={
                              isSubscriptionActive(business)
                                ? "default"
                                : "destructive"
                            }
                          >
                            {isSubscriptionActive(business)
                              ? "Suscripción activa"
                              : "Suscripción vencida"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {business.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {business.contact?.email || "Sin email"}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {business.contact?.phone || "Sin teléfono"}
                      </span>
                      {business.contact?.website && (
                        <span className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          {business.contact.website}
                        </span>
                      )}
                      <span>
                        Vence:{" "}
                        {getSubscriptionExpirationDate(business)
                          ? getSubscriptionExpirationDate(
                              business,
                            )?.toLocaleDateString("es-HN")
                          : "Sin fecha"}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublic(business)}
                      title={
                        business.is_public
                          ? "Ocultar negocio"
                          : "Publicar negocio"
                      }
                      className="flex items-center gap-1"
                    >
                      {business.is_public ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span className="hidden sm:inline text-xs">
                            Ocultar
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline text-xs">
                            Publicar
                          </span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRenewSubscription(business)}
                      className="flex items-center gap-1"
                      title="Renovar suscripción"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">Renovar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(business)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">Editar</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(business.id, business.name)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showEditModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Negocio
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <input
                    list="categories-list-edit"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="categories-list-edit">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={editForm.departamento}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        departamento: e.target.value,
                        municipio: "",
                      });
                      setMunicipios(
                        getMunicipiosByDepartamento(e.target.value),
                      );
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Selecciona un departamento</option>
                    {departamentos.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipio *
                  </label>
                  <select
                    value={editForm.municipio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, municipio: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={!editForm.departamento}
                  >
                    <option value="">
                      {editForm.departamento
                        ? "Selecciona un municipio"
                        : "Primero selecciona un departamento"}
                    </option>
                    {municipios.map((mun) => (
                      <option key={mun} value={mun}>
                        {mun}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia / Sector
                  </label>
                  <input
                    type="text"
                    value={editForm.colonia}
                    onChange={(e) =>
                      setEditForm({ ...editForm, colonia: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: West Bay Beach"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mapa de ubicación
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Haz clic en el mapa para actualizar la ubicación exacta.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setMapType((prev) =>
                          prev === "roadmap" ? "satellite" : "roadmap",
                        )
                      }
                    >
                      <Satellite className="h-4 w-4 mr-1" />
                      {mapType === "roadmap" ? "Ver satélite" : "Ver mapa"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        editForm.latitude == null || editForm.longitude == null
                      }
                      onClick={() => {
                        if (
                          editForm.latitude == null ||
                          editForm.longitude == null
                        )
                          return;
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${editForm.latitude},${editForm.longitude}`,
                          "_blank",
                        );
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" /> Ver en Google Maps
                    </Button>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-gray-300">
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "280px" }}
                      center={
                        editForm.latitude != null && editForm.longitude != null
                          ? { lat: editForm.latitude, lng: editForm.longitude }
                          : mapCenter
                      }
                      zoom={13}
                      onClick={(event) => {
                        const lat = event.latLng?.lat();
                        const lng = event.latLng?.lng();
                        if (lat == null || lng == null) return;
                        setEditForm({
                          ...editForm,
                          latitude: lat,
                          longitude: lng,
                        });
                      }}
                      options={{
                        mapTypeId: mapType,
                        styles: GOOGLE_MAPS_CONFIG.mapStyle,
                        mapTypeControl: false,
                        streetViewControl: false,
                      }}
                    >
                      {editForm.latitude != null &&
                        editForm.longitude != null && (
                          <Marker
                            position={{
                              lat: editForm.latitude,
                              lng: editForm.longitude,
                            }}
                            title={editForm.name || "Ubicación del negocio"}
                          />
                        )}
                    </GoogleMap>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono(s) *
                  </label>
                  <div className="space-y-2">
                    {editForm.phones.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const newPhones = [...editForm.phones];
                            newPhones[index] = e.target.value;
                            setEditForm({ ...editForm, phones: newPhones });
                          }}
                          placeholder="+504 2445-1234"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {editForm.phones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPhones = editForm.phones.filter(
                                (_, i) => i !== index,
                              );
                              setEditForm({ ...editForm, phones: newPhones });
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar teléfono"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          phones: [...editForm.phones, ""],
                        })
                      }
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Plus className="h-4 w-4" /> Agregar otro teléfono
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) =>
                      setEditForm({ ...editForm, whatsapp: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Redes sociales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={editForm.facebook}
                    onChange={(e) =>
                      setEditForm({ ...editForm, facebook: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={editForm.instagram}
                    onChange={(e) =>
                      setEditForm({ ...editForm, instagram: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    value={editForm.twitter}
                    onChange={(e) =>
                      setEditForm({ ...editForm, twitter: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={editForm.tiktok}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tiktok: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TripAdvisor
                  </label>
                  <input
                    type="url"
                    value={editForm.tripadvisor}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tripadvisor: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="URL de TripAdvisor"
                  />
                </div>
              </div>

              {/* Rango de precios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de duración (meses)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {[6, 12, 18, 24, 30, 36].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, subscriptionMonths: months })
                      }
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        editForm.subscriptionMonths === months
                          ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">{months}</div>
                      <div className="text-xs text-gray-500 mt-1">meses</div>
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Precios
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, priceRange: range.value })
                      }
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        editForm.priceRange === range.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">{range.value}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {range.label.split(" - ")[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios y Amenidades
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Agregar amenidad"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAmenity())
                    }
                  />
                  <Button type="button" onClick={addAmenity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 px-3 py-1 flex items-center gap-2"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Principal
                  </label>
                  <ImageUpload
                    onImageUploaded={(url) =>
                      setEditForm({ ...editForm, coverImage: url })
                    }
                    onImageRemoved={() =>
                      setEditForm({ ...editForm, coverImage: "" })
                    }
                    currentImage={editForm.coverImage}
                    label="Imagen de portada"
                    maxSize={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <ImageUpload
                    onImageUploaded={(url) =>
                      setEditForm({ ...editForm, logo: url })
                    }
                    onImageRemoved={() =>
                      setEditForm({ ...editForm, logo: "" })
                    }
                    currentImage={editForm.logo}
                    label="Logo del negocio"
                    maxSize={2}
                  />
                </div>
              </div>

              {/* Visibilidad */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editForm.is_public}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_public: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="is_public"
                  className="text-sm font-medium text-gray-700"
                >
                  Negocio público (visible en el directorio)
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      <RegisterBusinessModalAdmin
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        municipios={municipios}
        setMunicipios={setMunicipios}
        getMunicipiosByDepartamento={getMunicipiosByDepartamento}
        categories={categories}
        priceRanges={priceRanges}
        addAmenity={addAmenity}
        removeAmenity={removeAmenity}
        newAmenity={newAmenity}
        setNewAmenity={setNewAmenity}
        mapCenter={mapCenter}
        mapType={mapType}
        setMapType={setMapType}
        isSubmitting={isSubmitting}
        handleSubmitRegister={handleSubmitRegister}
      />
    </div>
  );
};

export default EditBusinessPage;
