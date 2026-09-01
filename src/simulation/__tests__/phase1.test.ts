import { describe, expect, it } from "vitest";
import { SimulationEngine } from "../core/engine";
import { createScenario } from "../scenarios/scenarios";
import { evaluateRisk } from "../risk/evaluateRisk";

const fixedTime = "2026-09-01T00:00:00.000Z";

describe("Phase 1 deterministic engine", () => {
  it("same seed + same config produces exactly the same logs and metrics", () => {
    const config = createScenario("SCENARIO_NORMAL", { seed: 12345 });
    const engine = new SimulationEngine();
    const first = engine.run(config, { executedAt: fixedTime });
    const second = engine.run(config, { executedAt: fixedTime });
    expect(second).toEqual(first);
  });

  it("different seeds change the generated observation stream", () => {
    const engine = new SimulationEngine();
    const a = engine.run(createScenario("SCENARIO_NORMAL", { seed: 1 }), { executedAt: fixedTime });
    const b = engine.run(createScenario("SCENARIO_NORMAL", { seed: 2 }), { executedAt: fixedTime });
    expect(b.logs).not.toEqual(a.logs);
  });

  it("critical condition requires pedestrian + approaching vehicle + risk above threshold", () => {
    const config = createScenario("SCENARIO_NORMAL").risk;
    expect(evaluateRisk({ timestampMs: 0, pedestrianPresent: true, vehicleApproaching: true, estimatedRisk: 0.9 }, config).critical).toBe(true);
    expect(evaluateRisk({ timestampMs: 0, pedestrianPresent: false, vehicleApproaching: true, estimatedRisk: 0.9 }, config).critical).toBe(false);
    expect(evaluateRisk({ timestampMs: 0, pedestrianPresent: true, vehicleApproaching: true, estimatedRisk: 0.2 }, config).critical).toBe(false);
  });
});
