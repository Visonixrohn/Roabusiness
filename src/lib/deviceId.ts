/**
 * Utilidad para generar y gestionar identificador único de dispositivo
 * Se utiliza para permitir calificaciones sin necesidad de login
 */

const DEVICE_ID_KEY = "roabusiness_device_id";

/**
 * Genera un UUID v4 simple
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Genera un identificador de dispositivo basado en características del navegador
 * Combina varios datos para crear un fingerprint más estable
 */
function generateDeviceFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;

  const components = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];

  // Crear un hash simple de los componentes
  const fingerprint = components.join("|");
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * Obtiene o genera el identificador único del dispositivo
 * Se almacena en localStorage para persistencia entre sesiones
 *
 * @returns {string} Identificador único del dispositivo
 */
export function getDeviceId(): string {
  try {
    // Intentar recuperar el ID existente
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      // Generar nuevo ID combinando UUID y fingerprint para mayor unicidad
      const uuid = generateUUID();
      const fingerprint = generateDeviceFingerprint();
      deviceId = `${uuid}_${fingerprint}`;

      // Guardar en localStorage
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    // Si localStorage no está disponible (navegación privada, etc.)
    // generar ID temporal basado en fingerprint
    console.warn("localStorage no disponible, usando ID temporal");
    return `temp_${generateDeviceFingerprint()}_${Date.now()}`;
  }
}

/**
 * Regenera el identificador del dispositivo
 * Útil para testing o si el usuario quiere resetear su ID
 *
 * @returns {string} Nuevo identificador del dispositivo
 */
export function regenerateDeviceId(): string {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
    return getDeviceId();
  } catch (error) {
    console.error("Error al regenerar device_id:", error);
    return getDeviceId();
  }
}

/**
 * Verifica si el dispositivo tiene un ID almacenado
 *
 * @returns {boolean} true si existe un device_id almacenado
 */
export function hasStoredDeviceId(): boolean {
  try {
    return localStorage.getItem(DEVICE_ID_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Obtiene información de depuración sobre el device_id
 */
export function getDeviceIdDebugInfo(): {
  deviceId: string;
  isStored: boolean;
  fingerprint: string;
} {
  return {
    deviceId: getDeviceId(),
    isStored: hasStoredDeviceId(),
    fingerprint: generateDeviceFingerprint(),
  };
}

/**
 * Gestión de registro local de calificaciones
 * Mantiene un registro en localStorage de qué negocios ha calificado este dispositivo
 */

const RATINGS_REGISTRY_KEY = "roabusiness_ratings_registry";

interface RatingRegistry {
  [businessId: string]: {
    rating: number;
    timestamp: number;
    deviceId: string;
  };
}

/**
 * Obtiene el registro de calificaciones del dispositivo
 */
function getRatingsRegistry(): RatingRegistry {
  try {
    const stored = localStorage.getItem(RATINGS_REGISTRY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error al leer registro de calificaciones:", error);
    return {};
  }
}

/**
 * Guarda el registro de calificaciones
 */
function saveRatingsRegistry(registry: RatingRegistry): void {
  try {
    localStorage.setItem(RATINGS_REGISTRY_KEY, JSON.stringify(registry));
  } catch (error) {
    console.error("Error al guardar registro de calificaciones:", error);
  }
}

/**
 * Registra una calificación en localStorage
 */
export function registerRating(
  businessId: string,
  rating: number,
  deviceId?: string,
): void {
  const registry = getRatingsRegistry();
  registry[businessId] = {
    rating,
    timestamp: Date.now(),
    deviceId: deviceId || getDeviceId(),
  };
  saveRatingsRegistry(registry);
}

/**
 * Verifica si el dispositivo ya calificó un negocio
 */
export function hasRatedBusiness(businessId: string): boolean {
  const registry = getRatingsRegistry();
  return businessId in registry;
}

/**
 * Obtiene la calificación previa del dispositivo para un negocio
 */
export function getDeviceRating(businessId: string): number | null {
  const registry = getRatingsRegistry();
  return registry[businessId]?.rating ?? null;
}

/**
 * Elimina una calificación del registro local
 */
export function unregisterRating(businessId: string): void {
  const registry = getRatingsRegistry();
  delete registry[businessId];
  saveRatingsRegistry(registry);
}

/**
 * Limpia el registro de calificaciones (útil para testing)
 */
export function clearRatingsRegistry(): void {
  try {
    localStorage.removeItem(RATINGS_REGISTRY_KEY);
  } catch (error) {
    console.error("Error al limpiar registro:", error);
  }
}
