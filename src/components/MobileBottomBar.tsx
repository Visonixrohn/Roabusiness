import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useNearbyBusinesses } from "@/hooks/useNearbyBusinesses";
import { haversineKm } from "@/utils/geoDistance";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  Map,
} from "lucide-react";

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection(10);
  const [panelOpen, setPanelOpen] = useState(false);

  const { geo, requestLocation, nearbyBusinesses, loading } =
    useNearbyBusinesses(1.5);

  // Solicitar ubicación al abrir el panel
  useEffect(() => {
    if (panelOpen) requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  // Cerrar el panel si cambia la ruta
  useEffect(() => {
    setPanelOpen(false);
  }, [location.pathname]);

  const isNearbyRoute = location.pathname === "/negocios-cerca";

  const handleNavClick = (to: string) => () => {
    setPanelOpen(false);
    if (location.pathname !== to) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const getDistance = (b: {
    latitude?: number;
    longitude?: number;
    coordinates?: { lat?: number; lng?: number };
  }) => {
    if (geo.status !== "ready") return "";
    const bLat = b.latitude ?? b.coordinates?.lat;
    const bLng = b.longitude ?? b.coordinates?.lng;
    if (!bLat || !bLng) return "";
    const d = haversineKm(geo.lat, geo.lng, bLat, bLng);
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  const renderPanelContent = () => {
    if (geo.status === "idle" || geo.status === "loading" || loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin absolute" />
            <MapPin className="h-4 w-4 text-blue-400 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-600">
            Buscando a tu alrededor...
          </p>
        </div>
      );
    }

    if (geo.status === "denied") {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="mb-2 text-base font-bold text-gray-900">
            Ubicación desactivada
          </h3>
          <p className="text-sm text-gray-500 max-w-[260px]">
            Para mostrarte negocios cercanos, necesitamos acceso a tu ubicación.
            Por favor, actívala en tu dispositivo.
          </p>
          <button
            onClick={requestLocation}
            className="mt-6 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    if (geo.status === "error") {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-sm font-medium text-red-600 max-w-[260px]">
            {geo.message}
          </p>
        </div>
      );
    }

    if (nearbyBusinesses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <MapPin className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="mb-1 text-base font-bold text-gray-900">
            Nada por aquí
          </h3>
          <p className="text-sm text-gray-500">
            No encontramos negocios en un radio de 1.5 km.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1" style={{ maxHeight: "320px" }}>
          <div className="flex flex-col gap-2 pb-2">
            {nearbyBusinesses.slice(0, 10).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setPanelOpen(false);
                  window.scrollTo({ top: 0, behavior: "instant" });
                  navigate(`/negocio/${b.profile_name ? `@${b.profile_name}` : b.id}`);
                }}
                className="group flex items-center gap-3.5 rounded-2xl border border-transparent bg-gray-50/80 p-3 text-left transition-all hover:bg-white hover:border-blue-100 hover:shadow-sm active:scale-[0.98]"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200/60 bg-white">
                  <img
                    src={b.logo || b.coverImage || "/icons/icon-192.png"}
                    alt={b.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-[15px] font-bold leading-tight text-gray-900 truncate">
                    {b.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-gray-500 truncate">
                    {b.category || "Negocio"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  <MapPin className="h-3 w-3" />
                  {getDistance(b)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* BOTÓN CORREGIDO AQUÍ */}
        <div className="pt-3 mt-1 border-t border-gray-100">
          <button
            onClick={() => {
              setPanelOpen(false);
              window.scrollTo({ top: 0, behavior: "instant" });
              navigate("/negocios-cerca");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            Ver todos cerca de ti
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              aria-label="Cerrar menú"
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-[80px] z-[70] px-3 md:hidden"
            >
              <div className="relative w-full rounded-[32px] border border-white/40 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                      Cerca de ti
                    </h2>
                    <p className="text-sm font-medium text-blue-600">
                      Radio de 1.5 km
                    </p>
                  </div>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/80 text-gray-500 transition-colors hover:bg-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {renderPanelContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-in-out",
          scrollDirection === "down" && !panelOpen ? "translate-y-[120%]" : "translate-y-0"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-3 mb-4 rounded-3xl border border-white/40 bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-1">
            
            <Link
              to="/"
              onClick={handleNavClick("/")}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-all duration-200",
                location.pathname === "/" ? "bg-white shadow-sm" : "hover:bg-gray-50/50"
              )}
            >
              <Home 
                className={cn("h-[22px] w-[22px]", location.pathname === "/" ? "text-blue-600" : "text-gray-400")} 
                strokeWidth={location.pathname === "/" ? 2.5 : 2}
              />
              <span className={cn("text-[10px] font-bold tracking-wide", location.pathname === "/" ? "text-blue-700" : "text-gray-500")}>
                Inicio
              </span>
            </Link>

            <button
              onClick={() => setPanelOpen((prev) => !prev)}
              aria-expanded={panelOpen}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-all duration-200",
                (panelOpen || isNearbyRoute) ? "bg-white shadow-sm" : "hover:bg-gray-50/50"
              )}
            >
              <MapPin 
                className={cn("h-[22px] w-[22px]", (panelOpen || isNearbyRoute) ? "text-blue-600" : "text-gray-400")} 
                strokeWidth={(panelOpen || isNearbyRoute) ? 2.5 : 2}
              />
              <span className={cn("text-[10px] font-bold tracking-wide", (panelOpen || isNearbyRoute) ? "text-blue-700" : "text-gray-500")}>
                Cerca
              </span>
            </button>

            <Link
              to="/directorio"
              onClick={handleNavClick("/directorio")}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-all duration-200",
                location.pathname === "/directorio" ? "bg-white shadow-sm" : "hover:bg-gray-50/50"
              )}
            >
              <BookOpen 
                className={cn("h-[22px] w-[22px]", location.pathname === "/directorio" ? "text-blue-600" : "text-gray-400")} 
                strokeWidth={location.pathname === "/directorio" ? 2.5 : 2}
              />
              <span className={cn("text-[10px] font-bold tracking-wide", location.pathname === "/directorio" ? "text-blue-700" : "text-gray-500")}>
                Directorio
              </span>
            </Link>

          </div>
        </div>
      </nav>
    </>
  );
}