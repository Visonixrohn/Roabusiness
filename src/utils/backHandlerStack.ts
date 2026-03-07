/**
 * Pila global de handlers para el botón atrás de Android.
 * Los modales registran su función de cierre aquí cuando están abiertos.
 * El listener principal en App.tsx llama al handler más reciente (tope de pila).
 */

type BackHandler = () => void;

const stack: BackHandler[] = [];

export const backHandlerStack = {
  /** Agrega un handler al tope de la pila. */
  push(handler: BackHandler): void {
    stack.push(handler);
  },

  /** Elimina el handler especificado de la pila (sin importar su posición). */
  remove(handler: BackHandler): void {
    const idx = stack.lastIndexOf(handler);
    if (idx !== -1) {
      stack.splice(idx, 1);
    }
  },

  /**
   * Ejecuta el handler del tope de la pila.
   * @returns true si había un handler y fue ejecutado, false si la pila estaba vacía.
   */
  pop(): boolean {
    if (stack.length === 0) return false;
    const handler = stack[stack.length - 1];
    handler();
    return true;
  },

  /** Indica si hay algún handler registrado. */
  hasHandlers(): boolean {
    return stack.length > 0;
  },
};
