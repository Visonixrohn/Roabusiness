import { useEffect, useRef, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      // Canvas con fondo circular azul + QR cuadrado centrado
      const canvasSize = 520;
      const qrSize = 380; // QR cuadrado - NO recortar para que sea escaneable
      const qrX = (canvasSize - qrSize) / 2;
      const qrY = (canvasSize - qrSize) / 2;

      const textAreaHeight = 130;
      canvas.width = canvasSize;
      canvas.height = canvasSize + textAreaHeight;

      // Fondo circular azul
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#1E40AF";
      ctx.fill();

      // Fondo blanco cuadrado con bordes redondeados para el QR
      const borderRadius = 20;
      ctx.beginPath();
      ctx.moveTo(qrX + borderRadius, qrY);
      ctx.lineTo(qrX + qrSize - borderRadius, qrY);
      ctx.arcTo(
        qrX + qrSize,
        qrY,
        qrX + qrSize,
        qrY + borderRadius,
        borderRadius,
      );
      ctx.lineTo(qrX + qrSize, qrY + qrSize - borderRadius);
      ctx.arcTo(
        qrX + qrSize,
        qrY + qrSize,
        qrX + qrSize - borderRadius,
        qrY + qrSize,
        borderRadius,
      );
      ctx.lineTo(qrX + borderRadius, qrY + qrSize);
      ctx.arcTo(
        qrX,
        qrY + qrSize,
        qrX,
        qrY + qrSize - borderRadius,
        borderRadius,
      );
      ctx.lineTo(qrX, qrY + borderRadius);
      ctx.arcTo(qrX, qrY, qrX + borderRadius, qrY, borderRadius);
      ctx.closePath();
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // Generar QR en canvas temporal (cuadrado, sin recorte)
      const tempCanvas = document.createElement("canvas");
      await QRCodeLib.toCanvas(tempCanvas, url, {
        width: qrSize,
        margin: 2,
        color: {
          dark: "#1E3A8A",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });

      // Recortar el canvas temporal con bordes redondeados al principal
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(qrX + borderRadius, qrY);
      ctx.lineTo(qrX + qrSize - borderRadius, qrY);
      ctx.arcTo(
        qrX + qrSize,
        qrY,
        qrX + qrSize,
        qrY + borderRadius,
        borderRadius,
      );
      ctx.lineTo(qrX + qrSize, qrY + qrSize - borderRadius);
      ctx.arcTo(
        qrX + qrSize,
        qrY + qrSize,
        qrX + qrSize - borderRadius,
        qrY + qrSize,
        borderRadius,
      );
      ctx.lineTo(qrX + borderRadius, qrY + qrSize);
      ctx.arcTo(
        qrX,
        qrY + qrSize,
        qrX,
        qrY + qrSize - borderRadius,
        borderRadius,
      );
      ctx.lineTo(qrX, qrY + borderRadius);
      ctx.arcTo(qrX, qrY, qrX + borderRadius, qrY, borderRadius);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);
      ctx.restore();

      // Logo en el centro del QR
      const logoSize = qrSize * 0.18;
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;

      const drawLogo = (logoImg?: HTMLImageElement) => {
        // Círculo blanco detrás del logo
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 9, 0, Math.PI * 2);
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (logoImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            logoImg,
            centerX - logoSize / 2,
            centerY - logoSize / 2,
            logoSize,
            logoSize,
          );
          ctx.restore();
        } else {
          // Iniciales
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = "#1E40AF";
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = `bold ${logoSize * 0.42}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            businessName.substring(0, 2).toUpperCase(),
            centerX,
            centerY,
          );
        }

        // Área de texto blanca debajo del círculo
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, canvasSize, canvasSize, textAreaHeight);

        // Texto principal
        ctx.fillStyle = "#1E40AF";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          "Calificame en Roabusiness.com",
          canvasSize / 2,
          canvasSize + 40,
        );

        // Nombre del negocio
        ctx.fillStyle = "#64748B";
        ctx.font = "20px sans-serif";
        // Truncar nombre si es muy largo
        const maxWidth = canvasSize - 40;
        let displayName = businessName;
        while (
          ctx.measureText(displayName).width > maxWidth &&
          displayName.length > 0
        ) {
          displayName = displayName.slice(0, -1);
        }
        if (displayName !== businessName) displayName += "...";
        ctx.fillText(displayName, canvasSize / 2, canvasSize + 88);

        setQrDataUrl(canvas.toDataURL("image/png"));
      };

      if (businessLogo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => drawLogo(img);
        img.onerror = () => drawLogo();
        img.src = businessLogo;
      } else {
        drawLogo();
      }
    } catch (error) {
      console.error("Error generando QR:", error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "_")}_QR.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[9999] p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto my-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Comparte con QR
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Escanea para visitar el negocio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 py-5 text-center">
          {/* QR Code */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-3 mb-5">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-full shadow-xl"
              />
              <div>
                <p className="text-sm font-bold text-blue-700">
                  Calificame en Roabusiness.com
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[16rem]">
                  {businessName}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-blue-200 animate-pulse bg-blue-50 flex items-center justify-center">
                <span className="text-blue-400 text-sm">Generando QR...</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl"
            >
              Cerrar
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700"
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
