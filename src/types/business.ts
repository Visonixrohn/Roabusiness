export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  island: string;
  location: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
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
