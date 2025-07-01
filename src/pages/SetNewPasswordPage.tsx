import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { updatePassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SetNewPasswordPage = () => {
  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWait, setShowWait] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error.message || "No se pudo actualizar la contraseña");
      return;
    }
    setShowWait(true);
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  if (showWait) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 animate-pulse">
          RoaBusiness
        </h1>
        <p className="text-gray-500">Actualizando contraseña...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-20 h-20 mb-2">
            <AvatarImage
              src={user?.user_metadata?.avatar || undefined}
              alt={user?.user_metadata?.name || user?.email}
            />
            <AvatarFallback>
              {(user?.user_metadata?.name || user?.email || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">
            {user?.user_metadata?.name || user?.email}
          </h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nueva contraseña</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPasswordPage;
