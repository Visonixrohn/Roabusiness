import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSchedule(businessId: string) {
  const [schedule, setSchedule] = useState<
    Array<{ id: string; day: string; open: string; close: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSchedule() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("schedule")
      .select("id, day, open, close")
      .eq("business_id", businessId);
    if (error) {
      setError(error.message);
      setSchedule([]);
      setLoading(false);
      return;
    }
    setSchedule(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId) return;
    fetchSchedule();
  }, [businessId]);

  async function updateSchedule(day: string, open: string, close: string) {
    setLoading(true);
    setError(null);
    // Upsert horario
    const { error } = await supabase
      .from("schedule")
      .upsert([{ business_id: businessId, day, open, close }], {
        onConflict: "business_id,day",
      });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchSchedule();
    setLoading(false);
    return true;
  }

  return { schedule, loading, error, updateSchedule };
}
