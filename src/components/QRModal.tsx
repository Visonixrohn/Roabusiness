import { useEffect, useRef, useState } from "react";
import { useAndroidBack } from "@/hooks/useAndroidBack";
import { X, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessLogo?: string;
  url: string;
}

const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  businessName,
  businessLogo,
  url,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Cerrar al presionar atrás en Android
  useAndroidBack(onClose, isOpen);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen, url, businessLogo]);

  const generateQRCode = async () => {
    try {
      const QRCodeLib = await import("qrcode");

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Card elegante rectangular
      const cardW = 520;
      const padding = 40;
      const qrSize = 320;
      const logoAreaH = 80;
      const nameAreaH = 70;
      const footerH = 40;
      const cardH = padding + logoAreaH + 20 + qrSize + nameAreaH + footerH + padding;

      canvas.width = cardW;
      canvas.height = cardH;

      // Fondo blanco con bordes redondeados
      const radius = 28;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(cardW - radius, 0);
      ctx.arcTo(cardW, 0, cardW, radius, radius);
      ctx.lineTo(cardW, cardH - radius);
      ctx.arcTo(cardW, cardH, cardW - radius, cardH, radius);
      ctx.lineTo(radius, cardH);
      ctx.arcTo(0, cardH, 0, cardH - radius, radius);
      ctx.lineTo(0, radius);
      ctx.arcTo(0, 0, radius, 0, radius);
      ctx.closePath();
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // Sombra sutil (borde)
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const centerX = cardW / 2;
      let y = padding;

      // Zona del logo
      const drawContent = (logoImg?: HTMLImageElement) => {
        const logoSize = 56;
        if (logoImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(logoImg, centerX - logoSize / 2, y, logoSize, logoSize);
          ctx.restore();
          // Borde del logo
          ctx.beginPath();
          ctx.arc(centerX, y + logoSize / 2, logoSize / 2 + 1, 0, Math.PI * 2);
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Iniciales
          ctx.beginPath();
          ctx.arc(centerX, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = "#1E40AF";
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = `bold ${logoSize * 0.4}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(businessName.substring(0, 2).toUpperCase(), centerX, y + logoSize / 2);
        }

        y += logoAreaH + 10;

        // Nombre del negocio
        ctx.fillStyle = "#0F172A";
        ctx.font = `bold 22px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxNameW = cardW - padding * 2;
        let displayName = businessName;
        while (ctx.measureText(displayName).width > maxNameW && displayName.length > 0) {
          displayName = displayName.slice(0, -1);
        }
        if (displayName !== businessName) displayName += "…";
        ctx.fillText(displayName, centerX, y);

        y += 30;

        // QR
        const qrX = (cardW - qrSize) / 2;
        const qrY = y;

        // Generar QR en canvas temporal
        const tempCanvas = document.createElement("canvas");
        QRCodeLib.toCanvas(tempCanvas, url, {
          width: qrSize,
          margin: 2,
          color: { dark: "#0F172A", light: "#FFFFFF" },
          errorCorrectionLevel: "H",
        }).then(() => {
          ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

          y = qrY + qrSize + 20;

          // Footer
          ctx.fillStyle = "#64748B";
          ctx.font = `500 14px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Escanea y califica en Roabusiness.com", centerX, y);

          y += 22;

          // Línea decorativa
          const lineW = 60;
          ctx.beginPath();
          ctx.moveTo(centerX - lineW / 2, y);
          ctx.lineTo(centerX + lineW / 2, y);
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 2;
          ctx.stroke();

          setQrDataUrl(canvas.toDataURL("image/png"));
        });
      };

      if (businessLogo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => drawContent(img);
        img.onerror = () => drawContent();
        img.src = businessLogo;
      } else {
        drawContent();
      }
    } catch (error) {
      console.error("Error generando QR:", error);
    }
  };

  const getQRBlob = async (): Promise<Blob | null> => {
    if (!qrDataUrl) return null;
    const res = await fetch(qrDataUrl);
    return res.blob();
  };

  /** Convierte dataURL a base64 puro (sin prefijo data:...) */
  const getBase64 = (): string => {
    if (!qrDataUrl) return "";
    return qrDataUrl.split(",")[1] || "";
  };

  const handleDownload = async () => {
    const blob = await getQRBlob();
    if (!blob) return;

    const fileName = `${businessName.replace(/\s+/g, "_")}_QR.png`;

    // En nativo (Capacitor), share con el plugin nativo que abre "Guardar en…"
    if (Capacitor.isNativePlatform()) {
      try {
        // Escribir como archivo temporal y compartir con intent nativo
        const base64Data = getBase64();
        // Crear un blob URL temporal para pasarlo a share
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `QR - ${businessName}` });
          return;
        }
        // Fallback: share con URL como texto
        await Share.share({
          title: `QR - ${businessName}`,
          text: `Escanea y califica ${businessName} en Roabusiness.com`,
          url: url,
          dialogTitle: `Descargar QR de ${businessName}`,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError" || (err as any)?.message?.includes("cancel")) return;
      }
    }

    // PWA: intentar Web Share con archivos
    const file = new File([blob], fileName, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `QR - ${businessName}`,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback escritorio
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleShare = async () => {
    const blob = await getQRBlob();
    if (!blob) return;

    const fileName = `${businessName.replace(/\s+/g, "_")}_QR.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    // Nativo: usar Capacitor Share primero con archivos
    if (Capacitor.isNativePlatform()) {
      // Intentar share con archivos vía Web Share API (funciona en algunos WebView)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `QR - ${businessName}`,
            text: `Escanea y califica ${businessName} en Roabusiness.com`,
          });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          // Si falla con archivos, caer al share de URL
        }
      }
      // Fallback nativo: share solo con URL
      try {
        await Share.share({
          title: businessName,
          text: `Escanea y califica en Roabusiness.com`,
          url: url,
          dialogTitle: `Compartir ${businessName}`,
        });
        return;
      } catch (err) {
        if ((err as any)?.message?.includes("cancel")) return;
      }
      return;
    }

    // PWA: intentar share con archivos
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `QR - ${businessName}`,
          text: `Escanea y califica ${businessName} en Roabusiness.com`,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: share URL sin imagen
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Calificame en Roabusiness.com`,
          url: url,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Código QR</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparte este QR para que te encuentren
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 pb-5 text-center">
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-4 mb-5">
              <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white p-1">
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-64 h-auto rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-64 h-64 rounded-2xl border border-slate-200 animate-pulse bg-slate-50 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Generando QR...</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              disabled={!qrDataUrl}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800"
              disabled={!qrDataUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
