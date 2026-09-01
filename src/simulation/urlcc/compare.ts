import type { SimulationConfig } from "../core/types";
import { simulateUrllcStrategy } from "./simulate";
import type { UrllcComparisonResult } from "./types";
import { generateUrllcWorkload } from "./workload";

/** Runs both URLLC strategies over the exact same deterministic events/routes. */
export function runUrllcComparison(config: SimulationConfig): UrllcComparisonResult {
  const workload = generateUrllcWorkload(config);

  return {
    baseline: simulateUrllcStrategy(config, "BASELINE", workload),
    proposed: simulateUrllcStrategy(config, "PROPOSED", workload),
  };
}
