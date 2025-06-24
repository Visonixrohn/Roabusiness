import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useContacts(businessId: string) {
  const [contacts, setContacts] = useState<{
    phone: string;
    email: string;
    website: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchContacts() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("contacts")
      .select("phone, email, website")
      .eq("business_id", businessId)
      .maybeSingle();
    if (error) {
      setError(error.message);
      setContacts(null);
      setLoading(false);
      return;
    }
    setContacts(data || null);
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId) return;
    fetchContacts();
  }, [businessId]);

  async function updateContacts({
    phone,
    email,
    website,
  }: {
    phone: string;
    email: string;
    website: string;
  }) {
    setLoading(true);
    setError(null);
    // Upsert contacto
    const { error } = await supabase
      .from("contacts")
      .upsert([{ business_id: businessId, phone, email, website }], {
        onConflict: "business_id",
      });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchContacts();
    setLoading(false);
    return true;
  }

  return { contacts, loading, error, updateContacts };
}
