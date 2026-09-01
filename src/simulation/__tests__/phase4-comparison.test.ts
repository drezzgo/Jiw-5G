import { describe, expect, it } from "vitest";
import { runMmtcComparison } from "../mmtc/compare";
import { createScenario, scenarioIds } from "../scenarios/scenarios";
import { runUrllcComparison } from "../urlcc/compare";
import { matrixToStrategyRows, serializeExperimentCsv } from "../experiments/export";
import { runExperimentMatrix } from "../experiments/matrix";
import { runScenarioExperiment } from "../experiments/run";
import { relativeReduction } from "../experiments/summary";

const fixedTime = "2026-09-01T12:00:00.000Z";

describe("FASE 4 - consolidated metrics and comparison", () => {
  it("is deterministic when seed, scenario and injected execution metadata are equal", () => {
    const config = createScenario("SCENARIO_CONGESTION_CRITICAL");
    const options = { executedAt: fixedTime };
    expect(runScenarioExperiment(config, options)).toEqual(
      runScenarioExperiment(config, options),
    );
  });

  it("contains exactly the same subsystem metrics as direct mMTC/URLLC runs", () => {
    const config = createScenario("SCENARIO_ROUTE_FAILURE");
    const combined = runScenarioExperiment(config, { executedAt: fixedTime });

    expect(combined.mmtc).toEqual(runMmtcComparison(config));
    expect(combined.urllc).toEqual(runUrllcComparison(config));
  });

  it("computes relative reduction with explicit zero-baseline handling", () => {
    expect(relativeReduction(100, 40)).toBeCloseTo(0.6);
    expect(relativeReduction(100, 120)).toBeCloseTo(-0.2);
    expect(relativeReduction(0, 0)).toBeNull();
  });

  it("shows the expected mMTC benefit direction under high density", () => {
    const result = runScenarioExperiment(createScenario("SCENARIO_HIGH_DENSITY"), {
      executedAt: fixedTime,
    });

    expect(result.summary.mmtc.transmissionReduction).not.toBeNull();
    expect(result.summary.mmtc.transmissionReduction!).toBeGreaterThan(0);
    expect(result.summary.mmtc.energyProxyReduction).not.toBeNull();
    expect(result.summary.mmtc.energyProxyReduction!).toBeGreaterThan(0);
    expect(result.mmtc.proposed.metrics.transmittedMessages).toBeLessThan(
      result.mmtc.baseline.metrics.transmittedMessages,
    );
  });

  it("shows the route-failure reliability benefit and redundancy cost separately", () => {
    const result = runScenarioExperiment(createScenario("SCENARIO_ROUTE_FAILURE"), {
      executedAt: fixedTime,
    });

    expect(result.summary.urllc.reliabilityChange).toBeGreaterThanOrEqual(0);
    expect(result.summary.urllc.redundancyOverheadIncrease).toBeGreaterThan(0);
    expect(result.urllc.proposed.metrics.reliability).toBeGreaterThanOrEqual(
      result.urllc.baseline.metrics.reliability,
    );
  });

  it("runs the complete five-scenario experimental matrix", () => {
    const matrix = runExperimentMatrix({ executedAt: fixedTime, seed: 12345 });
    expect(matrix.scenarios).toHaveLength(scenarioIds.length);
    expect(matrix.scenarios.map((item) => item.config.scenarioId)).toEqual(scenarioIds);
  });

  it("creates exactly two strategy rows per scenario and preserves source metrics", () => {
    const matrix = runExperimentMatrix({ executedAt: fixedTime });
    const rows = matrixToStrategyRows(matrix);
    expect(rows).toHaveLength(matrix.scenarios.length * 2);

    const routeFailure = matrix.scenarios.find(
      (item) => item.config.scenarioId === "SCENARIO_ROUTE_FAILURE",
    );
    if (!routeFailure) throw new Error("route failure scenario missing");

    const baselineRow = rows.find(
      (row) =>
        row.scenarioId === "SCENARIO_ROUTE_FAILURE" && row.strategy === "BASELINE",
    );
    expect(baselineRow?.mmtc).toEqual(routeFailure.mmtc.baseline.metrics);
    expect(baselineRow?.urllc).toEqual(routeFailure.urllc.baseline.metrics);
  });

  it("serializes a stable CSV table that matches the matrix row count", () => {
    const matrix = runExperimentMatrix({ executedAt: fixedTime });
    const csv = serializeExperimentCsv(matrix);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(1 + scenarioIds.length * 2);
    expect(lines[0]).toContain("mmtc.transmittedMessages");
    expect(lines[0]).toContain("urllc.reliability");
    expect(csv).not.toContain("[object Object]");
  });

  it("keeps all exported strategy metrics equal to log-derived subsystem metrics", () => {
    const matrix = runExperimentMatrix({ executedAt: fixedTime });
    const rows = matrixToStrategyRows(matrix);

    for (const scenario of matrix.scenarios) {
      for (const strategy of ["BASELINE", "PROPOSED"] as const) {
        const row = rows.find(
          (candidate) =>
            candidate.scenarioId === scenario.config.scenarioId &&
            candidate.strategy === strategy,
        );
        if (!row) throw new Error("strategy row missing");
        const mmtcResult =
          strategy === "BASELINE" ? scenario.mmtc.baseline : scenario.mmtc.proposed;
        const urllcResult =
          strategy === "BASELINE" ? scenario.urllc.baseline : scenario.urllc.proposed;
        expect(row.mmtc).toEqual(mmtcResult.metrics);
        expect(row.urllc).toEqual(urllcResult.metrics);
      }
    }
  });
});
