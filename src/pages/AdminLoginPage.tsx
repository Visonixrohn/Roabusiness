import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { setAdminSession } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [clave, setClave] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("redirect") || "/editar-negocio";
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clave.trim() || !code.trim()) {
      toast.error("Ingresa clave y code");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("admin")
        .select("clave, code")
        .eq("clave", clave.trim())
        .eq("code", code.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Credenciales de administrador inválidas");
        return;
      }

      setAdminSession();
      toast.success("Bienvenido, administrador");
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      toast.error(`No se pudo iniciar sesión: ${err.message || "Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-blue-600">
                RoaBusiness
              </span>
              <span className="text-xs text-gray-500 block leading-none">
                Admin Access
              </span>
            </div>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Ingreso Administrador
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Acceso a registro y edición de negocios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clave
            </label>
            <Input
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Ingresa tu clave"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa tu code"
              type="password"
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <LockKeyhole className="h-4 w-4 mr-2" />
            {isSubmitting ? "Validando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 bg-blue-50 rounded-lg p-3 text-sm text-blue-700 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5" />
          <p>
            Esta pantalla es solo para ingreso administrativo. No permite
            registro de nuevos administradores.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
