import { useState, useEffect } from "react";
import { useFinancial } from "@/hooks/useFinancial";
import {
  SubscriptionPlan,
  Transaction,
  AdvertisingCost,
  BusinessFinancialView,
  FinancialSummary,
  IngresosPorMes,
  SuscripcionPorVencer,
  PaymentReceipt,
} from "@/types/financial";
import Receipt from "@/components/Receipt";
import TransactionReceipt from "@/components/TransactionReceipt";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  PieChart,
  BarChart3,
  FileText,
  Phone,
  Mail,
  Plus,
  Edit,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";

const FinancialDashboard = () => {
  const {
    loading,
    fetchSubscriptionPlans,
    updateSubscriptionPlan,
    fetchTransactions,
    createTransaction,
    fetchAdvertisingCosts,
    createAdvertisingCost,
    fetchBusinessesFinancial,
    fetchFinancialSummary,
    fetchIngresosPorMes,
    fetchSuscripcionesPorVencer,
    renovarSuscripcion,
  } = useFinancial();

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advertisingCosts, setAdvertisingCosts] = useState<AdvertisingCost[]>(
    [],
  );
  const [businesses, setBusinesses] = useState<BusinessFinancialView[]>([]);
  const [ingresosPorMes, setIngresosPorMes] = useState<IngresosPorMes[]>([]);
  const [suscripcionesPorVencer, setSuscripcionesPorVencer] = useState<
    SuscripcionPorVencer[]
  >([]);

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "plans"
    | "transactions"
    | "advertising"
    | "businesses"
    | "expiring"
  >("dashboard");

  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showAddAdvertisingModal, setShowAddAdvertisingModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [selectedBusinessForRenewal, setSelectedBusinessForRenewal] =
    useState<string>("");
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] =
    useState<string>("");
  const [renewalPaymentMethod, setRenewalPaymentMethod] =
    useState<string>("efectivo");
  const [renewalReceipt, setRenewalReceipt] = useState<PaymentReceipt | null>(
    null,
  );
  const [pagoFilter, setPagoFilter] = useState<
    "todos" | "ejecutado" | "sin pagar"
  >("todos");
  const [transactionReceipt, setTransactionReceipt] = useState<
    (Transaction & { business_name?: string }) | null
  >(null);

  const [newTransaction, setNewTransaction] = useState({
    business_id: "",
    tipo: "ingreso" as "ingreso" | "egreso" | "reembolso",
    concepto: "",
    monto: 0,
    metodo_pago: "",
    notas: "",
  });

  const [newAdvertising, setNewAdvertising] = useState({
    descripcion: "",
    monto: 0,
    plataforma: "",
    notas: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [editPlanData, setEditPlanData] = useState({
    months: 0,
    price_lempiras: 0,
    description: "",
  });

  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // AdminRouteGuard ya verifica la sesión de admin
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const [
      summaryData,
      plansData,
      transactionsData,
      advertisingData,
      businessesData,
      ingresosData,
      expiringData,
    ] = await Promise.all([
      fetchFinancialSummary(),
      fetchSubscriptionPlans(),
      fetchTransactions(),
      fetchAdvertisingCosts(),
      fetchBusinessesFinancial(),
      fetchIngresosPorMes(),
      fetchSuscripcionesPorVencer(),
    ]);

    setSummary(summaryData);
    setPlans(plansData);
    setTransactions(transactionsData);
    setAdvertisingCosts(advertisingData);
    setBusinesses(businessesData);
    setIngresosPorMes(ingresosData);
    setSuscripcionesPorVencer(expiringData);
  };

  const handleCreateTransaction = async () => {
    if (
      !newTransaction.business_id ||
      !newTransaction.concepto ||
      newTransaction.monto <= 0
    ) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const transaction = await createTransaction({
      ...newTransaction,
      fecha: new Date().toISOString(),
      created_by: "admin",
    });

    if (transaction) {
      // Obtener nombre del negocio para el recibo
      const business = businesses.find(
        (b) => b.id === newTransaction.business_id,
      );

      // Mostrar comprobante de transacción
      setTransactionReceipt({
        ...transaction,
        business_name: business?.name || "Desconocido",
      });

      setShowAddTransactionModal(false);
      setNewTransaction({
        business_id: "",
        tipo: "ingreso",
        concepto: "",
        monto: 0,
        metodo_pago: "",
        notas: "",
      });
      loadAllData();
    }
  };

  const handleCreateAdvertising = async () => {
    if (!newAdvertising.descripcion || newAdvertising.monto <= 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const success = await createAdvertisingCost({
      ...newAdvertising,
      fecha: new Date(newAdvertising.fecha).toISOString(),
    });

    if (success) {
      setShowAddAdvertisingModal(false);
      setNewAdvertising({
        descripcion: "",
        monto: 0,
        plataforma: "",
        notas: "",
        fecha: new Date().toISOString().split("T")[0],
      });
      loadAllData();
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan || editPlanData.price_lempiras <= 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const success = await updateSubscriptionPlan(selectedPlan.id, {
      price_lempiras: editPlanData.price_lempiras,
      description: editPlanData.description,
    });

    if (success) {
      setShowEditPlanModal(false);
      setSelectedPlan(null);
      loadAllData();
    }
  };

  const handleRenewSubscription = async (
    businessId: string,
    months: number,
    amount: number,
    paymentMethod: string,
  ) => {
    const receipt = await renovarSuscripcion({
      business_id: businessId,
      new_months: months,
      amount_paid: amount,
      payment_method: paymentMethod,
      admin_user: "admin",
    });

    if (receipt) {
      setRenewalReceipt(receipt);
      loadAllData();
    }
  };

  const formatCurrency = (amount: number) => {
    return `$ ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-HN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Cargando datos financieros...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Panel Financiero
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gestión completa de ingresos, egresos y suscripciones
          </p>
        </div>

        {/* Resumen financiero */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Ingresos
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {formatCurrency(summary.ingresos_totales)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Egresos
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    {formatCurrency(
                      summary.egresos_totales + summary.costos_publicidad,
                    )}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 sm:h-12 sm:w-12 text-red-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Balance
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-bold ${summary.balance_total >= 0 ? "text-blue-600" : "text-red-600"}`}
                  >
                    {formatCurrency(summary.balance_total)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Suscripciones
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-base sm:text-lg font-bold text-green-600">
                      {summary.suscripciones_activas}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-base sm:text-lg font-bold text-red-600">
                      {summary.suscripciones_vencidas}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Activas / Vencidas
                  </p>
                </div>
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {summary &&
          (summary.negocios_sin_pagar > 0 ||
            suscripcionesPorVencer.length > 0) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Atención requerida
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {summary.negocios_sin_pagar > 0 && (
                        <li>
                          {summary.negocios_sin_pagar} negocios con pago
                          pendiente
                        </li>
                      )}
                      {suscripcionesPorVencer.length > 0 && (
                        <li>
                          {suscripcionesPorVencer.length} suscripciones por
                          vencer en los próximos 30 días
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: "dashboard", label: "Dashboard", icon: PieChart },
                { id: "plans", label: "Planes", icon: FileText },
                { id: "transactions", label: "Transacc.", icon: DollarSign },
                { id: "advertising", label: "Publicidad", icon: BarChart3 },
                { id: "businesses", label: "Negocios", icon: Users },
                { id: "expiring", label: "Por Vencer", icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de tabs */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Ingresos por Mes
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Mes
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Transacciones
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Ingresos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresosPorMes.map((ingreso, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(ingreso.mes).toLocaleDateString("es-HN", {
                            year: "numeric",
                            month: "long",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {ingreso.cantidad_transacciones}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(ingreso.ingresos_mes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "plans" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Planes de Suscripción
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {plan.months} meses
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setEditPlanData({
                            months: plan.months,
                            price_lempiras: plan.price_lempiras,
                            description: plan.description || "",
                          });
                          setShowEditPlanModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(plan.price_lempiras)}
                    </div>
                    <Badge
                      className="mt-4"
                      variant={plan.is_active ? "default" : "secondary"}
                    >
                      {plan.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Transacciones
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRenewModal(true)}
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Renovar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAddTransactionModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Nueva
                  </Button>
                </div>
              </div>

              {/* Cards móvil */}
              <div className="block sm:hidden space-y-3">
                {transactions.slice(0, 50).map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {transaction.business_name || "Sin nombre"}
                        </p>
                        {transaction.business_profile && (
                          <p className="text-xs text-gray-500">
                            @{transaction.business_profile}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          transaction.tipo === "ingreso"
                            ? "default"
                            : transaction.tipo === "egreso"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {transaction.tipo}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {transaction.concepto}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {formatDate(transaction.fecha)}
                      </span>
                      <span
                        className={`font-bold text-sm ${transaction.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.tipo === "ingreso" ? "+" : "-"}
                        {formatCurrency(transaction.monto)}
                      </span>
                    </div>
                    {transaction.metodo_pago && (
                      <p className="text-xs text-gray-400 mt-1">
                        {transaction.metodo_pago}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Tabla desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Negocio
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Concepto
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Monto
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Método
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 50).map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm">
                          {formatDate(transaction.fecha)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="font-medium text-gray-900">
                            {transaction.business_name || "Sin nombre"}
                          </div>
                          {transaction.business_profile && (
                            <div className="text-xs text-gray-500">
                              @{transaction.business_profile}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              transaction.tipo === "ingreso"
                                ? "default"
                                : transaction.tipo === "egreso"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {transaction.tipo}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.concepto}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold ${transaction.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.tipo === "ingreso" ? "+" : "-"}
                          {formatCurrency(transaction.monto)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.metodo_pago || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "advertising" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Costos de Publicidad
                </h2>
                <Button
                  size="sm"
                  onClick={() => setShowAddAdvertisingModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nuevo Costo
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Total invertido:</span>{" "}
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    {formatCurrency(
                      advertisingCosts.reduce(
                        (sum, cost) => sum + cost.monto,
                        0,
                      ),
                    )}
                  </span>
                </p>
              </div>

              {/* Cards móvil */}
              <div className="block sm:hidden space-y-3">
                {advertisingCosts.map((cost) => (
                  <div key={cost.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {cost.descripcion}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cost.plataforma || "Sin plataforma"}
                        </p>
                      </div>
                      <p className="font-bold text-red-600 text-sm">
                        {formatCurrency(cost.monto)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(cost.fecha)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tabla desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Descripción
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Plataforma
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {advertisingCosts.map((cost) => (
                      <tr key={cost.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(cost.fecha)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {cost.descripcion}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {cost.plataforma || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          {formatCurrency(cost.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "businesses" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Estado Financiero de Negocios
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Filtrar:
                  </label>
                  <select
                    value={pagoFilter}
                    onChange={(e) => setPagoFilter(e.target.value as any)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="ejecutado">Pagado</option>
                    <option value="sin pagar">Pendiente</option>
                  </select>
                </div>
              </div>

              {/* Cards móvil */}
              <div className="block sm:hidden space-y-3">
                {businesses
                  .filter(
                    (b) => pagoFilter === "todos" || b.pago === pagoFilter,
                  )
                  .map((business) => (
                    <div
                      key={business.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {business.name}
                          </p>
                          {business.profile_name && (
                            <p className="text-xs text-gray-500">
                              @{business.profile_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              business.pago === "ejecutado"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {business.pago === "ejecutado"
                              ? "✓ Pagado"
                              : "⚠ Pendiente"}
                          </Badge>
                          <Badge
                            variant={
                              business.subscription_status === "activa"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {business.subscription_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{business.subscription_months} meses</span>
                        <span>
                          {business.subscription_price
                            ? formatCurrency(business.subscription_price)
                            : "-"}
                        </span>
                      </div>
                      {business.subscription_expires_at && (
                        <p className="text-xs text-gray-400">
                          Vence: {formatDate(business.subscription_expires_at)}
                        </p>
                      )}
                      {business.pago === "sin pagar" && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedBusinessForRenewal(business.id);
                            setSelectedPlanForRenewal("");
                            setRenewalPaymentMethod("efectivo");
                            setShowRenewModal(true);
                          }}
                        >
                          Renovar Suscripción
                        </Button>
                      )}
                    </div>
                  ))}
              </div>

              {/* Tabla desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Negocio
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Estado Pago
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Suscripción
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Precio
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Vence
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses
                      .filter(
                        (b) => pagoFilter === "todos" || b.pago === pagoFilter,
                      )
                      .map((business) => (
                        <tr
                          key={business.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {business.name}
                            </p>
                            {business.profile_name && (
                              <p className="text-sm text-gray-500">
                                @{business.profile_name}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={
                                business.pago === "ejecutado"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {business.pago === "ejecutado"
                                ? "✓ Pagado"
                                : "⚠ Pendiente"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {business.subscription_months} meses
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {business.subscription_price
                              ? formatCurrency(business.subscription_price)
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-center text-sm">
                            {business.subscription_expires_at
                              ? formatDate(business.subscription_expires_at)
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={
                                business.subscription_status === "activa"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {business.subscription_status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {business.pago === "sin pagar" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedBusinessForRenewal(business.id);
                                  setSelectedPlanForRenewal("");
                                  setRenewalPaymentMethod("efectivo");
                                  setShowRenewModal(true);
                                }}
                              >
                                Renovar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "expiring" && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Suscripciones por Vencer (30 días)
              </h2>

              {suscripcionesPorVencer.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No hay suscripciones por vencer en los próximos 30 días
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suscripcionesPorVencer.map((suscripcion) => (
                    <div
                      key={suscripcion.id}
                      className={`border rounded-lg p-6 ${
                        suscripcion.days_remaining <= 7
                          ? "border-red-300 bg-red-50"
                          : suscripcion.days_remaining <= 15
                            ? "border-yellow-300 bg-yellow-50"
                            : "border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {suscripcion.name}
                          </h3>
                          {suscripcion.profile_name && (
                            <p className="text-sm text-gray-600">
                              @{suscripcion.profile_name}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            suscripcion.days_remaining <= 7
                              ? "destructive"
                              : suscripcion.days_remaining <= 15
                                ? "default"
                                : "secondary"
                          }
                        >
                          {Math.floor(suscripcion.days_remaining)} días
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Vence:</strong>{" "}
                          {formatDate(suscripcion.expires_at)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Plan actual:</strong>{" "}
                          {suscripcion.subscription_months} meses
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        {suscripcion.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${suscripcion.phone}`}
                              className="hover:text-blue-600"
                            >
                              {suscripcion.phone}
                            </a>
                          </div>
                        )}
                        {suscripcion.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${suscripcion.email}`}
                              className="hover:text-blue-600"
                            >
                              {suscripcion.email}
                            </a>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();

                          // Prellenar el negocio siempre
                          setSelectedBusinessForRenewal(suscripcion.id);

                          // Intentar encontrar el plan correspondiente
                          const plan = plans.find(
                            (p) => p.months === suscripcion.subscription_months,
                          );

                          if (plan) {
                            setSelectedPlanForRenewal(plan.id.toString());
                          } else {
                            setSelectedPlanForRenewal("");
                          }

                          setRenewalPaymentMethod("efectivo");
                          setShowRenewModal(true);
                        }}
                      >
                        Renovar Suscripción
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Renovar Suscripción */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 my-4">
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
                  Negocio *
                </label>
                <select
                  value={selectedBusinessForRenewal}
                  onChange={(e) =>
                    setSelectedBusinessForRenewal(e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Selecciona un negocio</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.profile_name ? `(@${b.profile_name})` : ""} -
                      {b.subscription_status === "activa"
                        ? ` Activa (vence ${b.subscription_expires_at ? new Date(b.subscription_expires_at).toLocaleDateString("es-HN") : "N/A"})`
                        : " Vencida"}
                    </option>
                  ))}
                </select>
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
                      {plan.months} meses -{" "}
                      {formatCurrency(plan.price_lempiras)}
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

              {selectedBusinessForRenewal && selectedPlanForRenewal && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Resumen:</strong>
                    <br />
                    Negocio:{" "}
                    {
                      businesses.find(
                        (b) => b.id === selectedBusinessForRenewal,
                      )?.name
                    }
                    <br />
                    Plan:{" "}
                    {
                      plans.find(
                        (p) => p.id === parseInt(selectedPlanForRenewal),
                      )?.months
                    }{" "}
                    meses
                    <br />
                    Monto:{" "}
                    {formatCurrency(
                      plans.find(
                        (p) => p.id === parseInt(selectedPlanForRenewal),
                      )?.price_lempiras || 0,
                    )}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRenewModal(false);
                    setSelectedBusinessForRenewal("");
                    setSelectedPlanForRenewal("");
                    setRenewalPaymentMethod("efectivo");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    if (
                      !selectedBusinessForRenewal ||
                      !selectedPlanForRenewal
                    ) {
                      toast.error("Por favor selecciona un negocio y un plan");
                      return;
                    }

                    const plan = plans.find(
                      (p) => p.id === parseInt(selectedPlanForRenewal),
                    );
                    if (!plan) {
                      toast.error("Plan no encontrado");
                      return;
                    }

                    const business = businesses.find(
                      (b) => b.id === selectedBusinessForRenewal,
                    );
                    const confirmMessage =
                      business?.subscription_status === "activa"
                        ? `¿Renovar suscripción de ${business.name}?\n\nLos ${plan.months} meses se sumarán a su tiempo restante.\nMonto: ${formatCurrency(plan.price_lempiras)}\nMétodo: ${renewalPaymentMethod}`
                        : `¿Renovar suscripción de ${business?.name}?\n\nPlan: ${plan.months} meses\nMonto: ${formatCurrency(plan.price_lempiras)}\nMétodo: ${renewalPaymentMethod}`;

                    if (confirm(confirmMessage)) {
                      await handleRenewSubscription(
                        selectedBusinessForRenewal,
                        plan.months,
                        plan.price_lempiras,
                        renewalPaymentMethod,
                      );
                      setShowRenewModal(false);
                      setSelectedBusinessForRenewal("");
                      setSelectedPlanForRenewal("");
                      setRenewalPaymentMethod("efectivo");
                    }
                  }}
                  className="flex-1"
                  disabled={
                    !selectedBusinessForRenewal || !selectedPlanForRenewal
                  }
                >
                  Procesar Renovación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Transacción */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 my-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nueva Transacción</h3>
              <button onClick={() => setShowAddTransactionModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID del Negocio *
                </label>
                <select
                  value={newTransaction.business_id}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      business_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Selecciona un negocio</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo *</label>
                <select
                  value={newTransaction.tipo}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      tipo: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="reembolso">Reembolso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={newTransaction.concepto}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      concepto: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Pago de suscripción - 6 meses"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto (L) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.monto}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      monto: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Método de Pago
                </label>
                <select
                  value={newTransaction.metodo_pago}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      metodo_pago: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Selecciona un método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="deposito">Depósito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={newTransaction.notas}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      notas: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                ></textarea>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddTransactionModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateTransaction} className="flex-1">
                  Crear Transacción
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nueva Publicidad */}
      {showAddAdvertisingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 my-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Nuevo Costo de Publicidad</h3>
              <button onClick={() => setShowAddAdvertisingModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={newAdvertising.descripcion}
                  onChange={(e) =>
                    setNewAdvertising({
                      ...newAdvertising,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Campaña Facebook Ads - Febrero"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto (L) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAdvertising.monto}
                  onChange={(e) =>
                    setNewAdvertising({
                      ...newAdvertising,
                      monto: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Plataforma
                </label>
                <select
                  value={newAdvertising.plataforma}
                  onChange={(e) =>
                    setNewAdvertising({
                      ...newAdvertising,
                      plataforma: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Selecciona una plataforma</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={newAdvertising.fecha}
                  onChange={(e) =>
                    setNewAdvertising({
                      ...newAdvertising,
                      fecha: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={newAdvertising.notas}
                  onChange={(e) =>
                    setNewAdvertising({
                      ...newAdvertising,
                      notas: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                ></textarea>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddAdvertisingModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateAdvertising} className="flex-1">
                  Crear Costo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Plan */}
      {showEditPlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 sm:p-6 my-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Editar Plan</h3>
              <button onClick={() => setShowEditPlanModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duración
                </label>
                <input
                  type="text"
                  value={`${editPlanData.months} meses`}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editPlanData.price_lempiras}
                  onChange={(e) =>
                    setEditPlanData({
                      ...editPlanData,
                      price_lempiras: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={editPlanData.description}
                  onChange={(e) =>
                    setEditPlanData({
                      ...editPlanData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditPlanModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdatePlan} className="flex-1">
                  Actualizar Plan
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

      {/* Comprobante de Transacción */}
      {transactionReceipt && (
        <TransactionReceipt
          transactionId={transactionReceipt.id}
          businessName={transactionReceipt.business_name || "Desconocido"}
          tipo={transactionReceipt.tipo}
          concepto={transactionReceipt.concepto}
          monto={transactionReceipt.monto}
          paymentMethod={transactionReceipt.metodo_pago || undefined}
          fecha={transactionReceipt.fecha}
          notas={transactionReceipt.notas || undefined}
          onClose={() => setTransactionReceipt(null)}
        />
      )}
    </div>
  );
};

export default FinancialDashboard;
