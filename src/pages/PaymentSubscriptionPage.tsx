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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BANK_OWNER = "MIGUEL ANGEL ROMERO GUILLEN";
const BANK_ACCOUNT = "751781611";
const WHATSAPP_NUMBER = "50488857653"; // Formato internacional sin guión

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
      alert("Por favor selecciona un plan primero.");
      return;
    }
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  /* ─── Estilos helpers ─── */
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

        {/* Negocio registrado */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-8">
          <BadgeCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Negocio registrado correctamente
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              <strong>{businessName}</strong> está oculto hasta confirmar el
              pago.
            </p>
          </div>
        </div>

        {/* Planes */}
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
              No hay planes disponibles en este momento. Por favor contacta al
              administrador.
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
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : isHighlighted
                            ? "border-blue-200 bg-white hover:border-blue-400 shadow-sm"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                      }`}
                  >
                    {/* Badge */}
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

                      {/* Precio */}
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-lg font-extrabold text-gray-900">
                          L {plan.price_lempiras.toLocaleString("es-HN")}
                        </p>
                        <p className="text-xs text-gray-400">
                          L{" "}
                          {Math.round(
                            plan.price_lempiras / plan.months,
                          ).toLocaleString("es-HN")}
                          /mes
                        </p>
                      </div>
                    </div>

                    {/* Check de selección */}
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

        {/* Instrucciones de pago + datos bancarios */}
        <section
          className={`rounded-2xl border p-6 mb-8 transition-all duration-300 ${
            selectedPlan
              ? "bg-white border-blue-200 shadow-sm"
              : "bg-gray-50 border-gray-200 opacity-60"
          }`}
        >
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            Cuenta bancaria para realizar la transferencia
          </h2>

          <div className="space-y-3">
            {/* Monto */}
            {selectedPlan && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">
                  Monto a transferir
                </span>
                <span className="text-xl font-extrabold text-blue-800">
                  L {selectedPlan.price_lempiras.toLocaleString("es-HN")}
                </span>
              </div>
            )}

            {/* Datos bancarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Instrucciones */}
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Realiza la transferencia por el monto indicado.</li>
              <li>Guarda el comprobante de pago.</li>
              <li>
                Presiona el botón de WhatsApp para notificar al administrador.
              </li>
              <li>
                El administrador activará tu negocio una vez confirmado el pago.
              </li>
            </ol>
          </div>
        </section>

        {/* Botón WhatsApp */}
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleWhatsApp}
            disabled={!selectedPlan}
            className="w-full h-14 rounded-2xl font-bold text-base gap-3 bg-[#25D366] hover:bg-[#1ebe5b] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            Notificar pago por WhatsApp al administrador
          </Button>

          {!selectedPlan && (
            <p className="text-center text-xs text-gray-400">
              Selecciona un plan para activar el botón de WhatsApp
            </p>
          )}

          {selectedPlan && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 text-center leading-relaxed">
              Se enviará un mensaje automático indicando el nombre de tu
              negocio, el plan seleccionado y que el pago está pendiente de
              confirmación.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSubscriptionPage;
