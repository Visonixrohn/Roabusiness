export const GOOGLE_MAPS_CONFIG = {
  apiKey: 'AIzaSyBWXNE96Eb23e16DCw7Zfb9rkYwxRiTUfQ',
  defaultCenter: {
    lat: 16.3156, // Coordenadas de Roatán
    lng: -86.5889
  },
  defaultZoom: 10,
  mapStyle: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#1e3a8a'
        }
      ]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [
        {
          color: '#f3f4f6'
        }
      ]
    }
  ]
};

export const BAY_ISLANDS_BOUNDS = {
  north: 16.5,
  south: 16.0,
  east: -85.8,
  west: -86.9
};
