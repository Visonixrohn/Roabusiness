import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Facebook,
  Instagram,
  Twitter,
  Plus,
  X,
  Satellite,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Button } from "@/components/ui/button";
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
  name: string;
  profile_name: string;
  categories: string[];
  departamento: string;
  municipio: string;
  colonia: string;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string;
  description: string;
  email: string;
  phones: string[];
  website: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  tripadvisor: string;
  coverImage: string;
  logo: string;
}

function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    const qMatch = url.match(/[?&](?:q|query)=([-\d.]+),([-\d.]+)/);
    if (qMatch)
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    const atMatch = url.match(/@([-\d.]+),([-\d.]+)/);
    if (atMatch)
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
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

const TOTAL_STEPS = 5;

const STEP_INFO = [
  { number: 1, title: "Información básica" },
  { number: 2, title: "Ubicación" },
  { number: 3, title: "Datos del negocio" },
  { number: 4, title: "Presencia digital" },
  { number: 5, title: "Imágenes" },
];

const PublicBusinessRegistrationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [locationMode, setLocationMode] = useState<"map" | "url">("map");
  const [mapCenter, setMapCenter] = useState(GOOGLE_MAPS_CONFIG.defaultCenter);
  const [urlInput, setUrlInput] = useState("");

  const {
    categories,
    creating: creatingCategory,
    createCategory,
  } = useCategories();

  const islandCenters: Record<string, { lat: number; lng: number }> = {
    Roatán: { lat: 16.3156, lng: -86.5889 },
    Utila: { lat: 16.1, lng: -86.9 },
    Guanaja: { lat: 16.45, lng: -85.9 },
    "Jose Santos Guardiola": { lat: 16.36, lng: -86.35 },
  };

  const [formData, setFormData] = useState<FormData>({
    name: "",
    profile_name: "",
    categories: [],
    departamento: "",
    municipio: "",
    colonia: "",
    latitude: null,
    longitude: null,
    google_maps_url: "",
    description: "",
    email: "",
    phones: [""],
    website: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    tripadvisor: "",
    coverImage: "",
    logo: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "departamento") {
      setMunicipios(getMunicipiosByDepartamento(value));
      setFormData((prev) => ({ ...prev, municipio: "", departamento: value }));
      if (islandCenters[value]) setMapCenter(islandCenters[value]);
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const updated = [...formData.phones];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, phones: updated }));
  };

  const addPhone = () => {
    setFormData((prev) => ({ ...prev, phones: [...prev.phones, ""] }));
  };

  const removePhone = (index: number) => {
    if (formData.phones.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name.trim() && formData.categories.length > 0);
      case 2:
        return !!(formData.departamento && formData.municipio);
      case 3:
        return !!(
          formData.description.trim() &&
          formData.email.trim() &&
          formData.phones.some((p) => p.trim())
        );
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      toast.error("Por favor completa todos los campos obligatorios");
    }
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /**
   * Genera un profile_name único.
   * Ejemplo: «angel» → si existe → «angel_1» → si existe → «angel_2» …
   */
  const resolveUniqueProfileName = async (base: string): Promise<string> => {
    const cleanBase = base.slice(0, 38); // reserva espacio para _N
    // 1. Probar sin sufijo
    const { data: first } = await supabase
      .from("businesses")
      .select("id")
      .eq("profile_name", cleanBase)
      .maybeSingle();
    if (!first) return cleanBase;

    // 2. Probar con _1, _2, _3 …
    let counter = 1;
    while (true) {
      const candidate = `${cleanBase}_${counter}`;
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("profile_name", candidate)
        .maybeSingle();
      if (!data) return candidate;
      counter += 1;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Generar base a partir del nombre del negocio (solo a-z0-9)
      const base = formData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 38) || "negocio";

      const profile_name = await resolveUniqueProfileName(base);

      const payload = {
        name: formData.name,
        profile_name: profile_name || null,
        category: formData.categories[0] || "",
        categories: formData.categories,
        departamento: formData.departamento,
        municipio: formData.municipio,
        colonia: formData.colonia || null,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        google_maps_url: formData.google_maps_url || null,
        contact: {
          email: formData.email,
          phone: formData.phones.filter((p) => p.trim()).join(", "),
          website: formData.website,
          whatsapp: formData.whatsapp,
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          tiktok: formData.tiktok,
          tripadvisor: formData.tripadvisor,
        },
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        tiktok: formData.tiktok || null,
        tripadvisor: formData.tripadvisor || null,
        cover_image: formData.coverImage || null,
        logo: formData.logo || null,
        // Guardado como oculto hasta confirmar pago
        is_public: false,
        pago: "sin pagar",
        subscription_started_at: new Date().toISOString(),
      };

      const { data: businessData, error } = await supabase
        .from("businesses")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      if (!businessData) throw new Error("No se pudo crear el negocio");

      toast.success("Negocio registrado. Ahora selecciona tu plan.");
      navigate(
        `/pago-suscripcion?businessId=${businessData.id}&businessName=${encodeURIComponent(formData.name)}`,
      );
    } catch (error: any) {
      toast.error(
        "Error al registrar: " + (error?.message || "Intenta de nuevo."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Barra de progreso ─── */
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEP_INFO.map((step, idx) => {
          const completed = step.number < currentStep;
          const active = step.number === currentStep;
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-colors duration-300 ${
                    completed
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {completed ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={`hidden sm:block mt-1 text-[10px] font-medium ${
                    active
                      ? "text-blue-600"
                      : completed
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {idx < STEP_INFO.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${
                    step.number < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Paso {currentStep} de {TOTAL_STEPS}:{" "}
          {STEP_INFO[currentStep - 1].title}
        </h2>
      </div>
    </div>
  );

  /* ─── Estilos reutilizables ─── */
  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-sm bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  const renderSectionHeader = (
    Icon: React.ComponentType<{ className?: string }>,
    title: string,
    subtitle?: string,
  ) => (
    <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-100">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 flex-shrink-0">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     PASO 1: Información Básica
  ═══════════════════════════════════════ */
  const renderStep1 = () => (
    <div className="space-y-5">
      {renderSectionHeader(Building2, "Información básica", "Datos principales que identifican tu negocio")}

      {/* Nombre */}
      <div>
        <label className={labelClass}>
          Nombre del Negocio <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Ej: Hotel Paradise Bay"
          />
        </div>
      </div>

      {/* Categorías */}
      <div>
        <label className={labelClass}>
          Categoría(s) <span className="text-red-500">*</span>
        </label>
        <MultiCategorySelect
          categories={categories}
          selected={formData.categories}
          onChange={(cats) =>
            setFormData((prev) => ({ ...prev, categories: cats }))
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
  );

  /* ═══════════════════════════════════════
     PASO 2: Ubicación
  ═══════════════════════════════════════ */
  const renderStep2 = () => (
    <div className="space-y-5">
      {renderSectionHeader(MapPin, "Ubicación", "¿Dónde está tu negocio?")}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Departamento */}
        <div>
          <label className={labelClass}>
            Departamento <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.departamento}
            onChange={(e) => handleChange("departamento", e.target.value)}
            className={inputClass}
          >
            <option value="">Selecciona un departamento</option>
            {departamentos.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        {/* Municipio */}
        <div>
          <label className={labelClass}>
            Municipio <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.municipio}
            onChange={(e) => handleChange("municipio", e.target.value)}
            className={inputClass}
            disabled={!formData.departamento}
          >
            <option value="">Selecciona un municipio</option>
            {municipios.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colonia */}
      <div>
        <label className={labelClass}>Colonia / Sector</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={formData.colonia}
            onChange={(e) => handleChange("colonia", e.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Ej: West Bay Beach"
          />
        </div>
      </div>

      {/* Mapa / URL */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`${labelClass} mb-0`}>
            Ubicación{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div className="flex gap-1">
            {formData.latitude != null && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <Check className="h-3 w-3" /> Coordenadas
              </span>
            )}
            {formData.google_maps_url && (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <Globe className="h-3 w-3" /> URL guardada
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {(["map", "url"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLocationMode(mode)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                locationMode === mode
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "map" ? (
                <>
                  <MapPin className="h-4 w-4" /> Mapa interactivo
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" /> URL de Google Maps
                </>
              )}
            </button>
          ))}
        </div>

        {/* Tab Mapa */}
        {locationMode === "map" && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Haz clic en el mapa para marcar la ubicación exacta de tu negocio.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() =>
                  setMapType((p) => (p === "roadmap" ? "hybrid" : "roadmap"))
                }
              >
                <Satellite className="h-4 w-4 mr-1.5" />
                {mapType === "roadmap" ? "Ver satélite" : "Ver mapa"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={
                  formData.latitude == null || formData.longitude == null
                }
                onClick={() => {
                  if (formData.latitude == null || formData.longitude == null)
                    return;
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`,
                    "_blank",
                  );
                }}
              >
                <Navigation className="h-4 w-4 mr-1.5" /> Ver en Google Maps
              </Button>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "280px" }}
                center={
                  formData.latitude != null && formData.longitude != null
                    ? { lat: formData.latitude, lng: formData.longitude }
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
                {formData.latitude != null && formData.longitude != null && (
                  <Marker
                    position={{
                      lat: formData.latitude,
                      lng: formData.longitude,
                    }}
                    title={formData.name || "Tu negocio"}
                  />
                )}
              </GoogleMap>
            </div>
            {formData.latitude != null && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
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

        {/* Tab URL */}
        {locationMode === "url" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Pega el enlace de tu negocio en Google Maps.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className={`${inputClass} flex-1`}
                placeholder="https://maps.google.com/..."
              />
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  const coords = parseGoogleMapsUrl(urlInput);
                  if (coords) {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: coords.lat,
                      longitude: coords.lng,
                      google_maps_url: urlInput,
                    }));
                    toast.success("Coordenadas extraídas correctamente");
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      google_maps_url: urlInput,
                    }));
                    toast.success("URL de Google Maps guardada");
                  }
                  setUrlInput("");
                }}
              >
                Guardar
              </Button>
            </div>
            {formData.google_maps_url && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-xs text-blue-700 truncate max-w-[80%]">
                  {formData.google_maps_url}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline ml-2"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      google_maps_url: "",
                      latitude: null,
                      longitude: null,
                    }))
                  }
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     PASO 3: Información del negocio
  ═══════════════════════════════════════ */
  const renderStep3 = () => (
    <div className="space-y-5">
      {renderSectionHeader(Mail, "Información del negocio", "Descripción y datos de contacto")}

      {/* Descripción */}
      <div>
        <label className={labelClass}>
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Describe tu negocio, servicios, especialidades..."
        />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="negocio@correo.com"
          />
        </div>
      </div>

      {/* Teléfonos */}
      <div>
        <label className={labelClass}>
          Teléfono(s) <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {formData.phones.map((phone, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(idx, e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="9999-9999"
                />
              </div>
              {formData.phones.length > 1 && (
                <button
                  type="button"
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  onClick={() => removePhone(idx)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPhone}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="h-4 w-4" />
          Agregar otro teléfono
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     PASO 4: Presencia Digital
  ═══════════════════════════════════════ */
  const renderStep4 = () => (
    <div className="space-y-5">
      {renderSectionHeader(Globe, "Presencia digital", "Todos los campos son opcionales")}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sitio Web */}
        <div>
          <label className={labelClass}>Sitio Web</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="https://miweb.com"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelClass}>WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="50499999999"
            />
          </div>
        </div>

        {/* Facebook */}
        <div>
          <label className={labelClass}>Facebook</label>
          <div className="relative">
            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>

        {/* Instagram */}
        <div>
          <label className={labelClass}>Instagram</label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>

        {/* Twitter/X */}
        <div>
          <label className={labelClass}>Twitter / X</label>
          <div className="relative">
            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="https://x.com/..."
            />
          </div>
        </div>

        {/* TikTok */}
        <div>
          <label className={labelClass}>TikTok</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <TikTokIcon className="h-4 w-4 text-gray-800" />
            </span>
            <input
              type="url"
              value={formData.tiktok}
              onChange={(e) => handleChange("tiktok", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="https://tiktok.com/@..."
            />
          </div>
        </div>

        {/* TripAdvisor */}
        <div className="sm:col-span-2">
          <label className={labelClass}>URL de TripAdvisor</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
            <input
              type="url"
              value={formData.tripadvisor}
              onChange={(e) => handleChange("tripadvisor", e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="https://tripadvisor.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     PASO 5: Imágenes
  ═══════════════════════════════════════ */
  const renderStep5 = () => (
    <div className="space-y-6">
      {renderSectionHeader(ImageIcon, "Imágenes del negocio", "Las imágenes son opcionales pero recomendadas")}

      {/* Imagen de portada */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-semibold text-gray-800">
            Imagen de Portada
          </h4>
          <span className="text-xs text-gray-400">(PNG o JPG · máx. 5MB)</span>
        </div>
        <ImageUpload
          onImageUploaded={(url) =>
            setFormData((prev) => ({ ...prev, coverImage: url }))
          }
          onImageRemoved={() =>
            setFormData((prev) => ({ ...prev, coverImage: "" }))
          }
          currentImage={formData.coverImage}
          label="Arrastra o selecciona la imagen de portada"
          maxSize={5}
        />
      </div>

      {/* Logo */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-semibold text-gray-800">
            Logo del Negocio
          </h4>
          <span className="text-xs text-gray-400">(PNG o JPG · máx. 2MB)</span>
        </div>
        <ImageUpload
          onImageUploaded={(url) =>
            setFormData((prev) => ({ ...prev, logo: url }))
          }
          onImageRemoved={() => setFormData((prev) => ({ ...prev, logo: "" }))}
          currentImage={formData.logo}
          label="Arrastra o selecciona el logo"
          maxSize={2}
        />
      </div>

      {/* Aviso final */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-medium mb-1">
          ¿Listo para enviar?
        </p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Al continuar, tu negocio quedará registrado{" "}
          <strong>oculto al público</strong>. Una vez que confirmes el pago de
          suscripción, el administrador lo activará en el directorio.
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        {/* Header de página */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Registrar Negocio
              </h1>
              <p className="text-sm text-gray-500">
                Únete al directorio de las Islas de la Bahía
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        {renderProgressBar()}

        {/* Tarjeta de formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form onSubmit={(e) => e.preventDefault()}>{renderStep()}</form>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center justify-between mt-5 gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex-1 sm:flex-none sm:w-36 rounded-xl h-11 border-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1 sm:flex-none sm:w-36 rounded-xl h-11 bg-blue-600 hover:bg-blue-700"
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none sm:w-44 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Enviar datos
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBusinessRegistrationPage;
