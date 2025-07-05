import * as React from "react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  options: string[];
  placeholder?: string;
  inputValue?: string;
  clearable?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  onInputChange,
  options,
  placeholder = "Selecciona...",
  inputValue = "",
  clearable = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        value={inputValue !== undefined ? inputValue : value}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onInputChange?.(e.target.value);
          setOpen(true);
        }}
        readOnly={!!onInputChange && !onInputChange}
        autoComplete="off"
      />
      {clearable && value && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
          onClick={() => {
            onChange("");
            onInputChange?.("");
          }}
        >
          ×
        </button>
      )}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">Sin resultados</div>
          ) : (
            options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                  option === value ? "bg-blue-100 text-blue-700" : ""
                }`}
                onMouseDown={() => {
                  onChange(option);
                  setOpen(false);
                  onInputChange?.("");
                }}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
