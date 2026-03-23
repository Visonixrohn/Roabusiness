import { useEffect, useState } from "react";
import MultiCategorySelect from "@/components/MultiCategorySelect";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import CountrySelector from "@/components/CountrySelector";
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
  Star,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import RegisterBusinessModalAdmin from "@/components/RegisterBusinessModalAdmin";
import { StarRating } from "@/components/StarRating";
import { useRatings } from "@/hooks/useRatings";
import { useFinancial } from "@/hooks/useFinancial";
import Receipt from "@/components/Receipt";
import type { PaymentReceipt, SubscriptionPlan } from "@/types/financial";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import {
  departamentos,
  getMunicipiosByDepartamento,
} from "@/data/hondurasLocations";
import {
  getSubscriptionExpirationDate,
  isSubscriptionActive,
  getBusinessStatus,
} from "@/lib/subscription";

interface Business {
  id: string;
  name: string;
  profile_name?: string;
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
  pago?: "ejecutado" | "sin pagar";
  paypal_order_id?: string | null;
  paypal_payer_name?: string | null;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  tripadvisor?: string;
}

// Componente interno para mostrar calificaciones de un negocio
const BusinessRatingDisplay = ({ businessId }: { businessId: string }) => {
  const { average, totalRatings, loading } = useRatings(businessId);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <Star className="h-4 w-4" />
        <span>Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={average || 0} readOnly size={16} showValue={false} />
      <span className="text-sm font-medium text-gray-700">
        {average ? average.toFixed(1) : "0.0"}
      </span>
      <span className="text-xs text-gray-500">({totalRatings})</span>
    </div>
  );
};

interface EditFormData {
  name: string;
  profile_name: string;
  category: string;
  categories: string[];
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
  google_maps_url: string;
  priceRange: string;
  amenities: string[];
  coverImage: string;
  logo: string;
  is_public: boolean;
  subscriptionMonths: number;
  pago: "ejecutado" | "sin pagar";
  graceDays: number;
  pais: string;
}

/** Extrae lat/lng de una URL de Google Maps pegada por el usuario */
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
    profile_name: "",
    category: "",
    categories: [],
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
    google_maps_url: "",
    priceRange: "",
    amenities: [],
    coverImage: "",
    logo: "",
    is_public: true,
    subscriptionMonths: 1,
    pago: "sin pagar",
    graceDays: 7,
    pais: "Honduras",
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
  const [mapCenter, setMapCenter] = useState(GOOGLE_MAPS_CONFIG.defaultCenter);
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [locationInputMode, setLocationInputMode] = useState<"map" | "url">(
    "map",
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<PaymentReceipt | null>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedBusinessForRenewal, setSelectedBusinessForRenewal] =
    useState<Business | null>(null);
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] =
    useState<string>("");
  const [renewalPaymentMethod, setRenewalPaymentMethod] =
    useState<string>("efectivo");
  const [renewalReceipt, setRenewalReceipt] = useState<PaymentReceipt | null>(
    null,
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const { processBusinessPayment, renovarSuscripcion, fetchSubscriptionPlans } =
    useFinancial();
  const [municipios, setMunicipios] = useState<string[]>([]);

  useEffect(() => {
    fetchBusinesses();
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    const plansData = await fetchSubscriptionPlans();
    setPlans(plansData);
  };

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
    const loadedCategories: string[] =
      (business as any).categories && (business as any).categories.length > 0
        ? (business as any).categories
        : business.category
          ? [business.category]
          : [];
    setEditForm({
      name: business.name || "",
      profile_name: (business as any).profile_name || "",
      category: business.category || "",
      categories: loadedCategories,
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
      google_maps_url: (business as any).google_maps_url || "",
      priceRange: business.price_range || business.priceRange || "",
      amenities: business.amenities || [],
      coverImage: business.cover_image || business.coverImage || "",
      logo: business.logo || "",
      is_public: business.is_public !== false,
      subscriptionMonths:
        business.subscription_months && business.subscription_months > 0
          ? business.subscription_months
          : 1,
      pago: business.pago || "sin pagar",
      graceDays: 7,
      pais: (business as any).pais || "Honduras",
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
      // Eliminar registros relacionados antes de borrar el negocio
      await supabase.from("views").delete().eq("business_id", id);
      await supabase.from("likes").delete().eq("business_id", id);
      await supabase.from("comments").delete().eq("business_id", id);
      await supabase.from("followers").delete().eq("business_id", id);
      await supabase.from("calificaciones").delete().eq("business_id", id);
      await supabase.from("posts").delete().eq("business_id", id);
      await supabase.from("gallery").delete().eq("business_id", id);
      await supabase.from("amenities").delete().eq("business_id", id);
      await supabase.from("transactions").delete().eq("business_id", id);
      await supabase.from("subscription_history").delete().eq("business_id", id);

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
      // Validar que profile_name no esté duplicado (si cambió)
      if (
        editForm.profile_name &&
        editForm.profile_name !== (selectedBusiness as any).profile_name
      ) {
        const { data: existingBusiness } = await supabase
          .from("businesses")
          .select("id")
          .eq("profile_name", editForm.profile_name)
          .neq("id", selectedBusiness.id)
          .single();

        if (existingBusiness) {
          toast.error(
            `El nombre de perfil @${editForm.profile_name} ya está en uso. Por favor elige otro.`,
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Payload en camelCase
      const payloadCamel = {
        name: editForm.name,
        profile_name: editForm.profile_name || null,
        category: editForm.categories[0] || editForm.category,
        categories: editForm.categories,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        pais: editForm.pais || "Honduras",
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
          google_maps_url: editForm.google_maps_url,
        },
        // Redes sociales como columnas individuales
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        google_maps_url: editForm.google_maps_url || null,
        priceRange: editForm.priceRange,
        amenities: editForm.amenities,
        coverImage: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
        pago: editForm.pago,
      };

      // Payload en snake_case como fallback
      const payloadSnake = {
        name: editForm.name,
        profile_name: editForm.profile_name || null,
        category: editForm.categories[0] || editForm.category,
        categories: editForm.categories,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        pais: editForm.pais || "Honduras",
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
          google_maps_url: editForm.google_maps_url,
        },
        // Redes sociales como columnas individuales
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        google_maps_url: editForm.google_maps_url || null,
        price_range: editForm.priceRange,
        amenities: editForm.amenities,
        cover_image: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
        pago: editForm.pago,
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
        const msg = String(err?.message || err).toLowerCase();
        if (
          msg.includes("cover_image") ||
          msg.includes("coverimage") ||
          msg.includes("google_maps_url") ||
          msg.includes("could not find") ||
          msg.includes("schema cache") ||
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
      profile_name: "",
      category: "",
      categories: [],
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
      google_maps_url: "",
      priceRange: "",
      amenities: [],
      coverImage: "",
      logo: "",
      is_public: true,
      subscriptionMonths: 1,
      pago: "sin pagar",
      graceDays: 7,
      pais: "Honduras",
    });
    setMapCenter(islandCenters["Roatán"]);
    setShowRegisterModal(true);
  };

  const handleSubmitRegister = async () => {
    if (
      !editForm.name ||
      editForm.categories.length === 0 ||
      !editForm.departamento
    ) {
      toast.error(
        "Por favor, completa los campos obligatorios (nombre, categoría y departamento)",
      );
      return;
    }

    // Validar plan de suscripción SOLO si el pago es "ejecutado"
    if (editForm.pago === "ejecutado" && editForm.subscriptionMonths <= 0) {
      toast.error("Por favor, selecciona un plan de suscripción válido");
      return;
    }

    setIsSubmitting(true);
    try {
      // Validar que profile_name no esté duplicado
      if (editForm.profile_name) {
        const { data: existingBusiness } = await supabase
          .from("businesses")
          .select("id")
          .eq("profile_name", editForm.profile_name)
          .single();

        if (existingBusiness) {
          toast.error(
            `El nombre de perfil @${editForm.profile_name} ya está en uso. Por favor elige otro.`,
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Configuración según estado de pago
      const isPaid = editForm.pago === "ejecutado";

      // Construir payload base
      const basePayload = {
        name: editForm.name,
        profile_name: editForm.profile_name || null,
        category: editForm.categories[0] || editForm.category,
        categories: editForm.categories,
        departamento: editForm.departamento,
        municipio: editForm.municipio,
        colonia: editForm.colonia || null,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        subscription_months: editForm.subscriptionMonths,
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
          google_maps_url: editForm.google_maps_url,
        },
        facebook: editForm.facebook || null,
        instagram: editForm.instagram || null,
        twitter: editForm.twitter || null,
        tiktok: editForm.tiktok || null,
        tripadvisor: editForm.tripadvisor || null,
        google_maps_url: editForm.google_maps_url || null,
        priceRange: editForm.priceRange,
        amenities: editForm.amenities,
        coverImage: editForm.coverImage,
        logo: editForm.logo,
        is_public: editForm.is_public,
        pago: editForm.pago,
      };

      // Si es PAGO EJECUTADO: registrar con suscripción activa
      if (isPaid) {
        const payloadPaid = {
          ...basePayload,
          subscription_started_at: new Date().toISOString(),
          grace_period_expires: null,
        };

        // Insertar negocio
        const { data: newBusiness, error: insertError } = await supabase
          .from("businesses")
          .insert([payloadPaid])
          .select()
          .single();

        if (insertError) throw insertError;

        // Obtener precio del plan
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("price_lempiras")
          .eq("months", editForm.subscriptionMonths)
          .single();

        if (!plan) {
          toast.warning("Negocio registrado pero no se encontró el plan");
          setShowRegisterModal(false);
          fetchBusinesses();
          return;
        }

        // Procesar pago y generar recibo
        const receipt = await processBusinessPayment({
          business_id: newBusiness.id,
          plan_months: editForm.subscriptionMonths,
          amount_paid: plan.price_lempiras,
          payment_method: "efectivo",
          created_by: "admin",
        });

        if (receipt) {
          // Agregar datos de contacto al recibo
          const fullReceipt = {
            ...receipt,
            businessContact: {
              email: editForm.email,
              phone: editForm.phones.filter((p) => p.trim())[0],
            },
          };
          setReceiptData(fullReceipt as any);
          setShowReceiptModal(true);
        }

        toast.success("Negocio registrado y pago procesado exitosamente");
        setShowRegisterModal(false);
        fetchBusinesses();
      } else {
        // Si es SIN PAGAR: registrar con período de gracia
        const gracePeriodExpires = new Date();
        gracePeriodExpires.setDate(
          gracePeriodExpires.getDate() + editForm.graceDays,
        );

        const payloadUnpaid = {
          ...basePayload,
          subscription_months: 0, // Establecer a 0 para negocios sin pagar
          subscription_started_at: null,
          grace_period_expires: gracePeriodExpires.toISOString(),
        };

        const { error: insertError } = await supabase
          .from("businesses")
          .insert([payloadUnpaid]);

        if (insertError) throw insertError;

        toast.success(
          `Negocio registrado con ${editForm.graceDays} días de período de gracia. ` +
            `Se ocultará automáticamente el ${gracePeriodExpires.toLocaleDateString("es-HN")} si no se registra el pago.`,
          { duration: 6000 },
        );
        setShowRegisterModal(false);
        fetchBusinesses();
      }
    } catch (error: any) {
      console.error("Error al registrar negocio:", error);
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
    // Abrir modal de renovación prellenando el negocio seleccionado
    setSelectedBusinessForRenewal(business);

    // Intentar encontrar el plan correspondiente
    const plan = plans.find((p) => p.months === business.subscription_months);

    if (plan) {
      setSelectedPlanForRenewal(plan.id.toString());
    } else {
      setSelectedPlanForRenewal("");
    }

    setRenewalPaymentMethod("efectivo");
    setShowRenewModal(true);
  };

  const handleProcessRenewal = async () => {
    if (!selectedBusinessForRenewal || !selectedPlanForRenewal) {
      toast.error("Por favor selecciona un negocio y un plan");
      return;
    }

    const plan = plans.find((p) => p.id === parseInt(selectedPlanForRenewal));
    if (!plan) {
      toast.error("Plan no encontrado");
      return;
    }

    const receipt = await renovarSuscripcion({
      business_id: selectedBusinessForRenewal.id,
      new_months: plan.months,
      amount_paid: plan.price_lempiras,
      payment_method: renewalPaymentMethod,
      admin_user: "admin",
    });

    if (receipt) {
      setRenewalReceipt(receipt);
      setShowRenewModal(false);
      setSelectedBusinessForRenewal(null);
      setSelectedPlanForRenewal("");
      setRenewalPaymentMethod("efectivo");
      fetchBusinesses();
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Link>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-6 w-6 opacity-80" />
                <h1 className="text-2xl font-bold">Gestionar Negocios</h1>
              </div>
              <p className="text-blue-100 text-sm">
                Administra todos los negocios registrados en la plataforma
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => navigate("/financial")}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white flex items-center gap-2 text-sm"
              >
                <DollarSign className="h-4 w-4" />
                Panel Financiero
              </Button>
              <Button
                onClick={handleOpenRegisterModal}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Nuevo Negocio
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`group text-left rounded-xl border-2 p-5 bg-white shadow-sm transition-all hover:shadow-md ${
              filterStatus === "all"
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-100 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              {filterStatus === "all" && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-gray-900 mb-0.5">
              {businesses.length}
            </p>
            <p className="text-xs text-gray-500 font-medium">Total negocios</p>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("active")}
            className={`group text-left rounded-xl border-2 p-5 bg-white shadow-sm transition-all hover:shadow-md ${
              filterStatus === "active"
                ? "border-green-500 ring-2 ring-green-200"
                : "border-gray-100 hover:border-green-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              {filterStatus === "active" && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-green-600 mb-0.5">
              {activeBusinessesCount}
            </p>
            <p className="text-xs text-gray-500 font-medium">Negocios activos</p>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("inactive")}
            className={`group text-left rounded-xl border-2 p-5 bg-white shadow-sm transition-all hover:shadow-md ${
              filterStatus === "inactive"
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-100 hover:border-red-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              {filterStatus === "inactive" && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-red-500 mb-0.5">
              {inactiveBusinessesCount}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Negocios inactivos
            </p>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">Filtros</span>
            {(searchTerm || filterDepartamento || filterCategory || filterStatus !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartamento("");
                  setFilterCategory("");
                  setFilterStatus("all");
                }}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Limpiar todo
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Buscar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Buscar negocio..."
              />
            </div>

            {/* Departamento - de negocios registrados */}
            <select
              value={filterDepartamento}
              onChange={(e) => setFilterDepartamento(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
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

            {/* Categoría - de negocios registrados */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
            >
              <option value="">Todas las categorías</option>
              {Array.from(
                new Set(
                  businesses
                    .map((b) => b.category)
                    .filter(Boolean),
                ),
              )
                .sort()
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>

            {/* Estado */}
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Lista de negocios */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-500 text-sm">Cargando negocios...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Building className="h-10 w-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No se encontraron negocios
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || filterDepartamento || filterCategory || filterStatus !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza registrando el primer negocio"}
            </p>
            {(searchTerm || filterDepartamento || filterCategory || filterStatus !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartamento("");
                  setFilterCategory("");
                  setFilterStatus("all");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
            {businesses.length === 0 && (
              <Button
                onClick={handleOpenRegisterModal}
                className="bg-blue-600 hover:bg-blue-700 mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primer Negocio
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">
                  {filteredBusinesses.length}
                </span>{" "}
                de {businesses.length} negocios
              </p>
              <button
                type="button"
                onClick={fetchBusinesses}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Actualizar
              </button>
            </div>

            <div className="space-y-3">
              {filteredBusinesses.map((business) => {
                const status = getBusinessStatus(business);
                const isActive = isSubscriptionActive(business);
                const statusColor = isActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : status.status === "grace_period"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-600 border-red-200";
                const statusLabel =
                  status.status === "grace_period"
                    ? `Gracia · ${status.daysRemaining}d`
                    : isActive
                      ? "Activo"
                      : "Vencido";

                return (
                  <div
                    key={business.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* Barra lateral de estado */}
                      <div
                        className={`w-1.5 flex-shrink-0 ${
                          isActive
                            ? "bg-green-500"
                            : status.status === "grace_period"
                              ? "bg-amber-400"
                              : "bg-red-400"
                        }`}
                      />

                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            <img
                              src={
                                business.logo ||
                                business.cover_image ||
                                "https://via.placeholder.com/64"
                              }
                              alt={business.name}
                              className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
                            />
                          </div>

                          {/* Info principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h3 className="text-base font-bold text-gray-900 truncate">
                                {business.name}
                              </h3>
                              <span
                                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}
                              >
                                {statusLabel}
                              </span>
                              {!business.is_public && (
                                <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Oculto
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                              {business.category && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                  {business.category}
                                </span>
                              )}
                              {(business.departamento || business.island) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  {business.departamento || business.island}
                                  {business.municipio && `, ${business.municipio}`}
                                </span>
                              )}
                              {business.contact?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  {business.contact.email}
                                </span>
                              )}
                              {business.contact?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  {business.contact.phone}
                                </span>
                              )}
                              {status.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  Vence:{" "}
                                  {status.expiryDate.toLocaleDateString("es-HN")}
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="mb-1">
                              <BusinessRatingDisplay businessId={business.id} />
                            </div>

                            {/* PayPal Info */}
                            {(business.paypal_order_id || business.paypal_payer_name) && (
                              <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                                {business.paypal_order_id && (
                                  <span>
                                    <span className="font-semibold text-blue-500">
                                      PayPal:
                                    </span>{" "}
                                    <span className="font-mono">
                                      {business.paypal_order_id}
                                    </span>
                                  </span>
                                )}
                                {business.paypal_payer_name && (
                                  <span>
                                    <span className="font-semibold text-blue-500">
                                      Pagador:
                                    </span>{" "}
                                    {business.paypal_payer_name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Acciones */}
                          <div className="flex sm:flex-col gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => togglePublic(business)}
                              title={
                                business.is_public
                                  ? "Ocultar negocio"
                                  : "Publicar negocio"
                              }
                              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                                business.is_public
                                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {business.is_public ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" /> Ocultar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" /> Publicar
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRenewSubscription(business)}
                              title="Renovar suscripción"
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Renovar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(business)}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" /> Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(business.id, business.name)
                              }
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
                    Nombre de Perfil (@nombre)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      @
                    </span>
                    <input
                      type="text"
                      value={editForm.profile_name}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "");
                        setEditForm({ ...editForm, profile_name: value });
                      }}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="tunombre"
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enlace único: @{editForm.profile_name || "tunombre"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría(s) *
                  </label>
                  <MultiCategorySelect
                    categories={categories}
                    selected={editForm.categories}
                    onChange={(cats) =>
                      setEditForm({
                        ...editForm,
                        categories: cats,
                        category: cats[0] || "",
                      })
                    }
                    onCreateCategory={createCategory}
                    creating={creatingCategory}
                    placeholder="Selecciona una o más categorías"
                  />
                  {editForm.categories.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Selecciona al menos una categoría
                    </p>
                  )}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <CountrySelector
                    value={editForm.pais || "Honduras"}
                    onChange={(v) => setEditForm({ ...editForm, pais: v })}
                    compact
                  />
                </div>

                <div className="md:col-span-2">
                  {/* Encabezado con badges de estado */}
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Ubicación{" "}
                      <span className="text-xs font-normal text-gray-400">
                        (opcional)
                      </span>
                    </p>
                    {editForm.latitude != null && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Coordenadas
                      </span>
                    )}
                    {editForm.google_maps_url && (
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
                        Haz clic en el mapa para actualizar la ubicación exacta.
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
                            editForm.latitude == null ||
                            editForm.longitude == null
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
                          <Navigation className="h-4 w-4 mr-1" /> Ver en Google
                          Maps
                        </Button>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-300">
                        <GoogleMap
                          mapContainerStyle={{ width: "100%", height: "280px" }}
                          center={
                            editForm.latitude != null &&
                            editForm.longitude != null
                              ? {
                                  lat: editForm.latitude,
                                  lng: editForm.longitude,
                                }
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
                            styles:
                              mapType === "roadmap"
                                ? GOOGLE_MAPS_CONFIG.cleanMapStyle
                                : undefined,
                            mapTypeControl: false,
                            streetViewControl: false,
                            clickableIcons: false,
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
                      {editForm.latitude != null && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Coordenadas:{" "}
                            {editForm.latitude.toFixed(5)},{" "}
                            {editForm.longitude?.toFixed(5)}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:underline"
                            onClick={() =>
                              setEditForm({
                                ...editForm,
                                latitude: null,
                                longitude: null,
                              })
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
                          value={editForm.google_maps_url}
                          onChange={(e) => {
                            const val = e.target.value;
                            const coords = val ? parseGoogleMapsUrl(val) : null;
                            setEditForm({
                              ...editForm,
                              google_maps_url: val,
                              ...(coords
                                ? {
                                    latitude: coords.lat,
                                    longitude: coords.lng,
                                  }
                                : {}),
                            });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://maps.google.com/..."
                        />
                        {editForm.latitude != null &&
                          editForm.longitude != null && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap"
                              onClick={() => {
                                const url = `https://www.google.com/maps/search/?api=1&query=${editForm.latitude},${editForm.longitude}`;
                                setEditForm({
                                  ...editForm,
                                  google_maps_url: url,
                                });
                                toast.success("URL generada desde el mapa");
                              }}
                            >
                              <MapPin className="h-4 w-4 mr-1" /> Desde mapa
                            </Button>
                          )}
                      </div>
                      {editForm.google_maps_url && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            onClick={() =>
                              window.open(editForm.google_maps_url, "_blank")
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
        setEditForm={(form: EditFormData) => setEditForm(form)}
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
        onCreateCategory={createCategory}
        creatingCategory={creatingCategory}
      />

      {/* Modal de Recibo */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <Receipt
              transactionId={receiptData.transaction_id}
              businessName={receiptData.business_name}
              profileName={receiptData.profile_name}
              planMonths={receiptData.plan_months}
              amountPaid={receiptData.amount_paid}
              paymentMethod={receiptData.payment_method}
              paymentDate={receiptData.payment_date}
              expiresAt={receiptData.expires_at}
              wasGracePeriod={receiptData.was_grace_period}
              businessContact={(receiptData as any).businessContact}
            />
          </div>
        </div>
      )}

      {/* Modal: Renovar Suscripción */}
      {showRenewModal && selectedBusinessForRenewal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Renovar Suscripción</h3>
              <button onClick={() => setShowRenewModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Si el negocio tiene suscripción activa,
                  los nuevos meses se sumarán a los días restantes.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Negocio
                </label>
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-50">
                  {selectedBusinessForRenewal.name}
                  {selectedBusinessForRenewal.profile_name
                    ? ` (@${selectedBusinessForRenewal.profile_name})`
                    : ""}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Plan de Suscripción *
                </label>
                <select
                  value={selectedPlanForRenewal}
                  onChange={(e) => setSelectedPlanForRenewal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Selecciona un plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.months} meses - L{" "}
                      {plan.price_lempiras.toLocaleString("es-HN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {plan.description && ` (${plan.description})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Método de Pago *
                </label>
                <select
                  value={renewalPaymentMethod}
                  onChange={(e) => setRenewalPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="deposito">Depósito</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {selectedPlanForRenewal && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Resumen:</strong>
                    <br />
                    Negocio: {selectedBusinessForRenewal.name}
                    <br />
                    Plan:{" "}
                    {
                      plans.find(
                        (p) => p.id === parseInt(selectedPlanForRenewal),
                      )?.months
                    }{" "}
                    meses
                    <br />
                    Monto: L{" "}
                    {(
                      plans.find(
                        (p) => p.id === parseInt(selectedPlanForRenewal),
                      )?.price_lempiras || 0
                    ).toLocaleString("es-HN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRenewModal(false);
                    setSelectedBusinessForRenewal(null);
                    setSelectedPlanForRenewal("");
                    setRenewalPaymentMethod("efectivo");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleProcessRenewal}
                  className="flex-1"
                  disabled={!selectedPlanForRenewal}
                >
                  Procesar Renovación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recibo de Renovación */}
      {renewalReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl my-4">
            <button
              onClick={() => setRenewalReceipt(null)}
              className="sticky top-2 float-right mr-2 mt-2 z-10 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 print:hidden"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="clear-both">
              <Receipt
                transactionId={renewalReceipt.transaction_id}
                businessName={renewalReceipt.business_name}
                profileName={renewalReceipt.profile_name}
                planMonths={renewalReceipt.plan_months}
                amountPaid={renewalReceipt.amount_paid}
                paymentMethod={renewalReceipt.payment_method}
                paymentDate={renewalReceipt.payment_date}
                expiresAt={renewalReceipt.expires_at}
                wasGracePeriod={renewalReceipt.was_grace_period}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBusinessPage;
