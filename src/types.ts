export type CelestialBodyId = 'moon' | 'mars' | 'venus' | 'io' | 'titan';

export type SurfaceMode = 'natural' | 'radar_surface' | 'infrared_surface';

export interface SurfaceFeature {
  id: string;
  name: string;
  type: 'crater' | 'volcano' | 'canyon' | 'plain' | 'landing_site' | 'mountain' | 'sea';
  lat: number; // degrees -90 to +90
  lon: number; // degrees -180 to +180
  description: string;
  significance: string;
  missionConnection?: string;
  elevationOrDepth?: string;
}

export interface InternalLayer {
  name: string;
  depth: string;
  composition: string;
  color: string;
  radiusPercent: number; // 0 to 1
  description: string;
}

export interface CelestialBodyData {
  id: CelestialBodyId;
  name: string;
  subtitle: string;
  classification: string;
  parentBody: string;
  equatorialRadiusKm: number;
  relativeRadiusEarth: number; // Earth = 1.0
  relativeScaleDisplay: number; // normalized scale factor for visual comparison
  surfaceGravity: number; // m/s^2
  relativeGravityEarth: number;
  rotationPeriodHours: number;
  rotationPeriodDesc: string;
  isRetrograde: boolean;
  axialTiltDeg: number;
  meanTempC: number;
  surfacePressureBar: number;
  surfacePressureDesc: string;
  atmosphericComposition: { gas: string; percentage: string }[];
  colorHex: string;
  glowColorHex: string;
  hasAtmosphereGlow: boolean;
  atmosphereThickness: number;
  summary: string;
  geologyHighlights: string[];
  missions: string[];
  surfaceModesAvailable: { mode: SurfaceMode; label: string; description: string }[];
  features: SurfaceFeature[];
  internalLayers: InternalLayer[];
}

export type ViewMode = 'single' | 'lineup';
