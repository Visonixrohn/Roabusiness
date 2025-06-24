import { supabase } from "@/lib/supabaseClient";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  // Validaciones
  if (!file) return { success: false, error: 'No se seleccionó ningún archivo' };
  if (!file.type.startsWith('image/')) return { success: false, error: 'El archivo debe ser una imagen' };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: 'La imagen debe ser menor a 5MB' };

  // Subir a Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const { data, error } = await supabase.storage.from('uploads').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) return { success: false, error: error.message };

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return { success: true, url: publicUrlData.publicUrl };
};

export const uploadMultipleImages = async (files: FileList): Promise<UploadResult[]> => {
  const promises = Array.from(files).map(file => uploadImage(file));
  return Promise.all(promises);
};

export const deleteImage = (imageUrl: string): boolean => {
  try {
    const savedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
    
    // Encontrar y eliminar la imagen
    const imageId = Object.keys(savedImages).find(id => 
      savedImages[id].url === imageUrl
    );
    
    if (imageId) {
      delete savedImages[imageId];
      localStorage.setItem('uploadedImages', JSON.stringify(savedImages));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};