import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useViews({
  businessId,
  postId,
  userId,
}: {
  businessId?: string;
  postId?: string;
  userId?: string;
}) {
  const [viewsCount, setViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchViews() {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("views")
      .select("*", { count: "exact", head: true });
    if (businessId) query = query.eq("business_id", businessId);
    if (postId) query = query.eq("post_id", postId);
    const { count, error } = await query;
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setViewsCount(count || 0);
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId && !postId) return;
    fetchViews();
    // eslint-disable-next-line
  }, [businessId, postId]);

  async function addView() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("views").insert([
      {
        business_id: businessId || null,
        post_id: postId || null,
        user_id: userId || null,
      },
    ]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchViews();
    setLoading(false);
    return true;
  }

  return { viewsCount, loading, error, addView };
}
