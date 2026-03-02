import React from "react";

interface ReceiptProps {
  transactionId: number;
  businessName: string;
  profileName?: string;
  planMonths: number;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  expiresAt: string;
  wasGracePeriod?: boolean;
  businessContact?: {
    email?: string;
    phone?: string;
  };
}

const Receipt: React.FC<ReceiptProps> = ({
  transactionId,
  businessName,
  profileName,
  planMonths,
  amountPaid,
  paymentMethod,
  paymentDate,
  expiresAt,
  wasGracePeriod,
  businessContact,
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
    return `L ${amount.toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container max-w-2xl mx-auto bg-white p-8 shadow-lg">
      {/* Header con logo */}
      <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/logo.png"
            alt="Roabusiness Logo"
            className="h-16 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <h1 className="text-3xl font-bold text-blue-600">Roabusiness</h1>
        <p className="text-gray-600 mt-2">Plataforma de Negocios en Honduras</p>
        <p className="text-sm text-gray-500">www.roabusiness.com</p>
      </div>

      {/* Título del recibo */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">RECIBO DE PAGO</h2>
        <p className="text-gray-600">Transacción #{transactionId}</p>
        {wasGracePeriod && (
          <div className="mt-2 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            ✓ Activación de Cuenta
          </div>
        )}
      </div>

      {/* Información del negocio */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Datos del Negocio
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre del Negocio:</p>
            <p className="font-semibold text-gray-900">{businessName}</p>
          </div>
          {profileName && (
            <div>
              <p className="text-sm text-gray-600">Perfil:</p>
              <p className="font-semibold text-gray-900">@{profileName}</p>
            </div>
          )}
          {businessContact?.email && (
            <div>
              <p className="text-sm text-gray-600">Email:</p>
              <p className="font-semibold text-gray-900">
                {businessContact.email}
              </p>
            </div>
          )}
          {businessContact?.phone && (
            <div>
              <p className="text-sm text-gray-600">Teléfono:</p>
              <p className="font-semibold text-gray-900">
                {businessContact.phone}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detalles del pago */}
      <div className="border-t-2 border-b-2 border-gray-200 py-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Detalles del Pago
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan de Suscripción:</span>
            <span className="font-semibold text-gray-900">
              {planMonths} meses
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Método de Pago:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha de Pago:</span>
            <span className="font-semibold text-gray-900">
              {formatDate(paymentDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Válido Hasta:</span>
            <span className="font-semibold text-green-600">
              {formatDate(expiresAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-gray-800">
            TOTAL PAGADO:
          </span>
          <span className="text-3xl font-bold text-blue-600">
            {formatCurrency(amountPaid)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p className="font-semibold">¡Gracias por confiar en Roabusiness!</p>
        <p>
          Este recibo es válido como comprobante de pago. Conserve este
          documento para sus registros.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p>Soporte: soporte@roabusiness.com | Tel: +504 0000-0000</p>
        </div>
      </div>

      {/* Botón de imprimir (solo visible en pantalla) */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          🖨️ Imprimir Recibo
        </button>
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
  );
};

export default Receipt;
