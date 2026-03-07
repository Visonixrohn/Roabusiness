import { useEffect, useRef } from "react";
import { backHandlerStack } from "@/utils/backHandlerStack";

/**
 * Hook para registrar un handler del botón atrás de Android.
 * Mientras `isActive` sea true, el handler queda en la pila global.
 * Cuando se presiona atrás, App.tsx llama al handler del tope de la pila
 * (que será la función pasada aquí: normalmente el `onClose` del modal).
 *
 * @param handler  Función a ejecutar cuando se presione atrás (ej: cerrar modal).
 * @param isActive Si es true, el handler está registrado; si pasa a false, se elimina.
 */
export function useAndroidBack(handler: () => void, isActive: boolean): void {
  // Usamos ref para evitar re-registros innecesarios si la referencia del handler cambia
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!isActive) return;

    const stableHandler = () => handlerRef.current();
    backHandlerStack.push(stableHandler);

    return () => {
      backHandlerStack.remove(stableHandler);
    };
  }, [isActive]);
}
