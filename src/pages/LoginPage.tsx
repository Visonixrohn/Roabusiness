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
  const [showRegisterModal, setShowRegisterModal] = useState(false);
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
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-md mx-auto px-4 py-16">
        {/* Volver */}
        <div className="mb-6 flex justify-start items-center">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2 stroke-2" />
            Volver
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
          className="bg-white rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-8 sm:p-10 border border-gray-200 transition duration-300 animate-fade-in-up max-w-md mx-auto"
        >
          <div className="space-y-8">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-[1.25rem] text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-blue-300 focus:border-transparent transition-shadow duration-300 shadow-sm focus:shadow-lg"
                  placeholder="tu@email.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full pl-14 pr-14 py-4 border border-gray-300 rounded-[1.25rem] text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-blue-300 focus:border-transparent transition-shadow duration-300 shadow-sm focus:shadow-lg"
                  placeholder="Tu contraseña"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón login */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 rounded-[2rem] shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-[1.05]"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>
        {/* Google Auth */}
        <div className="my-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-12 h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg text-gray-800 font-semibold transition-all duration-200 hover:bg-white/90"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-6 w-6"
            />
          </button>
          <p>Iniciar con Google como usuario</p>
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="w-40 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm"
          >
            Crear cuenta
          </button>
        </div>
        {/* Botón registrar negocio */}
        <div className="mt-4 flex justify-center">
          <Link to="/registrar-negocio">
            <Button className="w-40 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-2 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 text-sm">
              Registrar tu negocio
            </Button>
          </Link>
        </div>

        {/* Modal de registro */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Cerrar"
              >
                ×
              </button>

              <h2 className="text-xl font-bold text-center mb-8 text-gray-800">
                Crear cuenta
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/registrar-negocio" className="w-full sm:w-auto">
                  <Button
                    className="w-full bg-white text-purple-700 font-semibold py-2 rounded-3xl shadow-neumorph hover:shadow-neumorph-hover transition-shadow duration-300 border border-purple-300 hover:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2"
                    style={{
                      boxShadow: "8px 8px 15px #bebebe, -8px -8px 15px #ffffff",
                    }}
                  >
                    Registrar tu negocio
                  </Button>
                </Link>
                <Link to="/registrar-usuario" className="w-full sm:w-auto">
                  <Button
                    className="w-full bg-white text-green-700 font-semibold py-3 rounded-3xl shadow-neumorph hover:shadow-neumorph-hover transition-shadow duration-300 border border-green-300 hover:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2"
                    style={{
                      boxShadow: "8px 8px 15px #bebebe, -8px -8px 15px #ffffff",
                    }}
                  >
                    Crear tu perfil de usuario
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

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

        {/* Footer / branding */}
        <div className="mt-12 text-center border-t border-gray-100 pt-6 text-sm">
          <div className="text-center mt-12">
            {/* Logo */}
            <a
              href="https://visonixro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-2"
            >
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

export default LoginPage;
