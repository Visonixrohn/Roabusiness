import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface Post {
  id: string;
  business_id: string;
  title: string;
  content: string;
  image: string | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  likes_count?: number;
  comments_count?: number;
}

export function usePosts(businessIdRaw: string) {
  // Forzar máxima compatibilidad: string y trim
  const businessId = String(businessIdRaw).trim();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(`*, likes(count), comments(count)`)
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setPosts([]);
      setLoading(false);
      return;
    }

    const mapped = (data || []).map((post: any) => ({
      ...post,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
    }));
    setPosts(mapped);
    setLoading(false);
  }

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    fetchPosts();
  }, [businessId]);

  async function createPost({
    title,
    content,
    image = null,
    user_id,
  }: {
    title: string;
    content: string;
    image?: string | null;
    user_id: string;
  }) {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          business_id: businessId, // siempre string y trim
          title,
          content,
          image,
          user_id,
        },
      ])
      .select();
    if (error) {
      setError(error.message);
      console.error("Supabase post insert error:", error);
      setLoading(false);
      return null;
    }
    await fetchPosts();
    setLoading(false);
    return data ? data[0] : null;
  }

  return { posts, loading, error, createPost, refetch: fetchPosts };
}
