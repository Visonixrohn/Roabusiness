import { supabase } from "./supabaseClient";

export function getGoogleRedirectUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin; // ya incluye https:// y el dominio correcto
  }
  return "https://roabusiness.com/google-callback"; // fallback para SSR
}

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `https://roabusiness.com/google-callback`,
    },
  });
}
