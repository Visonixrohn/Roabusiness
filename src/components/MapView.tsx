import { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Star, MapPin, Phone, Globe } from 'lucide-react';
import { Business } from '@/types/business';
import { GOOGLE_MAPS_CONFIG, BAY_ISLANDS_BOUNDS } from '@/config/googleMaps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContactModal from '@/components/ContactModal';

interface MapViewProps {
  businesses: Business[];
}

const MapView = ({ businesses }: MapViewProps) => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const mapOptions = {
    styles: GOOGLE_MAPS_CONFIG.mapStyle,
    restriction: {
      latLngBounds: BAY_ISLANDS_BOUNDS,
      strictBounds: false,
    },
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    scrollwheel: true,
    gestureHandling: 'cooperative',
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerIcon = (business: Business) => {
    const colors = {
      'Hoteles y Alojamiento': '#EF4444', // Red
      'Restaurantes': '#F97316', // Orange
      'Tours y Actividades': '#10B981', // Green
      'Bares y Vida Nocturna': '#8B5CF6', // Purple
      'Bienestar y Spa': '#EC4899', // Pink
      'Tiendas y Comercios': '#F59E0B', // Yellow
      'Cafeterías': '#6B7280', // Gray
      'Alquiler Vacacional': '#3B82F6', // Blue
    };

    const color = colors[business.category as keyof typeof colors] || '#6B7280';
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20),
    };
  };

  const openContactModal = (business: Business) => {
    setSelectedBusiness(business);
    setShowContactModal(true);
  };

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '600px',
        }}
        center={GOOGLE_MAPS_CONFIG.defaultCenter}
        zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {businesses.map((business) => (
          <Marker
            key={business.id}
            position={{
              lat: business.coordinates.lat,
              lng: business.coordinates.lng,
            }}
            icon={getMarkerIcon(business)}
            onClick={() => setSelectedBusiness(business)}
            title={business.name}
          />
        ))}

        {selectedBusiness && (
          <InfoWindow
            position={{
              lat: selectedBusiness.coordinates.lat,
              lng: selectedBusiness.coordinates.lng,
            }}
            onCloseClick={() => setSelectedBusiness(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -40),
            }}
          >
            <div className="max-w-sm p-2">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={selectedBusiness.logo}
                  alt={selectedBusiness.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {selectedBusiness.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{selectedBusiness.location}</span>
                  </div>
                </div>
              </div>

              <img
                src={selectedBusiness.coverImage}
                alt={selectedBusiness.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />

              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {selectedBusiness.category}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{selectedBusiness.rating}</span>
                  <span className="text-sm text-gray-500">• {selectedBusiness.priceRange}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {selectedBusiness.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-3 w-3 mr-2" />
                  <a 
                    href={`tel:${selectedBusiness.contact.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedBusiness.contact.phone}
                  </a>
                </div>
                {selectedBusiness.contact.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-3 w-3 mr-2" />
                    <a 
                      href={`https://${selectedBusiness.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Sitio web
                    </a>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => openContactModal(selectedBusiness)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Contactar
                </Button>
                {selectedBusiness.contact.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${selectedBusiness.contact.website}`, '_blank')}
                    className="flex-1"
                  >
                    Sitio Web
                  </Button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Leyenda del mapa */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-3">Categorías</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Hoteles y Alojamiento</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Restaurantes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Tours y Actividades</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>Vida Nocturna</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span>Spa y Bienestar</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Tiendas</span>
          </div>
        </div>
      </div>

      {/* Modal de contacto */}
      {selectedBusiness && (
        <ContactModal
          business={selectedBusiness}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default MapView;