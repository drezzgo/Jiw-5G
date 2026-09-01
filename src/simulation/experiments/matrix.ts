import type { ScenarioId } from "../core/types";
import { createScenario, scenarioIds } from "../scenarios/scenarios";
import { runScenarioExperiment } from "./run";
import type { ExperimentMatrixResult } from "./types";

export interface ExperimentMatrixOptions {
  scenarioIds?: readonly ScenarioId[];
  seed?: number;
  executedAt?: string;
  trafficSource?: string;
}

/** Runs the selected scenarios with one shared seed and returns comparison-ready data. */
export function runExperimentMatrix(
  options: ExperimentMatrixOptions = {},
): ExperimentMatrixResult {
  const selected = options.scenarioIds ?? scenarioIds;
  const seed = options.seed ?? 12345;
  const executedAt = options.executedAt ?? new Date().toISOString();
  const scenarios = selected.map((scenarioId) =>
    runScenarioExperiment(createScenario(scenarioId, { seed }), {
      executedAt,
      trafficSource: options.trafficSource,
    }),
  );

  const first = scenarios[0];
  if (first === undefined) {
    throw new Error("experiment matrix requires at least one scenario");
  }

  return {
    metadata: {
      executedAt,
      simulatorVersion: first.config.simulatorVersion,
      seed,
      mode: first.config.mode,
      trafficSource: first.metadata.trafficSource,
    },
    scenarios,
  };
}
