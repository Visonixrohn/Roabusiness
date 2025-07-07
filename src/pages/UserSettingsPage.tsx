import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { useNavigate } from "react-router-dom";
import { updatePassword, signInWithEmail } from "@/lib/auth";
import { isGoogleUser } from "@/lib/isGoogleUser";

const UserFullSettingsPage = () => {
  const { user, updateProfile, isBusiness } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.userData?.name || "",
    avatar: user?.userData?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const [showWait, setShowWait] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPasswordProfile, setCurrentPasswordProfile] = useState("");
  const [currentPasswordPass, setCurrentPasswordPass] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorProfile, setErrorProfile] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [isGoogle, setIsGoogle] = useState(false);

  useEffect(() => {
    if (user) {
      isGoogleUser(user.email).then(setIsGoogle);
      // Detectar si el usuario ya tiene contraseña (auth.user.user_metadata.provider)
      // O bien, intentar signInWithEmail y si da error, no tiene contraseña
      // Mejor: consultar el campo "password" en user.userData si existe, o usar el método de Supabase
      // Pero como workaround, intentamos signInWithEmail con un string imposible
      (async () => {
        if (!user.email) return;
        try {
          const { error } = await signInWithEmail(
            user.email,
            "contraseña_incorrecta_123456"
          );
          // Si el error es exactamente "Invalid login credentials", SÍ tiene contraseña
          // Si el error es cualquier otro ("Sign in failed", "Email not confirmed", etc), NO tiene contraseña
          if (error && error.message === "Invalid login credentials") {
            setHasPassword(true);
          } else {
            setHasPassword(false);
          }
        } catch {
          setHasPassword(false);
        }
      })();
    }
  }, [user]);

  if (!user || isBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <h2 className="text-3xl font-extrabold text-red-500 mb-6">
            Acceso denegado
          </h2>
          <Button
            onClick={() => navigate("/")}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 font-bold shadow-xl"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorProfile("");
    if (!isGoogle && !currentPasswordProfile) {
      setErrorProfile("Ingresa tu contraseña actual para continuar.");
      return;
    }
    setSaving(true);
    if (!isGoogle) {
      const { error: authError } = await signInWithEmail(
        user.email,
        currentPasswordProfile
      );
      if (authError) {
        setErrorProfile("Contraseña incorrecta.");
        setSaving(false);
        return;
      }
    }
    await updateProfile(form);
    setShowWait(true);
    setTimeout(() => {
      setShowWait(false);
      navigate("/");
    }, 1000);
    setSaving(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setErrorPass("");
    if (!currentPasswordPass) {
      setErrorPass("Debes ingresar tu contraseña actual.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorPass("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorPass("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    const { error: authError } = await signInWithEmail(
      user.email,
      currentPasswordPass
    );
    if (authError) {
      setErrorPass("Contraseña incorrecta.");
      setSaving(false);
      return;
    }
    const { error: passError } = await updatePassword(newPassword);
    if (passError) {
      setErrorPass(passError.message || "Error al actualizar contraseña.");
      setSaving(false);
      return;
    }
    setShowWait(true);
    setTimeout(() => {
      setShowWait(false);
      setShowPasswordFields(false);
      setCurrentPasswordPass("");
      setNewPassword("");
      setConfirmNewPassword("");
      setErrorPass("");
      navigate("/");
    }, 1000);
    setSaving(false);
  };

  if (showWait) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <h1 className="text-5xl font-extrabold mb-4 animate-pulse">
          RoaBusiness
        </h1>
        <p className="text-lg">Guardando cambios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-900 text-white py-16 px-4 sm:px-8 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
          <h2 className="text-3xl font-extrabold mb-6">Editar perfil</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center">
              <ImageUpload
                currentImage={form.avatar}
                onImageUploaded={(url) =>
                  setForm((f) => ({ ...f, avatar: url }))
                }
                onImageRemoved={() => setForm((f) => ({ ...f, avatar: "" }))}
                label="Avatar"
                maxSize={2}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>
            {!isGoogle && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPasswordProfile}
                  onChange={(e) => setCurrentPasswordProfile(e.target.value)}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3"
                />
              </div>
            )}
            {errorProfile && (
              <p className="text-red-400 text-sm">{errorProfile}</p>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-transform hover:scale-105"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </div>

        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-extrabold mb-4">
            {isGoogle && !hasPassword
              ? "Crear contraseña"
              : "Actualizar contraseña"}
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="mb-4 w-full border border-purple-500 text-purple-300 hover:bg-purple-800 rounded-xl"
          >
            {showPasswordFields
              ? "Cancelar"
              : isGoogle && !hasPassword
              ? "Crear contraseña"
              : "Actualizar contraseña"}
          </Button>
          {showPasswordFields && (
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              {(!isGoogle || hasPassword) && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={currentPasswordPass}
                    onChange={(e) => setCurrentPasswordPass(e.target.value)}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  {isGoogle && !hasPassword
                    ? "Crear nueva contraseña"
                    : "Nueva contraseña"}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3"
                />
              </div>
              {errorPass && <p className="text-red-400 text-sm">{errorPass}</p>}
              <Button
                type="submit"
                disabled={saving}
                className="w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-transform hover:scale-105"
              >
                {saving
                  ? "Guardando..."
                  : isGoogle && !hasPassword
                  ? "Crear contraseña"
                  : "Actualizar contraseña"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFullSettingsPage;
