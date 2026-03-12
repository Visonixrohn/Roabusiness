import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useCountryContext } from "@/contexts/CountryContext";
import CountrySelector from "@/components/CountrySelector";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Check,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  Eye,
  Users,
  Facebook,
  Instagram,
  Twitter,
  Satellite,
  Navigation,
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import MultiCategorySelect from "@/components/MultiCategorySelect";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import {
  departamentos,
  getMunicipiosByDepartamento,
} from "@/data/hondurasLocations";

interface FormData {
  // Información básica
  name: string;
  profile_name: string;
  category: string;
  categories: string[];
  departamento: string;
  municipio: string;
  colonia: string;
  /** País donde opera el negocio */
  pais: string;
  latitude: number | null;
  longitude: number | null;
  description: string;

  // Contacto
  email: string;
  phones: string[];
  website: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  tripadvisor?: string;
  google_maps_url?: string;

  // Detalles
  priceRange: string;
  amenities: string[];

  // Imágenes
  coverImage: string;
  logo: string;
  subscriptionMonths: number;

  // No auth fields here; admin will create users directly
}

/** Extrae lat/lng de una URL de Google Maps pegada por el usuario */
function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    // ?q=lat,lng  o  ?query=lat,lng
    const qMatch = url.match(/[?&](?:q|query)=([-\d.]+),([-\d.]+)/);
    if (qMatch)
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    // /@lat,lng,zoom
    const atMatch = url.match(/@([-\d.]+),([-\d.]+)/);
    if (atMatch)
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    // /search/lat,lng
    const searchMatch = url.match(/\/search\/([-\d.]+),([-\d.]+)/);
    if (searchMatch)
      return {
        lat: parseFloat(searchMatch[1]),
        lng: parseFloat(searchMatch[2]),
      };
    return null;
  } catch {
    return null;
  }
}

const BusinessRegistrationPage = () => {
  const navigate = useNavigate();
  const { country: detectedCountry } = useCountryContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [municipios, setMunicipios] = useState<string[]>([]);
  // password/reset UI removed — admin registers businesses via this URL

  const [formData, setFormData] = useState<FormData>({
    name: "",
    profile_name: "",
    category: "",
    categories: [],
    departamento: "",
    municipio: "",
    colonia: "",
    pais: detectedCountry || "Honduras",
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
    google_maps_url: "",
    priceRange: "",
    amenities: [],
    coverImage: "",
    logo: "",
    subscriptionMonths: 12,
  });

  const islandCenters: Record<string, { lat: number; lng: number }> = {
    Roatán: { lat: 16.3156, lng: -86.5889 },
    Utila: { lat: 16.1, lng: -86.9 },
    Guanaja: { lat: 16.45, lng: -85.9 },
    "Jose Santos Guardiola": { lat: 16.36, lng: -86.35 },
  };

  const [mapCenter, setMapCenter] = useState(GOOGLE_MAPS_CONFIG.defaultCenter);
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [locationInputMode, setLocationInputMode] = useState<"map" | "url">(
    "map",
  );

  const islands = ["Roatán", "Utila", "Guanaja", "Jose Santos Guardiola"];
  const priceRanges = [
    { value: "$", label: "$ - Económico" },
    { value: "$$", label: "$$ - Moderado" },
    { value: "$$$", label: "$$$ - Caro" },
    { value: "$$$$", label: "$$$$ - Muy Caro" },
  ];

  const {
    categories,
    creating: creatingCategory,
    createCategory,
  } = useCategories();

  const totalSteps = 4;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "departamento") {
      // Actualizar lista de municipios y resetear municipio seleccionado
      setMunicipios(getMunicipiosByDepartamento(value));
      setFormData((prev) => ({ ...prev, municipio: "" }));

      // Si hay centro definido para este departamento, actualizar mapa
      if (islandCenters[value]) {
        setMapCenter(islandCenters[value]);
      }
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter(
        (amenity) => amenity !== amenityToRemove,
      ),
    }));
  };

  const handleCoverImageUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
  };

  const handleCoverImageRemoved = () => {
    setFormData((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleLogoUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, logo: imageUrl }));
  };

  const handleLogoRemoved = () => {
    setFormData((prev) => ({ ...prev, logo: "" }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.name &&
          formData.categories.length > 0 &&
          formData.departamento &&
          formData.municipio
        );
      case 2:
        return !!(
          formData.description &&
          formData.email &&
          formData.phones.some((p) => p.trim())
        );
      case 3:
        return formData.amenities.length > 0 && formData.subscriptionMonths > 0;
      case 4:
        return true; // Imágenes opcionales
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Por favor completa todos los campos obligatorios");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      // Validar que profile_name no esté duplicado
      if (formData.profile_name) {
        const { data: existingBusiness } = await supabase
          .from("businesses")
          .select("id")
          .eq("profile_name", formData.profile_name)
          .single();

        if (existingBusiness) {
          toast.error(
            `El nombre de perfil @${formData.profile_name} ya está en uso. Por favor elige otro.`,
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Preparar payload en camelCase
      const payloadCamel = {
        name: formData.name,
        profile_name: formData.profile_name || null,
        category: formData.categories[0] || formData.category,
        categories: formData.categories,
        departamento: formData.departamento,
        municipio: formData.municipio,
        colonia: formData.colonia || null,
        pais: formData.pais || "Honduras",
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        subscription_months: formData.subscriptionMonths,
        subscription_started_at: new Date().toISOString(),
        contact: {
          email: formData.email,
          phone: formData.phones.filter((p) => p.trim()).join(", "),
          website: formData.website,
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          tiktok: formData.tiktok,
          whatsapp: formData.whatsapp,
          tripadvisor: formData.tripadvisor,
          google_maps_url: formData.google_maps_url,
        },
        // Redes sociales como columnas individuales
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        tiktok: formData.tiktok || null,
        tripadvisor: formData.tripadvisor || null,
        google_maps_url: formData.google_maps_url || null,
        priceRange: formData.priceRange,
        amenities: formData.amenities,
        coverImage: formData.coverImage,
        logo: formData.logo,
        is_public: true,
      };

      // Preparar payload en snake_case como fallback
      const payloadSnake = {
        name: formData.name,
        profile_name: formData.profile_name || null,
        category: formData.categories[0] || formData.category,
        categories: formData.categories,
        departamento: formData.departamento,
        municipio: formData.municipio,
        colonia: formData.colonia || null,
        pais: formData.pais || "Honduras",
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        subscription_months: formData.subscriptionMonths,
        subscription_started_at: new Date().toISOString(),
        contact: {
          email: formData.email,
          phone: formData.phones.filter((p) => p.trim()).join(", "),
          website: formData.website,
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          tiktok: formData.tiktok,
          whatsapp: formData.whatsapp,
          tripadvisor: formData.tripadvisor,
          google_maps_url: formData.google_maps_url,
        },
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        tiktok: formData.tiktok || null,
        tripadvisor: formData.tripadvisor || null,
        google_maps_url: formData.google_maps_url || null,
        price_range: formData.priceRange,
        amenities: formData.amenities,
        cover_image: formData.coverImage,
        logo: formData.logo,
        is_public: true,
      };

      // Intentar primero con camelCase
      let businessData = null;
      try {
        const result = await supabase
          .from("businesses")
          .insert([payloadCamel])
          .select()
          .single();

        if (result.error) throw result.error;
        businessData = result.data;
      } catch (err: any) {
        // Si falla por columnas, intentar con snake_case
        const msg = String(err?.message || err).toLowerCase();
        if (
          msg.includes("cover_image") ||
          msg.includes("coverimage") ||
          msg.includes("google_maps_url") ||
          msg.includes("could not find") ||
          msg.includes("schema cache") ||
          msg.includes("column")
        ) {
          const result = await supabase
            .from("businesses")
            .insert([payloadSnake])
            .select()
            .single();

          if (result.error) throw result.error;
          businessData = result.data;
        } else {
          throw err;
        }
      }

      if (!businessData) {
        toast.error("Error al crear el negocio");
        setIsSubmitting(false);
        return;
      }

      toast.success("Negocio registrado exitosamente");
      setTimeout(() => navigate("/editar-negocio"), 1200);
    } catch (error: any) {
      toast.error(
        "Error al registrar el negocio: " +
          (error?.message || "Intenta nuevamente."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // password recovery removed for admin-only registration

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return "Información Básica";
      case 2:
        return "Descripción y Contacto";
      case 3:
        return "Servicios y Precios";
      case 4:
        return "Imágenes del Negocio";
      default:
        return "";
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                ${
                  isCompleted
                    ? "bg-green-600 text-white"
                    : isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500"
                }
              `}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNum}
              </div>
              {stepNum < totalSteps && (
                <div
                  className={`
                  flex-1 h-1 mx-2 
                  ${stepNum < currentStep ? "bg-green-600" : "bg-gray-300"}
                `}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Paso {currentStep} de {totalSteps}: {getStepTitle(currentStep)}
        </h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/directorio"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al directorio
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-md animate-fade-in">
              Registra tu Negocio
            </h1>
            <p className="text-gray-600 text-lg">
              Únete al directorio más importante de las Islas de la Bahía y
              conecta con miles de visitantes
            </p>
          </div>

          {renderProgressBar()}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 transition-shadow duration-300 hover:shadow-xl">
          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ej: Hotel Paradise Bay"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Perfil * (@nombre)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.profile_name}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "");
                        handleInputChange("profile_name", value);
                      }}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="lacocinadejorge"
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo letras minúsculas y números. Este será tu enlace único:
                    roabusiness.com/negocio/@
                    {formData.profile_name || "tunombre"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría(s) *
                  </label>
                  <MultiCategorySelect
                    categories={categories}
                    selected={formData.categories}
                    onChange={(cats) =>
                      setFormData((prev) => ({
                        ...prev,
                        categories: cats,
                        category: cats[0] || "",
                      }))
                    }
                    onCreateCategory={createCategory}
                    creating={creatingCategory}
                    placeholder="Selecciona una o más categorías"
                  />
                  {formData.categories.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Selecciona al menos una categoría
                    </p>
                  )}
                </div>
              </div>

              {/* País — full width, siempre visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <CountrySelector
                  value={formData.pais}
                  onChange={(v) => {
                    handleInputChange("pais", v);
                    // Limpiar depto/municipio al cambiar de país
                    setFormData((prev) => ({
                      ...prev,
                      pais: v,
                      departamento: "",
                      municipio: "",
                    }));
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departamento / Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.pais === "Honduras"
                      ? "Departamento *"
                      : "Estado / Departamento *"}
                  </label>
                  {formData.pais === "Honduras" ? (
                    <select
                      value={formData.departamento}
                      onChange={(e) => {
                        handleInputChange("departamento", e.target.value);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md bg-white"
                      required
                    >
                      <option value="">Selecciona un departamento</option>
                      {departamentos.map((dep) => (
                        <option key={dep} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.departamento}
                      onChange={(e) =>
                        handleInputChange("departamento", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ej: Ciudad de México, Buenos Aires..."
                    />
                  )}
                </div>

                {/* Municipio / Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.pais === "Honduras"
                      ? "Municipio *"
                      : "Ciudad / Municipio *"}
                  </label>
                  {formData.pais === "Honduras" ? (
                    <select
                      value={formData.municipio}
                      onChange={(e) =>
                        handleInputChange("municipio", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md bg-white"
                      required
                      disabled={!formData.departamento}
                    >
                      <option value="">Selecciona un municipio</option>
                      {municipios.map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.municipio}
                      onChange={(e) =>
                        handleInputChange("municipio", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ej: Bogotá, Guadalajara, Lima..."
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia / Sector
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.colonia}
                      onChange={(e) =>
                        handleInputChange("colonia", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ej: West Bay Beach"
                    />
                  </div>
                </div>
              </div>

              <div>
                {/* Encabezado con badges de estado */}
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Ubicación{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (opcional)
                    </span>
                  </p>
                  {formData.latitude != null && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <Check className="h-3 w-3" /> Coordenadas
                    </span>
                  )}
                  {formData.google_maps_url && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      <Globe className="h-3 w-3" /> URL guardada
                    </span>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setLocationInputMode("map")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${locationInputMode === "map" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <MapPin className="h-4 w-4" /> Mapa
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationInputMode("url")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${locationInputMode === "url" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <Globe className="h-4 w-4" /> URL de Google Maps
                  </button>
                </div>

                {/* Tab: Mapa */}
                {locationInputMode === "map" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Haz clic en el mapa para marcar la ubicación exacta.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setMapType((prev) =>
                            prev === "roadmap" ? "hybrid" : "roadmap",
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
                          formData.latitude == null ||
                          formData.longitude == null
                        }
                        onClick={() => {
                          if (
                            formData.latitude == null ||
                            formData.longitude == null
                          )
                            return;
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`,
                            "_blank",
                          );
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-1" /> Ver en Google
                        Maps
                      </Button>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-300">
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "300px" }}
                        center={
                          formData.latitude != null &&
                          formData.longitude != null
                            ? {
                                lat: formData.latitude,
                                lng: formData.longitude,
                              }
                            : mapCenter
                        }
                        zoom={13}
                        onClick={(event) => {
                          const lat = event.latLng?.lat();
                          const lng = event.latLng?.lng();
                          if (lat == null || lng == null) return;
                          setFormData((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                          }));
                        }}
                        options={{
                          mapTypeId: mapType,
                          styles:
                            mapType === "roadmap"
                              ? GOOGLE_MAPS_CONFIG.cleanMapStyle
                              : undefined,
                          mapTypeControl: false,
                          streetViewControl: false,
                          clickableIcons: false,
                        }}
                      >
                        {formData.latitude != null &&
                          formData.longitude != null && (
                            <Marker
                              position={{
                                lat: formData.latitude,
                                lng: formData.longitude,
                              }}
                              title={formData.name || "Ubicación del negocio"}
                            />
                          )}
                      </GoogleMap>
                    </div>
                    {formData.latitude != null && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Coordenadas:{" "}
                          {formData.latitude.toFixed(5)},{" "}
                          {formData.longitude?.toFixed(5)}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              latitude: null,
                              longitude: null,
                            }))
                          }
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: URL */}
                {locationInputMode === "url" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Pega el enlace directo a tu negocio en Google Maps.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={formData.google_maps_url || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange("google_maps_url", val);
                          if (val) {
                            const coords = parseGoogleMapsUrl(val);
                            if (coords)
                              setFormData((prev) => ({
                                ...prev,
                                latitude: coords.lat,
                                longitude: coords.lng,
                              }));
                          }
                        }}
                        placeholder="https://maps.google.com/..."
                      />
                      {formData.latitude != null &&
                        formData.longitude != null && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => {
                              const url = `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`;
                              handleInputChange("google_maps_url", url);
                              toast.success("URL generada desde el mapa");
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-1" /> Desde mapa
                          </Button>
                        )}
                    </div>
                    {formData.google_maps_url && (
                      <div className="mt-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          onClick={() =>
                            window.open(formData.google_maps_url, "_blank")
                          }
                        >
                          <Navigation className="h-3 w-3" /> Abrir en Google
                          Maps
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 2: Descripción y Contacto */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Negocio *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                  placeholder="Describe tu negocio, servicios especiales, lo que te hace único..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="contacto@tunegocio.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono(s) *
                  </label>
                  <div className="space-y-2">
                    {formData.phones.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              const newPhones = [...formData.phones];
                              newPhones[index] = e.target.value;
                              setFormData({ ...formData, phones: newPhones });
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                            placeholder="+504 2445-1234"
                          />
                        </div>
                        {formData.phones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPhones = formData.phones.filter(
                                (_, i) => i !== index,
                              );
                              setFormData({ ...formData, phones: newPhones });
                            }}
                            className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-300"
                            title="Eliminar teléfono"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          phones: [...formData.phones, ""],
                        })
                      }
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
                    >
                      <Plus className="h-4 w-4" /> Agregar otro teléfono
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio Web (opcional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 shadow-sm hover:shadow-md"
                      placeholder="www.tunegocio.com"
                    />
                  </div>
                </div>

                {/* Redes sociales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={formData.facebook || ""}
                    onChange={(e) =>
                      handleInputChange("facebook", e.target.value)
                    }
                    placeholder="URL de Facebook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={formData.instagram || ""}
                    onChange={(e) =>
                      handleInputChange("instagram", e.target.value)
                    }
                    placeholder="URL de Instagram"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" /> X (Twitter)
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={formData.twitter || ""}
                    onChange={(e) =>
                      handleInputChange("twitter", e.target.value)
                    }
                    placeholder="URL de X"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <TikTokIcon className="h-4 w-4 text-black" /> TikTok
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={formData.tiktok || ""}
                    onChange={(e) =>
                      handleInputChange("tiktok", e.target.value)
                    }
                    placeholder="URL de TikTok"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    TripAdvisor
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={formData.tripadvisor || ""}
                    onChange={(e) =>
                      handleInputChange("tripadvisor", e.target.value)
                    }
                    placeholder="URL de TripAdvisor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    WhatsApp
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    value={formData.whatsapp || ""}
                    onChange={(e) =>
                      handleInputChange("whatsapp", e.target.value)
                    }
                    placeholder="Número o link de WhatsApp"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Servicios y Precios */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Precios
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() =>
                        handleInputChange("priceRange", range.value)
                      }
                      className={`
                        p-3 rounded-lg border text-center transition-colors
                        ${
                          formData.priceRange === range.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        }
                      `}
                    >
                      <div className="font-medium">{range.value}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {range.label.split(" - ")[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tiempo de duración (meses) *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[6, 12, 18, 24, 30, 36].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          subscriptionMonths: months,
                        }))
                      }
                      className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                        formData.subscriptionMonths === months
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-105"
                          : "border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      {months}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Este valor se usa para controlar cuándo expira la suscripción
                  del negocio.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios y Amenidades *
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Agrega los servicios que ofreces (ej: WiFi, Piscina, Aire
                  Acondicionado, etc.)
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Escribe un servicio o amenidad"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAmenity())
                    }
                  />
                  <Button type="button" onClick={addAmenity} className="px-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[100px] p-4 border border-gray-200 rounded-lg">
                  {formData.amenities.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No hay servicios agregados aún
                    </p>
                  ) : (
                    formData.amenities.map((amenity, index) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Imágenes del Negocio */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Imágenes de tu Negocio
                </h3>
                <p className="text-gray-600 mb-6">
                  Las imágenes son opcionales pero recomendadas para atraer más
                  clientes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagen Principal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Imagen Principal (opcional)
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Esta será la imagen de portada que verán los usuarios
                  </p>
                  <ImageUpload
                    onImageUploaded={handleCoverImageUploaded}
                    onImageRemoved={handleCoverImageRemoved}
                    currentImage={formData.coverImage}
                    label="Imagen de portada"
                    maxSize={5}
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Logo del Negocio (opcional)
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    El logo aparecerá en tu perfil y publicaciones
                  </p>
                  <ImageUpload
                    onImageUploaded={handleLogoUploaded}
                    onImageRemoved={handleLogoRemoved}
                    currentImage={formData.logo}
                    label="Logo del negocio"
                    maxSize={2}
                  />
                </div>
              </div>

              {/* Vista previa de imágenes */}
              {(formData.coverImage || formData.logo) && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Vista Previa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.coverImage && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Imagen Principal:
                        </p>
                        <img
                          src={formData.coverImage}
                          alt="Imagen principal"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {formData.logo && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Logo:
                        </p>
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="w-24 h-24 object-cover rounded-full border mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5 removed: admin registers businesses via this URL. */}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Registrando..." : "Registrar Negocio"}
              </Button>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
            ¿Por qué registrar tu negocio con nosotros?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Más Visibilidad
              </h4>
              <p className="text-gray-600 text-sm">
                Aparece en búsquedas de miles de turistas que visitan las islas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Más Clientes</h4>
              <p className="text-gray-600 text-sm">
                Conecta directamente con turistas y locales interesados
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Presencia Digital
              </h4>
              <p className="text-gray-600 text-sm">
                Perfil profesional con toda la información de tu negocio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistrationPage;
