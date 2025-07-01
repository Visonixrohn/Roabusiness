import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

const HeroSection = () => {
  const fullTitle = "Descubre las Islas de la Bahía";
  const [imgLoaded, setImgLoaded] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!imgLoaded) return;

    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex <= fullTitle.length) {
        setTypedText(fullTitle.slice(0, currentIndex));
        currentIndex++;
        setTimeout(typeNextChar, 80);
      } else {
        setShowContent(true);
      }
    };

    typeNextChar();
  }, [imgLoaded]);

  const handleImageLoad = () => {
    setImgLoaded(true);
    setTimeout(() => setRippleActive(true), 600);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Imagen de fondo */}
      <img
        src="https://i.imgur.com/IyMgElg.jpeg"
        alt="Islas de la Bahía"
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
          imgLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleImageLoad}
        style={{ zIndex: 1 }}
      />

      {/* Ripple SVG */}
      {!rippleActive && (
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="60" r="1" fill="rgba(255,255,255,0.15)">
            <animate
              attributeName="r"
              from="1"
              to="80"
              dur="1s"
              begin="0s"
              fill="freeze"
              keySplines="0.4 0 0.2 1"
              calcMode="spline"
            />
            <animate
              attributeName="opacity"
              from="0.7"
              to="0"
              dur="1s"
              begin="0s"
              fill="freeze"
            />
          </circle>
        </svg>
      )}

      {/* Máscara circular */}
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-1000 ${
          rippleActive ? "mask-reveal" : ""
        }`}
        style={{
          background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6))",
          zIndex: 2,
          maskImage: rippleActive
            ? "radial-gradient(circle at 50% 60%, white 100%, transparent 100%)"
            : "radial-gradient(circle at 50% 60%, white 0%, transparent 0%)",
          WebkitMaskImage: rippleActive
            ? "radial-gradient(circle at 50% 60%, white 100%, transparent 100%)"
            : "radial-gradient(circle at 50% 60%, white 0%, transparent 0%)",
          transition: "mask-image 1s, -webkit-mask-image 1s",
        }}
      />

      {/* Texto y botones */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto flex flex-col items-center">
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-lg leading-tight min-h-[5rem]"
          aria-label={fullTitle}
          aria-live="polite"
        >
          {typedText}
          <span className="text-blue-400 block animate-pulse"> </span>
        </h1>

        <p
          className={`text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-100 drop-shadow-md transform transition-opacity duration-900 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          El paraíso caribeño de Honduras te espera. Explora los mejores negocios,
          restaurantes, hoteles y actividades en Roatán, Utila y Guanaja.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-opacity duration-900 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link to="/directorio" aria-label="Explorar directorio de negocios">
            <Button
              size="lg"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              <Search className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
              Explorar Directorio
            </Button>
          </Link>

          <Link to="/sobre-las-islas" aria-label="Conocer las islas">
            <Button
              variant="outline"
              size="lg"
              className="group relative inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white bg-transparent rounded-full text-lg font-medium transition-all duration-300 hover:bg-white hover:text-blue-600 hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-white"
            >
              <MapPin className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
              Conoce las Islas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
