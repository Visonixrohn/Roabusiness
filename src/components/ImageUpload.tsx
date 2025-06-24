import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { uploadImage, compressImage, UploadResult } from '@/utils/imageUpload';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: (imageUrl: string) => void;
  currentImage?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
  compress?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  currentImage,
  label = "Subir imagen",
  accept = "image/*",
  maxSize = 5,
  compress = true,
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`La imagen debe ser menor a ${maxSize}MB`);
      return;
    }

    setIsUploading(true);

    try {
      let fileToUpload = file;
      
      // Comprimir imagen si está habilitado
      if (compress && file.size > 500 * 1024) { // Si es mayor a 500KB
        fileToUpload = await compressImage(file);
        toast.success('Imagen optimizada automáticamente');
      }

      const result: UploadResult = await uploadImage(fileToUpload);

      if (result.success && result.url) {
        onImageUploaded(result.url);
        toast.success('Imagen subida exitosamente');
      } else {
        toast.error(result.error || 'Error al subir la imagen');
      }
    } catch (error) {
      toast.error('Error inesperado al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (currentImage && onImageRemoved) {
      onImageRemoved(currentImage);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentImage ? (
        // Vista previa de imagen actual
        <div className="relative group">
          <img
            src={currentImage}
            alt="Imagen actual"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          
          {/* Overlay con botones */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
            <Button
              type="button"
              size="sm"
              onClick={openFileDialog}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Cambiar
            </Button>
            
            {onImageRemoved && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Zona de drop para nueva imagen
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!isUploading ? openFileDialog : undefined}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium mb-2">{label}</p>
              <p className="text-sm text-gray-500 mb-4">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <Button type="button" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG hasta {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;