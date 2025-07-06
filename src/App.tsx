import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import LoginPage from "@/pages/LoginPage";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessSettingsPage from "@/pages/BusinessSettingsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfUsePage from "@/pages/TermsOfUsePage";
import UserFullSettingsPage from "@/pages/UserFullSettingsPage";
import SetNewPasswordPage from "@/pages/SetNewPasswordPage";
import RecentPostsPage from "@/pages/RecentPostsPage";
import GoogleCallbackPage from "@/pages/google-callback";
import UserProfilePage from "@/pages/UserProfilePage";
import UserSettingsPage from "@/pages/UserSettingsPage";

import MobileBottomBar from "@/components/MobileBottomBar";
import MobileTopBar from "@/components/MobileTopBar";
import "./App.css";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

function App() {
  return (
    <AuthProvider>
      <InteractionsProvider>
        <LoadScript
          googleMapsApiKey="AIzaSyA-Jv8AMyTySXYsd8rY2kEdNhhotdNWolg"
          libraries={libraries}
          loadingElement={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Router>
            <div className="min-h-screen bg-gray-50">
              {/* Top bar solo móvil */}
              <MobileTopBar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/directorio" element={<DirectoryPage />} />
                <Route path="/negocio/:id" element={<BusinessProfilePage />} />
                <Route
                  path="/negocio/:id/configuracion"
                  element={<BusinessSettingsPage />}
                />
                <Route
                  path="/registrar-negocio"
                  element={<BusinessRegistrationPage />}
                />
                <Route
                  path="/registrar-usuario"
                  element={<UserRegistrationPage />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<BusinessDashboard />} />
                <Route path="/sobre-las-islas" element={<AboutPage />} />
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
                <Route
                  path="/google-callback"
                  element={<GoogleCallbackPage />}
                />
                <Route path="/user/profile" element={<UserProfilePage />} />
                <Route path="/user/settings" element={<UserSettingsPage />} />
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

              {/* Barra inferior solo en móvil */}
              <MobileBottomBar />
            </div>
          </Router>
        </LoadScript>
      </InteractionsProvider>
    </AuthProvider>
  );
}

export default App;
