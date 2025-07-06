import { useEffect, useState, Fragment } from "react";
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
import businessCategories from "@/data/businessCategories";
import { Menu, MenuIcon } from "lucide-react";
import { Facebook, Instagram, Twitter, Globe, Mail, Phone } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import RobotMascot from "@/components/ui/RobotMascot";

const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const menuSections = [
  { key: "name", label: "Nombre del Negocio" },
  { key: "location", label: "Ubicación" },
  { key: "island", label: "Isla" },
  { key: "contact", label: "Contacto" },
  { key: "category", label: "Categoría" },
  { key: "priceRange", label: "Rango de Precios" },
  { key: "images", label: "Imágenes" },
  { key: "description", label: "Descripción" },
  { key: "schedule", label: "Horario" },
  { key: "amenities", label: "Amenidades" },
  { key: "security", label: "Seguridad" },
  { key: "deactivate", label: "Desactivar tu cuenta" },
];

export default function BusinessSettingsPage() {
  const { id } = useParams();
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
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
  const [activeSection, setActiveSection] = useState("name");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivatePass1, setDeactivatePass1] = useState("");
  const [deactivatePass2, setDeactivatePass2] = useState("");
  const [deactivateError, setDeactivateError] = useState("");

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
      if (!business.schedule || business.schedule.length !== days.length) {
        business.schedule = days.map((d) => {
          const found = business.schedule?.find((s) => s.day === d);
          return found || { day: d, open: "", close: "" };
        });
      } else {
        business.schedule = days.map(
          (d) =>
            business.schedule.find((s) => s.day === d) || {
              day: d,
              open: "",
              close: "",
            }
        );
      }
      if (!business.contact)
        business.contact = { phone: "", email: "", website: "" };
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
      if (business.facebook === undefined) business.facebook = "";
      if (business.instagram === undefined) business.instagram = "";
      if (business.twitter === undefined) business.twitter = "";
      if (business.tiktok === undefined) business.tiktok = "";
      setForm(business);
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  const handleChange = (field, value) => {
    if (field === "phone") {
      setForm((prev) => ({
        ...prev,
        contact: { ...prev.contact, phone: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleScheduleChange = (idx, key, value) => {
    setForm((prev) => {
      const schedule = [...(prev.schedule || [])];
      schedule[idx][key] = value;
      return { ...prev, schedule };
    });
  };

  const handleImageChange = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange(field, e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorProfile("");
    setPasswordInput("");
    setShowPasswordModal(true);
  };

  const handleConfirmSave = async () => {
    setErrorProfile("");
    if (!passwordInput) {
      setErrorProfile(
        "Debes ingresar tu contraseña actual para guardar cambios."
      );
      toast.error("Debes ingresar tu contraseña actual para guardar cambios.");
      return;
    }
    setSaving(true);
    const { error: authError } = await signInWithEmail(
      user.email,
      passwordInput
    );
    if (authError) {
      setErrorProfile("Contraseña actual incorrecta.");
      toast.error("Contraseña actual incorrecta.");
      setSaving(false);
      return;
    }
    try {
      // No enviar open247 a la base de datos
      const { open247, ...formToSave } = form;
      const toSave = {
        ...formToSave,
        contact: {
          ...form.contact,
          phone: `${form.contact?.countryCode || ""}${
            form.contact?.phoneNumber || ""
          }`,
          countryCode: form.contact?.countryCode || "",
          phoneNumber: form.contact?.phoneNumber || "",
          email: form.contact?.email || "",
          website: form.contact?.website || "",
        },
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        twitter: form.twitter || null,
        tiktok: form.tiktok || null,
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

  const handleEmailPassUpdate = async (e) => {
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
    const { error: authError } = await signInWithEmail(
      user.email,
      currentPasswordPass
    );
    if (authError) {
      setErrorPass("Contraseña actual incorrecta.");
      setSaving(false);
      return;
    }
    if (newEmail && newEmail !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (emailError) {
        setErrorPass(emailError.message || "No se pudo actualizar el email.");
        setSaving(false);
        return;
      }
      await supabase
        .from("users")
        .update({ email: newEmail })
        .eq("id", user.id);
      await supabase
        .from("businesses")
        .update({ "contact.email": newEmail })
        .eq("id", id);
    }
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

  // Función para desactivar cuenta
  const handleDeactivateAccount = async () => {
    setDeactivateError("");
    if (!deactivatePass1 || !deactivatePass2) {
      setDeactivateError("Debes ingresar la contraseña dos veces.");
      return;
    }
    if (deactivatePass1 !== deactivatePass2) {
      setDeactivateError("Las contraseñas no coinciden.");
      return;
    }
    // Verificar contraseña
    const { error: authError } = await signInWithEmail(
      user.email,
      deactivatePass1
    );
    if (authError) {
      setDeactivateError("Contraseña incorrecta.");
      return;
    }
    // Desactivar perfil público y cambiar contraseña a un valor aleatorio
    const newRandomPassword =
      Math.random().toString(36).slice(-12) + Date.now();
    await supabase.from("businesses").update({ is_public: false }).eq("id", id);
    await updatePassword(newRandomPassword);
    toast.success(
      "Cuenta desactivada correctamente. Si deseas volver a acceder, deberás restablecer tu contraseña."
    );
    logout(); // Cerrar sesión explícitamente
    setTimeout(() => {
      window.location.href = "/";
    }, 2500);
  };

  if (loading || !form)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-2xl font-semibold text-gray-600">
          Cargando...
        </div>
      </div>
    );

  if (!user || String(user.businessData?.id) !== String(id))
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 text-xl font-semibold">No autorizado</div>
      </div>
    );

  if (showWait) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-6"></div>
        <h2 className="text-4xl font-bold text-blue-700 mb-2 animate-pulse">
          RoaBusiness
        </h2>
        <p className="text-gray-600 text-lg">Guardando cambios...</p>
      </div>
    );
  }

  // Detectar si es móvil
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <aside
        className={`bg-white shadow-lg w-72 p-6 fixed md:static top-0 left-0 h-full flex flex-col transition-transform duration-300 ease-in-out z-30 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <RobotMascot className="w-12 h-12 hidden md:block" />
          <button
            className="md:hidden text-gray-600 hover:text-blue-600"
            onClick={() => setSidebarOpen(false)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-2">
          {menuSections.map((section) => (
            <button
              key={section.key}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeSection === section.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } font-medium`}
              onClick={() => {
                setActiveSection(section.key);
                setSidebarOpen(false);
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Botón menú móvil: abajo a la derecha */}
      {isMobile ? (
        <button
          className="fixed bottom-20 right-4 z-50 md:hidden bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-7 w-7" />
        </button>
      ) : (
        <button
          className="fixed top-4 left-4 z-40 md:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
      <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 max-w-4xl mx-auto">
        {activeSection === "island" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Isla</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona la isla donde se ubica tu negocio
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={form.island || ""}
                onChange={(e) => handleChange("island", e.target.value)}
                required
              >
                <option value="">Selecciona una isla</option>
                <option value="Roatán">Roatán</option>
                <option value="Utila">Utila</option>
                <option value="Guanaja">Guanaja</option>
              </select>
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "name" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">
              Nombre del Negocio
            </h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nombre del negocio"
              />
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "location" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Ubicación</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Ubicación
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Dirección del negocio"
              />
              {/* Inputs para coordenadas GPS */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.coordinates?.lat || ""}
                    onChange={(e) =>
                      handleChange("coordinates", {
                        ...form.coordinates,
                        lat: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Latitud"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {/* Mapa para coordenadas GPS, ahora movible */}
              {form.coordinates && (
                <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={{
                      lat: form.coordinates.lat,
                      lng: form.coordinates.lng,
                    }}
                    zoom={16}
                    options={{
                      disableDefaultUI: true,
                      draggable: true,
                      scrollwheel: true,
                      mapTypeId: "satellite",
                    }}
                    onClick={(e) => {
                      if (e.latLng) {
                        handleChange("coordinates", {
                          lat: e.latLng.lat(),
                          lng: e.latLng.lng(),
                        });
                      }
                    }}
                  >
                    {/* Marker solo si hay coordenadas */}
                    {form.coordinates && (
                      <Marker
                        position={{
                          lat: form.coordinates.lat,
                          lng: form.coordinates.lng,
                        }}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                          scaledSize:
                            window.google && window.google.maps
                              ? new window.google.maps.Size(40, 40)
                              : undefined,
                        }}
                        draggable={true}
                        onDragEnd={(e) => {
                          handleChange("coordinates", {
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                          });
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              )}
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "contact" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Contacto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" /> Teléfono
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.contact?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" /> Email
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.contact?.email || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }))
                  }
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" /> Sitio web
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.contact?.website || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, website: e.target.value },
                    }))
                  }
                  placeholder="Sitio web"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.facebook || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, facebook: e.target.value }))
                  }
                  placeholder="URL de Facebook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.instagram || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, instagram: e.target.value }))
                  }
                  placeholder="URL de Instagram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-blue-400" /> X (Twitter)
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.twitter || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, twitter: e.target.value }))
                  }
                  placeholder="URL de X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TikTokIcon className="h-4 w-4 text-black" /> TikTok
                </label>
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={form.tiktok || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tiktok: e.target.value }))
                  }
                  placeholder="URL de TikTok"
                />
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "category" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Categoría</h2>
            <div className="space-y-4">
              <input
                list="categories-list"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Escribe o selecciona una categoría"
                required
              />
              <datalist id="categories-list">
                {businessCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "priceRange" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">
              Rango de Precios
            </h2>
            <div className="space-y-4">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={form.priceRange}
                onChange={(e) => handleChange("priceRange", e.target.value)}
              >
                <option value="">Selecciona un rango</option>
                <option value="$">$ - Económico</option>
                <option value="$$">$$ - Moderado</option>
                <option value="$$$">$$$ - Caro</option>
                <option value="$$$$">$$$$ - Muy Caro</option>
              </select>
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "images" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Imágenes</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={form.logo || "https://via.placeholder.com/80x80"}
                    alt="Logo preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange("logo", e.target.files?.[0] || null)
                    }
                    className="block text-sm text-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      form.coverImage || "https://via.placeholder.com/200x80"
                    }
                    alt="Cover preview"
                    className="w-40 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(
                        "coverImage",
                        e.target.files?.[0] || null
                      )
                    }
                    className="block text-sm text-gray-600"
                  />
                </div>
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "description" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">
              Descripción
            </h2>
            <div className="space-y-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descripción del negocio"
                rows={6}
              />
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "schedule" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Horario</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <input
                  id="open247"
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={form.open247 || false}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      open247: e.target.checked,
                      schedule: e.target.checked
                        ? days.map((day) => ({
                            day,
                            open: "00:00",
                            close: "00:00",
                          }))
                        : days.map((day) => ({
                            day,
                            open: "07:00",
                            close: "08:00",
                          })),
                    }));
                  }}
                />
                <label
                  htmlFor="open247"
                  className="text-blue-700 font-medium select-none cursor-pointer"
                >
                  Abierto 24/7 todos los días
                </label>
              </div>
              {form.open247
                ? form.schedule?.map((s, idx) => (
                    <div
                      key={s.day}
                      className="flex items-center gap-3 opacity-70"
                    >
                      <span className="w-24 font-medium text-gray-700">
                        {s.day}
                      </span>
                      <input
                        type="time"
                        className="p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        value={s.open}
                        disabled
                      />
                      <span className="text-gray-600">a</span>
                      <input
                        type="time"
                        className="p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        value={s.close}
                        disabled
                      />
                      <span className="ml-2 text-xs text-gray-500">
                        (12:00 am a 12:00 am)
                      </span>
                    </div>
                  ))
                : form.schedule?.map((s, idx) => (
                    <div key={s.day} className="flex items-center gap-3">
                      <span className="w-24 font-medium text-gray-700">
                        {s.day}
                      </span>
                      <input
                        type="time"
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={s.open}
                        onChange={(e) =>
                          handleScheduleChange(idx, "open", e.target.value)
                        }
                      />
                      <span className="text-gray-600">a</span>
                      <input
                        type="time"
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        value={s.close}
                        onChange={(e) =>
                          handleScheduleChange(idx, "close", e.target.value)
                        }
                      />
                    </div>
                  ))}
              <Button
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Guardar
              </Button>
            </div>
          </Fragment>
        )}
        {activeSection === "amenities" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">
              Amenidades
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {form.amenities?.map((a) => (
                  <span
                    key={a}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Agregar amenidad"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newAmenity.trim()) {
                      setForm((prev) => ({
                        ...prev,
                        amenities: [
                          ...(prev.amenities || []),
                          newAmenity.trim(),
                        ],
                      }));
                      setNewAmenity("");
                    }
                  }
                }}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (newAmenity.trim()) {
                      setForm((prev) => ({
                        ...prev,
                        amenities: [
                          ...(prev.amenities || []),
                          newAmenity.trim(),
                        ],
                      }));
                      setNewAmenity("");
                    }
                  }}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Agregar
                </Button>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Guardar
                </Button>
              </div>
            </div>
          </Fragment>
        )}
        {activeSection === "security" && (
          <Fragment>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">Seguridad</h2>
            <div className="space-y-4">
              <Button
                onClick={() => setShowEmailPassFields(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Cambiar Email o Contraseña
              </Button>
              {showEmailPassFields && (
                <form onSubmit={handleEmailPassUpdate} className="space-y-4">
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Nuevo email"
                  />
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    type="password"
                    value={currentPasswordPass}
                    onChange={(e) => setCurrentPasswordPass(e.target.value)}
                    placeholder="Contraseña actual"
                  />
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                  />
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirmar nueva contraseña"
                  />
                  {errorPass && (
                    <div className="text-red-500 text-sm">{errorPass}</div>
                  )}
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Guardar Cambios
                  </Button>
                </form>
              )}
            </div>
          </Fragment>
        )}
        {activeSection === "deactivate" && (
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Desactivar tu cuenta
            </h2>
            <p className="mb-4 text-gray-700">
              Esta acción desactivará tu perfil público y cambiará tu contraseña
              para que no puedas acceder hasta restablecerla. Para confirmar,
              ingresa tu contraseña dos veces.
            </p>
            <input
              type="password"
              className="w-full mb-3 p-2 border rounded"
              placeholder="Contraseña"
              value={deactivatePass1}
              onChange={(e) => setDeactivatePass1(e.target.value)}
            />
            <input
              type="password"
              className="w-full mb-3 p-2 border rounded"
              placeholder="Repite la contraseña"
              value={deactivatePass2}
              onChange={(e) => setDeactivatePass2(e.target.value)}
            />
            {deactivateError && (
              <div className="text-red-600 mb-2">{deactivateError}</div>
            )}
            <Button
              className="bg-red-600 hover:bg-red-700 text-white w-full"
              onClick={handleDeactivateAccount}
            >
              Desactivar la cuenta
            </Button>
          </div>
        )}
      </main>
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md rounded-xl shadow-xl bg-white border border-blue-200 p-6">
          <DialogHeader>
            <DialogTitle className="text-blue-700 text-xl font-bold">
              Confirmar cambios
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Ingresa tu contraseña actual para guardar los cambios.
            </DialogDescription>
          </DialogHeader>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Contraseña actual"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoFocus
          />
          {errorProfile && (
            <div className="text-red-500 text-sm mt-2">{errorProfile}</div>
          )}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Confirmar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
