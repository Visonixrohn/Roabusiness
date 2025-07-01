import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { signUpWithEmail, signInWithEmail, resetPassword } from "@/lib/auth";

export interface User {
  id: string;
  email: string;
  type: "business" | "user";
  businessData?: {
    id: string;
    name: string;
    category: string;
    island: string;
    location: string;
    description: string;
    contact: {
      phone: string;
      email: string;
      website?: string;
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
    approved: boolean;
    createdAt: string;
    is_public?: boolean;
  };
  userData?: {
    name: string;
    avatar?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    data: any,
    type: "business" | "user"
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: any) => Promise<boolean>;
  isAuthenticated: boolean;
  isBusiness: boolean;
  isUser: boolean;
  recoverPassword: (email: string) => Promise<any>; // <-- agregar tipo de retorno
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Login con Supabase Auth
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        return { success: false, message: error.message };
      }
      // Buscar datos adicionales en tabla users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (userError || !userData) {
        return {
          success: false,
          message: "No se encontraron datos de usuario",
        };
      }
      let userObj: any = {
        ...userData,
        userData: { name: userData.name, avatar: userData.avatar },
      };
      // Si es negocio, buscar datos del negocio
      if (userData.type === "business") {
        const { data: businessData } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", userData.id)
          .maybeSingle();
        userObj.businessData = businessData;
      }
      setUser(userObj);
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      return { success: true, message: "Inicio de sesión exitoso" };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Error en el sistema de autenticación",
      };
    }
  };

  const register = async (
    data: any,
    type: "business" | "user"
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await signUpWithEmail(
        data.email,
        data.password
      );
      if (authError) {
        return { success: false, message: authError.message };
      }
      // 2. Insertar datos adicionales en tabla users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: data.email,
            type,
            name: data.name,
            avatar: data.avatar || data.logo || null,
          },
        ])
        .select()
        .single();
      if (userError || !userData) {
        return {
          success: false,
          message:
            userError?.message || "Error al crear usuario en tabla users",
        };
      }
      // Si es negocio, crear el negocio
      let businessData = null;
      if (type === "business") {
        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .insert([
            {
              name: data.name,
              description: data.description,
              category: data.category,
              island: data.island,
              location: data.location,
              coverImage: data.coverImage,
              logo: data.logo,
              rating: 0,
              priceRange: data.priceRange,
              featured: false,
              owner_id: userData.id,
              amenities: data.amenities || [],
              // Agregar datos de contacto y redes sociales
              contact: {
                phone: data.phone,
                email: data.email,
                website: data.website,
                facebook: data.facebook,
                instagram: data.instagram,
                twitter: data.twitter,
                tiktok: data.tiktok,
                whatsapp: data.whatsapp,
              },
              facebook: data.facebook,
              instagram: data.instagram,
              twitter: data.twitter,
              tiktok: data.tiktok,
            },
          ])
          .select()
          .single();
        if (businessError || !business) {
          return {
            success: false,
            message: businessError?.message || "Error al crear negocio",
          };
        }
        businessData = business;
      }
      setUser(
        type === "business"
          ? { ...userData, businessData }
          : {
              ...userData,
              userData: { name: userData.name, avatar: userData.avatar },
            }
      );
      localStorage.setItem(
        "currentUser",
        JSON.stringify(
          type === "business"
            ? { ...userData, businessData }
            : {
                ...userData,
                userData: { name: userData.name, avatar: userData.avatar },
              }
        )
      );
      return {
        success: true,
        message:
          "Usuario registrado exitosamente. Revisa tu correo para confirmar tu cuenta.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Error al registrar usuario",
      };
    }
  };

  const updateProfile = async (data: any): Promise<boolean> => {
    if (!user) return false;
    try {
      // Actualizar datos en la tabla users de Supabase
      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          avatar: data.avatar,
        })
        .eq("id", user.id);
      if (error) return false;
      // Actualizar contexto y localStorage
      const updatedUser = {
        ...user,
        userData: { ...user.userData, name: data.name, avatar: data.avatar },
        email: user.email, // el email no se actualiza aquí
      };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  // Nueva función para recuperación de contraseña
  const recoverPassword = async (email: string) => {
    return await resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isBusiness: user?.type === "business",
        isUser: user?.type === "user",
        recoverPassword, // <-- agregar a value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
