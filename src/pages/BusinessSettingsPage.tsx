import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import { supabase } from "@/lib/supabaseClient";
import { updatePassword, signInWithEmail } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const categories = [
  "Hoteles y Alojamiento",
  "Restaurantes",
  "Tours y Actividades",
  "Spa y Bienestar",
  "Tiendas y Comercios",
  "Servicios",
  "Transporte",
  "Entretenimiento",
  "Deportes y Recreación",
];
const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function BusinessSettingsPage() {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWait, setShowWait] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [showEmailPassFields, setShowEmailPassFields] = useState(false);
  const [currentPasswordProfile, setCurrentPasswordProfile] = useState("");
  const [currentPasswordPass, setCurrentPasswordPass] = useState("");
  const [newEmail, setNewEmail] = useState(form?.contact?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorProfile, setErrorProfile] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      const { data: business, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();
      if (!business) {
        toast.error("No se encontró el negocio");
        setLoading(false);
        return;
      }
      // Inicializar horarios si no existen o están incompletos
      if (!business.schedule || business.schedule.length !== days.length) {
        business.schedule = days.map((d: string) => {
          const found = business.schedule?.find((s: any) => s.day === d);
          return found || { day: d, open: "", close: "" };
        });
      } else {
        business.schedule = days.map(
          (d: string) =>
            business.schedule.find((s: any) => s.day === d) || {
              day: d,
              open: "",
              close: "",
            }
        );
      }
      // Asegurar que contact existe
      if (!business.contact)
        business.contact = { phone: "", email: "", website: "" };
      // Si phone existe y no hay countryCode/phoneNumber, separarlos
      if (
        business.contact.phone &&
        (!business.contact.countryCode || !business.contact.phoneNumber)
      ) {
        const match = business.contact.phone.match(/^(\+\d{1,4})?(\d{6,})$/);
        if (match) {
          business.contact.countryCode = match[1] || "";
          business.contact.phoneNumber = match[2] || "";
        } else {
          business.contact.countryCode = "";
          business.contact.phoneNumber = business.contact.phone;
        }
      }
      setForm(business);
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  const handleChange = (field: string, value: any) => {
    if (field === "phone") {
      setForm((prev: any) => ({
        ...prev,
        contact: { ...prev.contact, phone: value },
      }));
    } else {
      setForm((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleScheduleChange = (idx: number, key: string, value: string) => {
    setForm((prev: any) => {
      const schedule = [...(prev.schedule || [])];
      schedule[idx][key] = value;
      return { ...prev, schedule };
    });
  };

  const handleImageChange = (field: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange(field, e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Guardar datos generales
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorProfile("");
    setPasswordInput("");
    setShowPasswordModal(true);
  };

  // Confirmar y guardar tras ingresar contraseña
  const handleConfirmSave = async () => {
    setErrorProfile("");
    if (!passwordInput) {
      setErrorProfile("Debes ingresar tu contraseña actual para guardar cambios.");
      toast.error("Debes ingresar tu contraseña actual para guardar cambios.");
      return;
    }
    setSaving(true);
    // Validar contraseña actual
    const { error: authError } = await signInWithEmail(user.email, passwordInput);
    if (authError) {
      setErrorProfile("Contraseña actual incorrecta.");
      toast.error("Contraseña actual incorrecta.");
      setSaving(false);
      return;
    }
    try {
      // Prepara el objeto a guardar
      const toSave = {
        ...form,
        contact: {
          ...form.contact,
          phone: `${form.contact?.countryCode || ""}${form.contact?.phoneNumber || ""}`,
          countryCode: form.contact?.countryCode || "",
          phoneNumber: form.contact?.phoneNumber || "",
          email: form.contact?.email || "",
          website: form.contact?.website || "",
        },
      };
      const { error } = await supabase
        .from("businesses")
        .update(toSave)
        .eq("id", id);
      if (!error) {
        toast.success("Datos actualizados");
        if (user && user.type === "business") {
          await updateProfile(toSave);
        }
        setShowWait(true);
        setShowPasswordModal(false);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast.error(error.message || "Error al actualizar");
        setErrorProfile(error.message || "Error al actualizar");
        console.error("Error al actualizar negocio:", error);
      }
    } catch (err) {
      toast.error("Error al actualizar");
      setErrorProfile("Error inesperado al actualizar");
      console.error("Error inesperado al actualizar negocio:", err);
    } finally {
      setSaving(false);
    }
  };

  // Cambiar email y/o contraseña
  const handleEmailPassUpdate = async (e: any) => {
    e.preventDefault();
    setErrorPass("");
    if (!currentPasswordPass) {
      setErrorPass("Debes ingresar tu contraseña actual.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setErrorPass("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
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
    // Cambiar email en Supabase Auth y en la BD
    if (newEmail && newEmail !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (emailError) {
        setErrorPass(emailError.message || "No se pudo actualizar el email.");
        setSaving(false);
        return;
      }
      // Actualizar en la BD
      await supabase
        .from("users")
        .update({ email: newEmail })
        .eq("id", user.id);
      await supabase
        .from("businesses")
        .update({ "contact.email": newEmail })
        .eq("id", id);
    }
    // Cambiar contraseña
    if (newPassword) {
      const { error: passError } = await updatePassword(newPassword);
      if (passError) {
        setErrorPass(
          passError.message || "No se pudo actualizar la contraseña."
        );
        setSaving(false);
        return;
      }
    }
    setShowWait(true);
    setTimeout(() => {
      setShowWait(false);
      setShowEmailPassFields(false);
      setCurrentPasswordPass("");
      setNewPassword("");
      setConfirmNewPassword("");
      setErrorPass("");
      navigate("/dashboard");
    }, 1000);
    setSaving(false);
  };

  if (loading || !form) return <div className="p-8">Cargando...</div>;
  if (!user || String(user.businessData?.id) !== String(id))
    return <div className="p-8 text-red-500">No autorizado</div>;

  if (showWait) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-3xl font-extrabold text-blue-700 mb-2 animate-pulse">
          RoaBusiness
        </h2>
        <p className="text-gray-500">Guardando cambios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-2/3 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center mb-6 gap-4">
          <img
            src={form.logo || "https://via.placeholder.com/60x60"}
            alt="Logo"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
          />
          <div>
            <h1 className="text-3xl font-bold text-blue-800">
              Editar: {form.name}
            </h1>
            <p className="text-gray-500">ID: {form.id}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <img
                src={form.logo || "https://via.placeholder.com/80x80"}
                alt="Logo preview"
                className="w-20 h-20 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange("logo", e.target.files?.[0] || null)
                }
                className="block"
              />
            </div>
          </div>
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen Principal
            </label>
            <div className="flex items-center gap-4">
              <img
                src={form.coverImage || "https://via.placeholder.com/200x80"}
                alt="Cover preview"
                className="w-40 h-20 object-cover rounded border"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange("coverImage", e.target.files?.[0] || null)
                }
                className="block"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Negocio
            </label>
            <input
              className="w-full p-2 border rounded"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              className="w-full p-2 border rounded"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Isla
            </label>
            <input
              className="w-full p-2 border rounded"
              value={form.island}
              onChange={(e) => handleChange("island", e.target.value)}
              placeholder="Isla"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              className="w-full p-2 border rounded"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Ubicación"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descripción"
            />
          </div>
          {/* Teléfono dividido en código de país y número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <div className="flex gap-2">
              <input
                className="w-1/3 p-2 border rounded"
                value={form.contact?.countryCode || ""}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    contact: { ...prev.contact, countryCode: e.target.value },
                  }))
                }
                placeholder="Código país (ej: +504)"
                maxLength={5}
                required
              />
              <input
                className="w-2/3 p-2 border rounded"
                value={form.contact?.phoneNumber || ""}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    contact: { ...prev.contact, phoneNumber: e.target.value },
                  }))
                }
                placeholder="Número"
                required
              />
            </div>
          </div>
          {/* Email editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              className="w-full p-2 border rounded"
              value={form.contact?.email || ""}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              placeholder="Correo electrónico"
            />
          </div>
          {/* Página web editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Página web
            </label>
            <input
              className="w-full p-2 border rounded"
              value={form.contact?.website || ""}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  contact: { ...prev.contact, website: e.target.value },
                }))
              }
              placeholder="Página web"
            />
          </div>
          {/* Servicios y Amenidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicios y Amenidades
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.amenities?.map((amenity: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {amenity}
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() =>
                      setForm((prev: any) => ({
                        ...prev,
                        amenities: prev.amenities.filter(
                          (_: string, i: number) => i !== idx
                        ),
                      }))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 p-2 border rounded"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Agregar servicio o amenidad"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newAmenity.trim()) {
                    setForm((prev: any) => ({
                      ...prev,
                      amenities: [...(prev.amenities || []), newAmenity.trim()],
                    }));
                    setNewAmenity("");
                  }
                }}
              >
                Agregar
              </Button>
            </div>
          </div>
          {/* Horarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horarios por día
            </label>
            <div className="grid grid-cols-1 gap-2">
              {form.schedule?.map((sch: any, idx: number) => (
                <div
                  key={sch.day}
                  className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b pb-2 last:border-b-0"
                >
                  <span className="w-24 text-gray-700 font-semibold">
                    {sch.day}
                  </span>
                  <div className="flex gap-2 items-center">
                    <label className="text-xs text-gray-500">Abre</label>
                    <input
                      type="time"
                      className="p-1 border rounded"
                      value={sch.open}
                      onChange={(e) =>
                        handleScheduleChange(idx, "open", e.target.value)
                      }
                    />
                    <label className="text-xs text-gray-500">Cierra</label>
                    <input
                      type="time"
                      className="p-1 border rounded"
                      value={sch.close}
                      onChange={(e) =>
                        handleScheduleChange(idx, "close", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Mapa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación en el mapa
            </label>
            <div className="w-full h-64 mb-2 rounded overflow-hidden">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={form.coordinates || GOOGLE_MAPS_CONFIG.defaultCenter}
                zoom={15}
                onClick={(e) => {
                  if (e.latLng) {
                    handleChange("coordinates", {
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    });
                  }
                }}
                options={{ disableDefaultUI: true }}
              >
                {form.coordinates && <Marker position={form.coordinates} />}
              </GoogleMap>
            </div>
            <div className="flex gap-2">
              <input
                className="w-1/2 p-2 border rounded"
                type="number"
                step="any"
                value={form.coordinates?.lat || ""}
                onChange={(e) =>
                  handleChange("coordinates", {
                    ...form.coordinates,
                    lat: parseFloat(e.target.value),
                  })
                }
                placeholder="Latitud"
              />
              <input
                className="w-1/2 p-2 border rounded"
                type="number"
                step="any"
                value={form.coordinates?.lng || ""}
                onChange={(e) =>
                  handleChange("coordinates", {
                    ...form.coordinates,
                    lng: parseFloat(e.target.value),
                  })
                }
                placeholder="Longitud"
              />
            </div>
          </div>
          {/* Switch de perfil público */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil público
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!form.is_public}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    is_public: e.target.checked,
                  }))
                }
                className="form-checkbox h-5 w-5 text-blue-600"
                id="is_public_switch"
              />
              <span className="text-gray-700">
                {form.is_public
                  ? "Visible en el directorio"
                  : "Oculto del directorio"}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
        {/* Modal para confirmar contraseña antes de guardar */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar cambios</DialogTitle>
              <DialogDescription>
                Ingresa tu contraseña para guardar los cambios.
              </DialogDescription>
            </DialogHeader>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-4"
              placeholder="Contraseña actual"
              autoFocus
            />
            {errorProfile && <div className="text-red-500 text-sm mt-2">{errorProfile}</div>}
            <DialogFooter className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmSave} disabled={saving}>
                {saving ? "Guardando..." : "Confirmar y guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mt-8 md:mt-0">
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          Actualizar email o contraseña
        </h2>
        <Button
          variant="outline"
          onClick={() => setShowEmailPassFields(!showEmailPassFields)}
          className="mb-4 w-full"
        >
          {showEmailPassFields ? "Cancelar" : "Actualizar email/contraseña"}
        </Button>
        {showEmailPassFields && (
          <form onSubmit={handleEmailPassUpdate} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Nuevo email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              />
            </div>
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
              {saving ? "Guardando..." : "Actualizar email/contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
