import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { X } from "lucide-react";

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: ModalFilters) => void;
  allBusinesses: {
    departamento?: string;
    island?: string;
    municipio?: string;
    location?: string;
    colonia?: string;
    category?: string;
  }[];
  departamentos: string[];
  municipios: string[];
  initialFilters: ModalFilters;
}

export interface ModalFilters {
  departamento: string;
  municipio: string;
  colonia: string;
  category: string;
}

export default function FiltersModal({
  open,
  onClose,
  onApply,
  allBusinesses,
  departamentos,
  municipios,
  initialFilters,
}: FiltersModalProps) {
  const [filters, setFilters] = useState<ModalFilters>(initialFilters);
  const [deptInput, setDeptInput] = useState(initialFilters.departamento);
  const [muniInput, setMuniInput] = useState(initialFilters.municipio);
  const [colInput, setColInput] = useState(initialFilters.colonia);
  const [catInput, setCatInput] = useState(initialFilters.category);

  // Resetear estado interno cuando el modal se abre
  useEffect(() => {
    if (open) {
      setFilters(initialFilters);
      setDeptInput(initialFilters.departamento);
      setMuniInput(initialFilters.municipio);
      setColInput(initialFilters.colonia);
      setCatInput(initialFilters.category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const municipiosFiltrados = useMemo(() => {
    if (!filters.departamento) return municipios;
    return Array.from(
      new Set(
        allBusinesses
          .filter((b) => (b.departamento || b.island) === filters.departamento)
          .map((b) => (b.municipio || b.location)?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [allBusinesses, municipios, filters.departamento]);

  const coloniasFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        allBusinesses
          .filter((b) => {
            const sameDept =
              !filters.departamento ||
              (b.departamento || b.island) === filters.departamento;
            const sameMuni =
              !filters.municipio ||
              (b.municipio || b.location) === filters.municipio;
            return sameDept && sameMuni;
          })
          .map((b) => b.colonia?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [allBusinesses, filters.departamento, filters.municipio]);

  const categoriasFiltradas = useMemo(() => {
    return Array.from(
      new Set(
        allBusinesses
          .filter((b) => {
            const sameDept =
              !filters.departamento ||
              (b.departamento || b.island) === filters.departamento;
            const sameMuni =
              !filters.municipio ||
              (b.municipio || b.location) === filters.municipio;
            const sameCol =
              !filters.colonia || (b.colonia || "") === filters.colonia;
            return sameDept && sameMuni && sameCol;
          })
          .map((b) => b.category?.trim()),
      ),
    )
      .filter(Boolean)
      .sort() as string[];
  }, [allBusinesses, filters.departamento, filters.municipio, filters.colonia]);

  const handleClear = () => {
    setFilters({ departamento: "", municipio: "", colonia: "", category: "" });
    setDeptInput("");
    setMuniInput("");
    setColInput("");
    setCatInput("");
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-[9999] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-slate-200 shadow-2xl bg-white">
        {/* ENCABEZADO */}
        <div className="px-6 py-6 sm:px-8 border-b border-slate-100 bg-white shrink-0 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Filtros Avanzados
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Refina tu búsqueda por ubicación específica y sector.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="px-6 py-6 sm:px-8 bg-slate-50 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Departamento */}
            <div className="space-y-2 rounded-[20px] border border-slate-200/60 bg-white p-4 shadow-sm">
              <p className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Departamento
              </p>
              <Combobox
                value={filters.departamento}
                onInputChange={setDeptInput}
                onChange={(val) => {
                  setFilters({
                    departamento: val,
                    municipio: "",
                    colonia: "",
                    category: "",
                  });
                  setDeptInput(val);
                  setMuniInput("");
                  setColInput("");
                  setCatInput("");
                }}
                options={departamentos.filter((d) =>
                  d.toLowerCase().includes(deptInput.toLowerCase()),
                )}
                placeholder="Elegir departamento"
                inputValue={deptInput}
                clearable
              />
            </div>

            {/* Municipio */}
            <div className="space-y-2 rounded-[20px] border border-slate-200/60 bg-white p-4 shadow-sm">
              <p className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Municipio
              </p>
              <Combobox
                value={filters.municipio}
                onInputChange={setMuniInput}
                onChange={(val) => {
                  setFilters((p) => ({
                    ...p,
                    municipio: val,
                    colonia: "",
                    category: "",
                  }));
                  setMuniInput(val);
                  setColInput("");
                  setCatInput("");
                }}
                options={municipiosFiltrados.filter((m) =>
                  m.toLowerCase().includes(muniInput.toLowerCase()),
                )}
                placeholder={
                  filters.departamento
                    ? "Elegir municipio"
                    : "Requiere departamento"
                }
                inputValue={muniInput}
                clearable
                disabled={!filters.departamento}
              />
            </div>

            {/* Sector / Colonia */}
            <div className="space-y-2 rounded-[20px] border border-slate-200/60 bg-white p-4 shadow-sm">
              <p className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Sector / Colonia
              </p>
              <Combobox
                value={filters.colonia}
                onInputChange={setColInput}
                onChange={(val) => {
                  setFilters((p) => ({ ...p, colonia: val, category: "" }));
                  setColInput(val);
                  setCatInput("");
                }}
                options={coloniasFiltradas.filter((c) =>
                  c.toLowerCase().includes(colInput.toLowerCase()),
                )}
                placeholder={
                  filters.departamento || filters.municipio
                    ? "Elegir sector"
                    : "Requiere ubicación"
                }
                inputValue={colInput}
                clearable
                disabled={!filters.departamento && !filters.municipio}
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2 rounded-[20px] border border-slate-200/60 bg-white p-4 shadow-sm">
              <p className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Categoría
              </p>
              <Combobox
                value={filters.category}
                onInputChange={setCatInput}
                onChange={(val) => {
                  setFilters((p) => ({ ...p, category: val }));
                  setCatInput(val);
                }}
                options={categoriasFiltradas.filter((c) =>
                  c.toLowerCase().includes(catInput.toLowerCase()),
                )}
                placeholder="Elegir categoría"
                inputValue={catInput}
                clearable
              />
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="px-6 py-5 sm:px-8 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-3 shrink-0 rounded-b-[32px]">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="w-full sm:w-auto rounded-full text-slate-500 hover:text-red-600 font-bold"
          >
            Limpiar todo
          </Button>
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-full border-slate-200 font-bold h-12 px-6 bg-white hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 sm:flex-none rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 shadow-sm"
            >
              Mostrar Resultados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
