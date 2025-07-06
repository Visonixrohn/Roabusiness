import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Menu,
  X,
  MapPin,
  Home,
  Users,
  Phone,
  Plus,
  User,
  LogOut,
  Settings,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBusinesses } from "@/hooks/useBusinesses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { businesses, loading } = useBusinesses();

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Directorio", href: "/directorio", icon: Users },
  ];

  const isActive = (href: string) => location.pathname === href;

  // Filtrar negocios por nombre
  const filteredBusinesses =
    searchQuery.length > 0
      ? businesses.filter((b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-blue-600">
                RoaBusiness
              </span>
              <span className="text-sm text-gray-600 block leading-none">
                Directory
              </span>
            </div>
          </Link>

          {/* Búsqueda - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
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
                className="w-full pl-10 py-2 bg-gray-100 border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        navigate(`/negocio/${b.id}`);
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
                        {b.island}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navegación - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}

            {/* Enlace a Publicaciones Recientes */}
            <Link
              to="/recent-posts"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive("/recent-posts")
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Publicaciones Recientes
            </Link>

            {/* Botones de autenticación */}
            {user ? (
              <div className="relative ml-4">
                {/* Usuario logueado */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <img
                    src={
                      user.type === "business"
                        ? user.businessData?.logo
                        : user.userData?.avatar ||
                          "https://via.placeholder.com/32x32"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.type === "business"
                      ? user.businessData?.name
                      : user.userData?.name}
                  </span>
                </button>

                {/* Menú desplegable del usuario */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {user.type === "business" ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                        <Link
                          to={`/negocio/${user.businessData?.id}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Ver Perfil Público
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* Solo para usuarios normales */}
                        {user.type === "user" && (
                          <Link
                            to="/user/full-settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Editar toda mi información
                          </Link>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowLogoutModal(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                {/* Botón Login */}
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Link>
              </div>
            )}
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
        <div className="md:hidden pb-4">
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
              className="w-full pl-10 py-2 bg-gray-100 border-gray-200 rounded-full"
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
                      navigate(`/negocio/${b.id}`);
                    }}
                  >
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <span className="font-medium text-gray-800">{b.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {b.island}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-3 space-y-1">
            {/* Navegación principal */}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Publicaciones Recientes - rediseñado */}
            <Link
              to="/recent-posts"
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive("/recent-posts")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              <Plus className="h-4 w-4 mr-3" />
              Publicaciones Recientes
            </Link>

            {/* Autenticación */}
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2 mb-2">
                    <img
                      src={
                        user.type === "business"
                          ? user.businessData?.logo
                          : user.userData?.avatar ||
                            "https://via.placeholder.com/32x32"
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.type === "business"
                          ? user.businessData?.name
                          : user.userData?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.type === "business" ? "Negocio" : "Usuario"}
                      </p>
                    </div>
                  </div>

                  {/* Links según tipo */}
                  {user.type === "business" && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Panel de Control
                      </Link>
                      <Link
                        to={`/negocio/${user.businessData?.id}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                      >
                        <Building2 className="h-4 w-4 mr-3" />
                        Ver Perfil Público
                      </Link>
                    </>
                  )}

                  {user.type === "user" && (
                    <Link
                      to="/user/full-settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Editar toda mi información
                    </Link>
                  )}

                  {/* Cerrar sesión */}
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/registrar-usuario"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    Registrarse como Usuario
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Modal de confirmación de cierre de sesión */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cerrar tu sesión?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowLogoutModal(false);
                setShowLoading(true);
                setTimeout(() => {
                  setShowLoading(false);
                  logout();
                }, 1000);
              }}
            >
              Sí, cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Pantalla de carga */}
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span className="text-gray-700 font-semibold">
              Cerrando sesión...
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
