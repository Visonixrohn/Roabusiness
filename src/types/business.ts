export interface BusinessContact {
  phone: string;
  email: string;
  website: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  island: string;
  location: string;
  contact: BusinessContact;
  coverImage: string;
  logo: string;
  gallery: string[];
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  priceRange: string;
  featured: boolean;
  is_public?: boolean;
  schedule?: { day: string; open: string; close: string }[];
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
}

export interface BusinessData {
  businesses: Business[];
  categories: string[];
  islands: string[];
}

export interface SearchFilters {
  query: string;
  category: string;
  island: string;
  priceRange: string;
}

export interface ModalData {
  isOpen: boolean;
  business: Business | null;
  type: "contact" | "gallery" | null;
}
