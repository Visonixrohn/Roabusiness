import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type React from "react";
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
  Clock,
  CreditCard,
  MessageCircle,
  Banknote,
  BadgeCheck,
  Star,
  Loader2,
  CheckCircle2,
  ChevronRight,
  LocateFixed,
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { useFinancial } from "@/hooks/useFinancial";
import { SubscriptionPlan } from "@/types/financial";
import MultiCategorySelect from "@/components/MultiCategorySelect";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import {
  departamentos,
  getMunicipiosByDepartamento,
} from "@/data/hondurasLocations";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import CountrySelector from "@/components/CountrySelector";

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

const TOTAL_FORM_STEPS = 5;

const FORM_STEP_INFO = [
  { number: 1, title: "Información básica" },
  { number: 2, title: "Ubicación" },
  { number: 3, title: "Datos del negocio" },
  { number: 4, title: "Presencia digital" },
  { number: 5, title: "Imágenes" },
];

// PayPal Producción
const PAYPAL_CLIENT_ID =
  "AQjVTE_oV6OIdDHscyUvDBeEoZRZHja32v3jQ31-HiMJWYa6Vb4JbjyQJupC7YfoIx7MAgpVl-nvJ121";
const HNL_TO_USD = 0.04;

// Transferencia bancaria
const BANK_OWNER = "MIGUEL ANGEL ROMERO GUILLEN";
const BANK_ACCOUNT = "751781611";
const WHATSAPP_NUMBER = "50488857653";

const PublicBusinessRegistrationPage = () => {
  // ─── Flujo principal ─────────────────────────────────────────────────────
  type AppStep =
    | "method" // Elegir método de pago
    | "plan" // Elegir plan (PayPal path & Transfer path)
    | "form" // Formulario completo (PayPal path)
    | "paypal-pay" // Pago con PayPal
    | "paypal-success" // Éxito PayPal → datos enviados
    | "transfer-info"; // Transferencia: nombre + banco + WhatsApp

  const [appStep, setAppStep] = useState<AppStep>("method");
  const [payMethod, setPayMethod] = useState<"paypal" | "transfer">("paypal");
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Planes ──────────────────────────────────────────────────────────────
  const { fetchSubscriptionPlans } = useFinancial();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  // ─── Formulario ──────────────────────────────────────────────────────────
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [locationMode, setLocationMode] = useState<"map" | "url">("map");
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no soporta geolocalización");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setMapCenter({ lat, lng });
        setGpsLoading(false);
        toast.success("¡Ubicación detectada!");
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED)
          toast.error(
            "Permiso de ubicación denegado. Actívalo en tu navegador.",
          );
        else toast.error("No se pudo obtener tu ubicación. Intenta de nuevo.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const [mapCenter, setMapCenter] = useState(GOOGLE_MAPS_CONFIG.defaultCenter);
  const [urlInput, setUrlInput] = useState("");

  const {
    categories,
    creating: creatingCategory,
    createCategory,
  } = useCategories();

  const [formData, setFormData] = useState({
    name: "",
    profile_name: "",
    categories: [] as string[],
    pais: "Honduras",
    departamento: "",
    municipio: "",
    colonia: "",
    latitude: null as number | null,
    longitude: null as number | null,
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

  // Para transferencia: solo nombre del negocio
  const [transferName, setTransferName] = useState("");

  const islandCenters: Record<string, { lat: number; lng: number }> = {
    Roatán: { lat: 16.3156, lng: -86.5889 },
    Utila: { lat: 16.1, lng: -86.9 },
    Guanaja: { lat: 16.45, lng: -85.9 },
    "Jose Santos Guardiola": { lat: 16.36, lng: -86.35 },
  };

  // ─── Cargar planes cuando se llega a la pantalla de planes ───────────────
  useEffect(() => {
    if (appStep === "plan") {
      setPlansLoading(true);
      fetchSubscriptionPlans().then((data) => {
        setPlans(data);
        setPlansLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStep]);

  // ─── Helpers formulario ───────────────────────────────────────────────────
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "departamento") {
      setMunicipios(getMunicipiosByDepartamento(value));
      setFormData((prev) => ({ ...prev, municipio: "", departamento: value }));
      if (islandCenters[value]) setMapCenter(islandCenters[value]);
    }
    if (field === "pais") {
      setFormData((prev) => ({
        ...prev,
        pais: value,
        departamento: "",
        municipio: "",
      }));
      setMunicipios([]);
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const updated = [...formData.phones];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, phones: updated }));
  };

  const addPhone = () =>
    setFormData((prev) => ({ ...prev, phones: [...prev.phones, ""] }));

  const removePhone = (index: number) => {
    if (formData.phones.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  const validateFormStep = (step: number): boolean => {
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

  const nextFormStep = () => {
    if (validateFormStep(formStep)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (formStep < TOTAL_FORM_STEPS) {
        setFormStep((p) => p + 1);
      } else {
        // Terminó el formulario → ir a pago PayPal
        setAppStep("paypal-pay");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Por favor completa todos los campos obligatorios");
    }
  };

  const prevFormStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (formStep > 1) {
      setFormStep((p) => p - 1);
    } else {
      setAppStep("plan");
    }
  };

  // ─── Generar profile_name único ───────────────────────────────────────────
  const resolveUniqueProfileName = async (base: string): Promise<string> => {
    const cleanBase = base.slice(0, 38);
    const { data: first } = await supabase
      .from("businesses")
      .select("id")
      .eq("profile_name", cleanBase)
      .maybeSingle();
    if (!first) return cleanBase;
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

  // ─── Construir payload y enviar a DB ────────────────────────────────────
  const submitBusinessPayPal = async (
    paypalOrderId: string,
    payerName?: string,
    payerEmail?: string,
  ) => {
    setIsSubmitting(true);
    try {
      const base =
        formData.name
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
        pais: formData.pais || "Honduras",
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
        is_public: false,
        pago: "ejecutado",
        paypal_order_id: paypalOrderId,
        paypal_payer_name: payerName || null,
        subscription_months: selectedPlan!.months,
        subscription_started_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from("businesses")
        .insert([payload])
        .select("id")
        .single();
      if (error) throw error;

      // Llamar al webhook de Google Apps Script para enviar factura por email
      const GAS_WEBHOOK =
        "https://script.google.com/macros/s/AKfycbyPKjRbqofGvCCdmZJGfMNYG3IFXJ7m7AkPpcHiIUTgYBoUo9oQ82tnD4RBFW1qaiagLg/exec";
      if (inserted?.id && formData.email) {
        fetch(GAS_WEBHOOK, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            business_id: inserted.id,
            paypal_order_id: paypalOrderId,
            payer_name: payerName ?? "",
            payer_email: payerEmail ?? formData.email,
            business_name: formData.name,
            plan_months: selectedPlan!.months,
            plan_price: selectedPlan!.price_lempiras,
            email: formData.email,
          }),
        })
          .then(() =>
            console.log("[GAS] Datos de factura enviados correctamente"),
          )
          .catch(() => {}); // no bloqueante
      }

      setAppStep("paypal-success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(
        "Error al guardar el negocio: " + (err?.message || "Intenta de nuevo."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Transferencia: registro mínimo + WhatsApp ───────────────────────────
  const handleTransferWhatsApp = async () => {
    if (!selectedPlan) {
      toast.error("Selecciona un plan primero");
      return;
    }
    if (!transferName.trim()) {
      toast.error("Ingresa el nombre de tu negocio");
      return;
    }
    const lines = [
      `Hola, quiero registrar mi negocio y notificar mi pago 🏢`,
      ``,
      `🏢 *Negocio:* ${transferName}`,
      `📦 *Plan:* ${selectedPlan.months === 1 ? "1 mes" : `${selectedPlan.months} meses`}`,
      `💵 *Monto:* $ ${selectedPlan.price_lempiras.toLocaleString("en-US")}`,
      ``,
      `📌 Pago enviado por transferencia bancaria – pendiente de comprobante.`,
      ``,
      `Por favor confirmar recepción. ¡Gracias!`,
    ];
    const message = lines.join("\n");
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  // ─── Estilos reutilizables ────────────────────────────────────────────────
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

  /* ═══════════════════ PANTALLA: Selección método de pago ════════════════ */
  const renderMethodScreen = () => (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Registrar tu negocio
          </h1>
          <p className="text-sm text-gray-500">
            Únete al directorio de las Islas de la Bahía
          </p>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-4">
        ¿Cómo deseas realizar el pago?
      </p>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* PayPal */}
        <button
          type="button"
          onClick={() => {
            setPayMethod("paypal");
            setPayMethod("paypal");
          }}
          className={`flex items-center gap-5 rounded-2xl border-2 p-5 text-left transition-all duration-200
            ${payMethod === "paypal" ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300"}`}
        >
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${payMethod === "paypal" ? "bg-[#003087]" : "bg-gray-100"}`}
          >
            <CreditCard
              className={`h-6 w-6 ${payMethod === "paypal" ? "text-white" : "text-gray-500"}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">Pago en línea con PayPal</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Llena el formulario completo con toda la información de tu negocio
              e imágenes. El negocio se publica al confirmar el pago.
            </p>
          </div>
          {payMethod === "paypal" && (
            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
          )}
        </button>

        {/* Transferencia */}
        <button
          type="button"
          onClick={() => setPayMethod("transfer")}
          className={`flex items-center gap-5 rounded-2xl border-2 p-5 text-left transition-all duration-200
            ${payMethod === "transfer" ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300"}`}
        >
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${payMethod === "transfer" ? "bg-blue-600" : "bg-gray-100"}`}
          >
            <Banknote
              className={`h-6 w-6 ${payMethod === "transfer" ? "text-white" : "text-gray-500"}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">Transferencia bancaria</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Selecciona tu plan, realiza la transferencia y notifica al
              administrador por WhatsApp. Él activará tu negocio.
            </p>
          </div>
          {payMethod === "transfer" && (
            <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setAppStep("plan")}
        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-colors"
      >
        Continuar
        <ChevronRight className="h-5 w-5" />
      </button>

      <a
        href="https://wa.me/50488857653?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20c%C3%B3mo%20registrar%20mi%20negocio"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.517 5.849L.057 23.882l6.204-1.429A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.498-5.2-1.37l-.373-.214-3.862.888.923-3.747-.241-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
        Consultar por WhatsApp
      </a>
    </div>
  );

  /* ═══════════════════ PANTALLA: Selección de plan ════════════════════════ */
  const getBadgeLabel = (months: number) => {
    if (months >= 12) return "Mejor valor";
    if (months >= 6) return "Recomendado";
    return null;
  };

  const getPricePerMonth = (plan: SubscriptionPlan) =>
    plan.months > 1
      ? `$ ${Math.round(plan.price_lempiras / plan.months).toLocaleString("en-US")}/mes`
      : null;

  const renderPlanScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/40">
      {/* ── Barra superior ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={() => setAppStep("method")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
      </div>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 px-6 pt-10 pb-14 text-center">
        {/* Círculos decorativos de fondo */}
        <span className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
        <span className="absolute -bottom-12 -right-8 w-56 h-56 rounded-full bg-orange-600/10" />
        <span className="absolute top-4 right-8 w-20 h-20 rounded-full bg-yellow-200/30" />

        {/* Icono */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm shadow-lg mb-4 ring-2 ring-white/40">
          <Star className="h-8 w-8 text-white fill-white drop-shadow" />
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
          Elige tu plan
        </h2>
        <p className="text-sm font-medium text-yellow-100 mt-1.5">
          {payMethod === "paypal"
            ? "💳 Pago en línea con PayPal"
            : "🏦 Pago por transferencia bancaria"}
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            "Sin contratos",
            
            "Activación Verificada",
          ].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full border border-white/30"
            >
              <Check className="h-3 w-3" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="max-w-lg mx-auto px-4 -mt-6 pb-32">
        {plansLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <span className="text-sm font-medium">Cargando planes...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-sm text-amber-700 shadow-sm">
            No hay planes disponibles. Contacta al administrador.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {plans.map((plan) => {
              const badge = getBadgeLabel(plan.months);
              const pricePerMonth = getPricePerMonth(plan);
              const isSelected = selectedPlan?.id === plan.id;
              const isGold = plan.months >= 12;
              const isMid = plan.months >= 6 && plan.months < 12;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative w-full text-left rounded-3xl border-2 overflow-hidden transition-all duration-200 focus:outline-none
                    ${
                      isSelected
                        ? "border-amber-400 shadow-[0_8px_32px_rgba(245,158,11,0.30)] scale-[1.01]"
                        : isGold
                          ? "border-yellow-200 hover:border-amber-300 hover:shadow-lg"
                          : isMid
                            ? "border-blue-100 hover:border-blue-300 hover:shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                >
                  {/* Fondo de tarjeta */}
                  <div
                    className="absolute inset-0"
                    style={
                      isSelected
                        ? {
                            background:
                              "linear-gradient(135deg,#fffbeb 0%,#fef3c7 50%,#fde68a 100%)",
                          }
                        : isGold
                          ? {
                              background:
                                "linear-gradient(135deg,#fffdf5 0%,#fef9c3 100%)",
                            }
                          : isMid
                            ? {
                                background:
                                  "linear-gradient(135deg,#f8faff 0%,#eff6ff 100%)",
                              }
                            : { background: "#ffffff" }
                    }
                  />

                  {/* Destellos gold */}
                  {isGold && (
                    <>
                      <span
                        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-15"
                        style={{
                          background:
                            "radial-gradient(circle,#f59e0b,transparent)",
                        }}
                      />
                      <span
                        className="absolute bottom-0 left-0 w-36 h-16 opacity-10"
                        style={{
                          background:
                            "radial-gradient(ellipse,#d97706,transparent)",
                        }}
                      />
                    </>
                  )}

                  {/* Contenido */}
                  <div className="relative p-5">
                    {/* Badge superior */}
                    {badge && (
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full
                          ${
                            isGold
                              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                          }`}
                        >
                          ✦ {badge}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      {/* Lado izquierdo: duración + descripción */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl shadow-sm
                          ${
                            isSelected
                              ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                              : isGold
                                ? "bg-gradient-to-br from-yellow-300 to-amber-400"
                                : isMid
                                  ? "bg-gradient-to-br from-blue-400 to-blue-500"
                                  : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }`}
                        >
                          <Clock
                            className={`h-5 w-5 ${isSelected || isGold || isMid ? "text-white" : "text-gray-500"}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-lg font-black leading-tight truncate
                            ${isSelected ? "text-amber-900" : isGold ? "text-amber-800" : isMid ? "text-blue-900" : "text-gray-900"}`}
                          >
                            {plan.months === 1
                              ? "1 mes"
                              : `${plan.months} meses`}
                          </p>
                          {plan.description && (
                            <p
                              className={`text-xs mt-0.5 leading-snug truncate
                              ${isSelected ? "text-amber-700" : "text-gray-500"}`}
                            >
                              {plan.description}
                            </p>
                          )}
                          {pricePerMonth && (
                            <p
                              className={`text-[11px] font-semibold mt-0.5
                              ${isSelected ? "text-amber-600" : "text-gray-400"}`}
                            >
                              ≈ {pricePerMonth}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Lado derecho: precio */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-wide mb-0.5
                          ${isSelected ? "text-amber-600" : "text-gray-400"}`}
                        >
                          Precio
                        </p>
                        <p
                          className={`text-2xl font-black leading-none
                          ${isSelected ? "text-amber-800" : isGold ? "text-amber-700" : isMid ? "text-blue-700" : "text-gray-900"}`}
                        >
                          $ {plan.price_lempiras.toLocaleString("en-US")}
                        </p>
                      </div>
                    </div>

                    {/* Indicador seleccionado (aparece abajo en la card) */}
                    {isSelected && (
                      <div className="mt-4 flex items-center gap-2 border-t border-amber-200 pt-3">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-bold text-green-700">
                          Plan seleccionado
                        </span>
                        <span className="ml-auto text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          ✓ Activo
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CTA flotante ── */}
      {!plansLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-lg mx-auto">
            {selectedPlan && (
              <p className="text-center text-xs text-gray-500 mb-2">
                Plan seleccionado:{" "}
                <span className="font-bold text-amber-700">
                  {selectedPlan.months === 1
                    ? "1 mes"
                    : `${selectedPlan.months} meses`}
                  {" · "}$ {selectedPlan.price_lempiras.toLocaleString("en-US")}
                </span>
              </p>
            )}
            <button
              type="button"
              disabled={!selectedPlan}
              onClick={() => {
                if (!selectedPlan) {
                  toast.error("Selecciona un plan");
                  return;
                }
                setAppStep(payMethod === "paypal" ? "form" : "transfer-info");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full h-14 rounded-2xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all"
              style={
                selectedPlan
                  ? {
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "#fff",
                    }
                  : undefined
              }
            >
              {selectedPlan
                ? payMethod === "paypal"
                  ? "Continuar – Llenar datos del negocio"
                  : "Continuar – Ver datos de pago"
                : "Selecciona un plan para continuar"}
              {selectedPlan && <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ═══════════════════ PANTALLA: Formulario (PayPal path) ═══════════════ */
  const renderFormProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {FORM_STEP_INFO.map((step, idx) => {
          const completed = step.number < formStep;
          const active = step.number === formStep;
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-colors duration-300 ${completed ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-500"}`}
                >
                  {completed ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={`hidden sm:block mt-1 text-[10px] font-medium ${active ? "text-blue-600" : completed ? "text-green-600" : "text-gray-400"}`}
                >
                  {step.title}
                </span>
              </div>
              {idx < FORM_STEP_INFO.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${step.number < formStep ? "bg-green-500" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Paso {formStep} de {TOTAL_FORM_STEPS}:{" "}
          {FORM_STEP_INFO[formStep - 1].title}
        </h2>
      </div>
    </div>
  );

  /* ─── Paso 1: Información básica ─── */
  const renderStep1 = () => (
    <div className="space-y-5">
      {renderSectionHeader(
        Building2,
        "Información básica",
        "Datos principales que identifican tu negocio",
      )}
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

  /* ─── Paso 2: Ubicación ─── */
  const renderStep2 = () => (
    <div className="space-y-5">
      {renderSectionHeader(MapPin, "Ubicación", "¿Dónde está tu negocio?")}

      {/* País — full width */}
      <div>
        <label className={labelClass}>
          País <span className="text-red-500">*</span>
        </label>
        <CountrySelector
          value={formData.pais}
          onChange={(v) => handleChange("pais", v)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {formData.pais === "Honduras"
              ? "Departamento"
              : "Estado / Departamento"}{" "}
            <span className="text-red-500">*</span>
          </label>
          {formData.pais === "Honduras" ? (
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
          ) : (
            <input
              type="text"
              value={formData.departamento}
              onChange={(e) => handleChange("departamento", e.target.value)}
              className={inputClass}
              placeholder="Ej: Ciudad de México, Buenos Aires..."
            />
          )}
        </div>
        <div>
          <label className={labelClass}>
            {formData.pais === "Honduras" ? "Municipio" : "Ciudad / Municipio"}{" "}
            <span className="text-red-500">*</span>
          </label>
          {formData.pais === "Honduras" ? (
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
          ) : (
            <input
              type="text"
              value={formData.municipio}
              onChange={(e) => handleChange("municipio", e.target.value)}
              className={inputClass}
              placeholder="Ej: Bogotá, Guadalajara, Lima..."
            />
          )}
        </div>
      </div>
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
        <div className="flex border-b border-gray-200 mb-4">
          {(["map", "url"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setLocationMode(mode)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${locationMode === mode ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
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
        {locationMode === "map" && (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Haz clic en el mapa para marcar la ubicación exacta.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Botón GPS */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={handleGpsLocate}
                disabled={gpsLoading}
              >
                {gpsLoading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-4 w-4 mr-1.5" />
                )}
                {gpsLoading ? "Detectando..." : "Mi ubicación"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() =>
                  setMapType((p) => (p === "roadmap" ? "hybrid" : "roadmap"))
                }
              >
                <Satellite className="h-4 w-4 mr-1.5" />{" "}
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

  /* ─── Paso 3: Datos del negocio ─── */
  const renderStep3 = () => (
    <div className="space-y-5">
      {renderSectionHeader(
        Mail,
        "Información del negocio",
        "Descripción y datos de contacto",
      )}
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
          <Plus className="h-4 w-4" /> Agregar otro teléfono
        </button>
      </div>
    </div>
  );

  /* ─── Paso 4: Presencia digital ─── */
  const renderStep4 = () => (
    <div className="space-y-5">
      {renderSectionHeader(
        Globe,
        "Presencia digital",
        "Todos los campos son opcionales",
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="sm:col-span-2">
          <label className={labelClass}>TripAdvisor</label>
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

  /* ─── Paso 5: Imágenes ─── */
  const renderStep5 = () => (
    <div className="space-y-6">
      {renderSectionHeader(
        ImageIcon,
        "Imágenes del negocio",
        "Las imágenes se enviarán al confirmar el pago",
      )}
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800 font-medium mb-1">¿Todo listo?</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          Al confirmar el pago con PayPal, toda la información e imágenes de tu
          negocio serán enviadas. El administrador activará tu perfil en el
          directorio.
        </p>
      </div>
    </div>
  );

  const renderCurrentFormStep = () => {
    switch (formStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  const renderFormScreen = () => (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
      <button
        type="button"
        onClick={() => {
          if (formStep > 1) {
            setFormStep((f) => f - 1);
          } else {
            setAppStep("plan");
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />{" "}
        {formStep > 1 ? "Paso anterior" : "Volver a planes"}
      </button>

      {/* Plan seleccionado */}
      {selectedPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">
              Plan:{" "}
              {selectedPlan.months === 1
                ? "1 mes"
                : `${selectedPlan.months} meses`}
            </span>
          </div>
          <span className="text-sm font-bold text-blue-800">
            $ {selectedPlan.price_lempiras.toLocaleString("en-US")}
          </span>
        </div>
      )}

      {renderFormProgressBar()}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-5">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderCurrentFormStep()}
        </form>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevFormStep}
          className="flex-1 sm:flex-none sm:w-36 rounded-xl h-11 border-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
        </Button>
        <Button
          type="button"
          onClick={nextFormStep}
          className={`flex-1 sm:flex-none rounded-xl h-11 font-semibold ${formStep < TOTAL_FORM_STEPS ? "sm:w-36 bg-blue-600 hover:bg-blue-700" : "sm:w-52 bg-blue-600 hover:bg-blue-700"}`}
        >
          {formStep < TOTAL_FORM_STEPS ? (
            <>
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Ir al pago PayPal</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  /* ═══════════════════ PANTALLA: Pago PayPal ══════════════════════════════ */
  const renderPayPalScreen = () => {
    if (!selectedPlan) return null;
    const usdAmount = selectedPlan.price_lempiras.toFixed(2);
    const planLabel =
      selectedPlan.months === 1 ? "1 mes" : `${selectedPlan.months} meses`;
    const cleanPhone = formData.phones[0]?.replace(/\D/g, "") || "";

    return (
      <div className="pb-12">
        {/* Barra de contexto */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setAppStep("form");
                setFormStep(TOTAL_FORM_STEPS);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al formulario
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BadgeCheck className="h-4 w-4 text-green-500" />
              Pago seguro · PayPal
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Título */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-600 shadow-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Confirmar pago
              </h2>
              <p className="text-sm text-gray-500">
                Plan {planLabel} · ${" "}
                {selectedPlan.price_lempiras.toLocaleString("en-US")}
              </p>
            </div>
          </div>

          {/* Layout dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* ── Columna izquierda: Resumen ── */}
            <div className="space-y-4">
              {/* Tarjeta resumen */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                  <p className="text-xs text-blue-100 font-medium tracking-wide uppercase">
                    Resumen del registro
                  </p>
                  <p className="text-white font-bold text-lg mt-1 truncate">
                    {formData.name || "—"}
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      Negocio
                    </span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[55%] truncate">
                      {formData.name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      Plan
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {planLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      Ubicación
                    </span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[55%]">
                      {[formData.municipio, formData.departamento]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Banknote className="h-3.5 w-3.5 text-gray-400" />
                      Monto (HNL)
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      $ {selectedPlan.price_lempiras.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-blue-500" />
                      Monto (USD)
                    </span>
                    <span className="text-xl font-extrabold text-blue-700">
                      USD {usdAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info de facturación pre-llenada */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Datos pre-llenados en PayPal
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "País", value: "Honduras (HN)" },
                    { label: "Email", value: formData.email || "—" },
                    { label: "Móvil", value: formData.phones[0] || "—" },
                    {
                      label: "Ciudad/Localidad",
                      value:
                        [formData.municipio, formData.departamento]
                          .filter(Boolean)
                          .join(", ") || "—",
                    },
                    { label: "Domicilio", value: formData.colonia || "—" },
                    { label: "Código postal", value: "41101" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5 w-28">
                        {label}
                      </span>
                      <span className="text-xs font-medium text-gray-800 text-right break-all">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota tasa */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <BadgeCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                El cargo se realizará en dólares (USD). Tasa de cambio
                referencial.
              </div>
            </div>

            {/* ── Columna derecha: Pago PayPal ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="font-semibold text-blue-700">
                    Guardando tu negocio...
                  </p>
                  <p className="text-xs text-gray-400">
                    No cierres ni recargues la página
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-5 text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      Pagar con PayPal
                    </p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">
                      USD {usdAmount}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      $ {selectedPlan.price_lempiras.toLocaleString("en-US")} ·{" "}
                      {planLabel}
                    </p>
                  </div>

                  <PayPalScriptProvider
                    options={{
                      clientId: PAYPAL_CLIENT_ID,
                      currency: "USD",
                      intent: "capture",
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "blue",
                        shape: "rect",
                        label: "pay",
                        height: 48,
                      }}
                      forceReRender={[
                        selectedPlan.id,
                        usdAmount,
                        formData.email,
                        cleanPhone,
                      ]}
                      createOrder={(_data, actions) =>
                        actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              description: `Suscripción ${planLabel} – ${formData.name}`,
                              amount: {
                                currency_code: "USD",
                                value: usdAmount,
                              },
                              shipping: {
                                address: {
                                  address_line_1:
                                    formData.colonia ||
                                    formData.municipio ||
                                    "N/A",
                                  ...([
                                    formData.municipio,
                                    formData.departamento,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")
                                    ? {
                                        address_line_2: [
                                          formData.municipio,
                                          formData.departamento,
                                        ]
                                          .filter(Boolean)
                                          .join(", "),
                                      }
                                    : {}),
                                  admin_area_2:
                                    formData.municipio || formData.departamento,
                                  admin_area_1: formData.departamento,
                                  postal_code: "41101",
                                  country_code: "HN",
                                },
                              },
                            },
                          ],
                          payer: {
                            email_address: formData.email || undefined,
                            ...(cleanPhone
                              ? {
                                  phone: {
                                    phone_type: "MOBILE" as const,
                                    phone_number: {
                                      country_code: "504",
                                      national_number: cleanPhone,
                                    },
                                  },
                                }
                              : {}),
                            address: {
                              address_line_1:
                                formData.colonia || formData.municipio || "N/A",
                              ...([formData.municipio, formData.departamento]
                                .filter(Boolean)
                                .join(", ")
                                ? {
                                    address_line_2: [
                                      formData.municipio,
                                      formData.departamento,
                                    ]
                                      .filter(Boolean)
                                      .join(", "),
                                  }
                                : {}),
                              admin_area_2:
                                formData.municipio || formData.departamento,
                              admin_area_1: formData.departamento,
                              postal_code: "41101",
                              country_code: "HN",
                            },
                          },
                        })
                      }
                      onApprove={async (_data, actions) => {
                        if (!actions.order) return;
                        const order = await actions.order.capture();
                        const givenName = order.payer?.name?.given_name ?? "";
                        const surname = order.payer?.name?.surname ?? "";
                        const payerName =
                          `${givenName} ${surname}`.trim() || undefined;
                        const payerEmail =
                          order.payer?.email_address ?? undefined;
                        await submitBusinessPayPal(
                          order.id ?? "N/A",
                          payerName,
                          payerEmail,
                        );
                      }}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                        toast.error(
                          "Error al procesar el pago. Intenta de nuevo.",
                        );
                      }}
                      onCancel={() =>
                        toast(
                          "Pago cancelado. Puedes intentarlo cuando quieras.",
                        )
                      }
                    />
                  </PayPalScriptProvider>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
                    Transacción 100% segura · PayPal
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════ PANTALLA: Éxito PayPal ═════════════════════════════ */
  const renderSuccessScreen = () => (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="relative mb-6 inline-block">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-300 shadow-md">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500" />
        </span>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
        ¡Todo listo!
      </h1>
      <p className="text-gray-500 text-sm mb-1">
        Pago procesado y negocio registrado exitosamente.
      </p>
      <p className="text-sm font-semibold text-gray-800 mb-8">
        {formData.name}
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 mb-8 text-left">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-bold text-amber-800">
            Pendiente de activación
          </p>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          Tu negocio está <strong>oculto al público</strong> mientras el
          administrador verifica el pago y activa el perfil en el directorio.
        </p>
      </div>

      <Link
        to="/"
        className="inline-block w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-colors"
      >
        Ir al inicio
      </Link>
    </div>
  );

  /* ═══════════════════ PANTALLA: Transferencia bancaria ══════════════════ */
  const renderTransferScreen = () => (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => setAppStep("plan")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg">
          <Banknote className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Pago por transferencia
          </h2>
          <p className="text-sm text-gray-500">
            Datos para completar tu registro
          </p>
        </div>
      </div>

      {/* Nombre del negocio */}
      <div className="mb-6">
        <label className={labelClass}>
          Nombre de tu negocio <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={transferName}
            onChange={(e) => setTransferName(e.target.value)}
            className={`${inputClass} pl-10`}
            placeholder="Ej: Hotel Paradise Bay"
          />
        </div>
      </div>

      {/* Plan seleccionado */}
      {selectedPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6">
          <p className="text-xs text-blue-600 font-medium mb-2">
            Plan seleccionado
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {selectedPlan.months === 1
                    ? "1 mes"
                    : `${selectedPlan.months} meses`}
                </p>
                {selectedPlan.description && (
                  <p className="text-xs text-gray-500">
                    {selectedPlan.description}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xl font-extrabold text-blue-800">
              $ {selectedPlan.price_lempiras.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      )}

      {/* Datos bancarios */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />
          Cuenta para la transferencia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Nombre del titular</p>
            <p className="text-sm font-bold text-gray-900">{BANK_OWNER}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Cuenta BAC</p>
            <p className="text-lg font-extrabold text-gray-900 tracking-wider">
              {BANK_ACCOUNT}
            </p>
          </div>
        </div>
        <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Realiza la transferencia por el monto del plan seleccionado.</li>
          <li>Guarda el comprobante de pago.</li>
          <li>
            Presiona el botón de WhatsApp para notificar al administrador con el
            comprobante.
          </li>
          <li>
            El administrador activará tu negocio una vez confirmado el pago.
          </li>
        </ol>
      </div>

      {/* Botón WhatsApp */}
      <button
        type="button"
        onClick={handleTransferWhatsApp}
        disabled={!selectedPlan || !transferName.trim()}
        className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition-colors bg-[#25D366] hover:bg-[#1ebe5b] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white"
      >
        <MessageCircle className="h-5 w-5" />
        Notificar pago por WhatsApp
      </button>

      {(!selectedPlan || !transferName.trim()) && (
        <p className="text-center text-xs text-gray-400 mt-2">
          {!transferName.trim()
            ? "Ingresa el nombre de tu negocio para continuar"
            : "Selecciona un plan para continuar"}
        </p>
      )}

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 text-center leading-relaxed">
        Se enviará un mensaje con el nombre de tu negocio y plan al
        administrador para que active tu perfil.
      </div>
    </div>
  );

  /* ═══════════════════ RENDER PRINCIPAL ═══════════════════════════════════ */
  const renderContent = () => {
    switch (appStep) {
      case "method":
        return renderMethodScreen();
      case "plan":
        return renderPlanScreen();
      case "form":
        return renderFormScreen();
      case "paypal-pay":
        return renderPayPalScreen();
      case "paypal-success":
        return renderSuccessScreen();
      case "transfer-info":
        return renderTransferScreen();
      default:
        return renderMethodScreen();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <Header />
      {renderContent()}
    </div>
  );
};

export default PublicBusinessRegistrationPage;
