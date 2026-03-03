import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BannerAdminPage from "@/pages/BannerAdminPage";
import BannerCarousel from "./BannerCarousel";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      <BannerCarousel />
    </footer>
  );
};

export default Footer;
