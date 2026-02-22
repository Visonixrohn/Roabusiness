import { Navigate, useLocation } from "react-router-dom";
import { isAdminSessionActive } from "@/lib/adminAuth";

interface AdminRouteGuardProps {
  children: JSX.Element;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const location = useLocation();

  if (!isAdminSessionActive()) {
    const redirectTo = encodeURIComponent(location.pathname);
    return <Navigate to={`/admin-login?redirect=${redirectTo}`} replace />;
  }

  return children;
};

export default AdminRouteGuard;
