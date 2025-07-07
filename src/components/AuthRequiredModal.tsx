import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  open,
  onClose,
  message,
}) => {
  const navigate = useNavigate();
  const backdropRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  // Handler para cerrar al hacer clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-sm p-6 sm:p-8 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        {/* Mensaje */}
        <h2 className="text-base sm:text-lg font-semibold text-center mb-4 text-gray-800 leading-relaxed">
          {message || "Debes iniciar sesión "}
        </h2>

        {/* Botón de acción */}
        <Button
          onClick={() => {
            onClose();
            navigate("/login");
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105"
        >
          Iniciar sesión o registrarse
        </Button>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
