import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Lock,
  EyeOff,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import businessCategories from "@/data/businessCategories";

interface FormData {
  // Información básica
  name: string;
  category: string;
  island: string;
  location: string;
  description: string;

  // Contacto
  email: string;
  phone: string;
  website: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;

  // Detalles
  priceRange: string;
  amenities: string[];

  // Imágenes
  coverImage: string;
  logo: string;

  // Autenticación
  password: string;
  confirmPassword: string;
}

const BusinessRegistrationPage = () => {
  const navigate = useNavigate();
  const { register, recoverPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    island: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    whatsapp: "",
    priceRange: "",
    amenities: [],
    coverImage: "",
    logo: "",
    password: "",
    confirmPassword: "",
  });

  const islands = ["Roatán", "Utila", "Guanaja", "Jose Santos Guardiola"];
  const priceRanges = [
    { value: "$", label: "$ - Económico" },
    { value: "$$", label: "$$ - Moderado" },
    { value: "$$$", label: "$$$ - Caro" },
    { value: "$$$$", label: "$$$$ - Muy Caro" },
  ];

  const categories = businessCategories;

  const totalSteps = 5;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        (amenity) => amenity !== amenityToRemove
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
          formData.category &&
          formData.island &&
          formData.location
        );
      case 2:
        return !!(formData.description && formData.email && formData.phone);
      case 3:
        return formData.amenities.length > 0;
      case 4:
        return true; // Imágenes opcionales
      case 5:
        return !!(
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 6
        );
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
      // Usar el método register del contexto de autenticación
      const result = await register(formData, "business");
      if (result.success) {
        toast.success(
          "¡Negocio registrado exitosamente! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión."
        );
        // Limpiar cualquier sesión activa y redirigir al login
        setTimeout(() => {
          window.location.href = "/login";
        }, 3500);
      } else {
        toast.error(result.message || "Error al registrar el negocio.");
      }
    } catch (error) {
      toast.error("Error al registrar el negocio. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    try {
      const { error } = await recoverPassword(resetEmail);
      if (error) {
        toast.error(error.message || "No se pudo enviar el correo");
      } else {
        toast.success("Enlace de recuperación enviado. Revisa tu correo.");
        setShowReset(false);
        setResetEmail("");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setResetLoading(false);
    }
  };

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
      case 5:
        return "Crear Cuenta de Acceso";
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/directorio"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al directorio
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registra tu Negocio
            </h1>
            <p className="text-gray-600">
              Únete al directorio más importante de las Islas de la Bahía y
              conecta con miles de visitantes
            </p>
          </div>

          {renderProgressBar()}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Hotel Paradise Bay"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <input
                    list="categories-list"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Escribe o selecciona una categoría"
                    required
                  />
                  <datalist id="categories-list">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Isla *
                  </label>
                  <select
                    value={formData.island}
                    onChange={(e) =>
                      handleInputChange("island", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una isla</option>
                    {islands.map((island) => (
                      <option key={island} value={island}>
                        {island}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación Específica *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: West Bay Beach"
                    />
                  </div>
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contacto@tunegocio.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+504 2445-1234"
                    />
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Paso 5: Crear Cuenta de Acceso */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Crear tu Cuenta de Acceso
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta cuenta te permitirá gestionar tu perfil y crear
                  publicaciones
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Email de la cuenta:
                </h4>
                <p className="text-blue-800">{formData.email}</p>
                <p className="text-sm text-blue-600 mt-1">
                  Usarás este email para iniciar sesión en tu panel de control
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Repite la contraseña"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumen Final */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Resumen Final de tu Registro:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Negocio:</span>{" "}
                    {formData.name || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Categoría:
                    </span>{" "}
                    {formData.category || "No especificada"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Ubicación:
                    </span>{" "}
                    {formData.location}, {formData.island}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {formData.email || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>{" "}
                    {formData.phone || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Servicios:
                    </span>{" "}
                    {formData.amenities.length} agregados
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Imágenes:</span>
                    {formData.coverImage ? " Portada ✓" : ""}
                    {formData.logo ? " Logo ✓" : ""}
                    {!formData.coverImage && !formData.logo ? " Ninguna" : ""}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cuenta:</span>{" "}
                    Lista para crear
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {isSubmitting
                  ? "Creando cuenta..."
                  : "Crear Cuenta y Registrar Negocio"}
              </Button>
            )}
          </div>

          {/* Recuperación de contraseña */}
          {currentStep === 5 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm font-medium"
                onClick={() => setShowReset(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Modal recuperación */}
          {showReset && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-2">Recuperar contraseña</h2>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-3"
                  placeholder="Tu email"
                  disabled={resetLoading}
                />
                <Button
                  onClick={handleResetPassword}
                  disabled={resetLoading || !resetEmail}
                  className="w-full mb-2"
                >
                  {resetLoading
                    ? "Enviando..."
                    : "Enviar enlace de recuperación"}
                </Button>
                <button
                  className="text-xs text-gray-500 hover:underline w-full"
                  onClick={() => setShowReset(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
            ¿Por qué registrar tu negocio con nosotros?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Más Clientes</h4>
              <p className="text-gray-600 text-sm">
                Conecta directamente con turistas y locales interesados
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
