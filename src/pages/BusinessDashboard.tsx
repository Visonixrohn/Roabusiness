import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInteractions } from "@/contexts/InteractionsContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Users,
  Star,
  Calendar,
  Image as ImageIcon,
  Settings,
  LogOut,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import { useViews } from "@/hooks/useViews";
import { useFollowers } from "@/hooks/useFollowers";
import { useRatings } from "@/hooks/useRatings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { Switch } from "@/components/ui/switch";

const BusinessDashboard = () => {
  const { user, logout, login } = useAuth();
  const businessId = user?.businessData?.id;
  const userId = user?.id;

  // Hooks de datos reales
  const { viewsCount } = useViews({ businessId });
  const { followersCount } = useFollowers(businessId, userId);
  const { average: avgRating } = useRatings(businessId, userId);

  const [posts, setPosts] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(
    user?.businessData?.is_public ?? true
  );
  const [savingPublic, setSavingPublic] = useState(false);

  // Estadísticas calculadas
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const totalComments = posts.reduce(
    (sum, p) => sum + (p.comments_count || 0),
    0
  );
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;

  const navigate = useNavigate();
  const [showNewPost, setShowNewPost] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Estado para nueva publicación
  const [newPost, setNewPost] = useState("");
  const [newPostImage, setNewPostImage] = useState("");

  // Carga los posts del negocio desde Supabase
  useEffect(() => {
    if (!user || user.type !== "business" || !user.businessData?.id) return;
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, likes(count), comments(count)")
        .eq("business_id", user.businessData.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        // Normaliza los conteos
        const mapped = data.map((post: any) => ({
          ...post,
          likes_count: post.likes?.[0]?.count || 0,
          comments_count: post.comments?.[0]?.count || 0,
        }));
        setPosts(mapped);
      }
    };
    fetchPosts();
  }, [user]);

  // Crear publicación usando Supabase
  const handleCreatePost = async () => {
    if (!newPost.trim() || !user?.businessData?.id) return;
    const { error } = await supabase.from("posts").insert([
      {
        business_id: user.businessData.id,
        content: newPost,
        image: newPostImage || null,
      },
    ]);
    if (!error) {
      setNewPost("");
      setNewPostImage("");
      setShowNewPost(false);
      toast.success("Publicación creada exitosamente");
      // Recargar posts
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*, likes(count), comments(count)")
        .eq("business_id", user.businessData.id)
        .order("created_at", { ascending: false });
      if (!fetchError && data) {
        const mapped = data.map((post: any) => ({
          ...post,
          likes_count: post.likes?.[0]?.count || 0,
          comments_count: post.comments?.[0]?.count || 0,
        }));
        setPosts(mapped);
      }
    } else {
      toast.error("Error al crear la publicación");
    }
  };

  // Eliminar publicación usando Supabase
  const handleDeletePost = async (postId: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (!error) {
        toast.success("Publicación eliminada");
        // Recargar posts
        const { data, error: fetchError } = await supabase
          .from("posts")
          .select("*, likes(count), comments(count)")
          .eq("business_id", user.businessData.id)
          .order("created_at", { ascending: false });
        if (!fetchError && data) {
          const mapped = data.map((post: any) => ({
            ...post,
            likes_count: post.likes?.[0]?.count || 0,
            comments_count: post.comments?.[0]?.count || 0,
          }));
          setPosts(mapped);
        }
      } else {
        toast.error("Error al eliminar la publicación");
      }
    }
  };

  const handleTogglePublic = async () => {
    setSavingPublic(true);
    const { error } = await supabase
      .from("businesses")
      .update({ is_public: !isPublic })
      .eq("id", user.businessData.id);
    if (!error) {
      setIsPublic(!isPublic);
      // Actualizar el contexto y localStorage
      if (user && user.businessData) {
        user.businessData.is_public = !isPublic;
        localStorage.setItem("currentUser", JSON.stringify(user));
      }
      toast.success(
        !isPublic
          ? "Tu perfil ahora es público y visible en el directorio."
          : "Tu perfil ahora está oculto del directorio."
      );
    } else {
      toast.error("Error al actualizar visibilidad");
    }
    setSavingPublic(false);
  };

  // Sincronizar isPublic con el valor real de la base de datos al cargar el dashboard
  useEffect(() => {
    if (user?.businessData?.is_public !== undefined) {
      setIsPublic(user.businessData.is_public);
    }
  }, [user?.businessData?.is_public]);

  // Refrescar datos del negocio tras volver de la configuración
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (user?.businessData?.id) {
        const res = await fetch(`http://localhost:3001/api/businesses`);
        const data = await res.json();
        const updated = data.find(
          (b: any) => String(b.id) === String(user.businessData.id)
        );
        if (updated) {
          user.businessData.name = updated.name;
          user.businessData.category = updated.category;
          user.businessData.location = updated.location;
          user.businessData.island = updated.island;
          user.businessData.logo = updated.logo;
          user.businessData.coverImage = updated.coverImage;
          user.businessData.contact = updated.contact;
        }
      }
    };
    fetchBusinessData();
    // eslint-disable-next-line
  }, []);

  if (!user || user.type !== "business" || !user.businessData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900">
            Acceso no autorizado
          </h2>
          <p className="text-gray-600 mt-2">
            Esta página es solo para negocios registrados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header del Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <img
              src={
                user.businessData.logo || "https://via.placeholder.com/80x80"
              }
              alt="Logo"
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.businessData.name}
              </h1>
              <p className="text-gray-600">{user.businessData.category}</p>
              <p className="text-sm text-gray-500">
                {user.businessData.location}, {user.businessData.island}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/negocio/${user.businessData?.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
            </Button>
            {/* Botón de configuración */}
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/negocio/${user.businessData?.id}/configuracion`)
              }
            >
              <Settings className="h-4 w-4 mr-2" />
            </Button>
            <Button variant="outline" onClick={() => setShowLogoutModal(true)}>
              <LogOut className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>

        {/* Switch de perfil público/privado */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-medium text-gray-700">Perfil público</span>
          <Switch
            checked={isPublic}
            onCheckedChange={handleTogglePublic}
            disabled={savingPublic}
          />
          <span className="text-xs text-gray-500">
            {isPublic ? "Visible en el directorio" : "Oculto del directorio"}
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Visualizaciones
                </p>
                <p className="text-2xl font-bold text-gray-900">{viewsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Seguidores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {followersCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Me Gusta</p>
                <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Comentarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalComments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Estadísticas
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Posts */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {/* Crear Nueva Publicación */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={
                        user.businessData.logo ||
                        "https://via.placeholder.com/50x50"
                      }
                      alt="Logo"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <button
                      onClick={() => setShowNewPost(true)}
                      className="flex-1 bg-white rounded-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100 border"
                    >
                      ¿Qué quieres compartir con tus clientes?
                    </button>
                  </div>

                  {showNewPost && (
                    <div className="space-y-4">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="Escribe tu publicación..."
                      />

                      {/* Subir imagen para post */}
                      <div>
                        <ImageUpload
                          onImageUploaded={(url) => setNewPostImage(url)}
                          onImageRemoved={() => setNewPostImage("")}
                          currentImage={newPostImage}
                          label="Agregar imagen a la publicación"
                          maxSize={5}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewPost(false);
                            setNewPost("");
                            setNewPostImage("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreatePost}
                          disabled={!newPost.trim()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Publicar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de Publicaciones */}
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes publicaciones
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crea tu primera publicación para conectar con tus clientes
                    </p>
                    <Button onClick={() => setShowNewPost(true)}>
                      Crear Primera Publicación
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white border rounded-lg">
                        {/* Post Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  user.businessData.logo ||
                                  "https://via.placeholder.com/50x50"
                                }
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {user.businessData.name}
                                </h4>
                                <div className="flex items-center text-sm text-gray-500 space-x-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      post.created_at
                                    ).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-4">
                          <p className="text-gray-800 mb-4">{post.content}</p>

                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post content"
                              className="w-full h-64 object-cover rounded-lg mb-4"
                            />
                          )}
                        </div>

                        {/* Post Actions */}
                        <div className="px-4 py-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex space-x-6">
                              <div className="flex items-center text-gray-600">
                                <Heart className="h-5 w-5 mr-2" />
                                <span>{post.likes_count || 0}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                <span>{post.comments_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Analytics */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Estadísticas del Negocio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-4">
                      Rendimiento de Publicaciones
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Total de publicaciones:
                        </span>
                        <span className="font-semibold text-blue-900">
                          {posts.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Me gusta totales:</span>
                        <span className="font-semibold text-blue-900">
                          {totalLikes}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Comentarios totales:
                        </span>
                        <span className="font-semibold text-blue-900">
                          {totalComments}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-4">
                      Alcance y Visibilidad
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">
                          Visualizaciones del perfil:
                        </span>
                        <span className="font-semibold text-green-900">
                          {viewsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Seguidores:</span>
                        <span className="font-semibold text-green-900">
                          {followersCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">
                          Promedio likes/post:
                        </span>
                        <span className="font-semibold text-green-900">
                          {avgLikes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de cerrar sesión solo en móvil */}
                <div className="block md:hidden mt-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación de cierre de sesión */}
        <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Cerrar sesión?</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas cerrar tu sesión?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowLogoutModal(false);
                  setShowWaitModal(true);
                  setTimeout(() => {
                    logout();
                    navigate("/");
                    setShowWaitModal(false);
                  }, 1000);
                }}
              >
                Sí, cerrar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación de eliminación */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar cuenta?</DialogTitle>
              <DialogDescription>
                Esta acción eliminará tu cuenta y todos los datos asociados
                (negocio, publicaciones, likes, comentarios, seguidores, etc).
                ¿Estás seguro?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                  setPasswordError("");
                  setShowPasswordModal(true);
                }}
                disabled={sendingCode}
              >
                Sí, eliminar cuenta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Modal para ingresar contraseña */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirma con tu contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu contraseña para confirmar la eliminación de tu
                cuenta.
              </DialogDescription>
            </DialogHeader>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <div className="text-red-500 text-sm mb-2">{passwordError}</div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  setPasswordError("");
                  // Validar contraseña usando login del contexto
                  const result = await login(user.email, password);
                  if (!result.success) {
                    setPasswordError("Contraseña incorrecta");
                    return;
                  }
                  setShowPasswordModal(false);
                  setShowWaitModal(true);
                  setTimeout(async () => {
                    // Eliminar interacciones y usuario/negocio en Supabase
                    // 1. Eliminar likes
                    await supabase.from("likes").delete().eq("user_id", userId);
                    await supabase
                      .from("likes")
                      .delete()
                      .eq("business_id", businessId);
                    // 2. Eliminar comentarios
                    await supabase
                      .from("comments")
                      .delete()
                      .eq("user_id", userId);
                    await supabase
                      .from("comments")
                      .delete()
                      .eq("business_id", businessId);
                    // 3. Eliminar seguidores
                    await supabase
                      .from("followers")
                      .delete()
                      .eq("user_id", userId);
                    await supabase
                      .from("followers")
                      .delete()
                      .eq("business_id", businessId);
                    // 4. Eliminar visualizaciones
                    await supabase.from("views").delete().eq("user_id", userId);
                    await supabase
                      .from("views")
                      .delete()
                      .eq("business_id", businessId);
                    // 5. Eliminar posts
                    await supabase
                      .from("posts")
                      .delete()
                      .eq("business_id", businessId);
                    // 6. Eliminar negocio
                    await supabase
                      .from("businesses")
                      .delete()
                      .eq("id", businessId);
                    // 7. Eliminar usuario
                    await supabase.from("users").delete().eq("id", userId);
                    setShowWaitModal(false);
                    toast.success("Cuenta eliminada correctamente");
                    logout();
                    navigate("/");
                  }, 5000);
                }}
              >
                Confirmar y eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Modal de espera */}
        <Dialog open={showWaitModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminando cuenta...</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6">
              <svg
                className="animate-spin h-10 w-10 text-red-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span className="text-gray-700 font-semibold">
                Eliminando todos tus datos...
              </span>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer / branding */}
        <div className="mt-12 text-center border-t border-gray-100 pt-6 text-sm">
         <div className="text-center mt-12">
  {/* Logo */}
  <a href="https://visonixro.com" target="_blank" rel="noopener noreferrer" className="inline-block mb-2">
    <img
      src="https://i.imgur.com/6Ua5WQl.png"
      alt="VISONIXRO Logo"
      className="h-10 w-10 mx-auto object-contain"
    />
  </a>

  {/* Texto con gradiente */}
  <a
    href="https://visonixro.com"
    target="_blank"
    rel="noopener noreferrer"
    className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-lg hover:underline transition-all duration-200"
  >
    VISONIXRO
  </a>
</div>

          <p className="text-xs text-gray-500 mt-1">
            Desarrollo y soluciones digitales
          </p>
          <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-gray-400">
            <span>Miguel Ángel Romero</span>
            <span>•</span>
            <span>info@visonixro.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
