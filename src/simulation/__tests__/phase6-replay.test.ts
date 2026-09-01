import { describe, expect, it } from "vitest";
import { runScenarioExperiment } from "../experiments/run";
import { createScenario } from "../scenarios/scenarios";
import {
  DEFAULT_TRAFFIC_MAPPING_CONFIG,
  mapTrafficSnapshotToSimulationContext,
} from "../../traffic/mapping";
import { ReplayTrafficProvider } from "../../traffic/providers/ReplayTrafficProvider";
import { SyntheticTrafficProvider } from "../../traffic/providers/SyntheticTrafficProvider";
import { parseReplayJson, ReplayValidationError, validateReplayCapture } from "../../traffic/replay";
import type { ReplayCapture, TrafficSnapshot } from "../../traffic/types";

const capture: ReplayCapture = {
  schemaVersion: "1.0",
  capture: {
    id: "test-congestion",
    capturedAt: "2026-09-01T12:00:00-05:00",
    originalProvider: "SYNTHETIC",
  },
  traffic: {
    timestamp: "2026-09-01T12:00:00-05:00",
    currentSpeedKmh: 15,
    freeFlowSpeedKmh: 40,
    currentTravelTimeSeconds: 120,
    freeFlowTravelTimeSeconds: 70,
    congestionLevel: "HIGH",
    incidents: 1,
    available: true,
  },
  mapping: DEFAULT_TRAFFIC_MAPPING_CONFIG,
};

const fixedTime = "2026-09-01T18:00:00.000Z";

describe("FASE 6 - REPLAY", () => {
  it("parses a valid schema 1.0 Replay", () => {
    const parsed = parseReplayJson(JSON.stringify(capture));
    expect(parsed).toEqual(capture);
  });

  it("rejects invalid JSON and unsupported schema versions", () => {
    expect(() => parseReplayJson("{invalid")).toThrow(ReplayValidationError);
    expect(() => validateReplayCapture({ ...capture, schemaVersion: "2.0" })).toThrow(
      /Unsupported schemaVersion/,
    );
  });

  it("rejects invalid traffic values instead of silently correcting them", () => {
    expect(() => validateReplayCapture({
      ...capture,
      traffic: { ...capture.traffic, currentSpeedKmh: -1 },
    })).toThrow(/currentSpeedKmh/);
  });

  it("ReplayTrafficProvider exposes source=REPLAY and preserves stored values", async () => {
    const snapshot = await new ReplayTrafficProvider(capture).getSnapshot();
    expect(snapshot).toEqual({ ...capture.traffic, source: "REPLAY" });
  });

  it("does not mutate the original Replay when consumers mutate a returned snapshot", async () => {
    const provider = new ReplayTrafficProvider(capture);
    const snapshot = await provider.getSnapshot();
    snapshot.currentSpeedKmh = 999;
    const second = await provider.getSnapshot();
    expect(second.currentSpeedKmh).toBe(15);
    expect(capture.traffic.currentSpeedKmh).toBe(15);
  });

  it("maps the same traffic snapshot deterministically using stored assumptions", async () => {
    const snapshot = await new ReplayTrafficProvider(capture).getSnapshot();
    const first = mapTrafficSnapshotToSimulationContext(snapshot, capture.mapping, "MEDIUM");
    const second = mapTrafficSnapshotToSimulationContext(snapshot, capture.mapping, "MEDIUM");
    expect(first).toEqual(second);
    expect(first.trafficLevel).toBe("HIGH");
    expect(first.speedRatio).toBeCloseTo(0.375);
    expect(first.vehicleArrivalRate).toBe(0.75);
  });

  it("DEMO and REPLAY providers satisfy the same TrafficSnapshot contract", async () => {
    const demoSnapshot: TrafficSnapshot = {
      ...capture.traffic,
      source: "DEMO",
    };
    const demo = await new SyntheticTrafficProvider(demoSnapshot).getSnapshot();
    const replay = await new ReplayTrafficProvider(capture).getSnapshot();
    expect(Object.keys(replay).sort()).toEqual(Object.keys(demo).sort());
    expect(demo.source).toBe("DEMO");
    expect(replay.source).toBe("REPLAY");
  });

  it("same Replay + seed + parameters produces the same simulation result", async () => {
    const snapshot = await new ReplayTrafficProvider(capture).getSnapshot();
    const context = mapTrafficSnapshotToSimulationContext(snapshot, capture.mapping, "MEDIUM");
    const config = createScenario("SCENARIO_CRITICAL_EVENT", {
      seed: 12345,
      mode: "REPLAY",
      trafficLevel: context.trafficLevel,
      vehicleArrivalRate: context.vehicleArrivalRate,
    });
    const first = runScenarioExperiment(config, {
      executedAt: fixedTime,
      trafficSource: `REPLAY:${capture.capture.originalProvider}:${capture.capture.id}`,
    });
    const second = runScenarioExperiment(structuredClone(config), {
      executedAt: fixedTime,
      trafficSource: `REPLAY:${capture.capture.originalProvider}:${capture.capture.id}`,
    });
    expect(second).toEqual(first);
  });
});
