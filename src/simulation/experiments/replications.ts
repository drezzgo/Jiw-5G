import type { ScenarioId, Strategy } from "../core/types";
import { createScenario, scenarioIds as allScenarioIds } from "../scenarios/scenarios";
import { runScenarioExperiment } from "./run";
import type { ScenarioExperimentResult } from "./types";

export interface DescriptiveStats {
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  sampleStdDev: number | null;
}

export interface AggregatedMetric {
  baseline: DescriptiveStats;
  proposed: DescriptiveStats;
  /** Mean(BASELINE) - Mean(PROPOSED). Positive means PROPOSED is lower. */
  meanDifference: number | null;
  /** (Mean(BASELINE) - Mean(PROPOSED)) / Mean(BASELINE). Null when baseline mean is zero/unavailable. */
  relativeReduction: number | null;
}

export interface ReplicationAggregate {
  scenarioId: ScenarioId;
  sensorCount: number;
  replications: number;
  mmtc: {
    transmittedMessages: AggregatedMetric;
    collisions: AggregatedMetric;
    energyProxy: AggregatedMetric;
    successRate: AggregatedMetric;
  };
  urllc: {
    latencyMean: AggregatedMetric;
    reliability: AggregatedMetric;
    lostAlerts: AggregatedMetric;
    redundancyOverhead: AggregatedMetric;
  };
}

export interface ReplicatedExperimentRun {
  scenarioId: ScenarioId;
  sensorCount: number;
  seed: number;
  result: ScenarioExperimentResult;
}

export interface ReplicatedExperimentResult {
  metadata: {
    executedAt: string;
    baseSeed: number;
    replications: number;
    totalRuns: number;
    trafficSource: string;
  };
  options: {
    scenarioIds: readonly ScenarioId[];
    sensorCounts: readonly number[] | null;
    seeds: readonly number[];
  };
  runs: ReplicatedExperimentRun[];
  aggregates: ReplicationAggregate[];
}

export interface ReplicatedExperimentOptions {
  scenarioIds?: readonly ScenarioId[];
  /** If omitted, each scenario uses its own configured sensorCount. */
  sensorCounts?: readonly number[];
  baseSeed?: number;
  replications?: number;
  executedAt?: string;
  trafficSource?: string;
}

export const CORE_EXPERIMENT_SCENARIOS = allScenarioIds;
export const SCALABILITY_SCENARIOS: readonly ScenarioId[] = [
  "SCENARIO_HIGH_DENSITY",
  "SCENARIO_CONGESTION_CRITICAL",
];
export const DEFAULT_SCALABILITY_SENSOR_COUNTS = [50, 100, 200, 300, 500, 750, 1000] as const;

export function generateReplicationSeeds(baseSeed: number, replications: number): number[] {
  const count = Math.max(1, Math.trunc(replications));
  const start = Math.trunc(baseSeed);
  return Array.from({ length: count }, (_, index) => start + index);
}

export function descriptiveStats(values: readonly number[]): DescriptiveStats {
  const finite = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (finite.length === 0) {
    return { count: 0, mean: null, median: null, min: null, max: null, sampleStdDev: null };
  }
  const mean = finite.reduce((sum, value) => sum + value, 0) / finite.length;
  const middle = Math.floor(finite.length / 2);
  const median = finite.length % 2 === 0
    ? (finite[middle - 1] + finite[middle]) / 2
    : finite[middle];
  const sampleStdDev = finite.length > 1
    ? Math.sqrt(finite.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (finite.length - 1))
    : 0;
  return {
    count: finite.length,
    mean,
    median,
    min: finite[0],
    max: finite[finite.length - 1],
    sampleStdDev,
  };
}

function aggregateMetric(baselineValues: readonly number[], proposedValues: readonly number[]): AggregatedMetric {
  const baseline = descriptiveStats(baselineValues);
  const proposed = descriptiveStats(proposedValues);
  const meanDifference = baseline.mean === null || proposed.mean === null
    ? null
    : baseline.mean - proposed.mean;
  const relativeReduction = baseline.mean === null || proposed.mean === null || baseline.mean === 0
    ? null
    : (baseline.mean - proposed.mean) / baseline.mean;
  return { baseline, proposed, meanDifference, relativeReduction };
}

function metricValues(
  runs: readonly ReplicatedExperimentRun[],
  strategy: Strategy,
  selector: (result: ScenarioExperimentResult, strategy: Strategy) => number | null,
): number[] {
  return runs
    .map((run) => selector(run.result, strategy))
    .filter((value): value is number => value !== null && Number.isFinite(value));
}

function aggregateGroup(runs: readonly ReplicatedExperimentRun[]): ReplicationAggregate {
  const first = runs[0];
  if (!first) throw new Error("Cannot aggregate an empty replication group.");
  const metric = (selector: (result: ScenarioExperimentResult, strategy: Strategy) => number | null) =>
    aggregateMetric(metricValues(runs, "BASELINE", selector), metricValues(runs, "PROPOSED", selector));
  return {
    scenarioId: first.scenarioId,
    sensorCount: first.sensorCount,
    replications: runs.length,
    mmtc: {
      transmittedMessages: metric((result, strategy) => result.mmtc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.transmittedMessages),
      collisions: metric((result, strategy) => result.mmtc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.collisions),
      energyProxy: metric((result, strategy) => result.mmtc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.energyProxy),
      successRate: metric((result, strategy) => result.mmtc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.successRate),
    },
    urllc: {
      latencyMean: metric((result, strategy) => result.urllc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.latencyMean),
      reliability: metric((result, strategy) => result.urllc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.reliability),
      lostAlerts: metric((result, strategy) => result.urllc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.lostAlerts),
      redundancyOverhead: metric((result, strategy) => result.urllc[strategy === "BASELINE" ? "baseline" : "proposed"].metrics.redundancyOverhead),
    },
  };
}

export function runReplicatedExperiments(
  options: ReplicatedExperimentOptions = {},
): ReplicatedExperimentResult {
  const selectedScenarios = options.scenarioIds ?? CORE_EXPERIMENT_SCENARIOS;
  const baseSeed = Math.trunc(options.baseSeed ?? 12345);
  const replications = Math.max(1, Math.trunc(options.replications ?? 5));
  const seeds = generateReplicationSeeds(baseSeed, replications);
  const executedAt = options.executedAt ?? new Date().toISOString();
  const trafficSource = options.trafficSource ?? "SYNTHETIC:REPLICATED_EXPERIMENT";
  const sensorCounts = options.sensorCounts?.map((value) => Math.max(1, Math.trunc(value))) ?? null;
  if (selectedScenarios.length === 0) throw new Error("At least one scenario is required.");
  if (sensorCounts && sensorCounts.length === 0) throw new Error("sensorCounts cannot be empty when provided.");

  const runs: ReplicatedExperimentRun[] = [];
  for (const scenarioId of selectedScenarios) {
    const defaultConfig = createScenario(scenarioId);
    const counts = sensorCounts ?? [defaultConfig.sensorCount];
    for (const sensorCount of counts) {
      for (const seed of seeds) {
        const config = createScenario(scenarioId, { seed, sensorCount });
        runs.push({
          scenarioId,
          sensorCount,
          seed,
          result: runScenarioExperiment(config, { executedAt, trafficSource }),
        });
      }
    }
  }

  const grouped = new Map<string, ReplicatedExperimentRun[]>();
  for (const run of runs) {
    const key = `${run.scenarioId}:${run.sensorCount}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(run);
    grouped.set(key, bucket);
  }

  return {
    metadata: { executedAt, baseSeed, replications, totalRuns: runs.length, trafficSource },
    options: { scenarioIds: selectedScenarios, sensorCounts, seeds },
    runs,
    aggregates: Array.from(grouped.values()).map(aggregateGroup),
  };
}
