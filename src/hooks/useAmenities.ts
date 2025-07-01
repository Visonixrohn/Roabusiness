import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAmenities(businessId: string) {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAmenities() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("amenities")
      .select("amenity")
      .eq("business_id", businessId);
    if (error) {
      setError(error.message);
      setAmenities([]);
      setLoading(false);
      return;
    }
    setAmenities((data || []).map((a: any) => a.amenity));
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId) return;
    fetchAmenities();
  }, [businessId]);

  async function addAmenity(amenity: string) {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("amenities")
      .insert([{ business_id: businessId, amenity }]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchAmenities();
    setLoading(false);
    return true;
  }

  async function removeAmenity(amenity: string) {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("amenities")
      .delete()
      .eq("business_id", businessId)
      .eq("amenity", amenity);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchAmenities();
    setLoading(false);
    return true;
  }

  return { amenities, loading, error, addAmenity, removeAmenity };
}
