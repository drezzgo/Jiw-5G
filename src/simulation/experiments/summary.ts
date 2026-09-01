import { ratio } from "../metrics/formulas";
import type { MmtcComparisonResult } from "../mmtc/types";
import type { UrllcComparisonResult } from "../urlcc/types";
import type { ScenarioComparisonSummary } from "./types";

/**
 * Relative reduction where positive = PROPOSED is lower than BASELINE.
 * Returns null when BASELINE is zero because a relative percentage is undefined.
 */
export function relativeReduction(
  baseline: number,
  proposed: number,
): number | null {
  return baseline === 0 ? null : (baseline - proposed) / baseline;
}

export function nullableRelativeReduction(
  baseline: number | null,
  proposed: number | null,
): number | null {
  if (baseline === null || proposed === null || baseline === 0) return null;
  return (baseline - proposed) / baseline;
}

export function calculateScenarioSummary(
  mmtc: MmtcComparisonResult,
  urllc: UrllcComparisonResult,
): ScenarioComparisonSummary {
  const baselineDeliveryRate = ratio(
    urllc.baseline.metrics.deliveredAlerts,
    urllc.baseline.metrics.criticalEvents,
  );
  const proposedDeliveryRate = ratio(
    urllc.proposed.metrics.deliveredAlerts,
    urllc.proposed.metrics.criticalEvents,
  );

  return {
    mmtc: {
      transmissionReduction: relativeReduction(
        mmtc.baseline.metrics.transmittedMessages,
        mmtc.proposed.metrics.transmittedMessages,
      ),
      physicalAttemptReduction: relativeReduction(
        mmtc.baseline.metrics.physicalTransmissionAttempts,
        mmtc.proposed.metrics.physicalTransmissionAttempts,
      ),
      collisionReduction: relativeReduction(
        mmtc.baseline.metrics.collisions,
        mmtc.proposed.metrics.collisions,
      ),
      energyProxyReduction: relativeReduction(
        mmtc.baseline.metrics.energyProxy,
        mmtc.proposed.metrics.energyProxy,
      ),
      successRateChange:
        mmtc.proposed.metrics.successRate - mmtc.baseline.metrics.successRate,
      channelUtilizationChange:
        mmtc.proposed.metrics.channelUtilization -
        mmtc.baseline.metrics.channelUtilization,
    },
    urllc: {
      deliveryRateChange: proposedDeliveryRate - baselineDeliveryRate,
      reliabilityChange:
        urllc.proposed.metrics.reliability - urllc.baseline.metrics.reliability,
      meanLatencyReduction: nullableRelativeReduction(
        urllc.baseline.metrics.latencyMean,
        urllc.proposed.metrics.latencyMean,
      ),
      p95LatencyReduction: nullableRelativeReduction(
        urllc.baseline.metrics.p95,
        urllc.proposed.metrics.p95,
      ),
      lostAlertsAvoided:
        urllc.baseline.metrics.lostAlerts - urllc.proposed.metrics.lostAlerts,
      redundancyOverheadIncrease:
        urllc.proposed.metrics.redundancyOverhead -
        urllc.baseline.metrics.redundancyOverhead,
      physicalCopiesIncrease:
        urllc.baseline.metrics.physicalCopiesSent === 0
          ? null
          : (urllc.proposed.metrics.physicalCopiesSent -
              urllc.baseline.metrics.physicalCopiesSent) /
            urllc.baseline.metrics.physicalCopiesSent,
    },
  };
}
