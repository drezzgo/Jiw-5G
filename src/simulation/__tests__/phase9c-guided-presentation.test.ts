import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIVE_LOCATION_PRESET,
  LIVE_LOCATION_PRESETS,
  coordinatesFromLivePreset,
  findLivePreset,
} from "../../traffic/livePresets";
import { isValidTomTomPoint } from "../../traffic/tomtom";

describe("FASE 9C · presets LIVE para sustentación", () => {
  it("incluye al menos tres puntos de Bogotá y todos son WGS84 válidos", () => {
    expect(LIVE_LOCATION_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of LIVE_LOCATION_PRESETS) {
      expect(isValidTomTomPoint({ latitude: preset.latitude, longitude: preset.longitude })).toBe(true);
    }
  });

  it("usa la Universidad Distrital como punto LIVE predeterminado", () => {
    expect(DEFAULT_LIVE_LOCATION_PRESET.id).toBe("udistrital-tecnologica");
    expect(DEFAULT_LIVE_LOCATION_PRESET.latitude).toBeCloseTo(4.580456693482892, 12);
    expect(DEFAULT_LIVE_LOCATION_PRESET.longitude).toBeCloseTo(-74.15738921821736, 12);
  });

  it("no repite identificadores", () => {
    const ids = LIVE_LOCATION_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puede convertir un preset a formulario y reconocerlo nuevamente", () => {
    const preset = LIVE_LOCATION_PRESETS[1];
    const draft = coordinatesFromLivePreset(preset);
    expect(findLivePreset(draft.latitude, draft.longitude)?.id).toBe(preset.id);
  });
});
