import type { ReplayCapture, TrafficMappingConfig, TrafficSnapshot } from "./types";

export interface TomTomPoint {
  latitude: number;
  longitude: number;
}

export interface TomTomFlowData {
  currentSpeedKmh: number;
  freeFlowSpeedKmh: number;
  currentTravelTimeSeconds: number;
  freeFlowTravelTimeSeconds: number;
  confidence: number | null;
  roadClosure: boolean | null;
}

export const TOMTOM_INCIDENT_RADIUS_METERS = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number.`);
  }
  return value;
}

function requireNonNegativeNumber(value: unknown, path: string): number {
  const parsed = requireFiniteNumber(value, path);
  if (parsed < 0) throw new Error(`${path} must be >= 0.`);
  return parsed;
}

export function isValidTomTomPoint(point: TomTomPoint): boolean {
  return Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude)
    && point.latitude >= -90
    && point.latitude <= 90
    && point.longitude >= -180
    && point.longitude <= 180;
}

export function validateTomTomPoint(point: TomTomPoint): TomTomPoint {
  if (!isValidTomTomPoint(point)) {
    throw new Error("Latitude must be between -90 and 90 and longitude between -180 and 180.");
  }
  return point;
}

export function buildTomTomIncidentBoundingBox(
  point: TomTomPoint,
  radiusMeters = TOMTOM_INCIDENT_RADIUS_METERS,
): string {
  validateTomTomPoint(point);
  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    throw new Error("Incident radius must be a finite number > 0.");
  }

  // Local WGS84 approximation used only to query nearby incident context.
  const metersPerDegreeLatitude = 111_320;
  const latitudeRadians = point.latitude * Math.PI / 180;
  const longitudeScale = Math.max(Math.cos(latitudeRadians), 0.01);
  const deltaLatitude = radiusMeters / metersPerDegreeLatitude;
  const deltaLongitude = radiusMeters / (metersPerDegreeLatitude * longitudeScale);

  const minLon = Math.max(-180, point.longitude - deltaLongitude);
  const minLat = Math.max(-90, point.latitude - deltaLatitude);
  const maxLon = Math.min(180, point.longitude + deltaLongitude);
  const maxLat = Math.min(90, point.latitude + deltaLatitude);
  return [minLon, minLat, maxLon, maxLat].join(",");
}

export function parseTomTomFlowResponse(value: unknown): TomTomFlowData {
  if (!isRecord(value) || !isRecord(value.flowSegmentData)) {
    throw new Error("TomTom response does not contain flowSegmentData.");
  }
  const flow = value.flowSegmentData;
  const confidence = flow.confidence === undefined || flow.confidence === null
    ? null
    : requireFiniteNumber(flow.confidence, "flowSegmentData.confidence");
  const roadClosure = typeof flow.roadClosure === "boolean" ? flow.roadClosure : null;

  return {
    currentSpeedKmh: requireNonNegativeNumber(flow.currentSpeed, "flowSegmentData.currentSpeed"),
    freeFlowSpeedKmh: requireNonNegativeNumber(flow.freeFlowSpeed, "flowSegmentData.freeFlowSpeed"),
    currentTravelTimeSeconds: requireNonNegativeNumber(flow.currentTravelTime, "flowSegmentData.currentTravelTime"),
    freeFlowTravelTimeSeconds: requireNonNegativeNumber(flow.freeFlowTravelTime, "flowSegmentData.freeFlowTravelTime"),
    confidence,
    roadClosure,
  };
}

export function parseTomTomIncidentCount(value: unknown): number | null {
  if (!isRecord(value)) return null;
  return Array.isArray(value.incidents) ? value.incidents.length : null;
}

export function unavailableLiveTrafficSnapshot(timestamp = new Date().toISOString()): TrafficSnapshot {
  return {
    source: "LIVE",
    timestamp,
    currentSpeedKmh: null,
    freeFlowSpeedKmh: null,
    currentTravelTimeSeconds: null,
    freeFlowTravelTimeSeconds: null,
    congestionLevel: "UNKNOWN",
    incidents: null,
    available: false,
  };
}

export function buildTomTomTrafficSnapshot(
  flow: TomTomFlowData,
  incidents: number | null,
  timestamp = new Date().toISOString(),
): TrafficSnapshot {
  return {
    source: "LIVE",
    timestamp,
    currentSpeedKmh: flow.currentSpeedKmh,
    freeFlowSpeedKmh: flow.freeFlowSpeedKmh,
    currentTravelTimeSeconds: flow.currentTravelTimeSeconds,
    freeFlowTravelTimeSeconds: flow.freeFlowTravelTimeSeconds,
    congestionLevel: "UNKNOWN",
    incidents,
    available: true,
  };
}

export function buildTomTomReplayCapture(
  snapshot: TrafficSnapshot,
  mapping: TrafficMappingConfig,
  point: TomTomPoint,
): ReplayCapture {
  if (snapshot.source !== "LIVE" || !snapshot.available) {
    throw new Error("Only an available LIVE snapshot can be exported as a TomTom replay.");
  }
  validateTomTomPoint(point);
  const safeTimestamp = snapshot.timestamp.replace(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, "");
  const { source: _source, ...storedTraffic } = snapshot;
  return {
    schemaVersion: "1.0",
    capture: {
      id: `tomtom-${safeTimestamp}`,
      capturedAt: snapshot.timestamp,
      originalProvider: "TOMTOM",
      description: `TomTom Traffic API capture for point ${point.latitude},${point.longitude}.`,
    },
    traffic: storedTraffic,
    mapping: structuredClone(mapping),
  };
}
