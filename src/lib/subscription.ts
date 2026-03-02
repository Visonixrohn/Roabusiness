type SubscriptionLike = {
  subscription_months?: number | null;
  subscription_started_at?: string | null;
  created_at?: string | null;
  grace_period_expires?: string | null;
  pago?: "ejecutado" | "sin pagar";
};

export type SubscriptionStatus = "grace_period" | "active" | "expired";

export interface BusinessStatus {
  status: SubscriptionStatus;
  expiryDate: Date | null;
  daysRemaining: number | null;
}

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

export const getBusinessStatus = (
  business: SubscriptionLike,
): BusinessStatus => {
  // Verificar si el negocio está en período de gracia
  if (business.grace_period_expires) {
    const graceExpiryDate = new Date(business.grace_period_expires);
    const now = Date.now();

    if (graceExpiryDate.getTime() >= now) {
      const daysRemaining = Math.ceil(
        (graceExpiryDate.getTime() - now) / (1000 * 60 * 60 * 24),
      );
      return {
        status: "grace_period",
        expiryDate: graceExpiryDate,
        daysRemaining,
      };
    } else {
      // El período de gracia expiró
      return {
        status: "expired",
        expiryDate: graceExpiryDate,
        daysRemaining: 0,
      };
    }
  }

  // Si no hay período de gracia, verificar suscripción normal
  const expirationDate = getSubscriptionExpirationDate(business);

  if (!expirationDate) {
    // Sin suscripción configurada
    return {
      status: "expired",
      expiryDate: null,
      daysRemaining: 0,
    };
  }

  const now = Date.now();
  if (expirationDate.getTime() >= now) {
    const daysRemaining = Math.ceil(
      (expirationDate.getTime() - now) / (1000 * 60 * 60 * 24),
    );
    return {
      status: "active",
      expiryDate: expirationDate,
      daysRemaining,
    };
  } else {
    return {
      status: "expired",
      expiryDate: expirationDate,
      daysRemaining: 0,
    };
  }
};

export const getSubscriptionExpirationDate = (business: SubscriptionLike) => {
  if (!business.subscription_months || business.subscription_months <= 0) {
    return null;
  }

  const baseDate = new Date(
    business.subscription_started_at || business.created_at || Date.now(),
  );

  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  return addMonths(baseDate, business.subscription_months);
};

export const isSubscriptionActive = (business: SubscriptionLike) => {
  const status = getBusinessStatus(business);
  // Se considera "activo" tanto en período de gracia como con suscripción activa
  return status.status === "grace_period" || status.status === "active";
};
