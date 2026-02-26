/**
 * Utilidades para compartir enlaces de negocios
 */

import { toast } from "sonner";

/**
 * Detecta si un string es un UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Genera la URL directa para un negocio específico usando el profile_name
 * @param profileName - Nombre de perfil del negocio (@nombre) o ID como fallback
 * @returns URL completa del negocio
 */
export function getBusinessUrl(profileName: string): string {
  const baseUrl = window.location.origin;

  // Si es un UUID, usar el formato legacy con ID
  if (isUUID(profileName)) {
    console.warn(
      "⚠️ Usando ID en lugar de profile_name. Considera actualizar este negocio.",
    );
    return `${baseUrl}/negocio/${profileName}`;
  }

  // Asegurar que el profileName tenga el formato correcto (sin @)
  const cleanProfileName = profileName.startsWith("@")
    ? profileName.slice(1)
    : profileName;
  return `${baseUrl}/negocio/@${cleanProfileName}`;
}

/**
 * Copia la URL del negocio al portapapeles
 * @param profileName - Nombre de perfil del negocio
 * @param businessName - Nombre del negocio (opcional, para el mensaje)
 * @returns Promise<boolean> - true si se copió exitosamente
 */
export async function copyBusinessLink(
  profileName: string,
  businessName?: string,
): Promise<boolean> {
  try {
    const url = getBusinessUrl(profileName);

    // Intentar usar la API moderna del portapapeles
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      toast.success(
        businessName
          ? `Enlace de "${businessName}" copiado al portapapeles`
          : "Enlace copiado al portapapeles",
      );
      return true;
    }

    // Fallback para navegadores antiguos o contextos no seguros
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    textArea.remove();

    if (successful) {
      toast.success(
        businessName
          ? `Enlace de "${businessName}" copiado al portapapeles`
          : "Enlace copiado al portapapeles",
      );
      return true;
    } else {
      throw new Error("No se pudo copiar el enlace");
    }
  } catch (error) {
    console.error("Error al copiar enlace:", error);
    toast.error("No se pudo copiar el enlace. Intenta de nuevo.");
    return false;
  }
}

/**
 * Intenta compartir el negocio usando la Web Share API (móviles)
 * Si no está disponible, copia el enlace al portapapeles
 * @param profileName - Nombre de perfil del negocio
 * @param businessName - Nombre del negocio
 * @param description - Descripción opcional
 */
export async function shareBusinessLink(
  profileName: string,
  businessName: string,
  description?: string,
): Promise<void> {
  const url = getBusinessUrl(profileName);

  // Verificar si Web Share API está disponible
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: description || `Mira ${businessName} en Roabusiness`,
        url: url,
      });
      toast.success("Enlace compartido exitosamente");
    } catch (error: any) {
      // El usuario canceló el share o hubo un error
      if (error.name !== "AbortError") {
        console.error("Error al compartir:", error);
        // Fallback a copiar al portapapeles
        await copyBusinessLink(profileName, businessName);
      }
    }
  } else {
    // Fallback: copiar al portapapeles
    await copyBusinessLink(profileName, businessName);
  }
}

/**
 * Verifica si el dispositivo soporta Web Share API
 */
export function supportsWebShare(): boolean {
  return typeof navigator.share === "function";
}
