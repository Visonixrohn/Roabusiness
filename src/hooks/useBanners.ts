import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type FocalPoint =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const focalPointToCSS = (fp: FocalPoint | null | undefined): string => {
  const map: Record<FocalPoint, string> = {
    "top-left": "left top",
    "top-center": "center top",
    "top-right": "right top",
    "center-left": "left center",
    center: "center center",
    "center-right": "right center",
    "bottom-left": "left bottom",
    "bottom-center": "center bottom",
    "bottom-right": "right bottom",
  };
  return map[fp ?? "center"] ?? "center center";
};

export interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  image_path: string | null;
  link_url: string | null;
  link_label: string | null;
  link_button_color: string | null;
  mobile_image_url: string | null;
  mobile_image_path: string | null;
  focal_point: FocalPoint | null;
  zoom_scale: number | null;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("banner_ads")
          .select("*")
          .eq("active", true)
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) throw error;
        setBanners(data || []);
      } catch (err) {
        console.error("Error al cargar banners:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const uploadBannerImage = async (
    file: File,
    bannerId: string,
    oldImagePath?: string | null,
  ): Promise<{ url: string; path: string } | null> => {
    try {
      // Eliminar imagen anterior si existe
      if (oldImagePath) {
        await supabase.storage.from("banner-images").remove([oldImagePath]);
      }

      const ext = file.name.split(".").pop();
      const newPath = `banners/${bannerId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("banner-images")
        .upload(newPath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("banner-images").getPublicUrl(newPath);

      return { url: publicUrl, path: newPath };
    } catch (err) {
      console.error("Error subiendo imagen de banner:", err);
      return null;
    }
  };

  return { banners, loading, error, uploadBannerImage };
};
