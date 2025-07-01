import { useState } from 'react';
import {
  Share2,
  X,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Music2,
} from 'lucide-react'; // Lucide icons

const SocialFloatingButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://api.whatsapp.com/send/?phone=50488632788&text&type=phone_number&app_absent=0',
      color: 'bg-green-500 hover:bg-green-600',
      delay: 'delay-75'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/visonixro/',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      delay: 'delay-100'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/people/VisonixRo/61574218733448/',
      color: 'bg-blue-600 hover:bg-blue-700',
      delay: 'delay-150'
    },
    {
      name: 'TikTok',
      icon: Music2,
      url: 'https://www.tiktok.com/@visonixro',
      color: 'bg-black hover:bg-neutral-800',
      delay: 'delay-200'
    },
    {
      name: 'Twitter (X)',
      icon: Twitter,
      url: 'https://x.com/ViSonixRo',
      color: 'bg-black hover:bg-gray-800',
      delay: 'delay-[250ms]'
    }
  ];

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botones sociales */}
      <div
        className={`flex flex-col space-y-3 mb-4 transition-all duration-500 ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              w-12 h-12 rounded-full ${social.color} text-white
              flex items-center justify-center shadow-lg
              transform transition-all duration-300 hover:scale-110
              ${isExpanded ? `animate-bounce-in ${social.delay}` : ''}
            `}
            title={social.name}
          >
            <social.icon className="h-5 w-5" />
          </a>
        ))}
      </div>

      {/* Botón principal */}
      <button
        onClick={toggleExpanded}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300
          flex items-center justify-center text-white font-semibold
          ${isExpanded
            ? 'bg-red-500 hover:bg-red-600 transform rotate-180'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-110'}
        `}
        title={isExpanded ? 'Cerrar' : 'Redes Sociales'}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Share2 className="h-6 w-6" />}
      </button>

      {/* Efecto pulsante */}
      {!isExpanded && (
        <div className="absolute inset-0 w-14 h-14 rounded-full bg-blue-400 animate-ping opacity-20"></div>
      )}
    </div>
  );
};

export default SocialFloatingButton;
