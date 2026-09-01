import type { SimulationConfig, Strategy } from "../core/types";
import type { MmtcLogEntry, MmtcMetrics } from "./types";

/**
 * Derives all mMTC metrics from the detailed event log.
 * This is intentionally the single source of truth for metric calculation.
 */
export function calculateMmtcMetrics(
  config: SimulationConfig,
  strategy: Strategy,
  logs: readonly MmtcLogEntry[],
): MmtcMetrics {
  const totalSteps = Math.floor(config.durationMs / config.stepMs);
  const capacity = config.mmtc.channelCapacityPerStep;

  const generatedIds = new Set<string>();
  const transmittedIds = new Set<string>();
  const activeSensorSteps = new Set<string>();
  const attemptsByStep = new Map<number, number>();

  let avoidedTransmissions = 0;
  let collisions = 0;
  let retries = 0;
  let successfulMessages = 0;
  let failedMessages = 0;
  let physicalTransmissionAttempts = 0;

  for (const entry of logs) {
    switch (entry.type) {
      case "MESSAGE_GENERATED":
        generatedIds.add(entry.messageId);
        break;
      case "MESSAGE_AVOIDED":
        avoidedTransmissions += 1;
        break;
      case "TRANSMISSION_ATTEMPT": {
        transmittedIds.add(entry.messageId);
        physicalTransmissionAttempts += 1;
        if (entry.attempt > 1) retries += 1;
        activeSensorSteps.add(`${entry.sensorId}:${entry.step}`);
        attemptsByStep.set(entry.step, (attemptsByStep.get(entry.step) ?? 0) + 1);
        break;
      }
      case "COLLISION":
        collisions += 1;
        break;
      case "MESSAGE_DELIVERED":
        successfulMessages += 1;
        break;
      case "MESSAGE_FAILED":
        failedMessages += 1;
        break;
      case "RETRY_SCHEDULED":
        break;
    }
  }

  let simultaneousAttempts = 0;
  let occupiedCapacityUnits = 0;
  for (const attempts of attemptsByStep.values()) {
    if (attempts > capacity) simultaneousAttempts += attempts;
    occupiedCapacityUnits += Math.min(attempts, capacity);
  }

  const totalCapacityUnits = totalSteps * capacity;
  const totalSensorSteps = config.sensorCount * totalSteps;
  const idleSensorSteps = Math.max(0, totalSensorSteps - activeSensorSteps.size);

  const metrics: MmtcMetrics = {
    generatedMessages: generatedIds.size,
    transmittedMessages: transmittedIds.size,
    avoidedTransmissions,
    simultaneousAttempts,
    collisions,
    retries,
    successfulMessages,
    failedMessages,
    successRate: transmittedIds.size === 0 ? 0 : successfulMessages / transmittedIds.size,
    channelUtilization:
      totalCapacityUnits === 0 ? 0 : occupiedCapacityUnits / totalCapacityUnits,
    energyProxy:
      physicalTransmissionAttempts * config.mmtc.energyTxUnits +
      idleSensorSteps * config.mmtc.energyIdleUnits,
    physicalTransmissionAttempts,
  };

  if (strategy === "BASELINE" && metrics.avoidedTransmissions !== 0) {
    throw new Error("baseline must not avoid transmissions");
  }
  if (metrics.successfulMessages + metrics.failedMessages !== metrics.transmittedMessages) {
    throw new Error("mMTC accounting invariant violated: success + failure != transmitted");
  }
  if (
    strategy === "PROPOSED" &&
    metrics.generatedMessages !== metrics.transmittedMessages + metrics.avoidedTransmissions
  ) {
    throw new Error("mMTC accounting invariant violated: generated != transmitted + avoided");
  }

  return metrics;
}
