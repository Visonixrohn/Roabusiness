import React from "react";
import FacebookIcon from "@/components/icons/FacebookIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import XIcon from "@/components/icons/XIcon";
import TikTokIcon from "@/components/icons/TikTokIcon";

interface SocialFloatingButtonProps {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

const SocialFloatingButton: React.FC<SocialFloatingButtonProps> = ({
  facebook,
  instagram,
  twitter,
  tiktok,
}) => {
  const socialLinks = [
    facebook && {
      href: facebook,
      icon: <FacebookIcon size={28} />,
      title: "Facebook",
      color: "text-[#1877f3]",
    },
    instagram && {
      href: instagram,
      icon: <InstagramIcon size={28} />,
      title: "Instagram",
      color: "text-[#e1306c]",
    },
    twitter && {
      href: twitter,
      icon: <XIcon size={28} />,
      title: "X (Twitter)",
      color: "text-[#1da1f2]",
    },
    tiktok && {
      href: tiktok,
      icon: <TikTokIcon size={28} />,
      title: "TikTok",
      color: "text-black",
    },
  ].filter(Boolean);

  if (socialLinks.length === 0) return null;
  if (socialLinks.length === 1) {
    const s = socialLinks[0];
    return (
      <a
        href={s.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-8 right-8 z-[100] bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${s.color}`}
        title={s.title}
        style={{ fontSize: 0 }}
      >
        {s.icon}
      </a>
    );
  }
  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <div className="group relative">
        <button
          className="bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Redes sociales"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.2" />
            <path
              d="M12 7v5l4 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
          {socialLinks.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-transform hover:scale-110 hover:shadow-lg rounded-full p-2 bg-white border border-gray-200 ${s.color}`}
              title={s.title}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialFloatingButton;
