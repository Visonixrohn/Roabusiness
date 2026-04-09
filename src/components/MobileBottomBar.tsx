import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useNearbyBusinesses } from "@/hooks/useNearbyBusinesses";
import { haversineKm } from "@/utils/geoDistance";
import { cn } from "@/lib/utils";
import { useBusinesses } from "@/hooks/useBusinesses";
import {
  Home,
  BookOpen,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Función normalizadora para la búsqueda
const normalize = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection(10);
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { businesses } = useBusinesses();
  const { geo, requestLocation, nearbyBusinesses, loading } = useNearbyBusinesses(1.5);

  const isNearbyRoute = location.pathname === "/negocios-cerca";

  // Efectos para cerrar paneles al navegar
  useEffect(() => {
    setPanelOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  // Solicitar ubicación al abrir panel
  useEffect(() => {
    if (panelOpen) requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  // Bloquear scroll del body si hay un panel abierto
  useEffect(() => {
    if (panelOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [panelOpen, searchOpen]);

  // Lógica de Búsqueda
  const filteredBusinesses = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return [];
    return businesses.filter((b) => {
      const name = normalize(b.name || "");
      const desc = normalize(b.description || "");
      const category = normalize(b.category || "");
      return name.includes(q) || desc.includes(q) || category.includes(q);
    });
  }, [searchQuery, businesses]);

  const handleNavClick = (to: string) => () => {
    setPanelOpen(false);
    setSearchOpen(false);
    if (location.pathname !== to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getDistance = (b: { latitude?: number; longitude?: number; coordinates?: { lat?: number; lng?: number } }) => {
    if (geo.status !== "ready") return "";
    const bLat = b.latitude ?? b.coordinates?.lat;
    const bLng = b.longitude ?? b.coordinates?.lng;
    if (!bLat || !bLng) return "";
    const d = haversineKm(geo.lat, geo.lng, bLat, bLng);
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  const togglePanel = () => {
    if (searchOpen) setSearchOpen(false);
    setPanelOpen(!panelOpen);
  };

  const toggleSearch = () => {
    if (panelOpen) setPanelOpen(false);
    setSearchOpen(!searchOpen);
  };

  // ---------------------------------------------
  // PANEL DE BÚSQUEDA
  // ---------------------------------------------
  const renderSearchPanel = () => (
    <div className="flex flex-col h-[70vh]">
      {/* Cabecera del buscador */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            autoFocus
            type="text"
            placeholder="Buscar negocios, servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 pl-10 pr-10 text-base shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {!searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <Search className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">Escribe para empezar a buscar</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <p className="text-sm font-medium">No se encontraron resultados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {filteredBusinesses.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSearchOpen(false);
                  navigate(`/negocio/${b.profile_name || b.id}`);
                }}
                className="flex items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-slate-50 active:scale-95 border border-transparent hover:border-slate-100"
              >
                <img
                  src={b.logo || b.coverImage || "/icons/icon-192.png"}
                  alt={b.name}
                  className="h-12 w-12 shrink-0 rounded-[14px] border border-slate-200 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900 truncate">{b.name}</p>
                  <p className="text-xs text-slate-500 truncate">{b.category || "Negocio"} • {b.departamento || b.island}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------
  // PANEL DE CERCANOS
  // ---------------------------------------------
  const renderNearbyPanel = () => {
    if (geo.status === "idle" || geo.status === "loading" || loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin absolute" />
            <MapPin className="h-4 w-4 text-blue-400 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-600">Buscando a tu alrededor...</p>
        </div>
      );
    }

    if (geo.status === "denied") {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="mb-2 text-base font-bold text-slate-900">Ubicación desactivada</h3>
          <p className="text-sm text-slate-500 max-w-[260px]">
            Necesitamos acceso a tu ubicación para mostrarte negocios cercanos.
          </p>
          <button onClick={requestLocation} className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white active:scale-95">
            Intentar de nuevo
          </button>
        </div>
      );
    }

    if (nearbyBusinesses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <MapPin className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="mb-1 text-base font-bold text-slate-900">Nada por aquí</h3>
          <p className="text-sm text-slate-500">No encontramos negocios en 1.5 km.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1" style={{ maxHeight: "40vh" }}>
          <div className="flex flex-col gap-2 pb-2">
            {nearbyBusinesses.slice(0, 10).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setPanelOpen(false);
                  navigate(`/negocio/${b.profile_name ? `@${b.profile_name}` : b.id}`);
                }}
                className="group flex items-center gap-3.5 rounded-[20px] bg-slate-50 p-3 text-left transition-all hover:bg-white active:scale-95 border border-transparent hover:border-slate-200"
              >
                <img src={b.logo || b.coverImage || "/icons/icon-192.png"} alt={b.name} className="h-12 w-12 shrink-0 rounded-[14px] border border-slate-200 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900 truncate">{b.name}</p>
                  <p className="text-xs text-slate-500 truncate">{b.category || "Negocio"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-blue-100/50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  <MapPin className="h-3 w-3" />
                  {getDistance(b)}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="pt-3 mt-1 border-t border-slate-100">
          <button onClick={() => { setPanelOpen(false); navigate("/negocios-cerca"); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95">
            Ver todos cerca de ti <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {/* Modal de Búsqueda o Cercanos */}
        {(panelOpen || searchOpen) && (
          <>
            <motion.div
              onClick={() => { setPanelOpen(false); setSearchOpen(false); }}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-[80px] z-[70] px-3 md:hidden"
            >
              <div className="relative w-full overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-2xl">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {searchOpen ? "Buscar" : "Cerca de ti"}
                  </h2>
                  <button
                    onClick={() => { setPanelOpen(false); setSearchOpen(false); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-5 pb-5">
                  {/* AQUÍ ESTABA EL ERROR, AHORA LLAMA A LA FUNCIÓN CORRECTA */}
                  {searchOpen ? renderSearchPanel() : renderNearbyPanel()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BARRA INFERIOR (NAVIGATION) */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          scrollDirection === "down" && !panelOpen && !searchOpen ? "translate-y-[150%]" : "translate-y-0"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-4 mb-4 rounded-full border border-slate-200/50 bg-white/80 p-2 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-1 relative">
            
            {/* ITEM: INICIO */}
            <Link
              to="/"
              onClick={handleNavClick("/")}
              className="relative flex flex-1 flex-col items-center justify-center py-2.5 outline-none group"
            >
              <div className={cn("transition-transform duration-300", location.pathname === "/" ? "-translate-y-1 scale-110 text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                <Home className="h-[22px] w-[22px]" strokeWidth={location.pathname === "/" ? 2.5 : 2} />
              </div>
              <span className={cn("absolute bottom-0 text-[10px] font-bold tracking-wide transition-opacity duration-300", location.pathname === "/" ? "opacity-100 text-blue-600" : "opacity-0")}>
                Inicio
              </span>
            </Link>

            {/* ITEM: BÚSQUEDA */}
            <button
              onClick={toggleSearch}
              className="relative flex flex-1 flex-col items-center justify-center py-2.5 outline-none group"
            >
              <div className={cn("transition-transform duration-300", searchOpen ? "-translate-y-1 scale-110 text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                <Search className="h-[22px] w-[22px]" strokeWidth={searchOpen ? 2.5 : 2} />
              </div>
              <span className={cn("absolute bottom-0 text-[10px] font-bold tracking-wide transition-opacity duration-300", searchOpen ? "opacity-100 text-blue-600" : "opacity-0")}>
                Buscar
              </span>
            </button>

            {/* ITEM: CERCA */}
            <button
              onClick={togglePanel}
              className="relative flex flex-1 flex-col items-center justify-center py-2.5 outline-none group"
            >
              <div className={cn("transition-transform duration-300", (panelOpen || isNearbyRoute) ? "-translate-y-1 scale-110 text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                <MapPin className="h-[22px] w-[22px]" strokeWidth={(panelOpen || isNearbyRoute) ? 2.5 : 2} />
              </div>
              <span className={cn("absolute bottom-0 text-[10px] font-bold tracking-wide transition-opacity duration-300", (panelOpen || isNearbyRoute) ? "opacity-100 text-blue-600" : "opacity-0")}>
                Cerca
              </span>
            </button>

            {/* ITEM: DIRECTORIO */}
            <Link
              to="/directorio"
              onClick={handleNavClick("/directorio")}
              className="relative flex flex-1 flex-col items-center justify-center py-2.5 outline-none group"
            >
              <div className={cn("transition-transform duration-300", location.pathname === "/directorio" ? "-translate-y-1 scale-110 text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                <BookOpen className="h-[22px] w-[22px]" strokeWidth={location.pathname === "/directorio" ? 2.5 : 2} />
              </div>
              <span className={cn("absolute bottom-0 text-[10px] font-bold tracking-wide transition-opacity duration-300", location.pathname === "/directorio" ? "opacity-100 text-blue-600" : "opacity-0")}>
                Explorar
              </span>
            </Link>

          </div>
        </div>
      </nav>
    </>
  );
}