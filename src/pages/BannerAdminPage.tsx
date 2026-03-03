import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Link2,
  Type,
  AlignLeft,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Banner, FocalPoint, focalPointToCSS } from "@/hooks/useBanners";

// ─── Tipos internos ───────────────────────────────────────────
interface BannerForm {
  title: string;
  description: string;
  image_url: string;
  image_path: string | null;
  mobile_image_url: string;
  mobile_image_path: string | null;
  link_url: string;
  link_label: string;
  link_button_color: string;
  focal_point: FocalPoint;
  zoom_scale: number;
  active: boolean;
  order_index: number;
}

const EMPTY_FORM: BannerForm = {
  title: "",
  description: "",
  image_url: "",
  image_path: null,
  mobile_image_url: "",
  mobile_image_path: null,
  link_url: "",
  link_label: "Ver más",
  link_button_color: "#06b6d4",
  focal_point: "center",
  zoom_scale: 1,
  active: true,
  order_index: 0,
};

// Cuadrícula de puntos focales
const FOCAL_POINTS: { value: FocalPoint; label: string }[] = [
  { value: "top-left", label: "↖" },
  { value: "top-center", label: "↑" },
  { value: "top-right", label: "↗" },
  { value: "center-left", label: "←" },
  { value: "center", label: "●" },
  { value: "center-right", label: "→" },
  { value: "bottom-left", label: "↙" },
  { value: "bottom-center", label: "↓" },
  { value: "bottom-right", label: "↘" },
];

// ─── Helpers ──────────────────────────────────────────────────
const uploadBannerImg = async (
  file: File,
  bannerId: string,
  oldPath?: string | null,
): Promise<{ url: string; path: string } | null> => {
  // Eliminar imagen antigua del storage
  if (oldPath) {
    await supabase.storage.from("banner-images").remove([oldPath]);
  }
  const ext = file.name.split(".").pop();
  const path = `banners/${bannerId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("banner-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from("banner-images").getPublicUrl(path);
  return { url: publicUrl, path };
};

// ─── Componente principal ─────────────────────────────────────
const BannerAdminPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  // Datos del formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Upload de imagen
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload de imagen móvil
  const [mobileImgFile, setMobileImgFile] = useState<File | null>(null);
  const [mobileImgPreview, setMobileImgPreview] = useState<string>("");
  const mobileFileRef = useRef<HTMLInputElement>(null);

  // ── Fetch banners ──────────────────────────────────────────
  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banner_ads")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error("Error cargando banners: " + error.message);
    else setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ── Abrir modal Agregar ────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order_index: banners.length + 1 });
    setImgFile(null);
    setImgPreview("");
    setModalOpen(true);
  };

  // ── Abrir modal Editar ─────────────────────────────────────
  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      description: b.description || "",
      image_url: b.image_url,
      image_path: b.image_path,
      mobile_image_url: (b as any).mobile_image_url || "",
      mobile_image_path: (b as any).mobile_image_path || null,
      link_url: b.link_url || "",
      link_label: b.link_label || "Ver más",
      link_button_color: (b as any).link_button_color || "#06b6d4",
      focal_point: (b.focal_point as FocalPoint) || "center",
      zoom_scale: b.zoom_scale ?? 1,
      active: b.active,
      order_index: b.order_index,
    });
    setImgFile(null);
    setImgPreview(b.image_url);
    setMobileImgFile(null);
    setMobileImgPreview((b as any).mobile_image_url || "");
    setModalOpen(true);
  };

  // ── Cerrar modal ───────────────────────────────────────────
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImgFile(null);
    setImgPreview("");
    setMobileImgFile(null);
    setMobileImgPreview("");
  };

  // ── Seleccionar imagen ─────────────────────────────────────
  const validateImageDimensions = (file: File, onValid: (f: File) => void) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width !== 1600 || img.height !== 150) {
        toast.error(
          `Dimensión incorrecta: ${img.width}×${img.height}px. La imagen debe ser exactamente 1600×150 px.`,
          { duration: 5000 },
        );
        return;
      }
      onValid(file);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("No se pudo leer la imagen");
    };
    img.src = url;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5 MB");
      return;
    }
    validateImageDimensions(f, (valid) => {
      setImgFile(valid);
      setImgPreview(URL.createObjectURL(valid));
    });
    // limpiar input para permitir re-seleccionar el mismo archivo
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Solo imágenes");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5 MB");
      return;
    }
    validateImageDimensions(f, (valid) => {
      setImgFile(valid);
      setImgPreview(URL.createObjectURL(valid));
    });
  };

  // ── Imagen móvil ───────────────────────────────────────────
  const validateMobileImageDimensions = (file: File, onValid: (f: File) => void) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width !== 800 || img.height !== 400) {
        toast.error(
          `Dimensión móvil incorrecta: ${img.width}×${img.height}px. Debe ser exactamente 800×400 px.`,
          { duration: 5000 },
        );
        return;
      }
      onValid(file);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast.error("No se pudo leer la imagen"); };
    img.src = url;
  };

  const handleMobileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("La imagen debe ser menor a 5 MB"); return; }
    validateMobileImageDimensions(f, (valid) => {
      setMobileImgFile(valid);
      setMobileImgPreview(URL.createObjectURL(valid));
    });
    e.target.value = "";
  };

  const handleMobileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith("image/")) { toast.error("Solo imágenes"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Máximo 5 MB"); return; }
    validateMobileImageDimensions(f, (valid) => {
      setMobileImgFile(valid);
      setMobileImgPreview(URL.createObjectURL(valid));
    });
  };

  // ── Guardar (crear / actualizar) ───────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!imgPreview && !editingId) { toast.error("Sube una imagen para el banner"); return; }

    setSaving(true);
    setUploading(true);
    try {
      const bannerId = editingId || crypto.randomUUID();
      let finalUrl = form.image_url;
      let finalPath = form.image_path;
      let finalMobileUrl = form.mobile_image_url || null;
      let finalMobilePath = form.mobile_image_path || null;

      // Subir imagen desktop si cambió
      if (imgFile) {
        const res = await uploadBannerImg(imgFile, bannerId, form.image_path);
        if (!res) throw new Error("Error subiendo imagen desktop");
        finalUrl = res.url;
        finalPath = res.path;
      }

      // Subir imagen móvil si cambió
      if (mobileImgFile) {
        const ext = mobileImgFile.name.split(".").pop();
        const mobilePath = `banners/mobile-${bannerId}-${Date.now()}.${ext}`;
        if (form.mobile_image_path) {
          await supabase.storage.from("banner-images").remove([form.mobile_image_path]);
        }
        const { error: mErr } = await supabase.storage
          .from("banner-images")
          .upload(mobilePath, mobileImgFile, { upsert: true });
        if (mErr) throw mErr;
        const { data: { publicUrl } } = supabase.storage.from("banner-images").getPublicUrl(mobilePath);
        finalMobileUrl = publicUrl;
        finalMobilePath = mobilePath;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: finalUrl,
        image_path: finalPath,
        mobile_image_url: finalMobileUrl,
        mobile_image_path: finalMobilePath,
        link_url: form.link_url.trim() || null,
        link_label: form.link_label.trim() || "Ver más",
        link_button_color: form.link_button_color || "#06b6d4",
        focal_point: form.focal_point,
        zoom_scale: form.zoom_scale,
        active: form.active,
        order_index: form.order_index,
      };

      if (editingId) {
        const { error } = await supabase.from("banner_ads").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Banner actualizado");
      } else {
        const { error } = await supabase.from("banner_ads").insert({ id: bannerId, ...payload });
        if (error) throw error;
        toast.success("Banner creado correctamente");
      }

      closeModal();
      fetchBanners();
    } catch (err: any) {
      toast.error("Error: " + (err?.message || "Desconocido"));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // ── Eliminar banner ────────────────────────────────────────
  const confirmDelete = (b: Banner) => {
    setSelectedBanner(b);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    setDeleting(true);
    try {
      // Eliminar imagen del storage si existe
      if (selectedBanner.image_path) {
        await supabase.storage
          .from("banner-images")
          .remove([selectedBanner.image_path]);
      }
      const { error } = await supabase
        .from("banner_ads")
        .delete()
        .eq("id", selectedBanner.id);
      if (error) throw error;
      toast.success("Banner eliminado");
      setDeleteModal(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (err: any) {
      toast.error("Error al eliminar: " + (err?.message || "Desconocido"));
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle activo ──────────────────────────────────────────
  const toggleActive = async (b: Banner) => {
    const { error } = await supabase
      .from("banner_ads")
      .update({ active: !b.active })
      .eq("id", b.id);
    if (error) toast.error("Error actualizando estado");
    else {
      toast.success(b.active ? "Banner desactivado" : "Banner activado");
      fetchBanners();
    }
  };

  // ── Cambiar orden ──────────────────────────────────────────
  const moveOrder = async (b: Banner, dir: "up" | "down") => {
    const idx = banners.findIndex((x) => x.id === b.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const swap = banners[swapIdx];
    await Promise.all([
      supabase
        .from("banner_ads")
        .update({ order_index: swap.order_index })
        .eq("id", b.id),
      supabase
        .from("banner_ads")
        .update({ order_index: b.order_index })
        .eq("id", swap.id),
    ]);
    fetchBanners();
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ── Encabezado ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Gestión de Banners
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Administra los banners publicitarios del carrusel principal
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-teal-600 hover:bg-teal-500 text-white gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Nuevo Banner
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total",
              value: banners.length,
              color: "text-gray-800",
              bg: "bg-white",
            },
            {
              label: "Activos",
              value: banners.filter((b) => b.active).length,
              color: "text-teal-700",
              bg: "bg-teal-50",
            },
            {
              label: "Inactivos",
              value: banners.filter((b) => !b.active).length,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "Con enlace",
              value: banners.filter((b) => b.link_url).length,
              color: "text-blue-700",
              bg: "bg-blue-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-4 shadow-sm border border-gray-100`}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                {s.label}
              </p>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Lista de banners ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <ImageIcon className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No hay banners aún</p>
            <p className="text-sm">
              Crea el primer banner usando el botón de arriba
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className={`group bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md overflow-hidden ${
                  b.active ? "border-gray-100" : "border-orange-200 opacity-70"
                }`}
              >
                <div className="flex items-stretch gap-0">
                  {/* Imagen thumbnail */}
                  <div className="relative w-36 sm:w-52 shrink-0 overflow-hidden rounded-l-2xl">
                    <img
                      src={b.image_url}
                      alt={b.title}
                      className="w-full h-full object-cover min-h-[100px]"
                      draggable={false}
                    />
                    {!b.active && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-orange-500/90 px-2 py-0.5 rounded-full">
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-300">
                          #{idx + 1}
                        </span>
                        {b.active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-semibold">
                            <AlertCircle className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-base truncate">
                        {b.title}
                      </h3>
                      {b.description && (
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                          {b.description}
                        </p>
                      )}
                      {b.link_url && (
                        <a
                          href={b.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1 truncate max-w-xs"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          {b.link_url}
                        </a>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Orden */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveOrder(b, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-20 transition"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => moveOrder(b, "down")}
                          disabled={idx === banners.length - 1}
                          className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-20 transition"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>

                      {/* Toggle activo */}
                      <button
                        onClick={() => toggleActive(b)}
                        className={`p-2 rounded-xl transition-all ${b.active ? "bg-teal-50 text-teal-600 hover:bg-teal-100" : "bg-orange-50 text-orange-500 hover:bg-orange-100"}`}
                        title={b.active ? "Desactivar" : "Activar"}
                      >
                        {b.active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>

                      {/* Preview */}
                      <button
                        onClick={() => {
                          setSelectedBanner(b);
                          setPreviewModal(true);
                        }}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                        title="Vista previa"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => openEdit(b)}
                        className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => confirmDelete(b)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════
          MODAL: Crear / Editar Banner
      ════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Header modal */}
            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    {editingId ? "Editar Banner" : "Nuevo Banner"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editingId
                      ? "Modifica los datos del banner"
                      : "Completa los datos para crear un banner"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Cuerpo del formulario */}
            <div className="px-6 py-5 space-y-5">
              {/* Zona de imagen */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Imagen del Banner *
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-teal-400 transition-all group"
                  style={{ minHeight: "180px" }}
                >
                  {imgPreview ? (
                    <>
                      <img
                        src={imgPreview}
                        alt="Preview"
                        className="w-full aspect-[32/3] object-cover"
                        style={{
                          objectPosition: focalPointToCSS(form.focal_point),
                        }}
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="text-white text-center">
                          <Upload className="w-8 h-8 mx-auto mb-1 opacity-90" />
                          <p className="text-sm font-semibold">
                            Cambiar imagen
                          </p>
                          <p className="text-xs opacity-70">
                            La anterior se eliminará automáticamente
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
                      <p className="font-semibold text-sm">
                        Arrastra o haz clic para subir
                      </p>
                      <p className="text-xs mt-1">PNG, JPG, WebP — máx 5 MB</p>
                      <p className="text-xs font-bold text-teal-500 mt-1.5">
                        ✦ Dimensión obligatoria: 1600 × 150 px
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Relación de aspecto 16:5 — imagen completa sin recorte
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {/* ── Imagen para móviles ──────────────────────────────── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  📱 Imagen para móviles
                  <span className="ml-2 text-gray-300 normal-case font-normal">— opcional, si no se sube se usa la imagen principal</span>
                </label>
                <div
                  onDrop={handleMobileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => mobileFileRef.current?.click()}
                  className="relative cursor-pointer rounded-2xl overflow-hidden border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all group"
                  style={{ minHeight: "120px" }}
                >
                  {mobileImgPreview ? (
                    <>
                      <img
                        src={mobileImgPreview}
                        alt="Preview móvil"
                        className="w-full aspect-[2/1] object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="text-white text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 opacity-90" />
                          <p className="text-sm font-semibold">Cambiar imagen móvil</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMobileImgFile(null); setMobileImgPreview(""); setForm({ ...form, mobile_image_url: "", mobile_image_path: null }); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10 hover:bg-red-600"
                      >✕</button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                      <p className="font-semibold text-sm">Arrastra o haz clic para subir</p>
                      <p className="text-xs mt-1">PNG, JPG, WebP — máx 5 MB</p>
                      <p className="text-xs font-bold text-blue-500 mt-1.5">✦ Dimensión obligatoria: 800 × 400 px</p>
                    </div>
                  )}
                  <input
                    ref={mobileFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMobileFileSelect}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Punto focal de la imagen
                  <span className="ml-2 text-gray-300 normal-case font-normal">
                    — ¿qué parte debe verse siempre?
                  </span>
                </label>
                <div className="flex gap-4 items-start">
                  {/* Cuadrícula 3×3 */}
                  <div className="grid grid-cols-3 gap-1.5 shrink-0">
                    {FOCAL_POINTS.map((fp) => (
                      <button
                        key={fp.value}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, focal_point: fp.value })
                        }
                        title={fp.value.replace("-", " ")}
                        className={`w-10 h-10 rounded-xl text-lg font-bold transition-all border-2 ${
                          form.focal_point === fp.value
                            ? "bg-teal-500 border-teal-500 text-white shadow-md scale-110"
                            : "bg-gray-50 border-gray-200 text-gray-400 hover:border-teal-300 hover:bg-teal-50"
                        }`}
                      >
                        {fp.label}
                      </button>
                    ))}
                  </div>
                  {/* Preview con zona marcada */}
                  {imgPreview && (
                    <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 aspect-[32/3]">
                      <img
                        src={imgPreview}
                        alt="focal preview"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: focalPointToCSS(form.focal_point),
                          transform: `scale(${form.zoom_scale})`,
                          transformOrigin: focalPointToCSS(form.focal_point),
                        }}
                        draggable={false}
                      />
                      <div className="absolute bottom-1.5 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        Vista previa del recorte
                      </div>
                    </div>
                  )}
                  {!imgPreview && (
                    <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center aspect-[32/3]">
                      <p className="text-xs text-gray-300">
                        Sube la imagen para ver la previsualización
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Zoom de imagen */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Zoom de imagen
                    <span className="ml-2 text-gray-300 normal-case font-normal">
                      — ajusta el tamaño del recorte
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
                      {form.zoom_scale.toFixed(2)}x
                    </span>
                    {form.zoom_scale !== 1 && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, zoom_scale: 1 })}
                        className="text-[10px] text-teal-500 hover:text-teal-700 font-semibold underline"
                      >
                        reset
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-300">0.5×</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={form.zoom_scale}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        zoom_scale: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${
                        ((form.zoom_scale - 0.5) / 2) * 100
                      }%, #e5e7eb ${
                        ((form.zoom_scale - 0.5) / 2) * 100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  <span className="text-xs text-gray-300">2.5×</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-300 mt-1 px-5">
                  <span>Alejar</span>
                  <span className="text-teal-400 font-semibold">1× normal</span>
                  <span>Acercar</span>
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Type className="w-3.5 h-3.5" /> Título *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Descubre Roatán"
                  maxLength={80}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <AlignLeft className="w-3.5 h-3.5" /> Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Texto que aparece debajo del título en el banner..."
                  rows={3}
                  maxLength={200}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"
                />
                <p className="text-xs text-gray-300 text-right mt-0.5">
                  {form.description.length}/200
                </p>
              </div>

              {/* URL de enlace */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Link2 className="w-3.5 h-3.5" /> URL de enlace (botón CTA)
                </label>
                <input
                  type="text"
                  value={form.link_url}
                  onChange={(e) =>
                    setForm({ ...form, link_url: e.target.value })
                  }
                  placeholder="Ej: /directorio  o  https://mipagina.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
              </div>

              {/* Etiqueta del botón */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Type className="w-3.5 h-3.5" /> Texto del botón
                </label>
                <input
                  type="text"
                  value={form.link_label}
                  onChange={(e) =>
                    setForm({ ...form, link_label: e.target.value })
                  }
                  placeholder="Ej: Ver más, Reservar ahora..."
                  maxLength={30}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
              </div>

              {/* Color del botón */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  🎨 Color del botón
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.link_button_color}
                    onChange={(e) => setForm({ ...form, link_button_color: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <span
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow"
                    style={{ backgroundColor: form.link_button_color }}
                  >
                    {form.link_label || 'Ver más'} ↗
                  </span>
                  <span className="text-xs text-gray-400">{form.link_button_color}</span>
                </div>
              </div>

              {/* Fila: orden + activo */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Orden de aparición
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.order_index}
                    onChange={(e) =>
                      setForm({ ...form, order_index: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Estado
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, active: !form.active })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all w-full font-semibold text-sm ${
                      form.active
                        ? "border-teal-400 bg-teal-50 text-teal-700"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {form.active ? (
                      <>
                        <ToggleRight className="w-5 h-5" /> Activo
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" /> Inactivo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className="px-6 pb-6 pt-2 flex gap-3 justify-end border-t border-gray-100">
              <Button
                variant="outline"
                onClick={closeModal}
                className="rounded-xl px-5"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-6 gap-2 shadow-lg shadow-teal-200"
              >
                {(saving || uploading) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingId ? "Guardar cambios" : "Crear banner"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL: Confirmar eliminación
      ════════════════════════════════════════════════════ */}
      {deleteModal && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Imagen del banner a eliminar */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={selectedBanner.image_url}
                alt={selectedBanner.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-white font-bold text-lg drop-shadow">
                  {selectedBanner.title}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    ¿Eliminar este banner?
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Se eliminará permanentemente el banner y su imagen del
                    almacenamiento. Esta acción{" "}
                    <span className="font-semibold text-red-500">
                      no se puede deshacer
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteModal(false);
                    setSelectedBanner(null);
                  }}
                  className="flex-1 rounded-xl"
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl gap-2"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL: Vista previa del banner
      ════════════════════════════════════════════════════ */}
      {previewModal && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                Vista previa del banner
              </h3>
              <button
                onClick={() => {
                  setPreviewModal(false);
                  setSelectedBanner(null);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Simulación del banner */}
            <div
              className="relative overflow-hidden"
              style={{ height: "clamp(200px, 38vw, 380px)" }}
            >
              <img
                src={selectedBanner.image_url}
                alt={selectedBanner.title}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: focalPointToCSS(selectedBanner.focal_point),
                }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-center px-10 py-8 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-teal-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Publicidad
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg mb-2">
                  {selectedBanner.title}
                </h2>
                {selectedBanner.description && (
                  <p className="text-sm text-gray-200 mb-4 drop-shadow">
                    {selectedBanner.description}
                  </p>
                )}
                {selectedBanner.link_url && (
                  <div className="inline-flex items-center gap-2 bg-teal-500 text-white font-semibold text-sm px-5 py-2.5 rounded-full w-fit shadow-lg">
                    {selectedBanner.link_label || "Ver más"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Esta es la apariencia real en el sitio web
              </p>
              <Button
                onClick={() => openEdit(selectedBanner)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs px-4 gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar este banner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerAdminPage;
