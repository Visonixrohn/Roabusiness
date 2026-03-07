import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import { AuthProvider } from "@/contexts/AuthContext";
import { InteractionsProvider } from "@/contexts/InteractionsContext";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import DirectoryPage from "@/pages/DirectoryPage";
import BusinessProfilePage from "@/pages/BusinessProfilePage";
import BusinessRegistrationPage from "@/pages/BusinessRegistrationPage";
import UserRegistrationPage from "@/pages/UserRegistrationPage";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessSettingsPage from "@/pages/BusinessSettingsPage";
import EditBusinessPage from "@/pages/EditBusinessPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfUsePage from "@/pages/TermsOfUsePage";
import UserFullSettingsPage from "@/pages/UserFullSettingsPage";
import SetNewPasswordPage from "@/pages/SetNewPasswordPage";
import RecentPostsPage from "@/pages/RecentPostsPage";
import GoogleCallbackPage from "@/pages/google-callback";
import UserProfilePage from "@/pages/UserProfilePage";
import UserSettingsPage from "@/pages/UserSettingsPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminRouteGuard from "@/components/AdminRouteGuard";
import FinancialDashboard from "@/pages/FinancialDashboard";
import BannerAdminPage from "@/pages/BannerAdminPage";
import ScrollToTop from "@/components/ScrollToTop";
import MobileBottomBar from "@/components/MobileBottomBar";
import NegociosCercaPage from "@/pages/NegociosCercaPage";

import "./App.css";
import { useEffect, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { toast } from "sonner";
import { backHandlerStack } from "@/utils/backHandlerStack";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

function App() {
  const lastBackPress = useRef<number>(0);

  useEffect(() => {
    // Botón atrás de Android
    const backHandler = CapacitorApp.addListener(
      "backButton",
      ({ canGoBack }) => {
        // 1. Si hay un modal u overlay registrado → cerrarlo
        if (backHandlerStack.pop()) {
          return;
        }

        // 2. Si se puede retroceder en el historial → hacerlo
        if (canGoBack) {
          window.history.back();
          return;
        }

        // 3. Estamos en la raíz: lógica de doble toque para salir
        const now = Date.now();
        if (now - lastBackPress.current < 2000) {
          // Segundo toque dentro de 2 s → minimizar (salir de la app)
          CapacitorApp.minimizeApp();
        } else {
          lastBackPress.current = now;
          toast("Presiona atrás otra vez para salir", {
            duration: 2000,
            position: "bottom-center",
          });
        }
      },
    );
    return () => {
      backHandler.then((h) => h.remove());
    };
  }, []);

  useEffect(() => {
    // Bloquear Ctrl+U
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // Bloquear clic derecho sobre imágenes
    const handleContextMenu = (e) => {
      if (e.target && e.target.tagName === "IMG") {
        e.preventDefault();
      }
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <AuthProvider>
      <InteractionsProvider>
        <LoadScript
          googleMapsApiKey={GOOGLE_MAPS_CONFIG.apiKey}
          libraries={libraries}
          loadingElement={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
              {/* Top bar móvil eliminado */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Redirección de URL antigua de Google */}
                <Route
                  path="/sobre-las-islas"
                  element={<Navigate to="/" replace />}
                />
                <Route path="/directorio" element={<DirectoryPage />} />
                <Route
                  path="/negocio/@:profileName"
                  element={<BusinessProfilePage />}
                />
                <Route path="/negocio/:id" element={<BusinessProfilePage />} />
                <Route
                  path="/negocio/:id/configuracion"
                  element={<BusinessSettingsPage />}
                />
                <Route
                  path="/registrar-negocio"
                  element={
                    <AdminRouteGuard>
                      <BusinessRegistrationPage />
                    </AdminRouteGuard>
                  }
                />
                <Route
                  path="/editar-negocio"
                  element={
                    <AdminRouteGuard>
                      <EditBusinessPage />
                    </AdminRouteGuard>
                  }
                />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route
                  path="/registrar-usuario"
                  element={<UserRegistrationPage />}
                />
                <Route path="/dashboard" element={<BusinessDashboard />} />

                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/privacidad" element={<PrivacyPolicyPage />} />
                <Route path="/terminos" element={<TermsOfUsePage />} />
                <Route
                  path="/user/full-settings"
                  element={<UserFullSettingsPage />}
                />
                <Route
                  path="/set-new-password"
                  element={<SetNewPasswordPage />}
                />
                <Route path="/recent-posts" element={<RecentPostsPage />} />
                <Route path="/negocios-cerca" element={<NegociosCercaPage />} />
                <Route
                  path="/google-callback"
                  element={<GoogleCallbackPage />}
                />
                <Route path="/user/profile" element={<UserProfilePage />} />
                <Route path="/user/settings" element={<UserSettingsPage />} />
                <Route
                  path="/financial"
                  element={
                    <AdminRouteGuard>
                      <FinancialDashboard />
                    </AdminRouteGuard>
                  }
                />
                <Route
                  path="/admin-banners"
                  element={
                    <AdminRouteGuard>
                      <BannerAdminPage />
                    </AdminRouteGuard>
                  }
                />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#1e40af",
                    color: "#ffffff",
                  },
                }}
              />

              {/* Barra inferior móvil */}
              <MobileBottomBar />
            </div>
          </Router>
        </LoadScript>
      </InteractionsProvider>
    </AuthProvider>
  );
}

export default App;
