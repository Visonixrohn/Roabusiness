import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TransactionReceiptProps {
  transactionId: number;
  businessName: string;
  profileName?: string;
  tipo: "ingreso" | "egreso" | "reembolso";
  concepto: string;
  monto: number;
  paymentMethod?: string;
  fecha: string;
  notas?: string;
  onClose: () => void;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  transactionId,
  businessName,
  profileName,
  tipo,
  concepto,
  monto,
  paymentMethod,
  fecha,
  notas,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-HN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$ ${amount.toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const getTipoLabel = (): { label: string; color: string } => {
    switch (tipo) {
      case "ingreso":
        return { label: "INGRESO", color: "text-green-600" };
      case "egreso":
        return { label: "EGRESO", color: "text-red-600" };
      case "reembolso":
        return { label: "REEMBOLSO", color: "text-blue-600" };
    }
  };

  const tipoInfo = getTipoLabel();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="receipt-container relative w-full max-w-2xl bg-white p-4 sm:p-8 shadow-lg rounded-lg my-4">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Encabezado */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roabusiness</h1>
              <p className="text-gray-600">Plataforma de Negocios</p>
            </div>
          </div>

          <div className="text-center">
            <h2 className={`text-2xl font-bold ${tipoInfo.color} uppercase`}>
              Comprobante de {tipoInfo.label}
            </h2>
            <p className="text-gray-600 mt-1">Transacción #{transactionId}</p>
          </div>
        </div>

        {/* Información del negocio */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Negocio</h3>
          <p className="text-lg font-medium">{businessName}</p>
          {profileName && <p className="text-gray-600">@{profileName}</p>}
        </div>

        {/* Detalles de la transacción */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Concepto:</span>
            <span className="font-medium">{concepto}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Tipo:</span>
            <span className={`font-semibold ${tipoInfo.color}`}>
              {tipoInfo.label}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Monto:</span>
            <span className={`text-2xl font-bold ${tipoInfo.color}`}>
              {tipo === "egreso" ? "-" : "+"}
              {formatCurrency(monto)}
            </span>
          </div>

          {paymentMethod && (
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Método de pago:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-medium">{formatDate(fecha)}</span>
          </div>

          {notas && (
            <div className="border-b pb-2">
              <span className="text-gray-600 block mb-1">Notas:</span>
              <p className="text-sm text-gray-700">{notas}</p>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="border-t-2 border-gray-300 pt-6 mt-6">
          <p className="text-center text-sm text-gray-600">
            Este comprobante es un registro de la transacción realizada
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            Generado el {new Date().toLocaleDateString("es-HN")} a las{" "}
            {new Date().toLocaleTimeString("es-HN")}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6 print:hidden">
          <Button onClick={handlePrint} className="flex-1">
            🖨️ Imprimir Comprobante
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cerrar
          </Button>
        </div>

        {/* Estilos para impresión */}
        <style>{`
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .receipt-container {
              box-shadow: none;
              max-width: 100%;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TransactionReceipt;
