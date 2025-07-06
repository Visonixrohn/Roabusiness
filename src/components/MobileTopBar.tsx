
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useBusinesses } from "@/hooks/useBusinesses";

export default function MobileTopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  // Bloquear scroll del body cuando la búsqueda está activa
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [showSearch]);
  const [search, setSearch] = useState("");
  const { businesses } = useBusinesses();
  const scrollDirection = useScrollDirection(10);

  // Icono central (logo personalizado)
  const appIcon = (
    <img
      src="https://cdn-icons-png.flaticon.com/512/2288/2288494.png"
      alt="Logo Roabusiness"
      className="w-9 h-9 object-contain drop-shadow-sm hover:scale-110 transition-transform duration-200"
      draggable={false}
    />
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between h-14 px-4 md:hidden shadow-sm transition-transform duration-300 ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}`}
        style={{ willChange: "transform" }}
      >
        {/* Avatar usuario */}
        <Link
          to={
            user?.type === "business"
              ? `/negocio/${user?.businessData?.id || user?.id}`
              : "/user/profile"
          }
          className="flex items-center"
        >
          {user?.userData?.avatar ? (
            <img
              src={user.userData.avatar}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border border-gray-200 shadow">
              {user?.userData?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}
        </Link>
        {/* Icono central */}
        <div className="flex-1 flex justify-center items-center">{appIcon}</div>
        {/* Icono lupa */}
        <button
          className="w-9 h-9 flex items-center justify-center text-blue-700 hover:bg-blue-50 rounded-full transition"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Buscar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {/* Barra de búsqueda flotante */}
      {showSearch && (
        <div className="fixed top-14 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2 flex flex-col gap-2 md:hidden animate-fade-in-down shadow">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar negocios, hoteles, restaurantes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <button
              className="ml-2 text-gray-500 hover:text-blue-700"
              onClick={() => setShowSearch(false)}
              aria-label="Cerrar búsqueda"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Dropdown de resultados */}
          {search.length > 0 && businesses && (
            <div className="absolute left-0 right-0 mt-14 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
              {businesses
                .filter((b) =>
                  b.name.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 8)
                .map((b) => (
                  <button
                    key={b.id}
                    className="w-full flex items-center px-4 py-2 hover:bg-blue-50 text-left gap-3"
                    onMouseDown={() => {
                      setSearch("");
                      setShowSearch(false);
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
              {businesses.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <div className="px-4 py-2 text-gray-500">No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
