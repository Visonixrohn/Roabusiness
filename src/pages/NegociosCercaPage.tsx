import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, AlertCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import BusinessCard from "@/components/BusinessCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNearbyBusinesses } from "@/hooks/useNearbyBusinesses";

export default function NegociosCercaPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const categoria = params.get("categoria") ?? undefined;

  const { geo, requestLocation, nearbyBusinesses, loading } =
    useNearbyBusinesses(15, categoria);

  // Solicitar ubicación automáticamente al entrar en la página
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------ */
  /* Renderizado condicional según estado de geo                          */
  /* ------------------------------------------------------------------ */

  const renderBody = () => {
    // Pidiendo permiso / cargando
    if (geo.status === "idle" || geo.status === "loading" || loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-gray-500 text-sm">Obteniendo tu ubicación…</p>
        </div>
      );
    }

    // Permiso denegado
    if (geo.status === "denied") {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h3 className="font-semibold text-gray-800 text-lg">
            Ubicación no disponible
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Activa el permiso de ubicación en tu dispositivo y vuelve a
            intentarlo.
          </p>
          <Button onClick={requestLocation} variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      );
    }

    // Error de geolocalización
    if (geo.status === "error") {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-gray-500 text-sm">{geo.message}</p>
          <Button onClick={requestLocation} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      );
    }

    // Sin resultados
    if (nearbyBusinesses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
          <MapPin className="h-12 w-12 text-gray-300" />
          <h3 className="font-semibold text-gray-700 text-lg">
            Sin negocios cercanos
          </h3>
          <p className="text-gray-400 text-sm max-w-xs">
            No encontramos{" "}
            {categoria ? (
              <>
                negocios de <strong>{categoria}</strong>
              </>
            ) : (
              "negocios"
            )}{" "}
            en un radio de 15&nbsp;km.
          </p>
        </div>
      );
    }

    // Lista de cards
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      {/* Cabecera de la vista */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[50px] sm:top-[56px] z-30">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {/* Botón atrás */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>

          {/* Título + badges */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Negocios cerca
              </h1>
              <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] px-2 py-0.5 h-auto">
                <MapPin className="h-2.5 w-2.5 mr-1" />
                15 km
              </Badge>
            </div>
            {categoria && (
              <span className="text-xs text-blue-600 font-medium truncate">
                {categoria}
              </span>
            )}
          </div>

          {/* Total de resultados */}
          {geo.status === "ready" && nearbyBusinesses.length > 0 && (
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
              {nearbyBusinesses.length}{" "}
              {nearbyBusinesses.length === 1 ? "resultado" : "resultados"}
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="container mx-auto px-4 py-5">{renderBody()}</div>
    </div>
  );
}
