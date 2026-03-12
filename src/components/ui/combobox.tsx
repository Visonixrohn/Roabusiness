import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  value = "",
  onChange,
  options,
  placeholder = "Selecciona una opción",
  inputValue,
  onInputChange,
  clearable = false,
  disabled = false,
  className,
}: ComboboxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [internalInput, setInternalInput] = useState(value || "");
  const [portalReady, setPortalReady] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const currentInput = inputValue ?? internalInput;

  const filteredOptions = useMemo(() => {
    const query = (currentInput || "").toLowerCase().trim();
    if (!query) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }, [options, currentInput]);

  const updateDropdownPosition = () => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = Math.min(
      Math.max(filteredOptions.length * 44 + 8, 80),
      288,
    );

    const spaceBelow = viewportHeight - rect.bottom;
    const openUpwards = spaceBelow < estimatedHeight + 12 && rect.top > estimatedHeight;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 999999,
      top: openUpwards ? undefined : rect.bottom + 8,
      bottom: openUpwards ? viewportHeight - rect.top + 8 : undefined,
    });
  };

  useLayoutEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();

    const handleResize = () => updateDropdownPosition();
    const handleScroll = () => updateDropdownPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, filteredOptions.length]);

  useEffect(() => {
    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
    };
  }, []);

  const handleInputChange = (nextValue: string) => {
    if (onInputChange) {
      onInputChange(nextValue);
    } else {
      setInternalInput(nextValue);
    }

    setOpen(true);
  };

  const handleSelect = (option: string) => {
    onChange(option);

    if (onInputChange) {
      onInputChange(option);
    } else {
      setInternalInput(option);
    }

    setOpen(false);
  };

  const handleClear = () => {
    onChange("");

    if (onInputChange) {
      onInputChange("");
    } else {
      setInternalInput("");
    }

    setOpen(false);
    inputRef.current?.focus();
  };

  const dropdown = open && !disabled && portalReady
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const selected = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                    selected
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span>{option}</span>
                  {selected && <Check className="h-4 w-4" />}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500">
              No se encontraron resultados
            </div>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div ref={wrapperRef} className={cn("relative w-full", className)}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            disabled={disabled}
            placeholder={placeholder}
            onFocus={() => {
              if (!disabled) {
                setOpen(true);
                updateDropdownPosition();
              }
            }}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={() => {
              requestAnimationFrame(() => {
                const active = document.activeElement;
                if (
                  wrapperRef.current?.contains(active) ||
                  dropdownRef.current?.contains(active)
                ) {
                  return;
                }
                setOpen(false);
              });
            }}
            className={cn(
              "flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-20 text-sm text-slate-900 shadow-sm outline-none transition",
              "placeholder:text-slate-400",
              "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />

          <div className="absolute inset-y-0 right-3 flex items-center gap-1">
            {clearable && currentInput && !disabled && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (disabled) return;
                setOpen((prev) => !prev);
                requestAnimationFrame(updateDropdownPosition);
              }}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {dropdown}
    </>
  );
}