import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  X,
  Home,
  Users,
  Settings,
  LayoutTemplate,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBusinesses } from "@/hooks/useBusinesses";
import { isAdminSessionActive } from "@/lib/adminAuth";
import CountrySelector from "@/components/CountrySelector";

const normalize = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

type SearchBoxProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showDropdown: boolean;
  setShowDropdown: (value: boolean) => void;
  filteredBusinesses: any[];
  navigate: ReturnType<typeof useNavigate>;
  placeholder?: string;
};

const SearchBox = ({
  searchQuery,
  setSearchQuery,
  showDropdown,
  setShowDropdown,
  filteredBusinesses,
  navigate,
  placeholder = "Buscar negocios...",
}: SearchBoxProps) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="h-4 w-4 text-slate-400" />
      </div>

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value;
          setSearchQuery(value);
          setShowDropdown(value.trim().length > 0);
        }}
        onFocus={() => setShowDropdown(searchQuery.trim().length > 0)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Ligeramente más tiempo para permitir clic
        className={cn(
          "h-10 w-full rounded-full border border-slate-200/60 bg-slate-100/50",
          "pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400",
          "shadow-inner backdrop-blur-md transition-all duration-300",
          "focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
        )}
        autoComplete="off"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setShowDropdown(false);
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown de Resultados */}
      {showDropdown && filteredBusinesses.length > 0 && (
        <div className="absolute left-0 right-0 z-[100] mt-2 max-h-[70vh] sm:max-h-96 overflow-y-auto custom-scrollbar rounded-[20px] border border-slate-200/50 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl p-2">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Resultados sugeridos
          </div>
          {filteredBusinesses.slice(0, 6).map((b) => (
            <button
              key={b.id}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all hover:bg-slate-50 active:scale-[0.98]"
              onMouseDown={(e) => {
                e.preventDefault(); // Evita que el onBlur del input se dispare antes del clic
                setSearchQuery("");
                setShowDropdown(false);
                navigate(`/negocio/${b.profile_name || b.id}`);
              }}
            >
              <img
                src={b.logo || b.coverImage || "/icons/icon-192.png"}
                alt={b.name}
                className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm transition-transform group-hover:scale-105"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {b.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="truncate text-xs font-medium text-slate-500">
                    {b.category || "Negocio"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                  <span className="flex items-center text-[11px] text-slate-400 truncate">
                    <MapPin className="h-3 w-3 mr-0.5 shrink-0" />
                    {b.departamento || b.island}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchQuery.trim().length > 0 && filteredBusinesses.length === 0 && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-[20px] border border-slate-200/50 bg-white/95 p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <Search className="h-8 w-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">No encontramos resultados para "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { businesses } = useBusinesses();
  const isAdminLoggedIn = isAdminSessionActive();

  const navigation = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: "Directorio", href: "/directorio", icon: Users },
    ...(isAdminLoggedIn
      ? [
          { name: t("nav.dashboard"), href: "/editar-negocio", icon: Settings },
          { name: "Banners", href: "/admin-banners", icon: LayoutTemplate },
        ]
      : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  const filteredBusinesses = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return [];

    return businesses.filter((b) => {
      const name = normalize(b.name || "");
      const desc = normalize(b.description || "");
      const category = normalize(b.category || "");
      const categories = normalize(
        (b.categories && b.categories.length > 0 ? b.categories : [b.category])
          .filter(Boolean)
          .join(" "),
      );
      const amenities = normalize((b.amenities || []).join(" "));
      const contactText = normalize(
        [b.contact?.phone, b.contact?.email, b.contact?.website]
          .filter(Boolean)
          .join(" "),
      );

      return (
        name.includes(q) ||
        desc.includes(q) ||
        category.includes(q) ||
        categories.includes(q) ||
        amenities.includes(q) ||
        contactText.includes(q)
      );
    });
  }, [searchQuery, businesses]);

  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
          : "bg-white/95 backdrop-blur-md border-b border-transparent"
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          
          {/* 1. Columna Izquierda: Buscador */}
          <div className="flex items-center justify-start">
            <div className="hidden w-full max-w-sm md:block">
              <SearchBox
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                filteredBusinesses={filteredBusinesses}
                navigate={navigate}
              />
            </div>
          </div>

          {/* 2. Columna Central: Logo y Título */}
          <div className="flex justify-center">
            <Link to="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
              <div className="relative h-10 w-10 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                <img
                  src="/icons/icon-192.png"
                  alt="RoaBusiness Logo"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div className="leading-none text-left">
                <span className="block text-[17px] font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  RoaBusiness
                </span>
                <span className="block text-[11px] font-bold tracking-widest text-emerald-600 uppercase mt-0.5">
                  Directory
                </span>
              </div>
            </Link>
          </div>

          {/* 3. Columna Derecha: Navegación, Admin y País */}
          <div className="flex items-center justify-end gap-2 lg:gap-3">
            
            {/* Navegación Desktop */}
            <nav className="hidden items-center gap-1 xl:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-all duration-300",
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-emerald-400" : "")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Admin Buttons */}
            {isAdminLoggedIn && (
              <div className="flex items-center gap-1.5 ml-2">
                <Link
                  to="/editar-negocio"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                    isActive("/editar-negocio")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                  )}
                  aria-label="Panel admin"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <Link
                  to="/admin-banners"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                    isActive("/admin-banners")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                  )}
                  aria-label="Banners"
                >
                  <LayoutTemplate className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Selector de País Desktop */}
            <div className="hidden md:block pl-2 border-l border-slate-200/60 ml-2">
              <div className="rounded-full bg-slate-50 p-1 transition-colors hover:bg-slate-100">
                <CountrySelector compact className="w-28 min-w-[112px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Fila Inferior Móvil: Buscador y País */}
        <div className="pb-3 pt-1 md:hidden">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchBox
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                filteredBusinesses={filteredBusinesses}
                navigate={navigate}
              />
            </div>

            <div className="rounded-full bg-slate-50 p-1 shrink-0 border border-slate-200/60">
              <CountrySelector compact className="w-[100px]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;