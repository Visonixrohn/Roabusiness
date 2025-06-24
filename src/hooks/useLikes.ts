import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export function useLikes(postId: string, userId: string) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  async function fetchLikes() {
    setLoading(true);
    setError(null);
    // Contar likes totales
    const { count, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    if (countError) {
      setError(countError.message);
      if (isFirstLoad.current) setLikesCount(0); // solo limpiar en el primer load
      setLoading(false);
      return;
    }
    setLikesCount(count || 0);
    // Verificar si el usuario ya dio like
    const { data, error: likeError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    if (likeError && likeError.code !== "PGRST116") {
      setError(likeError.message);
      setLoading(false);
      return;
    }
    setLiked(!!data);
    setLoading(false);
    isFirstLoad.current = false;
  }

  useEffect(() => {
    if (!postId || !userId) return;
    fetchLikes();
    // eslint-disable-next-line
  }, [postId, userId]);

  async function toggleLike() {
    setLoading(true);
    setError(null);
    if (liked) {
      // Quitar like
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }
    } else {
      // Dar like
      const { error } = await supabase
        .from("likes")
        .insert([{ post_id: postId, user_id: userId }]);
      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }
    }
    await fetchLikes();
    setLoading(false);
    return true;
  }

  return { liked, likesCount, loading, error, toggleLike };
}
