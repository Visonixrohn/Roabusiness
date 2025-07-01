import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Download, Share2 } from "lucide-react";
import { Business } from "@/types/business";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GalleryModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
}

const GalleryModal = ({ business, isOpen, onClose }: GalleryModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reiniciar índice al abrir el modal
  useEffect(() => {
    if (isOpen) setCurrentImageIndex(0);
  }, [isOpen, business.gallery]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === business.gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? business.gallery.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = business.gallery[currentImageIndex];
    link.download = `${business.name}-imagen-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} - Galería`,
          text: `Mira esta imagen de ${business.name} en ${business.island}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isOpen || !business.gallery || business.gallery.length === 0)
    return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <div className="relative h-full bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="text-white font-semibold">{business.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {currentImageIndex + 1} de {business.gallery.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="relative h-full flex items-center justify-center">
            <img
              src={business.gallery[currentImageIndex]}
              alt={`${business.name} - Imagen ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Controles de navegación */}
            {business.gallery.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {business.gallery.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex justify-center space-x-2 overflow-x-auto">
                {business.gallery.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      index === currentImageIndex
                        ? "border-blue-500 opacity-100"
                        : "border-white/30 opacity-60 hover:opacity-80"
                    )}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicadores de posición */}
          {business.gallery.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
              <div className="flex space-x-2">
                {business.gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentImageIndex
                        ? "bg-white"
                        : "bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
