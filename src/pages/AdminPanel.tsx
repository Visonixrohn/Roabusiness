import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const LOCAL_KEY = "isAdminRoa";

const AdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [clave, setClave] = useState("");
  const [debugResult, setDebugResult] = useState<string | null>(null);

  // users table
  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // form for create/update
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState({ email: "", name: "", type: "user" });

  // modal for full edit/create including business
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<any | null>(null);
  const [modalBusiness, setModalBusiness] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const emptyBusiness = () => ({
    name: "",
    description: "",
    category: "",
    island: "",
    location: "",
    coverImage: "",
    logo: "",
    priceRange: "",
    amenities: "",
    contact_phone: "",
    contact_email: "",
    contact_website: "",
  });

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // obtener la primera fila de la tabla 'clave' (orden por id)
      const { data, error } = await supabase
        .from("clave")
        .select("id, nun")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Supabase error fetching clave:", error);
        toast.error(`Error al comprobar la clave: ${error.message || error}`);
        setLoading(false);
        return;
      }
      if (!data) {
        toast.error("No se encontró ninguna fila en la tabla 'clave'");
        setLoading(false);
        return;
      }
      // comparar como strings o números
      const nunValue = String(data.nun);
      if (nunValue === clave.trim()) {
        localStorage.setItem(LOCAL_KEY, "1");
        setIsAdmin(true);
        toast.success("Acceso concedido");
      } else {
        toast.error("Clave incorrecta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setDebugResult(null);
    try {
      const { data, error } = await supabase
        .from("clave")
        .select("id, nun")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) {
        setDebugResult(`ERROR: ${JSON.stringify(error)}`);
      } else {
        setDebugResult(`OK: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setDebugResult(`EXCEPTION: ${String(err)}`);
    }
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      toast.error("Error al obtener usuarios");
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setFetchingUsers(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_KEY);
    setIsAdmin(false);
    setUsers([]);
    setForm({ email: "", name: "", type: "user" });
    setEditingUser(null);
    toast.success("Sesión cerrada");
  };

  const handleStartEdit = (u: any) => {
    // Open modal for edit
    openEditModal(u);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setForm({ email: "", name: "", type: "user" });
  };

  const handleSave = async (e?: React.FormEvent) => {
    // Deprecated: use modal save
    openCreateModal();
  };

  const handleDelete = async (u: any) => {
    if (!window.confirm(`Eliminar usuario ${u.email}?`)) return;
    const { error } = await supabase.from("users").delete().eq("id", u.id);
    if (error) return toast.error("Error al eliminar");
    toast.success("Usuario eliminado");
    fetchUsers();
  };

  // --- Modal helpers ---
  const openEditModal = async (u: any) => {
    setModalUser({ ...u });
    setModalBusiness(null);
    setShowModal(true);
    // if user is business, try load business by owner_id
    if (u.type === "business") {
      const { data: bdata } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", u.id)
        .maybeSingle();
      if (bdata) {
        setModalBusiness({
          ...bdata,
          amenities: Array.isArray(bdata.amenities) ? bdata.amenities.join(",") : (bdata.amenities || ""),
          contact_phone: bdata.contact?.phone || "",
          contact_email: bdata.contact?.email || "",
          contact_website: bdata.contact?.website || "",
        });
      } else {
        setModalBusiness(emptyBusiness());
      }
    } else {
      setModalBusiness(emptyBusiness());
    }
  };

  const openCreateModal = () => {
    setModalUser(null);
    setModalBusiness(emptyBusiness());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalUser(null);
    setModalBusiness(null);
  };

  const handleModalSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!modalUser && !modalBusiness) return;
    setIsSaving(true);
    try {
      // USER create or update
      let userId = modalUser?.id;
      if (modalUser) {
        const userPayload: any = {
          email: modalUser.email,
          name: modalUser.name,
          type: modalUser.type || "user",
        };
        if (userId) {
          const { error } = await supabase.from("users").update(userPayload).eq("id", userId);
          if (error) throw error;
          toast.success("Usuario actualizado");
        } else {
          const { data: newUser, error } = await supabase.from("users").insert([userPayload]).select().single();
          if (error) throw error;
          userId = newUser.id;
          toast.success("Usuario creado");
        }
      }

      // BUSINESS create or update if applicable
      if (modalBusiness && ( (modalUser && modalUser.type === "business") || (modalBusiness.name && modalBusiness.name.length>0) )) {
        const businessPayload: any = {
          name: modalBusiness.name,
          description: modalBusiness.description,
          category: modalBusiness.category,
          island: modalBusiness.island,
          location: modalBusiness.location,
          coverImage: modalBusiness.coverImage,
          logo: modalBusiness.logo,
          priceRange: modalBusiness.priceRange,
          amenities: (modalBusiness.amenities || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          contact: {
            phone: modalBusiness.contact_phone,
            email: modalBusiness.contact_email,
            website: modalBusiness.contact_website,
          },
          owner_id: userId,
        };

        // try find existing business by owner_id
        const { data: existing } = await supabase.from("businesses").select("id").eq("owner_id", userId).maybeSingle();
        if (existing && existing.id) {
          const { error } = await supabase.from("businesses").update(businessPayload).eq("id", existing.id);
          if (error) throw error;
          toast.success("Business actualizado");
        } else {
          const { error } = await supabase.from("businesses").insert([businessPayload]);
          if (error) throw error;
          toast.success("Business creado");
        }
      }

      closeModal();
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error guardando datos");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
         
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Clave de acceso</label>
              <Input
                value={clave}
                onChange={(e: any) => setClave(e.target.value)}
                placeholder="Introduce la clave"
                type="password"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-blue-600" disabled={loading}>
                {loading ? "Verificando..." : "Acceder"}
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Panel Admin</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-4 flex gap-2">
              <input
                className="px-3 py-2 border rounded w-full"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <input
                className="px-3 py-2 border rounded w-64"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <select
                className="px-3 py-2 border rounded"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="user">Usuario</option>
                <option value="business">Business</option>
              </select>
              <div className="flex items-center gap-2">
                {editingUser ? (
                  <>
                    <Button onClick={handleSave}>Guardar</Button>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                  </>
                ) : (
                  <Button onClick={handleSave}>Crear</Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Nombre</th>
                    <th className="px-2 py-2">Tipo</th>
                    <th className="px-2 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchingUsers ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">Cargando...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">No hay usuarios</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-2 py-2">{u.id}</td>
                        <td className="px-2 py-2">{u.email}</td>
                        <td className="px-2 py-2">{u.name}</td>
                        <td className="px-2 py-2">{u.type}</td>
                        <td className="px-2 py-2 flex gap-2">
                          <Button size="sm" onClick={() => handleStartEdit(u)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(u)}>Eliminar</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Button onClick={fetchUsers}>Refrescar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar usuario + business */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalUser ? `Editar usuario ${modalUser.email || ''}` : 'Crear usuario / negocio'}</DialogTitle>
            <DialogDescription>
              Rellena los campos del usuario y, si aplica, la información del negocio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleModalSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700">Email</label>
                <Input
                  value={modalUser?.email || ""}
                  onChange={(e: any) => setModalUser((m) => ({ ...(m || {}), email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Tipo</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={modalUser?.type || "user"}
                  onChange={(e) => setModalUser((m) => ({ ...(m || {}), type: e.target.value }))}
                >
                  <option value="user">Usuario</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700">Nombre</label>
              <Input
                value={modalUser?.name || ""}
                onChange={(e: any) => setModalUser((m) => ({ ...(m || {}), name: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>

            {/* Sección de Business (si aplica) */}
            <div className="pt-2 border-t">
              <h4 className="text-sm font-semibold">Información del negocio</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm text-gray-700">Nombre del negocio</label>
                  <Input
                    value={modalBusiness?.name || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), name: e.target.value }))}
                    placeholder="Nombre del negocio"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Categoría</label>
                  <Input
                    value={modalBusiness?.category || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), category: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Isla</label>
                  <Input
                    value={modalBusiness?.island || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), island: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Ubicación</label>
                  <Input
                    value={modalBusiness?.location || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), location: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700">Descripción</label>
                  <Textarea
                    value={modalBusiness?.description || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Imagen principal (URL)</label>
                  <Input
                    value={modalBusiness?.coverImage || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), coverImage: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Logo (URL)</label>
                  <Input
                    value={modalBusiness?.logo || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), logo: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Rango de precio</label>
                  <Input
                    value={modalBusiness?.priceRange || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), priceRange: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Amenities (coma-separados)</label>
                  <Input
                    value={modalBusiness?.amenities || ""}
                    onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), amenities: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700">Teléfono</label>
                    <Input
                      value={modalBusiness?.contact_phone || ""}
                      onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), contact_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Email contacto</label>
                    <Input
                      value={modalBusiness?.contact_email || ""}
                      onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), contact_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Sitio web</label>
                    <Input
                      value={modalBusiness?.contact_website || ""}
                      onChange={(e: any) => setModalBusiness((b) => ({ ...(b || {}), contact_website: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2 w-full justify-end">
                <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
