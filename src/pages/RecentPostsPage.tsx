import { useRecentPosts } from "@/hooks/useRecentPosts";
import PostCard from "@/components/PostCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useLikes } from "@/hooks/useLikes";
import { useComments } from "@/hooks/useComments";

const sortOptions = [
  { value: "recent", label: "Más recientes" },
  { value: "likes", label: "Más me gustas" },
  { value: "comments", label: "Más comentarios" },
];

export default function RecentPostsPage() {
  const { posts, loading, error } = useRecentPosts();
  const { businesses } = useBusinesses();
  const [sortBy, setSortBy] = useState("recent");

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "likes") return (b.likes_count || 0) - (a.likes_count || 0);
    if (sortBy === "comments")
      return (b.comments_count || 0) - (a.comments_count || 0);
    // Default: recent (created_at desc)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Obtener vistas del perfil del negocio desde el endpoint de negocios (si no existe, usar 0)
  const businessViewsMap = {};
  (businesses || []).forEach((b) => {
    // Solo usar 0, ya que la mayoría de negocios no tiene views_count
    businessViewsMap[b.id] = 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Publicaciones Recientes
          </h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 animate-pulse h-32"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No hay publicaciones recientes
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sortedPosts.map((post) => {
              // Obtener vistas del negocio
              const views =
                businessViewsMap[post.business_id] || post.views_count || 0;
              return (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    views_count: views,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
