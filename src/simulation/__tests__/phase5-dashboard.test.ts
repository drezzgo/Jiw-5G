import { describe, expect, it } from "vitest";
import { buildDemoTrafficSnapshot, buildLatestCriticalAlert, toSingleScenarioMatrix } from "../../app/dashboard/presentation";
import { serializeExperimentCsv } from "../experiments/export";
import { runScenarioExperiment } from "../experiments/run";
import { createScenario } from "../scenarios/scenarios";

const fixedTime = "2026-09-01T13:00:00.000Z";

describe("FASE 5 - dashboard presentation contract", () => {
  it("derives the latest critical alert directly from PROPOSED URLLC logs", () => {
    const result = runScenarioExperiment(createScenario("SCENARIO_ROUTE_FAILURE"), {
      executedAt: fixedTime,
    });
    const alert = buildLatestCriticalAlert(result);
    expect(alert).not.toBeNull();
    expect(alert?.estimatedRisk).toBeGreaterThan(result.config.risk.threshold);
    expect(alert?.delivered).toBe(true);
    expect(["A", "B"]).toContain(alert?.firstValidRoute);
  });

  it("keeps the dashboard export exactly tied to the displayed scenario result", () => {
    const result = runScenarioExperiment(createScenario("SCENARIO_HIGH_DENSITY"), {
      executedAt: fixedTime,
    });
    const matrix = toSingleScenarioMatrix(result);
    expect(matrix.scenarios).toEqual([result]);
    const csv = serializeExperimentCsv(matrix);
    expect(csv.split("\n")).toHaveLength(3);
    expect(csv).toContain("SCENARIO_HIGH_DENSITY");
  });

  it("labels Phase-5 traffic context as synthetic DEMO data", () => {
    const traffic = buildDemoTrafficSnapshot("HIGH", fixedTime);
    expect(traffic.source).toBe("DEMO");
    expect(traffic.congestionLevel).toBe("HIGH");
    expect(traffic.available).toBe(true);
    expect(traffic.currentSpeedKmh).not.toBeNull();
  });
});
