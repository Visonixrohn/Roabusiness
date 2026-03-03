import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/ImageUpload";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Satellite, X, Plus } from "lucide-react";
import { GOOGLE_MAPS_CONFIG } from "@/config/googleMaps";
import { departamentos } from "@/data/hondurasLocations";

interface EditFormData {
  name: string;
  profile_name: string;
  category: string;
  departamento: string;
  municipio: string;
  colonia: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  email: string;
  phones: string[];
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  whatsapp: string;
  tripadvisor: string;
  priceRange: string;
  amenities: string[];
  coverImage: string;
  logo: string;
  is_public: boolean;
  subscriptionMonths: number;
  pago: "ejecutado" | "sin pagar";
  graceDays: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editForm: EditFormData;
  setEditForm: (form: EditFormData) => void;
  municipios: string[];
  setMunicipios: (municipios: string[]) => void;
  getMunicipiosByDepartamento: (dep: string) => string[];
  categories: string[];
  priceRanges: { value: string; label: string }[];
  addAmenity: () => void;
  removeAmenity: (amenity: string) => void;
  newAmenity: string;
  setNewAmenity: (value: string) => void;
  mapCenter: { lat: number; lng: number };
  mapType: "roadmap" | "satellite";
  setMapType: (type: "roadmap" | "satellite") => void;
  isSubmitting: boolean;
  handleSubmitRegister: () => void;
}

const SUBSCRIPTION_MONTHS = [6, 12, 18, 24, 30, 36];

const RegisterBusinessModalAdmin: React.FC<Props> = ({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  municipios,
  setMunicipios,
  getMunicipiosByDepartamento,
  categories,
  priceRanges,
  addAmenity,
  removeAmenity,
  newAmenity,
  setNewAmenity,
  mapCenter,
  mapType,
  setMapType,
  isSubmitting,
  handleSubmitRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Registrar Nuevo Negocio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <input
                list="categories-list-register"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="categories-list-register">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <select
                value={editForm.departamento}
                onChange={(e) => {
                  setEditForm({
                    ...editForm,
                    departamento: e.target.value,
                    municipio: "",
                  });
                  setMunicipios(getMunicipiosByDepartamento(e.target.value));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio *
              </label>
              <select
                value={editForm.municipio}
                onChange={(e) =>
                  setEditForm({ ...editForm, municipio: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={!editForm.departamento}
              >
                <option value="">
                  {editForm.departamento
                    ? "Selecciona un municipio"
                    : "Primero selecciona un departamento"}
                </option>
                {municipios.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colonia / Sector
              </label>
              <input
                type="text"
                value={editForm.colonia}
                onChange={(e) =>
                  setEditForm({ ...editForm, colonia: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: West Bay Beach"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mapa de ubicación
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Haz clic en el mapa para seleccionar la ubicación exacta.
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMapType(mapType === "roadmap" ? "satellite" : "roadmap")
                  }
                >
                  <Satellite className="h-4 w-4 mr-1" />
                  {mapType === "roadmap" ? "Ver satélite" : "Ver mapa"}
                </Button>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-300">
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "280px" }}
                  center={
                    editForm.latitude != null && editForm.longitude != null
                      ? { lat: editForm.latitude, lng: editForm.longitude }
                      : mapCenter
                  }
                  zoom={13}
                  onClick={(event) => {
                    const lat = event.latLng?.lat();
                    const lng = event.latLng?.lng();
                    if (lat == null || lng == null) return;
                    setEditForm({
                      ...editForm,
                      latitude: lat,
                      longitude: lng,
                    });
                  }}
                  options={{
                    mapTypeId: mapType,
                    styles: GOOGLE_MAPS_CONFIG.mapStyle,
                    mapTypeControl: false,
                    streetViewControl: false,
                  }}
                >
                  {editForm.latitude != null && editForm.longitude != null && (
                    <Marker
                      position={{
                        lat: editForm.latitude,
                        lng: editForm.longitude,
                      }}
                      title={editForm.name || "Ubicación del negocio"}
                    />
                  )}
                </GoogleMap>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono(s) *
              </label>
              <div className="space-y-2">
                {editForm.phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...editForm.phones];
                        newPhones[index] = e.target.value;
                        setEditForm({ ...editForm, phones: newPhones });
                      }}
                      placeholder="+504 2445-1234"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {editForm.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPhones = editForm.phones.filter(
                            (_, i) => i !== index,
                          );
                          setEditForm({ ...editForm, phones: newPhones });
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar teléfono"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      phones: [...editForm.phones, ""],
                    })
                  }
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="h-4 w-4" /> Agregar otro teléfono
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={editForm.website}
                onChange={(e) =>
                  setEditForm({ ...editForm, website: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={editForm.whatsapp}
                onChange={(e) =>
                  setEditForm({ ...editForm, whatsapp: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Redes sociales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={editForm.facebook}
                onChange={(e) =>
                  setEditForm({ ...editForm, facebook: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={editForm.instagram}
                onChange={(e) =>
                  setEditForm({ ...editForm, instagram: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter/X
              </label>
              <input
                type="url"
                value={editForm.twitter}
                onChange={(e) =>
                  setEditForm({ ...editForm, twitter: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok
              </label>
              <input
                type="url"
                value={editForm.tiktok}
                onChange={(e) =>
                  setEditForm({ ...editForm, tiktok: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TripAdvisor
              </label>
              <input
                type="url"
                value={editForm.tripadvisor}
                onChange={(e) =>
                  setEditForm({ ...editForm, tripadvisor: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="URL de TripAdvisor"
              />
            </div>
          </div>

          {/* Estado de Pago y Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de Pago
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, pago: "ejecutado" })}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  editForm.pago === "ejecutado"
                    ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                ✓ Ejecutado
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    pago: "sin pagar",
                    subscriptionMonths: 0,
                  })
                }
                className={`p-3 rounded-lg border text-center transition-colors ${
                  editForm.pago === "sin pagar"
                    ? "border-red-500 bg-red-50 text-red-700 font-semibold"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                ⚠ Sin Pagar
              </button>
            </div>

            {/* Campo de días de gracia cuando es "sin pagar" */}
            {editForm.pago === "sin pagar" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de Gracia *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={editForm.graceDays}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      graceDays: parseInt(e.target.value) || 7,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 7"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número de días que el negocio estará visible sin pagar (por
                  defecto 7 días)
                </p>
              </div>
            )}

            {/* Mostrar duración solo si es "ejecutado" */}
            {editForm.pago === "ejecutado" && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de duración (meses)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {SUBSCRIPTION_MONTHS.map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, subscriptionMonths: months })
                      }
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        editForm.subscriptionMonths === months
                          ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">{months}</div>
                      <div className="text-xs text-gray-500 mt-1">meses</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de Precios
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() =>
                    setEditForm({ ...editForm, priceRange: range.value })
                  }
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    editForm.priceRange === range.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">{range.value}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {range.label.split(" - ")[1]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amenidades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios y Amenidades
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar amenidad"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAmenity())
                }
              />
              <Button type="button" onClick={addAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editForm.amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 px-3 py-1 flex items-center gap-2"
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
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUpload
                onImageUploaded={(url) =>
                  setEditForm({ ...editForm, coverImage: url })
                }
                onImageRemoved={() =>
                  setEditForm({ ...editForm, coverImage: "" })
                }
                currentImage={editForm.coverImage}
                label="Imagen de portada"
                maxSize={5}
              />
            </div>
            <div>
              <ImageUpload
                onImageUploaded={(url) =>
                  setEditForm({ ...editForm, logo: url })
                }
                onImageRemoved={() => setEditForm({ ...editForm, logo: "" })}
                currentImage={editForm.logo}
                label="Logo del negocio"
                maxSize={2}
              />
            </div>
          </div>

          {/* Visibilidad */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_public_register"
              checked={editForm.is_public}
              onChange={(e) =>
                setEditForm({ ...editForm, is_public: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="is_public_register"
              className="text-sm font-medium text-gray-700"
            >
              Negocio público (visible en el directorio)
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitRegister}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Registrando..." : "Registrar Negocio"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterBusinessModalAdmin;
