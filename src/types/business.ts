export interface BusinessContact {
  phone: string;
  email: string;
  website: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  tripadvisor?: string;
}

export interface Business {
  id: string;
  name: string;
  profile_name?: string;
  description: string;
  category: string;
  departamento: string;
  municipio: string;
  colonia?: string;
  /** @deprecated usar departamento */
  island?: string;
  /** @deprecated usar municipio */
  location?: string;
  contact: BusinessContact;
  coverImage: string;
  logo: string;
  gallery: string[];
  amenities: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;
  rating: number;
  priceRange: string;
  featured: boolean;
  is_public?: boolean;
  created_at?: string;
  subscription_months?: number | null;
  subscription_started_at?: string | null;
  schedule?: { day: string; open: string; close: string }[];
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  tripadvisor?: string;
}

export interface BusinessData {
  businesses: Business[];
  categories: string[];
  departamentos: string[];
  municipios: string[];
}

export interface SearchFilters {
  query: string;
  category: string;
  departamento: string;
  municipio: string;
  colonia: string;
  priceRange: string;
}

export interface ModalData {
  isOpen: boolean;
  business: Business | null;
  type: "contact" | "gallery" | null;
}
