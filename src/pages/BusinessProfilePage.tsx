import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinesses } from "@/hooks/useBusinesses";
import { usePosts } from "@/hooks/usePosts";
import { useFollowers } from "@/hooks/useFollowers";
import { useViews } from "@/hooks/useViews";
import { useRatings } from "@/hooks/useRatings";
import { useAmenities } from "@/hooks/useAmenities";
import { useGallery } from "@/hooks/useGallery";
import { useContacts } from "@/hooks/useContacts";
import { useComments } from "@/hooks/useComments";
import { useLikes } from "@/hooks/useLikes";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  Users,
} from "lucide-react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ContactModal from "@/components/ContactModal";
import GalleryModal from "@/components/GalleryModal";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FacebookIcon from "@/components/icons/FacebookIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import XIcon from "@/components/icons/XIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";
import SocialFloatingButton from "@/components/SocialFloatingButton";

const PostCard = ({
  post,
  business,
  user,
  comments,
  likes,
  setAllComments,
  setAllLikes,
}) => {
  const [openCommentsModal, setOpenCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPost, setEditPost] = useState({
    title: post.title,
    content: post.content,
    image: post.image,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Likes y comentarios del post
  const postComments = comments || [];
  const postLikes = likes || [];
  const lastTwo = postComments.slice(-2);
  const likesCount = postLikes.length;
  const liked = !!(user && postLikes.find((l) => l.user_id === user.id));

  // Eliminar publicación
  const handleDeletePost = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?"))
      return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return toast.error("Error al eliminar publicación");
    toast.success("Publicación eliminada");
  };

  // Editar publicación
  const handleEditPost = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    const { error } = await supabase
      .from("posts")
      .update({
        title: editPost.title,
        content: editPost.content,
        image: editPost.image,
      })
      .eq("id", post.id);
    setIsEditing(false);
    if (error) return toast.error("Error al editar publicación");
    setShowEditModal(false);
    toast.success("Publicación actualizada");
  };

  // Eliminar comentario
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) return toast.error("Error al eliminar comentario");
    // Actualizar estado global de comentarios para reflejar el cambio inmediatamente
    setAllComments((prev) => prev.filter((c) => c.id !== commentId));
    toast.success("Comentario eliminado");
  };

  // Crear comentario
  const handleCreateComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast.error("Debes iniciar sesión para comentar");
      return;
    }
    setIsCommenting(true);
    const { error } = await supabase.from("comments").insert([
      {
        user_id: user.id,
        business_id: business.id,
        post_id: post.id,
        content: commentText,
      },
    ]);
    setIsCommenting(false);
    if (error) return toast.error("Error al agregar comentario");
    setCommentText("");
    // Refrescar comentarios globales
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*, users(id, name, avatar)")
      .eq("post_id", post.id);
    setAllComments((prev) => [
      ...prev.filter((c) => c.post_id !== post.id),
      ...(commentsData || []).map((c) => ({ ...c, user: c.users })),
    ]);
    toast.success("Comentario agregado");
  };

  // Like/Unlike
  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para dar like");
      return;
    }
    setIsLiking(true);
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("likes")
        .insert([{ post_id: post.id, user_id: user.id }]);
    }
    setIsLiking(false);
    // Refrescar likes globales
    const { data: likesData } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post.id);
    setAllLikes((prev) => [
      ...prev.filter((l) => l.post_id !== post.id),
      ...(likesData || []),
    ]);
  };

  // Utilidad para fallback de nombre/avatar
  const getUserName = (comment) =>
    comment.user?.name || comment.user?.id || "Usuario";
  const getUserAvatar = (comment) => comment.user?.avatar || undefined;
  const getUserInitial = (comment) =>
    comment.user?.name
      ? comment.user.name.charAt(0)
      : (comment.user?.id || "U").charAt(0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Opciones de publicación (solo dueño) */}
      {user &&
        user.type === "business" &&
        user.businessData?.id === business.id && (
          <div className="flex justify-end p-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditModal(true)}
            >
              Editar
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeletePost}>
              Eliminar
            </Button>
          </div>
        )}
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={business.logo}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{business.name}</h4>
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <Calendar className="h-3 w-3" />
              <span>
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Post Content */}
      <div className="p-4">
        <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
        <p className="text-gray-800 mb-4">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-64 object-cover object-center rounded-lg cursor-pointer hover:opacity-95 transition-opacity bg-white"
            style={{ backgroundColor: "#fff", display: "block" }}
          />
        )}
      </div>
      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            className={`flex items-center text-gray-600 hover:text-red-500 transition-colors ${
              liked ? "text-red-500" : ""
            }`}
            onClick={handleToggleLike}
            disabled={!user}
          >
            <Heart className={`h-5 w-5 mr-2 ${liked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </button>
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => setOpenCommentsModal(true)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            <span>{Array.isArray(comments) ? comments.length : 0}</span>
          </button>
        </div>
      </div>
      {/* Modal editar publicación */}
      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Editar publicación</h2>
              <form onSubmit={handleEditPost} className="space-y-4">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Título"
                  value={editPost.title}
                  onChange={(e) =>
                    setEditPost((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <textarea
                  className="w-full border rounded px-3 py-2"
                  placeholder="Contenido"
                  value={editPost.content}
                  onChange={(e) =>
                    setEditPost((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />
                <ImageUpload
                  onImageUploaded={(url) =>
                    setEditPost((prev) => ({ ...prev, image: url }))
                  }
                  onImageRemoved={() =>
                    setEditPost((prev) => ({ ...prev, image: "" }))
                  }
                  currentImage={editPost.image}
                  label="Subir imagen para la publicación"
                  maxSize={5}
                />
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isEditing}>
                    {isEditing ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}
      {/* Mostrar solo los 2 comentarios más recientes */}
      {lastTwo.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          {lastTwo.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={getUserAvatar(comment)}
                  alt={getUserName(comment)}
                />
                <AvatarFallback>{getUserInitial(comment)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {getUserName(comment)}
                </p>
                <p className="text-sm text-gray-700">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {comment.created_at
                    ? new Date(comment.created_at).toLocaleDateString()
                    : ""}
                </p>
              </div>
              {/* Botón eliminar comentario (solo dueño del comentario o del negocio) */}
              {user &&
                (user.id === comment.user_id ||
                  (user.type === "business" &&
                    user.businessData?.id === business.id)) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Eliminar
                  </Button>
                )}
            </div>
          ))}
        </div>
      )}
      {/* Add Comment */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              user ? "Escribe un comentario..." : "Inicia sesión para comentar"
            }
            disabled={!user}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            onKeyPress={(e) => e.key === "Enter" && handleCreateComment()}
          />
          <Button
            size="sm"
            onClick={handleCreateComment}
            disabled={!commentText.trim() || !user}
          >
            Comentar
          </Button>
        </div>
      </div>
      {/* Modal de comentarios */}
      {openCommentsModal && (
        <Dialog open={true} onOpenChange={() => setOpenCommentsModal(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-0 max-w-lg w-full max-h-[80vh] flex flex-col">
              {/* Cabecera sticky */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex justify-between items-center">
                <h2 className="text-lg font-bold">Comentarios</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenCommentsModal(false)}
                >
                  Cerrar
                </Button>
              </div>
              {/* Lista de comentarios */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {Array.isArray(comments) && comments.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    Aún no hay comentarios.
                  </div>
                ) : (
                  Array.isArray(comments) &&
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3 py-3 border-b last:border-b-0"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={getUserAvatar(comment)}
                          alt={getUserName(comment)}
                        />
                        <AvatarFallback>
                          {getUserInitial(comment)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {getUserName(comment)}
                        </p>
                        <p className="text-sm text-gray-700">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      {/* Botón eliminar comentario (solo dueño del comentario o del negocio) */}
                      {user &&
                        (user.id === comment.user_id ||
                          (user.type === "business" &&
                            user.businessData?.id === business.id)) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                    </div>
                  ))
                )}
              </div>
              {/* Input fijo abajo */}
              <form
                className="border-t bg-white px-6 py-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (commentText.trim()) handleCreateComment();
                }}
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    user
                      ? "Escribe un comentario..."
                      : "Inicia sesión para comentar"
                  }
                  disabled={!user}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  autoFocus
                />
                <Button
                  size="sm"
                  type="submit"
                  disabled={!commentText.trim() || !user}
                >
                  Comentar
                </Button>
              </form>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

const BusinessProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getBusinessById } = useBusinesses();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  // Estado para el error del mapa
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      const localBusiness = getBusinessById(id!);
      if (localBusiness) {
        setBusiness(localBusiness);
        setLoadingBusiness(false);
      } else {
        const { data } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", id)
          .single();
        setBusiness((data as Business) || null);
        setLoadingBusiness(false);
      }
    };
    fetchBusiness();
  }, [id, getBusinessById]);

  // Supabase hooks
  const businessId = String(id ?? "");
  const { posts, createPost, loading: postsLoading } = usePosts(businessId);
  const { isFollowing, followersCount, toggleFollow } = useFollowers(
    id!,
    user?.id || ""
  );
  const { viewsCount, addView } = useViews({
    businessId: id,
    userId: user?.id,
  });
  const { average, userRating, rate } = useRatings(id!, user?.id || "");
  const { amenities } = useAmenities(id!);
  const { images } = useGallery(id!);
  const { contacts } = useContacts(id!);

  // Estados locales solo para UI
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", image: "" });
  const [isPosting, setIsPosting] = useState(false);
  const [openCommentsModal, setOpenCommentsModal] = useState<{
    postId: string | null;
  }>({ postId: null });

  // Acceso seguro a arrays y objetos
  const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);
  const safeObj = (obj: any) => obj || {};

  // Crear publicación usando hook Supabase
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (safeArray(posts).length >= 3) {
      toast.error("Solo puedes tener hasta 3 publicaciones activas.");
      return;
    }
    if (!newPost.title || !newPost.content)
      return toast.error("Completa título y contenido");
    if (!user) {
      toast.error("Debes iniciar sesión para publicar");
      return;
    }
    setIsPosting(true);
    try {
      const result = await createPost({
        title: newPost.title,
        content: newPost.content,
        image: newPost.image,
        user_id: user.id,
      });
      if (!result) {
        toast.error(
          "Error al crear publicación. Revisa la consola o la estructura de la tabla en Supabase."
        );
      } else {
        toast.success("¡Publicación creada!");
        setNewPost({ title: "", content: "", image: "" });
        setShowCreateModal(false);
      }
    } catch (err) {
      toast.error("Error inesperado al crear publicación");
    } finally {
      setIsPosting(false);
    }
  };

  // Like a post usando hook Supabase
  const handleLike = (postId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar "me gusta"');
      return;
    }
    // El hook useLikes ya maneja el toggle
  };

  // Comentar en un post usando hook Supabase
  // (Eliminado porque la lógica de comentarios está correctamente implementada dentro de PostCard)

  const getPostIcon = (type: string) => {
    switch (type) {
      case "offer":
        return "🏷️";
      case "event":
        return "📅";
      case "image":
        return "📸";
      default:
        return "💬";
    }
  };

  const islandColors = {
    Roatán: "bg-blue-100 text-blue-800",
    Utila: "bg-green-100 text-green-800",
    Guanaja: "bg-purple-100 text-purple-800",
  };

  const handleNewPostChange = (field: string, value: string) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  };

  // Seguir/deseguir negocio
  const handleFollow = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para seguir negocios");
      return;
    }
    try {
      let res;
      if (isFollowing) {
        res = await fetch(
          `http://localhost:3001/api/businesses/${business.id}/unfollow`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }
        );
      } else {
        res = await fetch(
          `http://localhost:3001/api/businesses/${business.id}/follow`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }
        );
      }
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "No se pudo actualizar el seguimiento");
        return;
      }
      toast.success(
        isFollowing
          ? "Has dejado de seguir este negocio"
          : "Ahora sigues este negocio"
      );
    } catch (err) {
      toast.error("Error de red al intentar seguir/deseguir");
    }
  };

  // Obtener todos los comentarios y likes de todos los posts en lote
  const [allComments, setAllComments] = useState([]);
  const [allLikes, setAllLikes] = useState([]);
  useEffect(() => {
    async function fetchAllCommentsAndLikes() {
      if (!posts.length) return;
      // Traer todos los comentarios de los posts visibles
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, users(id, name, avatar)")
        .in(
          "post_id",
          posts.map((p) => p.id)
        );
      setAllComments(commentsData || []);
      // Traer todos los likes de los posts visibles
      const { data: likesData } = await supabase
        .from("likes")
        .select("*")
        .in(
          "post_id",
          posts.map((p) => p.id)
        );
      setAllLikes(likesData || []);
    }
    fetchAllCommentsAndLikes();
  }, [posts]);

  // Agrupar comentarios y likes por postId
  const commentsByPost = useMemo(() => {
    const map = {};
    allComments.forEach((c) => {
      if (!map[c.post_id]) map[c.post_id] = [];
      map[c.post_id].push({ ...c, user: c.users });
    });
    return map;
  }, [allComments]);
  const likesByPost = useMemo(() => {
    const map = {};
    allLikes.forEach((l) => {
      if (!map[l.post_id]) map[l.post_id] = [];
      map[l.post_id].push(l);
    });
    return map;
  }, [allLikes]);

  // Efecto para sumar visualización al cargar el perfil
  useEffect(() => {
    if (!id) return;
    addView();
  }, [id]);

  // Loader visual solo con postsLoading
  if (postsLoading || loadingBusiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Negocio no encontrado
          </h2>
          <Link to="/directorio" className="text-blue-600 hover:underline">
            Volver al directorio
          </Link>
        </div>
      </div>
    );
  }

  const weekDaysOrder = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // En el render de posts:
  {
    safeArray(posts).length === 0 ? (
      <div className="text-gray-500 text-center py-8">
        No hay publicaciones aún.
      </div>
    ) : (
      safeArray(posts).map((post) => (
        <PostCard
          key={post.id}
          post={post}
          business={business}
          user={user}
          comments={commentsByPost[post.id] || []}
          likes={likesByPost[post.id] || []}
          setAllComments={setAllComments}
          setAllLikes={setAllLikes}
        />
      ))
    );
  }

  // DEBUG: Mostrar en consola los datos de contacto para verificar
  console.log("DEBUG business.contact", business.contact);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-2 sm:px-4 md:px-8 lg:px-24 xl:px-40 2xl:px-64 py-4 w-full">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/directorio"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al directorio
          </Link>
        </div>

        {/* Cover Section estilo Facebook */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="relative h-64 md:h-80 bg-white">
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-full object-cover object-center bg-white"
              onClick={() => setShowGalleryModal(true)}
              style={{ backgroundColor: "#fff", display: "block" }}
            />

            {/* Business Info Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full flex flex-col items-center text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
                {business.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <Badge
                  className={
                    islandColors[business.island as keyof typeof islandColors]
                  }
                >
                  {business.island}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white bg-opacity-20 text-white border-white"
                >
                  {business.category}
                </Badge>
              </div>
            </div>

            {/* Gallery Button */}
            {Array.isArray(business.gallery) && business.gallery.length > 1 && (
              <Button
                className="absolute bottom-6 right-6 bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={() => setShowGalleryModal(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver galería ({business.gallery.length})
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <img
                src={business.logo}
                alt={`${business.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg -mt-8"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {business.name}
                </h2>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {business.location}, {business.island}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Botones Contactar, Seguir y WhatsApp debajo de la card */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full items-stretch px-6 pb-4">
            <Button
              variant={isFollowing ? "default" : "outline"}
              onClick={() => {
                if (!user) {
                  toast.error("Debes iniciar sesión para seguir negocios");
                  return;
                }
                toggleFollow();
              }}
              className="flex-1 min-w-[120px] w-full h-full"
            >
              <Heart className="h-4 w-4 mr-2" />
              {isFollowing ? "Dejar de seguir" : "Seguir"}
              <span className="ml-2">({followersCount})</span>
            </Button>
            <Button
              onClick={() => setShowContactModal(true)}
              className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 w-full h-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar
            </Button>
            {business.contact?.phone && (
              <Button
                onClick={() => {
                  const phone = (business.contact?.phone || "").replace(
                    /\D/g,
                    ""
                  );
                  window.open(`https://wa.me/${phone}`);
                }}
                className="flex-1 min-w-[120px] w-full h-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white"
                style={{}}
              >
                <svg
                  viewBox="0 0 32 32"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.34 7.09L4 29l7.18-2.31A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.52-5.54-1.5l-.39-.23-4.27 1.37 1.4-4.15-.25-.4A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.28-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"></path>
                </svg>
                WhatsApp
              </Button>
            )}
          </div>
          {/* Botón flotante para redes sociales */}
          <SocialFloatingButton
            facebook={business.facebook}
            instagram={business.instagram}
            twitter={business.twitter}
            tiktok={business.tiktok}
            whatsapp={business.contact?.whatsapp}
          />

          {/* Mostrar visualizaciones en el perfil */}
          <div className="flex items-center text-gray-500 text-sm mt-2">
            <Eye className="h-4 w-4 mr-1" />
            <span>{viewsCount} visualizaciones</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Acerca de nosotros</h3>
            <p className="text-gray-600 mb-4">{business.description}</p>

            {/* Amenities */}
            <h3 className="text-xl font-bold text-blue-600 border-b-4 border-blue-300 pb-1 mb-4 drop-shadow-sm tracking-wide">
              Nuestros Servicios
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.isArray(business.amenities) &&
              business.amenities.length > 0 ? (
                business.amenities.map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="justify-center"
                  >
                    {amenity}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">Sin amenidades</span>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Publicaciones</h3>

            {/* Botón para crear publicación, solo visible para el dueño */}
            {user &&
              user.type === "business" &&
              user.businessData?.id === business.id && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={posts.length >= 3}
                  >
                    + Crear publicación
                  </Button>
                  {posts.length >= 3 && (
                    <div className="text-red-500 text-sm mt-2 font-semibold">
                      Solo puedes tener hasta 3 publicaciones activas.
                    </div>
                  )}
                </div>
              )}

            {safeArray(posts).length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No hay publicaciones aún.
              </div>
            ) : (
              safeArray(posts).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  business={business}
                  user={user}
                  comments={commentsByPost[post.id] || []}
                  likes={likesByPost[post.id] || []}
                  setAllComments={setAllComments}
                  setAllLikes={setAllLikes}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Información de Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <a
                  href={`tel:${business.contact?.phone || ""}`}
                  className="text-blue-600 hover:underline"
                >
                  {business.contact?.phone || "No disponible"}
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <a
                    href={`mailto:${business.contact?.email || ""}`}
                    className="text-blue-600 hover:underline"
                  >
                    {business.contact?.email || "No disponible"}
                  </a>
                  <div className="text-xs text-gray-500 mt-1">
                    {business.contact?.email || ""}
                  </div>
                </div>
              </div>
              {business.contact?.website && (
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={
                      business.contact.website.startsWith("http")
                        ? business.contact.website
                        : `https://${business.contact.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {business.contact.website}
                  </a>
                </div>
              )}
              {/* Redes Sociales SOLO en perfil público, con efectos visuales */}
              {(business.contact?.facebook ||
                business.contact?.instagram ||
                business.contact?.twitter ||
                business.contact?.tiktok) && (
                <div className="flex flex-col gap-2 mt-4">
                  <h3 className="text-lg font-semibold mb-2">Redes sociales</h3>
                  <div className="flex gap-4">
                    {business.contact?.facebook && (
                      <a
                        href={business.contact.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110 hover:shadow-lg rounded-full p-2 bg-[#f3f4f6] text-[#1877f3] hover:bg-[#e7f0fd] hover:text-[#1456a0]"
                        title="Facebook"
                      >
                        <FacebookIcon size={28} />
                      </a>
                    )}
                    {business.contact?.instagram && (
                      <a
                        href={business.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110 hover:shadow-lg rounded-full p-2 bg-[#f3f4f6] text-[#e1306c] hover:bg-[#fce4ef] hover:text-[#a81d4d]"
                        title="Instagram"
                      >
                        <InstagramIcon size={28} />
                      </a>
                    )}
                    {business.contact?.twitter && (
                      <a
                        href={business.contact.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110 hover:shadow-lg rounded-full p-2 bg-[#f3f4f6] text-[#1da1f2] hover:bg-[#e5f6fd] hover:text-[#0d6fa1]"
                        title="X (Twitter)"
                      >
                        <XIcon size={28} />
                      </a>
                    )}
                    {business.contact?.tiktok && (
                      <a
                        href={business.contact.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110 hover:shadow-lg rounded-full p-2 bg-[#f3f4f6] text-black hover:bg-[#eaeaea] hover:text-[#ff0050]"
                        title="TikTok"
                      >
                        <TikTokIcon size={28} />
                      </a>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {business.location}, {business.island}
                </span>
              </div>
            </div>
          </div>

          {/* Business Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Datos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Seguidores</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {followersCount}
                </span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Horarios</h3>
            <div className="space-y-2 text-sm">
              {business.schedule && business.schedule.length > 0
                ? weekDaysOrder.map((day) => {
                    const sch = business.schedule.find(
                      (sch: any) => sch.day === day
                    );
                    return sch ? (
                      <div key={sch.day} className="flex justify-between">
                        <span className="text-gray-700">{sch.day}</span>
                        <span className="text-gray-900">
                          {sch.open && sch.close
                            ? `${sch.open} - ${sch.close}`
                            : "Cerrado"}
                        </span>
                      </div>
                    ) : null;
                  })
                : weekDaysOrder.map((day, index) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-700">{day}</span>
                      <span className="text-gray-900">
                        {index < 5 ? "8:00 AM - 6:00 PM" : "9:00 AM - 8:00 PM"}
                      </span>
                    </div>
                  ))}
            </div>
            <div className="mt-3 flex items-center text-green-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Abierto ahora</span>
            </div>
          </div>

          {/* Información de contacto y ubicación */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Contacto y Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Phone className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{business?.contact?.phone || "No disponible"}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{business?.contact?.email || "No disponible"}</span>
                </div>
                {business?.contact?.website && (
                  <div className="flex items-center mb-2">
                    <Globe className="h-5 w-5 mr-2 text-gray-500" />
                    <a
                      href={`https://${business.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {business.contact.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {business?.location || "No disponible"}
                  </span>
                </div>
              </div>
              {/* Mapa Google Maps */}
              {business?.coordinates && (
                <div className="w-full rounded overflow-hidden relative flex items-center justify-between">
                  <span className="text-gray-600">Ubicación:</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${business.coordinates.lat},${business.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
