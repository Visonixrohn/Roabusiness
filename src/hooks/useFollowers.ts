import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useFollowers(businessId: string, userId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFollowers() {
    setLoading(true);
    setError(null);
    // Contar seguidores totales
    const { count, error: countError } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId);
    if (countError) {
      setError(countError.message);
      setLoading(false);
      return;
    }
    setFollowersCount(count || 0);
    // Verificar si el usuario ya sigue (si userId disponible)
    if (userId) {
      const { data, error: followError } = await supabase
        .from("followers")
        .select("id")
        .eq("business_id", businessId)
        .eq("user_id", userId)
        .maybeSingle();
      if (followError && followError.code !== "PGRST116") {
        setError(followError.message);
        setLoading(false);
        return;
      }
      setIsFollowing(!!data);
    } else {
      setIsFollowing(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId) return;
    fetchFollowers();
    // eslint-disable-next-line
  }, [businessId, userId]);

  async function toggleFollow() {
    setLoading(true);
    setError(null);
    if (isFollowing) {
      // Dejar de seguir
      const query = supabase.from("followers").delete().eq("business_id", businessId);
      const res = userId ? query.eq("user_id", userId) : query.is("user_id", null);
      const { error } = await res;
      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }
    } else {
      // Seguir
      const insertObj: any = { business_id: businessId };
      if (userId) insertObj.user_id = userId;
      else insertObj.user_id = null;
      const { error } = await supabase.from("followers").insert([insertObj]);
      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }
    }
    await fetchFollowers();
    setLoading(false);
    return true;
  }

  return { isFollowing, followersCount, loading, error, toggleFollow };
}
