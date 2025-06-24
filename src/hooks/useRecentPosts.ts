import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Post {
  id: string;
  business_id: string;
  title: string;
  content: string;
  image?: string;
  created_at: string;
  business_name: string;
  business_logo: string;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
}

export const useRecentPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      // Obtener posts recientes con datos del negocio y conteos
      const { data, error } = await supabase
        .from("posts")
        .select(
          `*, businesses(name, logo), likes(count), comments(count), views(count)`
        )
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        setError(error.message);
        setPosts([]);
        setLoading(false);
        return;
      }
      const mapped = (data || []).map((post: any) => ({
        id: post.id,
        business_id: post.business_id,
        title: post.title,
        content: post.content,
        image: post.image,
        created_at: post.created_at,
        business_name: post.businesses?.name || "",
        business_logo: post.businesses?.logo || "",
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        views_count: post.views?.[0]?.count || 0,
      }));
      setPosts(mapped);
      setLoading(false);
    };
    loadPosts();
  }, []);

  return { posts, loading, error };
};
