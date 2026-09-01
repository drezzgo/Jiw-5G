import { describe, expect, it } from "vitest";
import {
  descriptiveStats,
  generateReplicationSeeds,
  runReplicatedExperiments,
} from "../experiments/replications";
import {
  serializeReplicationsAggregateCsv,
  serializeReplicationsJson,
  serializeReplicationsRawCsv,
  toReplicationsPortableObject,
} from "../experiments/replicationExport";

describe("Phase 9B.2 replicated experiments", () => {
  it("generates deterministic consecutive replication seeds", () => {
    expect(generateReplicationSeeds(100, 4)).toEqual([100, 101, 102, 103]);
  });

  it("calculates descriptive statistics with sample standard deviation", () => {
    const stats = descriptiveStats([1, 2, 3, 4]);
    expect(stats.count).toBe(4);
    expect(stats.mean).toBe(2.5);
    expect(stats.median).toBe(2.5);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(4);
    expect(stats.sampleStdDev).toBeCloseTo(1.2909944487, 8);
  });

  it("is reproducible for the same options and fixed executedAt", () => {
    const options = {
      scenarioIds: ["SCENARIO_HIGH_DENSITY"] as const,
      sensorCounts: [50, 100],
      baseSeed: 12345,
      replications: 2,
      executedAt: "2026-09-01T00:00:00.000Z",
    };
    expect(runReplicatedExperiments(options)).toEqual(runReplicatedExperiments(options));
  });

  it("creates one run per scenario, sensor count and seed", () => {
    const result = runReplicatedExperiments({
      scenarioIds: ["SCENARIO_HIGH_DENSITY", "SCENARIO_CONGESTION_CRITICAL"],
      sensorCounts: [50, 100],
      baseSeed: 7,
      replications: 2,
      executedAt: "fixed",
    });
    expect(result.runs).toHaveLength(8);
    expect(result.aggregates).toHaveLength(4);
  });

  it("preserves the baseline/proposed advantage direction for mMTC high density in the tested configuration", () => {
    const result = runReplicatedExperiments({
      scenarioIds: ["SCENARIO_HIGH_DENSITY"],
      sensorCounts: [300],
      baseSeed: 12345,
      replications: 3,
      executedAt: "fixed",
    });
    const aggregate = result.aggregates[0];
    expect(aggregate.mmtc.transmittedMessages.proposed.mean!).toBeLessThan(aggregate.mmtc.transmittedMessages.baseline.mean!);
    expect(aggregate.mmtc.energyProxy.proposed.mean!).toBeLessThan(aggregate.mmtc.energyProxy.baseline.mean!);
  });

  it("exports two raw rows per simulation run", () => {
    const result = runReplicatedExperiments({
      scenarioIds: ["SCENARIO_NORMAL"],
      baseSeed: 1,
      replications: 2,
      executedAt: "fixed",
    });
    const lines = serializeReplicationsRawCsv(result).trim().split("\n");
    expect(lines).toHaveLength(1 + result.runs.length * 2);
  });

  it("exports one aggregate row per scenario/sensor group", () => {
    const result = runReplicatedExperiments({
      scenarioIds: ["SCENARIO_HIGH_DENSITY"],
      sensorCounts: [50, 100],
      baseSeed: 1,
      replications: 2,
      executedAt: "fixed",
    });
    const lines = serializeReplicationsAggregateCsv(result).trim().split("\n");
    expect(lines).toHaveLength(1 + result.aggregates.length);
  });

  it("exports replicated JSON without massive per-message logs", () => {
    const result = runReplicatedExperiments({
      scenarioIds: ["SCENARIO_HIGH_DENSITY"],
      sensorCounts: [300],
      baseSeed: 12345,
      replications: 2,
      executedAt: "fixed",
    });
    const portable = toReplicationsPortableObject(result);
    const json = serializeReplicationsJson(result);
    const parsed = JSON.parse(json);

    expect(portable.logsIncluded).toBe(false);
    expect(parsed.runs).toHaveLength(result.runs.length);
    expect(parsed.runs[0].result.mmtc.baseline.logs).toBeUndefined();
    expect(parsed.runs[0].result.urllc.proposed.logs).toBeUndefined();
    expect(parsed.runs[0].result.mmtc.baseline.metrics).toEqual(result.runs[0].result.mmtc.baseline.metrics);
    expect(parsed.aggregates).toEqual(result.aggregates);
  });

});
