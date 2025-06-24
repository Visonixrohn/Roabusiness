import { supabase } from "./supabaseClient";

// Registro de usuario con verificación de email
// envía un correo de confirmación automáticamente
export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + "/login", // Redirige tras confirmar email
    },
  });
}

// Login de usuario
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Enviar email para recuperación de contraseña
export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/set-new-password", // Página para cambiar contraseña
  });
}

// Cambiar contraseña tras recibir el link (en la página de /set-new-password)
export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({ password: newPassword });
}
