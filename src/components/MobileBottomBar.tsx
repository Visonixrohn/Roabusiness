import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useNearbyBusinesses } from "@/hooks/useNearbyBusinesses";
import {
  Home,
  BookOpen,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

/** Paleta de colores ciclada por índice para los tiles de categorías */
const TILE_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-teal-50 text-teal-700 border-teal-100",
  "bg-violet-50 text-violet-700 border-violet-100",
  "bg-orange-50 text-orange-700 border-orange-100",
  "bg-rose-50 text-rose-700 border-rose-100",
  "bg-amber-50 text-amber-700 border-amber-100",
];
const TILE_ICON_BG = [
  "bg-blue-600",
  "bg-teal-600",
  "bg-violet-600",
  "bg-orange-500",
  "bg-rose-500",
  "bg-amber-500",
];

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection(10);
  const [panelOpen, setPanelOpen] = useState(false);

  const { geo, requestLocation, nearbyCategories, loading } =
    useNearbyBusinesses(15);

  // Solicitar ubicación cuando el usuario abre el panel (lazy)
  useEffect(() => {
    if (panelOpen) requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  const isNearbyRoute = location.pathname === "/negocios-cerca";

  const navItems = [
    { label: "Inicio", icon: Home, to: "/" },
    { label: "Directorio", icon: BookOpen, to: "/directorio" },
  ];

  const handleNavClick = (to: string) => () => {
    setPanelOpen(false);
    if (location.pathname !== to) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleCategoryClick = (cat: string) => {
    setPanelOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/negocios-cerca?categoria=${encodeURIComponent(cat)}`);
  };

  const renderPanelContent = () => {
    if (geo.status === "idle" || geo.status === "loading" || loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Obteniendo tu ubicación…</p>
        </div>
      );
    }
    if (geo.status === "denied") {
      return (
        <div className="flex flex-col items-center gap-2 py-6 text-center px-2">
          <AlertCircle className="h-8 w-8 text-amber-400" />
          <p className="text-sm font-medium text-gray-700">
            Ubicación desactivada
          </p>
          <p className="text-xs text-gray-400 max-w-[240px]">
            Activa el permiso en tu dispositivo y vuelve a abrir este menú.
          </p>
        </div>
      );
    }
    if (geo.status === "error") {
      return (
        <div className="flex flex-col items-center gap-2 py-6 text-center px-2">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-xs text-gray-400">{geo.message}</p>
        </div>
      );
    }
    if (nearbyCategories.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-8 text-center px-2">
          <MapPin className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            Sin negocios cercanos en 15 km
          </p>
        </div>
      );
    }
    return (
      <>
        <div
          className="grid grid-cols-3 gap-2 overflow-y-auto"
          style={{ maxHeight: "260px" }}
        >
          {nearbyCategories.map((cat, i) => {
            const colorClass = TILE_COLORS[i % TILE_COLORS.length];
            const iconBg = TILE_ICON_BG[i % TILE_ICON_BG.length];
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-150 active:scale-[0.97] ${colorClass}`}
              >
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-white text-base font-bold ${iconBg}`}
                >
                  {cat.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-medium leading-tight line-clamp-2">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            setPanelOpen(false);
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate("/negocios-cerca");
          }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 active:scale-[0.98] transition-all"
        >
          Ver todos cerca de ti
          <ChevronRight className="h-4 w-4" />
        </button>
      </>
    );
  };

  return (
    <>
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.button
              aria-label="Cerrar menú"
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-4 bottom-[88px] z-50 md:hidden"
            >
              <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Cerca de ti
                    </p>
                    <p className="text-xs text-gray-400">
                      Negocios en un radio de 15 km
                    </p>
                  </div>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderPanelContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
          scrollDirection === "down" && !panelOpen
            ? "translate-y-full"
            : "translate-y-0"
        }`}
        style={{
          willChange: "transform",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="mx-3 mb-3 rounded-[28px] border border-white/60 bg-white/90 px-3 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl">
          <div className="grid grid-cols-3 items-center">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={handleNavClick(to)}
                  className="flex flex-col items-center justify-center gap-1 py-1"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${active ? "text-blue-700" : "text-gray-500"}`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}

            {/* Botón central "Cerca de ti" */}
            <button
              onClick={() => setPanelOpen((prev) => !prev)}
              aria-expanded={panelOpen}
              aria-label="Cerca de ti"
              className="flex flex-col items-center justify-center gap-1 py-1"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
                  panelOpen || isNearbyRoute
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  panelOpen || isNearbyRoute ? "text-blue-700" : "text-gray-500"
                }`}
              >
                Cerca de ti
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
