import type { RiskConfig, RiskEvaluation, SensorObservation } from "../core/types";

export function evaluateRisk(
  observation: SensorObservation,
  config: RiskConfig,
): RiskEvaluation {
  const critical =
    observation.pedestrianPresent &&
    observation.vehicleApproaching &&
    observation.estimatedRisk > config.threshold;

  return {
    critical,
    reason: critical ? "CRITICAL_CONDITION_MET" : "NO_CRITICAL_CONDITION",
  };
}
