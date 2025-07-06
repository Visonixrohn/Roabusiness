import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileBottomBar() {
  const location = useLocation();
  const { user } = useAuth();

  // Iconos SVG
  const iconClass = "w-6 h-6";
  const homeIcon = (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 12l8-8 8 8"/><path d="M5 12v8a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-8"/>
    </svg>
  );
  const bookIcon = (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20"/>
      <path d="M20 22V2"/><path d="M4 22V2"/>
    </svg>
  );
  const postsIcon = (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M8 3v2"/><path d="M16 3v2"/><path d="M3 10h18"/>
    </svg>
  );
  const profileIcon = (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
    </svg>
  );
  const dashboardIcon = (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="13" width="7" height="8" rx="1"/>
      <rect x="14" y="3" width="7" height="18" rx="1"/>
    </svg>
  );

  const navItems = [
    { label: "Inicio", icon: homeIcon, to: "/" },
    { label: "Directorio", icon: bookIcon, to: "/directorio" },
    { label: "Publicaciones", icon: postsIcon, to: "/recent-posts" },
  ];

  if (user) {
    if (user.type === "business") {
      const businessId = user.businessData?.id || user.id;
      navItems.push({ label: "Perfil", icon: profileIcon, to: `/negocio/${businessId}` });
      navItems.push({ label: "Panel", icon: dashboardIcon, to: "/dashboard" });
    } else {
      navItems.push({ label: "Perfil", icon: profileIcon, to: "/user/profile" });
    }
  } else {
    navItems.push({ label: "Perfil", icon: profileIcon, to: "/user/profile" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center h-16 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 ${
              isActive ? "text-blue-600 scale-105" : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
