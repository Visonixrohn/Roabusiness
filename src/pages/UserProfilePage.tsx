import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) return;
      // Obtener los negocios que sigue el usuario desde Supabase
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: followers, error } = await supabase
        .from("followers")
        .select("businesses:business_id(*)")
        .eq("user_id", user.id);
      if (error) return setFollowing([]);
      // followers es un array de objetos con la propiedad businesses (el negocio seguido)
      const businesses = (followers || [])
        .map((f) => f.businesses)
        .filter(Boolean);
      setFollowing(businesses);
    };
    fetchFollowing();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-slate-900 text-white">
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <h2 className="text-2xl font-extrabold mb-6">Debes iniciar sesión</h2>
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 font-bold shadow-lg">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-6 mb-10">
          <Avatar className="w-24 h-24 shadow-xl border-4 border-white">
            <AvatarImage
              src={user.userData?.avatar || undefined}
              alt={user.userData?.name || user.email}
            />
            <AvatarFallback className="text-lg">
              {(user.userData?.name || user.email || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-extrabold">
              {user.userData?.name || user.email}
            </h1>
            <p className="text-slate-400">{user.email}</p>
            <Link to="/user/settings">
              <Button className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition-transform hover:scale-105">
                Editar perfil
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Link to="/">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold shadow-md transition-transform hover:scale-105">
              Ir al Directorio
            </Button>
          </Link>
        </div>

        {user.type !== "business" && (
          <div className="block md:hidden mb-8">
            <button
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 transition-transform hover:scale-105"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        )}

        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
          <h2 className="text-xl font-bold mb-6 text-purple-400">
            Negocios que sigues
          </h2>
          {following.length === 0 ? (
            <p className="text-slate-400">No sigues ningún negocio aún.</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {following.map((biz) => (
                <li key={biz.id} className="py-4 flex items-center space-x-4">
                  <img
                    src={biz.logo}
                    alt={biz.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/negocio/${biz.id}`}
                      className="font-semibold text-blue-400 hover:underline"
                    >
                      {biz.name}
                    </Link>
                    <div className="text-xs text-slate-400">
                      {biz.category} - {biz.island}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
