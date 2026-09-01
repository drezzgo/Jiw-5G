import { describe, expect, it, vi, afterEach } from "vitest";
import { DEFAULT_TRAFFIC_MAPPING_CONFIG } from "../../traffic/mapping";
import { TomTomTrafficProvider } from "../../traffic/providers/TomTomTrafficProvider";
import {
  buildTomTomIncidentBoundingBox,
  buildTomTomReplayCapture,
  buildTomTomTrafficSnapshot,
  parseTomTomFlowResponse,
  validateTomTomPoint,
} from "../../traffic/tomtom";

const point = { latitude: 4.6, longitude: -74.08 };
const flowResponse = {
  flowSegmentData: {
    currentSpeed: 15,
    freeFlowSpeed: 40,
    currentTravelTime: 120,
    freeFlowTravelTime: 70,
    confidence: 0.91,
    roadClosure: false,
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FASE 7 - LIVE TomTom", () => {
  it("valida coordenadas WGS84 y rechaza valores fuera de rango", () => {
    expect(validateTomTomPoint(point)).toEqual(point);
    expect(() => validateTomTomPoint({ latitude: 91, longitude: 0 })).toThrow();
    expect(() => validateTomTomPoint({ latitude: 0, longitude: -181 })).toThrow();
  });

  it("interpreta los campos documentados del Flow Segment Data response", () => {
    expect(parseTomTomFlowResponse(flowResponse)).toEqual({
      currentSpeedKmh: 15,
      freeFlowSpeedKmh: 40,
      currentTravelTimeSeconds: 120,
      freeFlowTravelTimeSeconds: 70,
      confidence: 0.91,
      roadClosure: false,
    });
  });

  it("construye un bounding box de incidentes que contiene el punto", () => {
    const [minLon, minLat, maxLon, maxLat] = buildTomTomIncidentBoundingBox(point).split(",").map(Number);
    expect(minLon).toBeLessThan(point.longitude);
    expect(maxLon).toBeGreaterThan(point.longitude);
    expect(minLat).toBeLessThan(point.latitude);
    expect(maxLat).toBeGreaterThan(point.latitude);
  });

  it("convierte datos TomTom en un TrafficSnapshot LIVE disponible", () => {
    const snapshot = buildTomTomTrafficSnapshot(parseTomTomFlowResponse(flowResponse), 2, "2026-09-01T18:00:00Z");
    expect(snapshot.source).toBe("LIVE");
    expect(snapshot.available).toBe(true);
    expect(snapshot.currentSpeedKmh).toBe(15);
    expect(snapshot.incidents).toBe(2);
  });

  it("una captura LIVE puede guardarse como Replay TOMTOM sin cambiar el mapping", () => {
    const snapshot = buildTomTomTrafficSnapshot(parseTomTomFlowResponse(flowResponse), 1, "2026-09-01T18:00:00Z");
    const replay = buildTomTomReplayCapture(snapshot, DEFAULT_TRAFFIC_MAPPING_CONFIG, point);
    expect(replay.capture.originalProvider).toBe("TOMTOM");
    expect(replay.traffic.currentSpeedKmh).toBe(15);
    expect(replay.mapping).toEqual(DEFAULT_TRAFFIC_MAPPING_CONFIG);
    expect(replay.mapping).not.toBe(DEFAULT_TRAFFIC_MAPPING_CONFIG);
  });

  it("TomTomTrafficProvider consume solo /api/traffic y preserva el contrato TrafficDataProvider", async () => {
    const snapshot = buildTomTomTrafficSnapshot(parseTomTomFlowResponse(flowResponse), null, "2026-09-01T18:00:00Z");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new TomTomTrafficProvider(point).getSnapshot();
    expect(result).toEqual(snapshot);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain("/api/traffic?");
    expect(requestedUrl).toContain("lat=4.6");
    expect(requestedUrl).toContain("lon=-74.08");
    expect(requestedUrl).not.toContain("key=");
  });

  it("si /api/traffic falla, el provider devuelve LIVE no disponible en vez de lanzar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));
    const result = await new TomTomTrafficProvider(point).getSnapshot();
    expect(result.source).toBe("LIVE");
    expect(result.available).toBe(false);
  });
});
