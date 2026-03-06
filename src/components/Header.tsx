import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  Menu,
  X,
  MapPin,
  Home,
  Users,
  Phone,
  Plus,
  LogOut,
  Settings,
  Building2,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBusinesses } from "@/hooks/useBusinesses";
import { isAdminSessionActive } from "@/lib/adminAuth";

const Header = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  // removed logout/modal related states
  const location = useLocation();
  const navigate = useNavigate();
  const user = null;
  const { businesses, loading } = useBusinesses();
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

  const handleGoHome = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleNavLinkClick = (href: string) => {
    if (location.pathname === href) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  // Filtrar negocios por nombre, descripción, categoría y amenidades
  const normalize = (text = "") =>
    text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  const q = normalize(searchQuery);
  const filteredBusinesses =
    q.length > 0
      ? businesses.filter((b) => {
          const name = normalize(b.name || "");
          const desc = normalize(b.description || "");
          const category = normalize(b.category || "");
          const categories = normalize(
            (b.categories && b.categories.length > 0
              ? b.categories
              : [b.category]
            )
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
        })
      : [];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleGoHome}
            className="flex items-center space-x-1.5"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2288/2288494.png"
              alt="RoaBusiness Logo"
              className="w-8 h-8 object-contain"
            />
            <div className="hidden sm:block">
              <span className="text-base font-bold text-blue-600">
                RoaBusiness
              </span>
              <span className="text-xs text-gray-600 block leading-none">
                Directory
              </span>
            </div>
          </Link>

          {/* Búsqueda - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 relative">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar negocios, hoteles, restaurantes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.length > 0);
                }}
                onFocus={() => setShowDropdown(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="w-full pl-9 py-1.5 text-sm bg-gray-100 border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
              {/* Dropdown de resultados */}
              {showDropdown && filteredBusinesses.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                  {filteredBusinesses.map((b) => (
                    <button
                      key={b.id}
                      className="w-full flex items-center px-4 py-2 hover:bg-blue-50 text-left gap-3"
                      onMouseDown={() => {
                        setSearchQuery("");
                        setShowDropdown(false);
                        navigate(`/negocio/${b.profile_name || b.id}`);
                      }}
                    >
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-800">
                        {b.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        {b.departamento || b.island}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navegación - Desktop */}
          <nav className="hidden md:flex items-center space-x-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handleNavLinkClick(item.href)}
                  className={cn(
                    "flex items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Authentication removed: no login/profile buttons shown */}
          </nav>

          {/* Menú móvil - Botón */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Búsqueda - Móvil con dropdown */}
        <div className="md:hidden pb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(e.target.value.length > 0);
              }}
              onFocus={() => setShowDropdown(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className="w-full pl-9 py-1.5 text-sm bg-gray-100 border-gray-200 rounded-full"
            />
            {/* Dropdown de resultados en móvil */}
            {showDropdown && filteredBusinesses.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                {filteredBusinesses.map((b) => (
                  <button
                    key={b.id}
                    className="w-full flex items-center px-4 py-2 hover:bg-blue-50 text-left gap-3"
                    onMouseDown={() => {
                      setSearchQuery("");
                      setShowDropdown(false);
                      navigate(`/negocio/${b.profile_name || b.id}`);
                    }}
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="font-medium text-gray-800">{b.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {b.departamento || b.island}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay y Modal lateral para menú móvil */}
      {/* Overlay y modal lateral: se renderizan siempre pero usan clases condicionales para animación */}
      <>
        {/* Overlay oscuro */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            "fixed inset-0 bg-black z-40 md:hidden transition-opacity",
            isMenuOpen
              ? "bg-opacity-50 opacity-100 pointer-events-auto"
              : "bg-opacity-0 opacity-0 pointer-events-none",
          )}
          aria-hidden={!isMenuOpen}
        />

        {/* Modal lateral desde la derecha (usa translate-x para animar) */}
        <div
          className={cn(
            "fixed inset-y-0 right-0 w-64 sm:w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!isMenuOpen}
        >
          {/* Header del modal */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2288/2288494.png"
                alt="RoaBusiness"
                className="w-8 h-8"
              />
              <div>
                <span className="text-sm font-bold text-blue-600">
                  RoaBusiness
                </span>
                <span className="text-xs text-gray-600 block leading-none">
                  Menú
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Contenido del menú con scroll */}
          <nav className="px-4 py-3 space-y-1 overflow-y-auto h-[calc(100vh-73px)]">
            {/* Navegación principal */}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handleNavLinkClick(item.href)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </>

      {/* Auth UI removed */}
    </header>
  );
};

export default Header;
