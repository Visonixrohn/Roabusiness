import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFinancial } from "@/hooks/useFinancial";
import { SubscriptionPlan } from "@/types/financial";
import Header from "@/components/Header";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Building2,
  MessageCircle,
  Star,
  Clock,
  Loader2,
  BadgeCheck,
  Banknote,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";

// ─── Configuración ────────────────────────────────────────────────────────────
const BANK_OWNER = "MIGUEL ANGEL ROMERO GUILLEN";
const BANK_ACCOUNT = "751781611";
const WHATSAPP_NUMBER = "50488857653";

const PAYPAL_CLIENT_ID =
  "AVrUbwP82_y8-jVKAUL-2yU-FOvmMDaS6zGhZ3D6IUxSAPHfK8h3Ws4b9LTgQIrRxd_GUkcU9ucEaTcF";

/** Tasa aproximada HNL → USD para cargo en PayPal */
const HNL_TO_USD = 0.04; // ≈ 1 USD = 25 HNL

type PaymentMethod = "transfer" | "paypal";

// ─── Componente PayPal ────────────────────────────────────────────────────────
function PayPalSection({
  plan,
  businessName,
  onSuccess,
}: {
  plan: SubscriptionPlan;
  businessName: string;
  onSuccess: (orderId: string) => void;
}) {
  const usdAmount = (plan.price_lempiras * HNL_TO_USD).toFixed(2);

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="space-y-3">
        {/* Referencia de monto */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-medium">Monto a pagar</p>
            <p className="text-xs text-blue-500 mt-0.5">
              L {plan.price_lempiras.toLocaleString("es-HN")} ≈ USD {usdAmount}
            </p>
          </div>
          <p className="text-xl font-extrabold text-blue-800">
            USD {usdAmount}
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center leading-relaxed">
          El cargo se realizará en dólares (USD). Tasa de cambio referencial.
        </p>

        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
          }}
          forceReRender={[plan.id, usdAmount]}
          createOrder={(_data, actions) =>
            actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: `Suscripción ${
                    plan.months === 1 ? "1 mes" : `${plan.months} meses`
                  } – ${businessName}`,
                  amount: { currency_code: "USD", value: usdAmount },
                },
              ],
            })
          }
          onApprove={async (_data, actions) => {
            if (!actions.order) return;
            const order = await actions.order.capture();
            onSuccess(order.id ?? "N/A");
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            toast.error(
              "Error al procesar el pago con PayPal. Intenta de nuevo.",
            );
          }}
          onCancel={() => {
            toast("Pago cancelado. Puedes intentarlo de nuevo cuando quieras.");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
const PaymentSubscriptionPage = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId") || "";
  const businessName = searchParams.get("businessName") || "Tu negocio";

  const { fetchSubscriptionPlans } = useFinancial();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer");
  const [paypalSuccess, setPaypalSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchSubscriptionPlans();
      setPlans(data);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildWhatsAppMessage = () => {
    if (!selectedPlan) return "";
    const lines = [
      `Hola, quiero notificar mi pago de suscripción 💳`,
      ``,
      `🏢 *Nombre del negocio:* ${businessName}`,
      selectedPlan.months === 1
        ? `📦 *Plan seleccionado:* ${selectedPlan.months} mes`
        : `📦 *Plan seleccionado:* ${selectedPlan.months} meses`,
      `💵 *Monto:* L ${selectedPlan.price_lempiras.toLocaleString("es-HN")}`,
      ``,
      `📌 *Estado de pago:* Pago enviado – pendiente de comprobante`,
      ``,
      `Por favor confirmar recepción. ¡Gracias!`,
    ];
    return lines.join("\n");
  };

  const handleWhatsApp = () => {
    if (!selectedPlan) {
      toast.error("Por favor selecciona un plan primero.");
      return;
    }
    const message = buildWhatsAppMessage();
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handlePayPalSuccess = (orderId: string) => {
    setPaypalSuccess(orderId);
    toast.success("¡Pago recibido! Tu negocio está en revisión.");
  };

  const getBadgeLabel = (months: number) => {
    if (months >= 12) return "Mejor valor";
    if (months >= 6) return "Recomendado";
    return null;
  };

  const getMostPopular = (plans: SubscriptionPlan[]) =>
    plans.reduce(
      (best, p) => (p.months > (best?.months ?? 0) ? p : best),
      null as SubscriptionPlan | null,
    );

  const mostPopular = getMostPopular(plans);

  // ─── Pantalla de éxito PayPal ──────────────────────────────────────────────
  if (paypalSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 pb-24 text-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-300 shadow-md mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            ¡Pago realizado con éxito!
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            Tu pago fue procesado correctamente a través de PayPal.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            ID de orden:{" "}
            <span className="font-mono font-semibold text-gray-600">
              {paypalSuccess}
            </span>
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 mb-8 text-left">
            <p className="text-sm font-bold text-amber-800 mb-2">¿Qué sigue?</p>
            <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>El administrador verificará tu pago de PayPal.</li>
              <li>
                Una vez confirmado, <strong>{businessName}</strong> quedará
                visible en el directorio.
              </li>
              <li>Recibirás un correo de confirmación.</li>
            </ol>
          </div>

          <Button
            type="button"
            onClick={handleWhatsApp}
            className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5b] font-bold text-base gap-2 shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            Notificar por WhatsApp (opcional)
          </Button>

          <Link
            to="/"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ─── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Navegación */}
        <Link
          to="/registro-negocio"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al formulario
        </Link>

        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Pago de Suscripción
            </h1>
            <p className="text-sm text-gray-500">
              Selecciona tu plan para activar tu negocio en el directorio
            </p>
          </div>
        </div>

        {/* Banner pendiente */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-8">
          <Clock className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Negocio pendiente de aprobación
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              <strong>{businessName}</strong> está oculto hasta confirmar el
              pago. Una vez verificado quedará visible en el directorio.
            </p>
          </div>
        </div>

        {/* ─── Planes ─── */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Planes de suscripción disponibles
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Cargando planes...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center text-sm text-amber-700">
              No hay planes disponibles. Por favor contacta al administrador.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan) => {
                const badge = getBadgeLabel(plan.months);
                const isSelected = selectedPlan?.id === plan.id;
                const isHighlighted = mostPopular?.id === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setPaypalSuccess(null);
                    }}
                    className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : isHighlighted
                            ? "border-blue-200 bg-white hover:border-blue-400 shadow-sm"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                      }`}
                  >
                    {badge && (
                      <span
                        className={`absolute -top-2.5 left-4 text-[11px] font-bold px-3 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-amber-400 text-amber-900"
                        }`}
                      >
                        {badge}
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                            isSelected ? "bg-blue-600" : "bg-gray-100"
                          }`}
                        >
                          <Clock
                            className={`h-5 w-5 ${
                              isSelected ? "text-white" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base leading-tight">
                            {plan.months === 1
                              ? "1 mes"
                              : `${plan.months} meses`}
                          </p>
                          {plan.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                              {plan.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-lg font-extrabold text-gray-900">
                          $ {plan.price_lempiras.toLocaleString("en-US")}
                        </p>
                        <p className="text-xs text-gray-400">
                          ${" "}
                          {Math.round(
                            plan.price_lempiras / plan.months,
                          ).toLocaleString("en-US")}
                          /mes
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Método de pago (solo si hay plan seleccionado) ─── */}
        {selectedPlan && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              Método de pago
            </h2>

            {/* Tabs de método */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Transferencia */}
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 focus:outline-none
                  ${
                    paymentMethod === "transfer"
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                    paymentMethod === "transfer" ? "bg-blue-600" : "bg-gray-100"
                  }`}
                >
                  <Banknote
                    className={`h-5 w-5 ${
                      paymentMethod === "transfer"
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    paymentMethod === "transfer"
                      ? "text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  Transferencia
                </span>
                <span className="text-xs text-gray-400">BAC Honduras</span>
              </button>

              {/* PayPal */}
              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 focus:outline-none
                  ${
                    paymentMethod === "paypal"
                      ? "border-[#003087] bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                    paymentMethod === "paypal" ? "bg-[#003087]" : "bg-gray-100"
                  }`}
                >
                  <Globe
                    className={`h-5 w-5 ${
                      paymentMethod === "paypal"
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    paymentMethod === "paypal"
                      ? "text-[#003087]"
                      : "text-gray-700"
                  }`}
                >
                  PayPal
                </span>
                <span className="text-xs text-gray-400">Pago en línea</span>
              </button>
            </div>

            {/* ── Panel Transferencia ── */}
            {paymentMethod === "transfer" && (
              <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Datos bancarios
                </h3>

                <div className="space-y-3">
                  {/* Monto */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-blue-700 font-medium">
                      Monto a transferir
                    </span>
                    <span className="text-xl font-extrabold text-blue-800">
                      L {selectedPlan.price_lempiras.toLocaleString("es-HN")}
                    </span>
                  </div>

                  {/* Datos bancarios */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Nombre del titular
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {BANK_OWNER}
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">Cuenta BAC</p>
                      <p className="text-lg font-extrabold text-gray-900 tracking-wider">
                        {BANK_ACCOUNT}
                      </p>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Realiza la transferencia por el monto indicado.</li>
                    <li>Guarda el comprobante de pago.</li>
                    <li>
                      Presiona el botón de WhatsApp para notificar al
                      administrador.
                    </li>
                    <li>
                      El administrador activará tu negocio una vez confirmado el
                      pago.
                    </li>
                  </ol>
                </div>

                {/* Botón WhatsApp */}
                <Button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full mt-5 h-12 rounded-2xl font-bold text-base gap-2 bg-[#25D366] hover:bg-[#1ebe5b] transition-all duration-200 shadow-md"
                >
                  <MessageCircle className="h-5 w-5" />
                  Notificar pago por WhatsApp
                </Button>

                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 text-center leading-relaxed">
                  Se enviará un mensaje con el nombre de tu negocio, plan
                  seleccionado y monto pendiente de confirmación.
                </div>
              </div>
            )}

            {/* ── Panel PayPal ── */}
            {paymentMethod === "paypal" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#009cde]" />
                  Pagar con PayPal
                </h3>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Pago seguro en línea. Puedes pagar con tu cuenta PayPal o
                  tarjeta de crédito/débito a través de PayPal.
                </p>

                <PayPalSection
                  plan={selectedPlan}
                  businessName={businessName}
                  onSuccess={handlePayPalSuccess}
                />

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
                  Transacción 100% segura procesada por PayPal
                </div>
              </div>
            )}
          </section>
        )}

        {/* Aviso cuando no hay plan seleccionado */}
        {!selectedPlan && !loading && plans.length > 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            Selecciona un plan para ver las opciones de pago
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentSubscriptionPage;
