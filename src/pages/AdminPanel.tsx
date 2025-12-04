import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Users,
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ImageUpload";
import TikTokIcon from "@/components/icons/TikTokIcon";

interface User {
  id: string;
  email: string;
  name: string;
  type: "business" | "user";
  business_id?: string;
  created_at?: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  island: string;
  location: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  price_range?: string;
  amenities?: string[];
  cover_image?: string;
  logo?: string;
  is_public?: boolean;
  created_at?: string;
}

type TabType = "users" | "businesses";
type ModalType = "add" | "edit" | null;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<User | Business | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Form states
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    type: "user" as "business" | "user",
    business_id: "",
  });

  const [businessForm, setBusinessForm] = useState({
    name: "",
    category: "",
    island: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    whatsapp: "",
    price_range: "",
    amenities: [] as string[],
    cover_image: "",
    logo: "",
    is_public: true,
  });

  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const { data, error } = await supabase.from("users").select("*");
        if (error) throw error;
        setUsers(data || []);
      } else {
        const { data, error } = await supabase.from("businesses").select("*");
        if (error) throw error;
        setBusinesses(data || []);
      }
    } catch (error: any) {
      toast.error("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: ModalType, item?: User | Business) => {
    setModalType(type);
    setSelectedItem(item || null);

    if (type === "edit" && item) {
      if (activeTab === "users") {
        const user = item as User;
        setUserForm({
          email: user.email,
          name: user.name,
          type: user.type,
          business_id: user.business_id || "",
        });
      } else {
        const business = item as Business;
        setBusinessForm({
          name: business.name,
          category: business.category,
          island: business.island,
          location: business.location,
          description: business.description,
          email: business.contact?.email || "",
          phone: business.contact?.phone || "",
          website: business.contact?.website || "",
          facebook: business.contact?.facebook || "",
          instagram: business.contact?.instagram || "",
          twitter: business.contact?.twitter || "",
          tiktok: business.contact?.tiktok || "",
          whatsapp: business.contact?.whatsapp || "",
          price_range: business.price_range || "",
          amenities: business.amenities || [],
          cover_image: business.cover_image || "",
          logo: business.logo || "",
          is_public: business.is_public ?? true,
        });
      }
    } else {
      resetForms();
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSelectedItem(null);
    resetForms();
  };

  const resetForms = () => {
    setUserForm({
      email: "",
      name: "",
      type: "user",
      business_id: "",
    });
    setBusinessForm({
      name: "",
      category: "",
      island: "",
      location: "",
      description: "",
      email: "",
      phone: "",
      website: "",
      facebook: "",
      instagram: "",
      twitter: "",
      tiktok: "",
      whatsapp: "",
      price_range: "",
      amenities: [],
      cover_image: "",
      logo: "",
      is_public: true,
    });
    setNewAmenity("");
  };

  const handleSaveUser = async () => {
    try {
      if (!userForm.email || !userForm.name) {
        toast.error("Por favor completa todos los campos obligatorios");
        return;
      }

      if (modalType === "add") {
        const { error } = await supabase.from("users").insert([userForm]);
        if (error) throw error;
        toast.success("Usuario creado exitosamente");
      } else if (modalType === "edit" && selectedItem) {
        const { error } = await supabase
          .from("users")
          .update(userForm)
          .eq("id", selectedItem.id);
        if (error) throw error;
        toast.success("Usuario actualizado exitosamente");
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleSaveBusiness = async () => {
    try {
      if (!businessForm.name || !businessForm.category || !businessForm.island) {
        toast.error("Por favor completa todos los campos obligatorios");
        return;
      }

      // Construir payload en camelCase (preferido por el frontend)
      const payloadCamel: any = {
        name: businessForm.name,
        category: businessForm.category,
        island: businessForm.island,
        location: businessForm.location,
        description: businessForm.description,
        contact: {
          email: businessForm.email,
          phone: businessForm.phone,
          website: businessForm.website,
          facebook: businessForm.facebook,
          instagram: businessForm.instagram,
          twitter: businessForm.twitter,
          tiktok: businessForm.tiktok,
          whatsapp: businessForm.whatsapp,
        },
        priceRange: businessForm.price_range || businessForm.price_range,
        amenities: businessForm.amenities,
        coverImage: businessForm.cover_image || businessForm.cover_image,
        logo: businessForm.logo,
        is_public: businessForm.is_public,
      };

      // Also prepare snake_case fallback for DBs expecting that naming
      const payloadSnake: any = {
        name: businessForm.name,
        category: businessForm.category,
        island: businessForm.island,
        location: businessForm.location,
        description: businessForm.description,
        contact: {
          email: businessForm.email,
          phone: businessForm.phone,
          website: businessForm.website,
          facebook: businessForm.facebook,
          instagram: businessForm.instagram,
          twitter: businessForm.twitter,
          tiktok: businessForm.tiktok,
          whatsapp: businessForm.whatsapp,
        },
        price_range: businessForm.price_range || businessForm.price_range,
        amenities: businessForm.amenities,
        cover_image: businessForm.cover_image || businessForm.cover_image,
        logo: businessForm.logo,
        is_public: businessForm.is_public,
      };

      // helper to try insert/update with given payload, returning error if any
      const tryUpsert = async (payload: any) => {
        if (modalType === "add") {
          return await supabase.from("businesses").insert([payload]);
        } else {
          return await supabase.from("businesses").update(payload).eq("id", selectedItem?.id);
        }
      };

      // Primero intentamos con camelCase; si falla por columna inexistente, reintentamos con snake_case
      try {
        const { error } = await tryUpsert(payloadCamel as any);
        if (error) throw error;
        toast.success(modalType === "add" ? "Negocio creado exitosamente" : "Negocio actualizado exitosamente");
      } catch (err: any) {
        // si el error menciona columnas faltantes, intentar con snake_case
        const msg = String(err?.message || err);
        if (msg.includes("cover_image") || msg.includes("could not find the") || msg.includes("column") ) {
          try {
            const { error } = await tryUpsert(payloadSnake as any);
            if (error) throw error;
            toast.success(modalType === "add" ? "Negocio creado exitosamente" : "Negocio actualizado exitosamente");
          } catch (err2: any) {
            throw err2;
          }
        } else {
          throw err;
        }
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este elemento?")) return;

    try {
      const table = activeTab === "users" ? "users" : "businesses";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success("Elemento eliminado exitosamente");
      fetchData();
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !businessForm.amenities.includes(newAmenity.trim())) {
      setBusinessForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setBusinessForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || user.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.island.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      business.island === filterType ||
      business.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const islands = ["Roatán", "Utila", "Guanaja", "Jose Santos Guardiola"];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Gestiona usuarios y negocios de Roabusiness
                </p>
              </div>
            </div>
            <Button
              onClick={() => fetchData()}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === "users"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Users className="h-5 w-5" />
            Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("businesses")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === "businesses"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Building2 className="h-5 w-5" />
            Negocios ({businesses.length})
          </button>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === "users" ? "usuarios" : "negocios"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">Todos</option>
              {activeTab === "users" ? (
                <>
                  <option value="user">Usuarios</option>
                  <option value="business">Negocios</option>
                </>
              ) : (
                <>
                  {islands.map((island) => (
                    <option key={island} value={island}>
                      {island}
                    </option>
                  ))}
                </>
              )}
            </select>

            <Button
              onClick={() => openModal("add")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Agregar {activeTab === "users" ? "Usuario" : "Negocio"}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "users" ? (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-blue-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`${user.type === "business"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                              } border px-3 py-1`}
                          >
                            {user.type === "business" ? "Negocio" : "Usuario"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString("es-ES")
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal("edit", user)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Negocio
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Isla
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBusinesses.map((business) => (
                      <tr
                        key={business.id}
                        className="hover:bg-blue-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {business.logo ? (
                                <img
                                  src={business.logo}
                                  alt={business.name}
                                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                                  {business.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {business.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {business.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 border">
                            {business.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {business.island}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs">{business.contact?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs">{business.contact?.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`${business.is_public
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              } border`}
                          >
                            {business.is_public ? (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Público
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />
                                Privado
                              </div>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal("edit", business)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(business.id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            ((activeTab === "users" && filteredUsers.length === 0) ||
              (activeTab === "businesses" && filteredBusinesses.length === 0)) && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  {activeTab === "users" ? (
                    <Users className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : `No hay ${activeTab === "users" ? "usuarios" : "negocios"} registrados`}
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {activeTab === "users" ? (
                  <Users className="h-6 w-6" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
                {modalType === "add" ? "Agregar" : "Editar"}{" "}
                {activeTab === "users" ? "Usuario" : "Negocio"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {activeTab === "users" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) =>
                          setUserForm({ ...userForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) =>
                            setUserForm({ ...userForm, email: e.target.value })
                          }
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Usuario *
                      </label>
                      <select
                        value={userForm.type}
                        onChange={(e) =>
                          setUserForm({
                            ...userForm,
                            type: e.target.value as "business" | "user",
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="user">Usuario</option>
                        <option value="business">Negocio</option>
                      </select>
                    </div>

                    {userForm.type === "business" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ID del Negocio
                        </label>
                        <input
                          type="text"
                          value={userForm.business_id}
                          onChange={(e) =>
                            setUserForm({
                              ...userForm,
                              business_id: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="ID del negocio asociado"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre del Negocio *
                        </label>
                        <input
                          type="text"
                          value={businessForm.name}
                          onChange={(e) =>
                            setBusinessForm({ ...businessForm, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ej: Hotel Paradise Bay"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Categoría *
                        </label>
                        <input
                          type="text"
                          value={businessForm.category}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ej: Hotel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Isla *
                        </label>
                        <select
                          value={businessForm.island}
                          onChange={(e) =>
                            setBusinessForm({ ...businessForm, island: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Selecciona una isla</option>
                          {islands.map((island) => (
                            <option key={island} value={island}>
                              {island}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ubicación *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            value={businessForm.location}
                            onChange={(e) =>
                              setBusinessForm({
                                ...businessForm,
                                location: e.target.value,
                              })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Ej: West Bay Beach"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Rango de Precios
                        </label>
                        <select
                          value={businessForm.price_range}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              price_range: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Selecciona un rango</option>
                          {priceRanges.map((range) => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Descripción *
                        </label>
                        <textarea
                          value={businessForm.description}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="Describe el negocio..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={businessForm.is_public}
                            onChange={(e) =>
                              setBusinessForm({
                                ...businessForm,
                                is_public: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Negocio Público (visible en el directorio)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-600" />
                      Información de Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="email"
                            value={businessForm.email}
                            onChange={(e) =>
                              setBusinessForm({ ...businessForm, email: e.target.value })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="contacto@negocio.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="tel"
                            value={businessForm.phone}
                            onChange={(e) =>
                              setBusinessForm({ ...businessForm, phone: e.target.value })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="+504 2445-1234"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sitio Web
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="url"
                            value={businessForm.website}
                            onChange={(e) =>
                              setBusinessForm({
                                ...businessForm,
                                website: e.target.value,
                              })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="www.negocio.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          value={businessForm.whatsapp}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              whatsapp: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+504 9999-9999"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Facebook className="h-4 w-4 text-blue-600" />
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={businessForm.facebook}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              facebook: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="URL de Facebook"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-500" />
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={businessForm.instagram}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              instagram: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="URL de Instagram"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-blue-400" />
                          X (Twitter)
                        </label>
                        <input
                          type="url"
                          value={businessForm.twitter}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              twitter: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="URL de X"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <TikTokIcon className="h-4 w-4" />
                          TikTok
                        </label>
                        <input
                          type="url"
                          value={businessForm.tiktok}
                          onChange={(e) =>
                            setBusinessForm({
                              ...businessForm,
                              tiktok: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="URL de TikTok"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Servicios y Amenidades
                    </h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Agregar servicio..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addAmenity())
                        }
                      />
                      <Button
                        type="button"
                        onClick={addAmenity}
                        className="bg-blue-600 hover:bg-blue-700 px-6"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      {businessForm.amenities.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No hay servicios agregados
                        </p>
                      ) : (
                        businessForm.amenities.map((amenity, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-100 text-blue-800 border-blue-200 border px-3 py-2 flex items-center gap-2"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => removeAmenity(amenity)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Imágenes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Imagen de Portada
                        </label>
                        <ImageUpload
                          onImageUploaded={(url) =>
                            setBusinessForm({ ...businessForm, cover_image: url })
                          }
                          onImageRemoved={() =>
                            setBusinessForm({ ...businessForm, cover_image: "" })
                          }
                          currentImage={businessForm.cover_image}
                          label="Portada"
                          maxSize={5}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Logo del Negocio
                        </label>
                        <ImageUpload
                          onImageUploaded={(url) =>
                            setBusinessForm({ ...businessForm, logo: url })
                          }
                          onImageRemoved={() =>
                            setBusinessForm({ ...businessForm, logo: "" })
                          }
                          currentImage={businessForm.logo}
                          label="Logo"
                          maxSize={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 rounded-b-2xl">
              <Button
                onClick={closeModal}
                variant="outline"
                className="px-6 py-3 border-2 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                onClick={activeTab === "users" ? handleSaveUser : handleSaveBusiness}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                {modalType === "add" ? "Crear" : "Actualizar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
