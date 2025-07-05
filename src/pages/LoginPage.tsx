import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { toast } from "sonner";
import { signInWithGoogle } from "@/lib/googleAuth";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login, recoverPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success(result.message);
        navigate(returnTo);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Recuperar contraseña
  const handleResetPassword = async () => {
    setResetLoading(true);
    try {
      const { error } = await recoverPassword(resetEmail);
      if (error) {
        toast.error(error.message || "No se pudo enviar el correo");
      } else {
        toast.success("Enlace de recuperación enviado. Revisa tu correo.");
        setShowReset(false);
        setResetEmail("");
      }
    } catch {
      toast.error("Error inesperado");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16">
        {/* Volver */}
        <div className="mb-6 flex justify-between items-center">
          <Link to="/">
            <ArrowLeft className="inline mr-2" /> Volver
          </Link>
        </div>

        {/* Branding principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-md animate-fade-in">
            RoaBusiness
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Tu directorio local inteligente
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 transition duration-300 animate-fade-in-up"
        >
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón login */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-transform hover:scale-[1.01]"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>
        {/* Google Auth */}
        <div className="my-8 flex flex-col items-center">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full max-w-xs flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-3xl shadow-md hover:shadow-lg py-3.5 px-5 text-gray-800 font-semibold transition-all duration-200 hover:bg-white/90"
       >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-6 w-6"
            />
            Iniciar sesión con Google
          </button>
        </div>

        {/* Recuperar contraseña */}
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm font-medium"
            onClick={() => setShowReset(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        {/* Modal recuperación */}
        {showReset && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-2">Recuperar contraseña</h2>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="Tu email"
                disabled={resetLoading}
              />
              <Button
                onClick={handleResetPassword}
                disabled={resetLoading || !resetEmail}
                className="w-full mb-2"
              >
                {resetLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
              <button
                className="text-xs text-gray-500 hover:underline w-full"
                onClick={() => setShowReset(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Registro y cuentas demo */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/registrar-negocio" className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              Registrar tu negocio
            </Button>
          </Link>
          <Link to="/registrar-usuario" className="w-full sm:w-auto">
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl hover:from-blue-500 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
              Crear tu perfil de usuario
            </Button>
          </Link>
        </div>

        {/* Footer / branding */}
        <div className="mt-12 text-center border-t border-gray-100 pt-6 text-sm">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-lg">
            VISONIXRO
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

export default LoginPage;
