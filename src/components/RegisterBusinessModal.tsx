import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterBusinessModal = ({ isOpen, onClose }: Props) => {
  const [form, setForm] = useState({ name: "", description: "", hasWebsite: "no", website: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construir mensaje para WhatsApp
    const phone = "50488857653"; // número destino
    const hasWebsiteText = form.hasWebsite === "yes" ? "Sí" : "No";
    const text = `Hola, quiero registrar mi negocio\nNombre: ${form.name}\nDescripción: ${form.description}\nTiene página web: ${hasWebsiteText}${
      form.hasWebsite === "yes" && form.website ? `\nWeb: ${form.website}` : ""
    }`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    // Abrir WhatsApp en nueva pestaña
    window.open(url, "_blank");
    toast.success("Abriendo WhatsApp con tu solicitud...");
    setForm({ name: "", description: "", hasWebsite: "no", website: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Solicitar registro de negocio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo se llama tu negocio?</label>
            <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nombre del negocio" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿A qué se dedica tu negocio?</label>
            <Textarea name="description" value={form.description} onChange={handleChange} required placeholder="Descripción breve" rows={3} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">¿Tienes página web?</label>
            <div className="flex items-center gap-4">
              <RadioGroup value={form.hasWebsite} onValueChange={(v) => setForm((p) => ({ ...p, hasWebsite: v }))}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="rb-yes" />
                  <label htmlFor="rb-yes" className="text-sm">Sí</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="rb-no" />
                  <label htmlFor="rb-no" className="text-sm">No</label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {form.hasWebsite === "yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Página web (opcional)</label>
              <Input name="website" value={form.website} onChange={handleChange} placeholder="https://tu-sitio.com" />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" className="mr-2" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Solicitar registro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterBusinessModal;
