import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useGallery(businessId: string) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchGallery() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("gallery")
      .select("image")
      .eq("business_id", businessId);
    if (error) {
      setError(error.message);
      setImages([]);
      setLoading(false);
      return;
    }
    setImages((data || []).map((g: any) => g.image));
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId) return;
    fetchGallery();
  }, [businessId]);

  async function addImage(image: string) {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("gallery")
      .insert([{ business_id: businessId, image }]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchGallery();
    setLoading(false);
    return true;
  }

  async function removeImage(image: string) {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("business_id", businessId)
      .eq("image", image);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchGallery();
    setLoading(false);
    return true;
  }

  return { images, loading, error, addImage, removeImage };
}
