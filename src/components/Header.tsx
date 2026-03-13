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
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-gray-400" />
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
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        className="h-10 w-full rounded-full border border-white/30 bg-white/75 pl-10 pr-10 text-sm shadow-sm backdrop-blur-md transition focus:bg-white focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setShowDropdown(false);
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showDropdown && filteredBusinesses.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl">
          {filteredBusinesses.slice(0, 8).map((b) => (
            <button
              key={b.id}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50"
              onMouseDown={() => {
                setSearchQuery("");
                setShowDropdown(false);
                navigate(`/negocio/${b.profile_name || b.id}`);
              }}
            >
              <img
                src={b.logo}
                alt={b.name}
                className="h-10 w-10 rounded-xl border border-gray-200 object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {b.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {b.category || "Negocio"}
                </p>
              </div>

              <span className="whitespace-nowrap text-xs text-gray-500">
                {b.departamento || b.island}
              </span>
            </button>
          ))}
        </div>
      )}

      {showDropdown &&
        searchQuery.trim().length > 0 &&
        filteredBusinesses.length === 0 && (
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-white/40 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
            <p className="text-sm text-gray-500">No se encontraron resultados.</p>
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
        "sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-white/20 bg-white/55 shadow-lg backdrop-blur-xl"
          : "border-transparent bg-white/90 backdrop-blur-md",
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Usamos un layout de Grid de 3 columnas para garantizar el centro exacto */}
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3">
          
          {/* 1. Columna Izquierda: Buscador (solo visible en pantallas medianas o más) */}
          <div className="flex items-center justify-start">
            <div className="hidden w-full max-w-xs lg:max-w-sm md:block">
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
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
              <img
                src="/icons/icon-192.png"
                alt="RoaBusiness"
                className="h-10 w-10 rounded-2xl border border-white/40 bg-white/80 object-contain shadow-sm backdrop-blur"
              />
              <div className="leading-tight text-center sm:text-left">
                <span className="block text-sm font-extrabold tracking-tight text-blue-600 sm:text-base">
                  RoaBusiness
                </span>
                <span className="hidden text-[11px] text-gray-500 sm:block text-center sm:text-left">
                  Directory
                </span>
              </div>
            </Link>
          </div>

          {/* 3. Columna Derecha: Navegación, Admin y País */}
          <div className="flex items-center justify-end gap-2 lg:gap-3">
            {/* Navegación desktop (Oculta en pantallas pequeñas para no amontonarse) */}
            <nav className="hidden items-center gap-1 xl:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all",
                      isActive(item.href)
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white/70 hover:text-blue-600",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Admin (Siempre visible si está logueado, ajustado para no romper el layout) */}
            {isAdminLoggedIn && (
              <div className="flex items-center gap-1">
                <Link
                  to="/editar-negocio"
                  className={cn(
                    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-colors",
                    isActive("/editar-negocio")
                      ? "bg-blue-600 text-white"
                      : "bg-white/80 text-gray-600 shadow-sm backdrop-blur hover:bg-blue-50 hover:text-blue-600",
                  )}
                  aria-label="Panel admin"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <Link
                  to="/admin-banners"
                  className={cn(
                    "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-colors",
                    isActive("/admin-banners")
                      ? "bg-blue-600 text-white"
                      : "bg-white/80 text-gray-600 shadow-sm backdrop-blur hover:bg-blue-50 hover:text-blue-600",
                  )}
                  aria-label="Banners"
                >
                  <LayoutTemplate className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Selector de país (Oculto en móvil, se muestra en la fila de abajo) */}
            <div className="hidden md:block">
              <div className="rounded-full border border-white/30 bg-white/70 p-1 shadow-sm backdrop-blur-xl transition hover:bg-white/90">
                <CountrySelector compact className="w-28 min-w-[112px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Fila Inferior: Buscador móvil y selector de país móvil */}
        <div className="pb-3 md:hidden">
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

            <div className="rounded-full border border-white/30 bg-white/70 p-1 shadow-sm backdrop-blur-xl shrink-0">
              <CountrySelector compact className="w-24 min-w-[96px]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;