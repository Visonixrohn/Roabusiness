import { Navigate, useLocation } from "react-router-dom";
import { isAdminSessionActive } from "@/lib/adminAuth";

interface AdminRouteGuardProps {
  children: JSX.Element;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const location = useLocation();
  const isActive = isAdminSessionActive();

  console.log("[AdminRouteGuard] Verificando sesión:", {
    isActive,
    path: location.pathname,
    storageValue: localStorage.getItem("roa_admin_session"),
  });

  if (!isActive) {
    const redirectTo = encodeURIComponent(location.pathname);
    console.log(
      "[AdminRouteGuard] Redirigiendo al login, redirect:",
      redirectTo,
    );
    return <Navigate to={`/admin-login?redirect=${redirectTo}`} replace />;
  }

  console.log("[AdminRouteGuard] Sesión válida, mostrando contenido");
  return children;
};

export default AdminRouteGuard;
