type SubscriptionLike = {
  subscription_months?: number | null;
  subscription_started_at?: string | null;
  created_at?: string | null;
};

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
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
  const expirationDate = getSubscriptionExpirationDate(business);
  if (!expirationDate) return true;
  return expirationDate.getTime() >= Date.now();
};
