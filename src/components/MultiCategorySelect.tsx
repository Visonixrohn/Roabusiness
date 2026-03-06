import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MultiCategorySelectProps {
  /** Lista maestra de categorías disponibles */
  categories: string[];
  /** Categorías actualmente seleccionadas */
  selected: string[];
  /** Callback cuando cambia la selección */
  onChange: (selected: string[]) => void;
  /** Placeholder cuando no hay selección */
  placeholder?: string;
  /** Máximo de categorías permitidas (0 = sin límite) */
  maxCategories?: number;
}

const MultiCategorySelect = ({
  categories,
  selected,
  onChange,
  placeholder = "Selecciona una o más categorías",
  maxCategories = 0,
}: MultiCategorySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      if (maxCategories > 0 && selected.length >= maxCategories) return;
      onChange([...selected, cat]);
    }
  };

  const remove = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((c) => c !== cat));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <div
        className={`min-h-[42px] w-full px-3 py-2 border rounded-lg cursor-pointer flex flex-wrap items-center gap-1.5 bg-white transition-shadow duration-150 focus-within:ring-2 focus-within:ring-blue-500 ${
          open
            ? "border-blue-500 ring-2 ring-blue-500"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {selected.length === 0 && (
          <span className="text-gray-400 text-sm select-none">
            {placeholder}
          </span>
        )}
        {selected.map((cat) => (
          <Badge
            key={cat}
            variant="secondary"
            className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 pr-1"
          >
            <span className="text-xs">{cat}</span>
            <button
              type="button"
              onClick={(e) => remove(cat, e)}
              className="ml-0.5 rounded-full hover:bg-blue-200 p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 ml-auto flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Búsqueda */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar categoría..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Info límite */}
          {maxCategories > 0 && (
            <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
              {selected.length}/{maxCategories} categorías seleccionadas
            </div>
          )}

          {/* Lista */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="text-center py-4 text-sm text-gray-400">
                No se encontraron categorías
              </li>
            ) : (
              filtered.map((cat) => {
                const isSelected = selected.includes(cat);
                const isDisabled =
                  maxCategories > 0 &&
                  selected.length >= maxCategories &&
                  !isSelected;
                return (
                  <li
                    key={cat}
                    onClick={() => !isDisabled && toggle(cat)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700"
                        : isDisabled
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 flex-shrink-0 border rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                    {cat}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiCategorySelect;
