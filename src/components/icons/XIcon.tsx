import React from "react";

export const XIcon = ({ className = "", size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.53 2.47A.75.75 0 0 1 18.28 3.22l-5.25 5.25 5.25 5.25a.75.75 0 0 1-1.06 1.06l-5.25-5.25-5.25 5.25a.75.75 0 0 1-1.06-1.06l5.25-5.25-5.25-5.25A.75.75 0 0 1 7.03 2.47l5.25 5.25 5.25-5.25a.75.75 0 0 1 1.06 0z" />
  </svg>
);

export default XIcon;
