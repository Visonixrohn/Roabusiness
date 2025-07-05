import { supabase } from "./supabaseClient";

export function getGoogleRedirectUrl() {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "roabusiness.com") {
      return "https://roabusiness.com";
    }
    if (window.location.hostname.endsWith(".vercel.app")) {
      return window.location.origin;
    }
    return window.location.origin;
  }
  return "https://roabusiness.com";
}

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getGoogleRedirectUrl() + "/google-callback",
    },
  });
}
