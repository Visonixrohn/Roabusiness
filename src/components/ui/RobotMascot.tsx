import React, { useEffect, useRef } from "react";

// Mascota robot minimalista, ojos siguen el mouse
const RobotMascot: React.FC<{ className?: string }> = ({ className = "" }) => {
  const leftEye = useRef<SVGCircleElement>(null);
  const rightEye = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const robot = document.getElementById("robot-mascot");
      if (!robot) return;
      const rect = robot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = Math.atan2(dy, dx);
      const r = 7;
      const offsetX = Math.cos(angle) * r;
      const offsetY = Math.sin(angle) * r;
      if (leftEye.current) {
        leftEye.current.setAttribute("cx", String(38 + offsetX));
        leftEye.current.setAttribute("cy", String(52 + offsetY));
      }
      if (rightEye.current) {
        rightEye.current.setAttribute("cx", String(62 + offsetX));
        rightEye.current.setAttribute("cy", String(52 + offsetY));
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <svg
      id="robot-mascot"
      className={className}
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      style={{ display: "block" }}
    >
      <rect
        x="20"
        y="30"
        width="80"
        height="60"
        rx="20"
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth="3"
      />
      <rect
        x="40"
        y="15"
        width="40"
        height="20"
        rx="8"
        fill="#e5e7eb"
        stroke="#d1d5db"
        strokeWidth="2"
      />
      <circle
        cx="38"
        cy="52"
        r="12"
        fill="#fff"
        stroke="#9ca3af"
        strokeWidth="2"
      />
      <circle
        cx="62"
        cy="52"
        r="12"
        fill="#fff"
        stroke="#9ca3af"
        strokeWidth="2"
      />
      <circle ref={leftEye} cx="38" cy="52" r="5" fill="#1e293b" />
      <circle ref={rightEye} cx="62" cy="52" r="5" fill="#1e293b" />
      <rect x="50" y="70" width="20" height="8" rx="4" fill="#d1d5db" />
      <rect x="30" y="90" width="10" height="10" rx="3" fill="#d1d5db" />
      <rect x="80" y="90" width="10" height="10" rx="3" fill="#d1d5db" />
    </svg>
  );
};

export default RobotMascot;
