import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import {
  Home,
  BookOpen,
  Newspaper,
  User,
  LayoutDashboard,
} from "lucide-react";

export default function MobileBottomBar() {
  const location = useLocation();
  const { user } = useAuth();
  const scrollDirection = useScrollDirection(10);

  const iconClass = "w-6 h-6";

  const navItems = [
    { label: "Inicio", icon: <Home className={iconClass} />, to: "/" },
    { label: "Directorio", icon: <BookOpen className={iconClass} />, to: "/directorio" },
    { label: "Publicaciones", icon: <Newspaper className={iconClass} />, to: "/recent-posts" },
  ];

  if (user) {
    if (user.type === "business") {
      const businessId = user.businessData?.id || user.id;
      navItems.push({
        label: "Perfil",
        icon: <User className={iconClass} />,
        to: `/negocio/${businessId}`,
      });
      navItems.push({
        label: "Panel",
        icon: <LayoutDashboard className={iconClass} />,
        to: "/dashboard",
      });
    } else {
      navItems.push({
        label: "Perfil",
        icon: <User className={iconClass} />,
        to: "/user/profile",
      });
    }
  } else {
    navItems.push({
      label: "Perfil",
      icon: <User className={iconClass} />,
      to: "/user/profile",
    });
  }

  const handleNavClick = (to: string) => (e: React.MouseEvent) => {
    if (location.pathname !== to) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center h-16 md:hidden transition-transform duration-300 ${
        scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ willChange: "transform" }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleNavClick(item.to)}
            className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 ${
              isActive
                ? "text-blue-600 scale-105"
                : "text-gray-500 hover:text-blue-500"
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
