import { supabase } from "./supabaseClient";

export async function isGoogleUser(email: string): Promise<boolean> {
  // Obtiene el usuario de Supabase Auth
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  // Si el usuario tiene provider 'google', es usuario de Google
  return (
    data.user.app_metadata?.provider === "google" ||
    data.user.identities?.some((i: any) => i.provider === "google")
  );
}
