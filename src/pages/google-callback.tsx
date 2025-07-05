import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { user, isUser } = useAuth();

  useEffect(() => {
    async function handleGoogleUser() {
      // 1. Obtener usuario autenticado de Supabase
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();
      if (!supaUser) {
        navigate("/login");
        return;
      }
      // 2. Buscar en tabla users
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", supaUser.email)
        .maybeSingle();
      if (!userData) {
        // 3. Si no existe, crear usuario tipo 'user' con datos de Google
        const name =
          supaUser.user_metadata?.full_name ||
          supaUser.user_metadata?.name ||
          supaUser.email;
        const avatar =
          supaUser.user_metadata?.avatar_url ||
          supaUser.user_metadata?.picture ||
          null;
        const { data: newUser } = await supabase
          .from("users")
          .insert([
            {
              email: supaUser.email,
              type: "user",
              name,
              avatar,
            },
          ])
          .select()
          .single();
        // Guardar en localStorage/contexto
        const userObj = {
          ...newUser,
          userData: { name: newUser.name, avatar: newUser.avatar },
        };
        localStorage.setItem("currentUser", JSON.stringify(userObj));
        window.location.href = "/user/profile";
        return;
      } else {
        // Si ya existe, guardar en localStorage/contexto
        const userObj = {
          ...userData,
          userData: { name: userData.name, avatar: userData.avatar },
        };
        localStorage.setItem("currentUser", JSON.stringify(userObj));
        window.location.href = "/user/profile";
        return;
      }
    }
    handleGoogleUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Iniciando sesión con Google...
        </h2>
        <p className="text-gray-600">Redirigiendo a tu perfil...</p>
      </div>
    </div>
  );
}
