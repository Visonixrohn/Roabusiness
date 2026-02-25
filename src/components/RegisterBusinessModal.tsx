import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Building2, MapPin, Globe, FileText, X, CheckCircle2 } from "lucide-react"; // Añadí CheckCircle2 para el botón
import {
  departamentos,
  getMunicipiosByDepartamento,
} from "@/data/hondurasLocations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterBusinessModal = ({ isOpen, onClose }: Props) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    departamento: "",
    municipio: "",
    colonia: "",
    hasWebsite: "no",
    website: "",
  });

  const [municipios, setMunicipios] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({...p, [name]: value }));

    if (name === "departamento") {
      setMunicipios(getMunicipiosByDepartamento(value));
      setForm((p) => ({...p, municipio: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = "50488857653";
    const hasWebsiteText = form.hasWebsite === "yes"? "Sí" : "No";
    const lugarText = [form.departamento, form.municipio, form.colonia]
     .filter(Boolean)
     .join(", ");

    const text =
      `Hola, quiero registrar mi negocio 🏢\n\n` +
      `📌 *Nombre:* ${form.name}\n` +
      `📝 *Descripción:* ${form.description}\n` +
      `📍 *Ubicación:* ${lugarText || "No especificado"}\n` +
      `🌐 *Tiene página web:* ${hasWebsiteText}` +
      (form.hasWebsite === "yes" && form.website
       ? `\n🔗 *Web:* ${form.website}`
        : "");

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("¡Abriendo WhatsApp con tu solicitud!");
    setForm({
      name: "",
      description: "",
      departamento: "",
      municipio: "",
      colonia: "",
      hasWebsite: "no",
      website: "",
    });
    setMunicipios([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) =>!open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl shadow-2xl border-0"> {/* Aumenté el tamaño del modal */}
        {/* Header mejorado */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-700 px-6 py-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2.5 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" /> {/* Icono más grande */}
            </div>
            <div>
              <h2 className="text-white font-extrabold text-xl leading-tight"> {/* Fuente más bold */}
                Registra tu Negocio
              </h2>
              <p className="text-blue-100 text-sm mt-0.5 opacity-90"> {/* Texto más legible */}
                Completa el formulario y te contactaremos por WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6 bg-gray-50"> {/* Fondo más suave */}
          {/* Sección de Información General */}
          <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <legend className="text-lg font-bold text-gray-800 flex items-center gap-2 px-2 -ml-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Información del Negocio
            </legend>
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <Building2 className="h-4 w-4 text-blue-500" />
                ¿Cómo se llama tu negocio? <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ej: Mi Tiendita, Café La Esquina"
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all text-base"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <FileText className="h-4 w-4 text-blue-500" />
                ¿A qué se dedica? <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe brevemente tu negocio o servicio..."
                rows={3}
                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-y transition-all text-base"
              />
            </div>
          </fieldset>

          {/* Sección de Ubicación */}
          <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <legend className="text-lg font-bold text-gray-800 flex items-center gap-2 px-2 -ml-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              Ubicación
            </legend>
            {/* Departamento */}
            <div>
              <label htmlFor="departamento" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <MapPin className="h-4 w-4 text-blue-500" />
                Departamento
              </label>
              <select
                id="departamento"
                name="departamento"
                value={form.departamento}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none cursor-pointer"
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipio */}
            {form.departamento && (
              <div>
                <label htmlFor="municipio" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Municipio
                </label>
                <select
                  id="municipio"
                  name="municipio"
                  value={form.municipio}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un municipio</option>
                  {municipios.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Colonia */}
            {form.municipio && (
              <div>
                <label htmlFor="colonia" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Colonia / Barrio (Opcional)
                </label>
                <Input
                  id="colonia"
                  name="colonia"
                  value={form.colonia}
                  onChange={handleChange}
                  placeholder="Ej: Col. Palmira, West Bay..."
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
            )}
          </fieldset>

          {/* Sección de Página Web */}
          <fieldset className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <legend className="text-lg font-bold text-gray-800 flex items-center gap-2 px-2 -ml-2">
              <Globe className="h-5 w-5 text-indigo-500" />
              Presencia Online
            </legend>
            {/* Tiene página web */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Globe className="h-4 w-4 text-blue-500" />
                ¿Tienes página web?
              </label>
              <RadioGroup
                value={form.hasWebsite}
                onValueChange={(v) => setForm((p) => ({...p, hasWebsite: v }))}
                className="flex gap-4"
              >
                <label
                  htmlFor="rb-yes"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 cursor-pointer transition-all text-sm font-medium ${
                    form.hasWebsite === "yes"
                     ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="yes" id="rb-yes" className="sr-only" />
                  <CheckCircle2 className="h-5 w-5" /> Sí
                </label>
                <label
                  htmlFor="rb-no"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 cursor-pointer transition-all text-sm font-medium ${
                    form.hasWebsite === "no"
                     ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="no" id="rb-no" className="sr-only" />
                  <X className="h-5 w-5" /> No
                </label>
              </RadioGroup>
            </div>

            {form.hasWebsite === "yes" && (
              <div>
                <label htmlFor="website" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Globe className="h-4 w-4 text-blue-500" />
                  URL de tu página web
                </label>
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://tu-sitio.com (Ej: Facebook, Instagram, etc.)"
                  className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
            )}
          </fieldset>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6"> {/* Separador sutil */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors py-2.5 h-auto text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-300/50 transition-all transform hover:-translate-y-0.5 py-2.5 h-auto text-base flex items-center justify-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0.16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar por WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterBusinessModal;