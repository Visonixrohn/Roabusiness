export const GOOGLE_MAPS_CONFIG = {
  apiKey: "AIzaSyD9ZMr4EAvpCy-AW5dg2IsSJeC9bPTUFOQ",
  defaultCenter: {
    lat: 16.3156, // Coordenadas de Roatán
    lng: -86.5889,
  },
  defaultZoom: 10,
  mapStyle: [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#1e3a8a",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [
        {
          color: "#f3f4f6",
        },
      ],
    },
  ],
  // Estilo limpio para vistas de perfil/contacto: oculta POIs de otros negocios
  // para que el mapa se vea idéntico a Google Maps pero sin locales cercanos
  cleanMapStyle: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.business",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.attraction",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export const BAY_ISLANDS_BOUNDS = {
  north: 16.5,
  south: 16.0,
  east: -85.8,
  west: -86.9,
};
