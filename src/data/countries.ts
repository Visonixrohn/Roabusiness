/**
 * Lista de países de América Latina + otros mercados clave.
 * Nombre en español tal como se almacena en la base de datos.
 */
export const PAISES_LATAM: string[] = [
  "Honduras",
  "México",
  "Guatemala",
  "El Salvador",
  "Nicaragua",
  "Costa Rica",
  "Panamá",
  "Colombia",
  "Venezuela",
  "Ecuador",
  "Perú",
  "Bolivia",
  "Chile",
  "Argentina",
  "Uruguay",
  "Paraguay",
  "Brasil",
  "Cuba",
  "República Dominicana",
  "Puerto Rico",
  "Jamaica",
  "Haití",
  "Belice",
  "España",
  "Estados Unidos",
  "Canadá",
];

/** Mapeo de nombre de país (como devuelve BigDataCloud en español) → nombre canónico de la app */
export const COUNTRY_NAME_MAP: Record<string, string> = {
  // Variantes de nombres que BigDataCloud puede devolver
  "Mexico": "México",
  "México": "México",
  "Panama": "Panamá",
  "Panamá": "Panamá",
  "Peru": "Perú",
  "Perú": "Perú",
  "Colombia": "Colombia",
  "Venezuela": "Venezuela",
  "Ecuador": "Ecuador",
  "Bolivia": "Bolivia",
  "Chile": "Chile",
  "Argentina": "Argentina",
  "Uruguay": "Uruguay",
  "Paraguay": "Paraguay",
  "Brasil": "Brasil",
  "Brazil": "Brasil",
  "Cuba": "Cuba",
  "Dominican Republic": "República Dominicana",
  "República Dominicana": "República Dominicana",
  "Puerto Rico": "Puerto Rico",
  "Jamaica": "Jamaica",
  "Haiti": "Haití",
  "Haití": "Haití",
  "Belize": "Belice",
  "Belice": "Belice",
  "Guatemala": "Guatemala",
  "El Salvador": "El Salvador",
  "Nicaragua": "Nicaragua",
  "Costa Rica": "Costa Rica",
  "Honduras": "Honduras",
  "Spain": "España",
  "España": "España",
  "United States": "Estados Unidos",
  "Estados Unidos": "Estados Unidos",
  "Canada": "Canadá",
  "Canadá": "Canadá",
};

/**
 * Normaliza el nombre de país que devuelve la API al nombre canónico de la app.
 * Si no hay mapeo, devuelve el nombre tal cual.
 */
export function normalizeCountryName(raw: string): string {
  return COUNTRY_NAME_MAP[raw] ?? raw;
}
