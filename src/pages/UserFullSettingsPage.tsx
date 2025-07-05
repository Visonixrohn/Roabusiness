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
  const [currentPasswordProfile, setCurrentPasswordProfile] = useState("");
  const [currentPasswordPass, setCurrentPasswordPass] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorProfile, setErrorProfile] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [isGoogle, setIsGoogle] = useState(false);

  if (!user || isBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Acceso no autorizado</h2>
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  // Detectar si es usuario de Google
  useEffect(() => {
    if (user) {
      isGoogleUser(user.email).then(setIsGoogle);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar datos de perfil
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorProfile("");
    if (!isGoogle && !currentPasswordProfile) {
      setErrorProfile(
        "Debes ingresar tu contraseña actual para guardar cambios."
      );
      return;
    }
    setSaving(true);
    // Validar contraseña actual solo si NO es Google
    if (!isGoogle) {
      const { error: authError } = await signInWithEmail(
        user.email,
        currentPasswordProfile
      );
      if (authError) {
        setErrorProfile("Contraseña actual incorrecta.");
        setSaving(false);
        return;
      }
    }
    // Actualizar datos
    await updateProfile(form);
    setShowWait(true);
    setTimeout(() => {
      setShowWait(false);
      navigate("/");
    }, 1000);
    setSaving(false);
  };

  // Cambiar contraseña
  const handlePasswordUpdate = async (e: React.FormEvent) => {
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
      setErrorPass("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSaving(true);
    // Reautenticación
    const { error: authError } = await signInWithEmail(
      user.email,
      currentPasswordPass
    );
    if (authError) {
      setErrorPass("Contraseña actual incorrecta.");
      setSaving(false);
      return;
    }
    // Cambiar contraseña
    const { error: passError } = await updatePassword(newPassword);
    if (passError) {
      setErrorPass(passError.message || "No se pudo actualizar la contraseña.");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 animate-pulse">
          RoaBusiness
        </h1>
        <p className="text-gray-500">Guardando cambios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-8 md:flex-row md:gap-12 items-start">
      <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          Editar información
        </h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center mb-4">
            <ImageUpload
              currentImage={form.avatar}
              onImageUploaded={(url) => setForm((f) => ({ ...f, avatar: url }))}
              onImageRemoved={() => setForm((f) => ({ ...f, avatar: "" }))}
              label="Foto de perfil"
              maxSize={2}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!isGoogle && (
            <div>
              <label className="block font-semibold mb-1">
                Contraseña actual <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={currentPasswordProfile}
                onChange={(e) => setCurrentPasswordProfile(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
                required
              />
            </div>
          )}
          {errorProfile && (
            <div className="text-red-500 text-sm">{errorProfile}</div>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
      <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mt-8 md:mt-0">
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          Actualizar contraseña
        </h2>
        <Button
          variant="outline"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
          className="mb-4 w-full"
        >
          {showPasswordFields ? "Cancelar" : "Actualizar contraseña"}
        </Button>
        {showPasswordFields && (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">
                Contraseña actual <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={currentPasswordPass}
                onChange={(e) => setCurrentPasswordPass(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
                required
              />
            </div>
            {errorPass && (
              <div className="text-red-500 text-sm">{errorPass}</div>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Guardando..." : "Actualizar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserFullSettingsPage;
