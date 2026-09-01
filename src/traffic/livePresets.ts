export interface LiveLocationPreset {
  latitude: number;
  longitude: number;
  id: string;
  name: string;
  shortName: string;
  description: string;
}

export const LIVE_LOCATION_PRESETS: readonly LiveLocationPreset[] = [
  {
    id: "udistrital-tecnologica",
    name: "Universidad Distrital · Sede Tecnológica",
    shortName: "Universidad Distrital",
    description: "Intersección de referencia del proyecto frente al entorno de la Sede Tecnológica, en Ciudad Bolívar.",
    latitude: 4.580456693482892,
    longitude: -74.15738921821736,
  },
  {
    id: "av68-americas",
    name: "Av. Carrera 68 × Av. de las Américas",
    shortName: "Av. 68 × Américas",
    description: "Cruce entre dos corredores arteriales de Bogotá y punto que ya fue utilizado para validar la consulta LIVE con TomTom.",
    latitude: 4.625802,
    longitude: -74.123718,
  },
  {
    id: "caracas-calle26",
    name: "Av. Caracas × Calle 26",
    shortName: "Caracas × Calle 26",
    description: "Intersección central de Bogotá que permite contrastar el contexto vial con los puntos del sur y occidente de la ciudad.",
    latitude: 4.6166596589073,
    longitude: -74.072168554136,
  },
] as const;

export const DEFAULT_LIVE_LOCATION_PRESET = LIVE_LOCATION_PRESETS[0];

export function findLivePreset(latitude: string, longitude: string): LiveLocationPreset | null {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return LIVE_LOCATION_PRESETS.find((preset) => (
    Math.abs(preset.latitude - lat) < 1e-9
    && Math.abs(preset.longitude - lon) < 1e-9
  )) ?? null;
}

export function coordinatesFromLivePreset(preset: LiveLocationPreset): { latitude: string; longitude: string } {
  return {
    latitude: String(preset.latitude),
    longitude: String(preset.longitude),
  };
}
