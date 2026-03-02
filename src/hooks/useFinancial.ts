import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  SubscriptionPlan,
  Transaction,
  AdvertisingCost,
  SubscriptionHistory,
  BusinessFinancialView,
  FinancialSummary,
  IngresosPorMes,
  SuscripcionPorVencer,
  RenovarSuscripcionParams,
  CancelarSuscripcionParams,
  ProcessPaymentParams,
  PaymentReceipt,
} from "@/types/financial";
import { toast } from "sonner";

export const useFinancial = () => {
  const [loading, setLoading] = useState(false);

  // ============ PLANES DE SUSCRIPCIÓN ============

  const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("months", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Error al cargar los planes de suscripción");
      return [];
    }
  };

  const updateSubscriptionPlan = async (
    id: number,
    updates: Partial<SubscriptionPlan>,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("subscription_plans")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Plan actualizado correctamente");
      return true;
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      toast.error("Error al actualizar el plan");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============ TRANSACCIONES ============

  const fetchTransactions = async (filters?: {
    tipo?: "ingreso" | "egreso" | "reembolso";
    startDate?: string;
    endDate?: string;
    business_id?: string;
  }): Promise<Transaction[]> => {
    try {
      let query = supabase
        .from("transactions_with_business")
        .select("*")
        .order("fecha", { ascending: false });

      if (filters?.tipo) {
        query = query.eq("tipo", filters.tipo);
      }
      if (filters?.startDate) {
        query = query.gte("fecha", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("fecha", filters.endDate);
      }
      if (filters?.business_id) {
        query = query.eq("business_id", filters.business_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Error al cargar las transacciones");
      return [];
    }
  };

  const createTransaction = async (
    transaction: Omit<Transaction, "id" | "created_at">,
  ): Promise<Transaction | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      toast.success("Transacción registrada correctamente");
      return data as Transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Error al registrar la transacción");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ============ COSTOS DE PUBLICIDAD ============

  const fetchAdvertisingCosts = async (filters?: {
    startDate?: string;
    endDate?: string;
    plataforma?: string;
  }): Promise<AdvertisingCost[]> => {
    try {
      let query = supabase
        .from("advertising_costs")
        .select("*")
        .order("fecha", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("fecha", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("fecha", filters.endDate);
      }
      if (filters?.plataforma) {
        query = query.eq("plataforma", filters.plataforma);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching advertising costs:", error);
      toast.error("Error al cargar los costos de publicidad");
      return [];
    }
  };

  const createAdvertisingCost = async (
    cost: Omit<AdvertisingCost, "id" | "created_at">,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase.from("advertising_costs").insert([cost]);

      if (error) throw error;
      toast.success("Costo de publicidad registrado correctamente");
      return true;
    } catch (error) {
      console.error("Error creating advertising cost:", error);
      toast.error("Error al registrar el costo de publicidad");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============ HISTORIAL DE SUSCRIPCIONES ============

  const fetchSubscriptionHistory = async (
    business_id?: string,
  ): Promise<SubscriptionHistory[]> => {
    try {
      let query = supabase
        .from("subscription_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (business_id) {
        query = query.eq("business_id", business_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching subscription history:", error);
      toast.error("Error al cargar el historial de suscripciones");
      return [];
    }
  };

  // ============ VISTAS FINANCIERAS ============

  const fetchBusinessesFinancial = async (): Promise<
    BusinessFinancialView[]
  > => {
    try {
      const { data, error } = await supabase
        .from("businesses_financial_view")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching businesses financial view:", error);
      toast.error("Error al cargar la información financiera de negocios");
      return [];
    }
  };

  const fetchFinancialSummary = async (): Promise<FinancialSummary | null> => {
    try {
      const { data, error } = await supabase
        .from("financial_summary")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      toast.error("Error al cargar el resumen financiero");
      return null;
    }
  };

  const fetchIngresosPorMes = async (): Promise<IngresosPorMes[]> => {
    try {
      const { data, error } = await supabase
        .from("ingresos_por_mes")
        .select("*")
        .order("mes", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching ingresos por mes:", error);
      toast.error("Error al cargar los ingresos por mes");
      return [];
    }
  };

  const fetchSuscripcionesPorVencer = async (): Promise<
    SuscripcionPorVencer[]
  > => {
    try {
      const { data, error } = await supabase
        .from("suscripciones_por_vencer")
        .select("*")
        .order("expires_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching suscripciones por vencer:", error);
      toast.error("Error al cargar las suscripciones por vencer");
      return [];
    }
  };

  // ============ FUNCIONES DE GESTIÓN ============

  const renovarSuscripcion = async (
    params: RenovarSuscripcionParams,
  ): Promise<PaymentReceipt | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("renovar_suscripcion", {
        p_business_id: params.business_id,
        p_new_months: params.new_months,
        p_amount_paid: params.amount_paid,
        p_payment_method: params.payment_method || null,
        p_admin_user: params.admin_user || null,
      });

      if (error) throw error;

      if (data) {
        toast.success("Suscripción renovada correctamente");
        return data as PaymentReceipt;
      }

      return null;
    } catch (error) {
      console.error("Error renovando suscripción:", error);
      toast.error("Error al renovar la suscripción");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelarSuscripcion = async (
    params: CancelarSuscripcionParams,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc("cancelar_suscripcion", {
        p_business_id: params.business_id,
        p_razon: params.razon || null,
        p_admin_user: params.admin_user || null,
      });

      if (error) throw error;
      toast.success("Suscripción cancelada correctamente");
      return true;
    } catch (error) {
      console.error("Error cancelando suscripción:", error);
      toast.error("Error al cancelar la suscripción");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============ PROCESAR PAGO ============

  const processBusinessPayment = async (
    params: ProcessPaymentParams,
  ): Promise<PaymentReceipt | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("process_business_payment", {
        p_business_id: params.business_id,
        p_plan_months: params.plan_months,
        p_amount_paid: params.amount_paid,
        p_payment_method: params.payment_method || "efectivo",
        p_created_by: params.created_by || "admin",
      });

      if (error) throw error;

      if (data && data.success) {
        toast.success(
          data.was_grace_period
            ? "¡Cuenta activada! Pago registrado correctamente"
            : "Pago registrado correctamente",
        );
        return data as PaymentReceipt;
      }

      throw new Error("No se pudo procesar el pago");
    } catch (error: any) {
      console.error("Error procesando pago:", error);
      toast.error("Error al procesar el pago: " + (error.message || ""));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // Planes
    fetchSubscriptionPlans,
    updateSubscriptionPlan,
    // Transacciones
    fetchTransactions,
    createTransaction,
    // Publicidad
    fetchAdvertisingCosts,
    createAdvertisingCost,
    // Historial
    fetchSubscriptionHistory,
    // Vistas
    fetchBusinessesFinancial,
    fetchFinancialSummary,
    fetchIngresosPorMes,
    fetchSuscripcionesPorVencer,
    // Gestión
    renovarSuscripcion,
    cancelarSuscripcion,
    processBusinessPayment,
  };
};
