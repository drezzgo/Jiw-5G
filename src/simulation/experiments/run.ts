import type { SimulationConfig } from "../core/types";
import { runMmtcComparison } from "../mmtc/compare";
import { runUrllcComparison } from "../urlcc/compare";
import { calculateScenarioSummary } from "./summary";
import type { ScenarioExperimentResult } from "./types";

export interface ScenarioExperimentOptions {
  /** Injectable for reproducible tests/exports; it does not affect simulation randomness. */
  executedAt?: string;
  /** Human-readable source label. DEMO defaults to SYNTHETIC. */
  trafficSource?: string;
}

/** Runs the complete Phase-4 comparison for one scenario. */
export function runScenarioExperiment(
  config: SimulationConfig,
  options: ScenarioExperimentOptions = {},
): ScenarioExperimentResult {
  const mmtc = runMmtcComparison(config);
  const urllc = runUrllcComparison(config);
  const executedAt = options.executedAt ?? new Date().toISOString();
  const trafficSource = options.trafficSource ?? defaultTrafficSource(config.mode);

  return {
    metadata: {
      executedAt,
      seed: config.seed,
      scenarioId: config.scenarioId,
      mode: config.mode,
      simulatorVersion: config.simulatorVersion,
      trafficSource,
    },
    config,
    mmtc,
    urllc,
    summary: calculateScenarioSummary(mmtc, urllc),
  };
}

function defaultTrafficSource(mode: SimulationConfig["mode"]): string {
  switch (mode) {
    case "DEMO":
      return "SYNTHETIC";
    case "REPLAY":
      return "REPLAY_FILE";
    case "LIVE":
      return "LIVE_EXTERNAL";
  }
}
