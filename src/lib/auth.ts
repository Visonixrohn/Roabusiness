import { supabase } from "./supabaseClient";

// Utilidad para obtener el dominio correcto según entorno
function getRedirectOrigin() {
  // Si está en Vercel producción, usar dominio real
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "roabusiness.com"
  ) {
    return "https://roabusiness.com";
  }
  // Si está en preview de Vercel, usar el dominio de preview
  if (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".vercel.app")
  ) {
    return window.location.origin;
  }
  // Por defecto (desarrollo local)
  return window.location.origin;
}

// Registro de usuario con verificación de email
// envía un correo de confirmación automáticamente
export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectOrigin() + "/login", // Redirige tras confirmar email
    },
  });
}

// Login de usuario
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Enviar email para recuperación de contraseña
export async function resetPassword(email: string) {
  // Siempre usar la URL de producción para la redirección
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://roabusiness.com/set-new-password",
  });
}

// Cambiar contraseña tras recibir el link (en la página de /set-new-password)
export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({ password: newPassword });
}
