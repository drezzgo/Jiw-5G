import type { SimulationConfig } from "../core/types";
import type { MmtcComparisonResult } from "./types";
import { generateMmtcWorkload } from "./workload";
import { simulateMmtcStrategy } from "./simulate";

/** Runs BASELINE and PROPOSED over the exact same deterministic workload. */
export function runMmtcComparison(config: SimulationConfig): MmtcComparisonResult {
  const workload = generateMmtcWorkload(config);

  return {
    baseline: simulateMmtcStrategy(config, "BASELINE", workload),
    proposed: simulateMmtcStrategy(config, "PROPOSED", workload),
  };
}
