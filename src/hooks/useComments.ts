import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Comment {
  id: string;
  user_id: string;
  business_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users(id, name, avatar)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      setError(error.message);
      if (isFirstLoad.current) setComments([]); // solo limpiar en el primer load
      setLoading(false);
      return;
    }
    const mapped = (data || []).map((comment: any) => ({
      ...comment,
      user: comment.users,
    }));
    setComments(mapped);
    setLoading(false);
    isFirstLoad.current = false;
  }

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    fetchComments();
    // Suscripción realtime a la tabla de comentarios para este post
    let channel: any = null;
    if (!window.__supabaseCommentChannels)
      window.__supabaseCommentChannels = {};
    if (!window.__supabaseCommentChannels[postId]) {
      channel = supabase
        .channel("comments-realtime-" + postId)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
            filter: `post_id=eq.${postId}`,
          },
          (payload) => {
            fetchComments();
          }
        )
        .subscribe();
      window.__supabaseCommentChannels[postId] = channel;
    }
    return () => {
      if (
        window.__supabaseCommentChannels &&
        window.__supabaseCommentChannels[postId]
      ) {
        supabase.removeChannel(window.__supabaseCommentChannels[postId]);
        delete window.__supabaseCommentChannels[postId];
      }
    };
  }, [postId]);

  async function createComment({
    user_id,
    business_id,
    content,
  }: {
    user_id: string;
    business_id: string;
    content: string;
  }) {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("comments").insert([
      {
        user_id,
        business_id,
        post_id: postId,
        content,
      },
    ]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchComments();
    setLoading(false);
    return true;
  }

  return { comments, loading, error, createComment };
}

// Agrega la propiedad global para evitar error de typescript
declare global {
  interface Window {
    __supabaseCommentChannels?: Record<string, any>;
  }
}
