import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { updatePassword, signInWithEmail } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { isGoogleUser } from "@/lib/isGoogleUser";

const UserSettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.userData?.name || "",
    avatar: user?.userData?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const [showWait, setShowWait] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);
  // Estados independientes para cada formulario
  const [currentPasswordProfile, setCurrentPasswordProfile] = useState("");
  const [currentPasswordPass, setCurrentPasswordPass] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorProfile, setErrorProfile] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const navigate = useNavigate();

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
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Configuración de perfil</h1>
      <form
        onSubmit={handleSave}
        className="space-y-6 bg-white p-6 rounded shadow"
      >
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
        <div>
          <label className="block font-semibold mb-1">Foto de perfil</label>
          <ImageUpload
            currentImage={form.avatar}
            onImageUploaded={(url) => setForm((f) => ({ ...f, avatar: url }))}
            onImageRemoved={() => setForm((f) => ({ ...f, avatar: "" }))}
            label="Subir foto de perfil"
            maxSize={2}
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
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
        >
          {showPasswordFields ? "Cancelar" : "Actualizar contraseña"}
        </Button>
      </div>
      {showPasswordFields && (
        <form
          onSubmit={handlePasswordUpdate}
          className="space-y-4 bg-white p-6 rounded shadow mt-6"
        >
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
            <label className="block font-semibold mb-1">Nueva contraseña</label>
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
          {errorPass && <div className="text-red-500 text-sm">{errorPass}</div>}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Actualizar contraseña"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default UserSettingsPage;
