import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useRatings(businessId: string, userId: string) {
  const [average, setAverage] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRatings() {
    setLoading(true);
    setError(null);
    // Obtener promedio
    const { data: avgData, error: avgError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("business_id", businessId);
    if (avgError) {
      setError(avgError.message);
      setLoading(false);
      return;
    }
    if (avgData && avgData.length > 0) {
      const sum = avgData.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      setAverage(sum / avgData.length);
    } else {
      setAverage(null);
    }
    // Obtener rating del usuario
    const { data: userData, error: userError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .maybeSingle();
    if (userError && userError.code !== "PGRST116") {
      setError(userError.message);
      setLoading(false);
      return;
    }
    setUserRating(userData?.rating ?? null);
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId || !userId) return;
    fetchRatings();
    // eslint-disable-next-line
  }, [businessId, userId]);

  async function rate(rating: number) {
    setLoading(true);
    setError(null);
    // Upsert rating
    const { error } = await supabase
      .from("ratings")
      .upsert([{ business_id: businessId, user_id: userId, rating }], {
        onConflict: "business_id,user_id",
      });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchRatings();
    setLoading(false);
    return true;
  }

  return { average, userRating, loading, error, rate };
}
