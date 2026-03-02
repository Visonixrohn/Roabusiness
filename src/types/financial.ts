// Tipos para el sistema financiero

export interface SubscriptionPlan {
  id: number;
  months: number;
  price_lempiras: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  business_id: string;
  business_name?: string; // Desde la vista
  business_profile?: string; // Desde la vista
  tipo: "ingreso" | "egreso" | "reembolso";
  tipo_display?: string; // Desde la vista
  concepto: string;
  monto: number;
  fecha: string;
  metodo_pago?: string;
  notas?: string;
  created_by?: string;
  created_at: string;
}

export interface AdvertisingCost {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  plataforma?: string;
  notas?: string;
  created_at: string;
}

export interface SubscriptionHistory {
  id: number;
  business_id: string;
  subscription_months: number;
  started_at: string;
  expires_at: string;
  amount_paid: number;
  status: "activa" | "vencida" | "cancelada" | "renovada";
  created_at: string;
  updated_at: string;
}

export interface BusinessFinancialView {
  id: string;
  name: string;
  profile_name?: string;
  pago: "ejecutado" | "sin pagar";
  subscription_months?: number;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  subscription_status: "activa" | "vencida";
  days_until_expiration?: number;
  subscription_price?: number;
  registered_at?: string;
}

export interface FinancialSummary {
  ingresos_totales: number;
  egresos_totales: number;
  costos_publicidad: number;
  balance_total: number;
  negocios_sin_pagar: number;
  negocios_pagados: number;
  suscripciones_vencidas: number;
  suscripciones_activas: number;
}

export interface IngresosPorMes {
  mes: string;
  cantidad_transacciones: number;
  ingresos_mes: number;
}

export interface SuscripcionPorVencer {
  id: string;
  name: string;
  profile_name?: string;
  subscription_months: number;
  subscription_started_at: string;
  expires_at: string;
  days_remaining: number;
  phone?: string;
  email?: string;
}

export interface RenovarSuscripcionParams {
  business_id: string;
  new_months: number;
  amount_paid: number;
  payment_method?: string;
  admin_user?: string;
}

export interface CancelarSuscripcionParams {
  business_id: string;
  razon?: string;
  admin_user?: string;
}

export interface ProcessPaymentParams {
  business_id: string;
  plan_months: number;
  amount_paid: number;
  payment_method?: string;
  created_by?: string;
}

export interface PaymentReceipt {
  success: boolean;
  transaction_id: number;
  business_id: string;
  business_name: string;
  profile_name?: string;
  plan_months: number;
  amount_paid: number;
  payment_method: string;
  payment_date: string;
  expires_at: string;
  was_grace_period: boolean;
}
