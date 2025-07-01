// Icono SVG de TikTok (original, simple)
import React from "react";

export const TikTokIcon = ({ className = "", size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.75 2h2.25a.75.75 0 0 1 .75.75v1.5a4.5 4.5 0 0 0 4.5 4.5h1.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-1.5a6.75 6.75 0 0 1-6.75-6.75V2.75A.75.75 0 0 1 12.75 2zm-2.25 6.75A6.75 6.75 0 1 0 17.25 15.5v-2.25a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0-.75.75v2.25a3 3 0 1 1-3-3h.75a.75.75 0 0 0 .75-.75V8.75a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0-.75.75v2.25z" />
  </svg>
);

export default TikTokIcon;
