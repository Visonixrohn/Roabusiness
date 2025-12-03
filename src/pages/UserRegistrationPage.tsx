import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import { signInWithGoogle } from "@/lib/googleAuth";

const UserRegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState(true); // Mostrar política primero
  const navigate = useNavigate();

  const handleAcceptPolicy = () => setShowPolicy(false);
  const handleRejectPolicy = () => navigate("/");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name || !formData.email) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: formData }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message || 'Error al registrar usuario');
      } else {
        toast.success('Registro de usuario completado');
        navigate('/');
      }
    } catch (err) {
      toast.error('Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, avatar: imageUrl }));
  };

  const handleAvatarRemoved = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  if (showPolicy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-2xl bg-white rounded shadow p-8">
          <PrivacyPolicyPage />
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={handleRejectPolicy}>
              Rechazar
            </Button>
            <Button onClick={handleAcceptPolicy}>Aceptar y continuar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/login"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al login
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registrarse como Usuario
            </h1>
            <p className="text-gray-600">
              Crea tu cuenta para interactuar con los negocios
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <div className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de Perfil (opcional)
              </label>
              <ImageUpload
                onImageUploaded={handleAvatarUploaded}
                onImageRemoved={handleAvatarRemoved}
                currentImage={formData.avatar}
                label="Sube tu foto de perfil"
                maxSize={2}
                className="max-w-xs mx-auto"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseñas eliminadas: registro directo en tabla `users` (sin Auth) */}

            {/* Botón de envío */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 py-3"
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta de Usuario"}
            </Button>
          </div>
        </form>

        {/* Google Auth eliminado (auth deshabilitado) */}

        {/* Enlaces adicionales */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">Registro creado correctamente.</p>
        </div>

        {/* Beneficios */}
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-center text-gray-900 mb-4">
            ¿Por qué crear una cuenta de usuario?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <User className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Interactúa</h4>
              <p className="text-gray-600 text-sm">
                Comenta y da "me gusta" a los negocios
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Contacta Fácil
              </h4>
              <p className="text-gray-600 text-sm">
                Contacta directamente con los negocios
              </p>
            </div>
          </div>
        </div>

        {/* Branding Visonixro */}
        <div className="mt-12 text-center border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <h3 className="font-bold text-lg">VISONIXRO</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Desarrollo y soluciones digitales para las Islas de la Bahía
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-xs text-gray-400">
            <div>📧 info@visonixro.com</div>
            <div>📞 +504 88632788</div>
            <div>📍 Roatán, Islas de la Bahía</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationPage;
