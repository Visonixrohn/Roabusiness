
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
    if (user) {
      fetch(`http://localhost:3001/api/users/${user.id}/following`)
        .then((res) => res.json())
        .then((data) => setFollowing(data.businesses || []));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Debes iniciar sesión</h2>
          <Link to="/login">
            <Button>Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={user.userData?.avatar || undefined}
            alt={user.userData?.name || user.email}
          />
          <AvatarFallback>
            {(user.userData?.name || user.email || "U").charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {user.userData?.name || user.email}
          </h1>
          <p className="text-gray-600">{user.email}</p>
          <Link to="/user/settings">
            <Button size="sm" className="mt-2">
              Editar perfil
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <Link to="/">
          <Button
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            Ir al Directorio
          </Button>
        </Link>
      </div>

      {/* Botón cerrar sesión solo en móvil y solo para usuarios no negocio */}
      {user.type !== "business" && (
        <div className="block md:hidden mb-8">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      )}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Negocios que sigues</h2>
        {following.length === 0 ? (
          <p className="text-gray-500">No sigues ningún negocio aún.</p>
        ) : (
          <ul className="divide-y">
            {following.map((biz: any) => (
              <li key={biz.id} className="py-3 flex items-center space-x-4">
                <img
                  src={biz.logo}
                  alt={biz.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Link
                    to={`/negocio/${biz.id}`}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    {biz.name}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {biz.category} - {biz.island}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
