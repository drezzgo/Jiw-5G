import type { SimulationConfig, Strategy } from "../core/types";
import { Mulberry32, deriveSeed } from "../random/prng";
import type {
  MmtcCandidateMessage,
  MmtcLogEntry,
  MmtcStrategyResult,
} from "./types";
import { calculateMmtcMetrics } from "./metrics";

interface QueuedMessage {
  message: MmtcCandidateMessage;
  retriesUsed: number;
}

function shuffled<T>(items: readonly T[], random: Mulberry32): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = random.integer(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Simplified mMTC contention model.
 *
 * Academic assumption: channelCapacityPerStep is the number of ordinary mMTC
 * transmissions that can be served in one simulation step. If demand exceeds
 * that capacity, the overflow attempts are counted as collisions/contention
 * failures. This is an abstraction of access congestion, not a 5G NR PHY/MAC
 * collision model.
 */
export function simulateMmtcStrategy(
  config: SimulationConfig,
  strategy: Strategy,
  workload: readonly MmtcCandidateMessage[],
): MmtcStrategyResult {
  const totalSteps = Math.floor(config.durationMs / config.stepMs);
  const capacity = config.mmtc.channelCapacityPerStep;

  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new Error("mmtc.channelCapacityPerStep must be a positive integer");
  }
  if (!Number.isInteger(config.mmtc.maxRetries) || config.mmtc.maxRetries < 0) {
    throw new Error("mmtc.maxRetries must be an integer >= 0");
  }
  if (
    !Number.isInteger(config.mmtc.backoffMinSteps) ||
    !Number.isInteger(config.mmtc.backoffMaxSteps) ||
    config.mmtc.backoffMinSteps < 1 ||
    config.mmtc.backoffMaxSteps < config.mmtc.backoffMinSteps
  ) {
    throw new Error("mmtc backoff range must satisfy 1 <= min <= max");
  }

  const random = new Mulberry32(deriveSeed(config.seed, `mmtc-${strategy.toLowerCase()}`));
  const logs: MmtcLogEntry[] = [];
  let sequence = 0;

  const emit = (
    step: number,
    type: MmtcLogEntry["type"],
    queued: QueuedMessage,
    payload: Record<string, unknown> = {},
  ) => {
    logs.push({
      sequence: sequence++,
      step,
      timestampMs: step * config.stepMs,
      strategy,
      type,
      messageId: queued.message.id,
      sensorId: queued.message.sensorId,
      attempt: queued.retriesUsed + 1,
      payload,
    });
  };

  const selected = workload.filter(
    (message) => strategy === "BASELINE" || message.exceptionRelevant,
  );
  const avoided = workload.filter(
    (message) => strategy === "PROPOSED" && !message.exceptionRelevant,
  );

  // Every strategy sees exactly the same candidate workload in its logs.
  for (const message of workload) {
    emit(message.generatedStep, "MESSAGE_GENERATED", { message, retriesUsed: 0 }, {
      exceptionRelevant: message.exceptionRelevant,
    });
  }
  for (const message of avoided) {
    emit(message.generatedStep, "MESSAGE_AVOIDED", { message, retriesUsed: 0 }, {
      reason: "NO_EXCEPTION_RELEVANT_CHANGE",
    });
  }

  const arrivals = new Map<number, QueuedMessage[]>();
  for (const message of selected) {
    const bucket = arrivals.get(message.generatedStep) ?? [];
    bucket.push({ message, retriesUsed: 0 });
    arrivals.set(message.generatedStep, bucket);
  }

  for (let step = 0; step < totalSteps; step += 1) {
    const attempts = arrivals.get(step) ?? [];
    if (attempts.length === 0) continue;

    for (const queued of attempts) {
      emit(step, "TRANSMISSION_ATTEMPT", queued, {
        channelDemand: attempts.length,
        channelCapacity: capacity,
      });
    }

    const randomized = shuffled(attempts, random);
    const delivered = randomized.slice(0, capacity);
    const collided = randomized.slice(capacity);

    for (const queued of delivered) {
      emit(step, "MESSAGE_DELIVERED", queued);
    }

    for (const queued of collided) {
      emit(step, "COLLISION", queued, {
        reason: "CHANNEL_CAPACITY_EXCEEDED",
      });

      if (queued.retriesUsed >= config.mmtc.maxRetries) {
        emit(step, "MESSAGE_FAILED", queued, { reason: "MAX_RETRIES_REACHED" });
        continue;
      }

      const delaySteps =
        strategy === "PROPOSED"
          ? random.integer(config.mmtc.backoffMinSteps, config.mmtc.backoffMaxSteps)
          : 1;
      const retryStep = step + delaySteps;
      const retried: QueuedMessage = {
        message: queued.message,
        retriesUsed: queued.retriesUsed + 1,
      };

      if (retryStep >= totalSteps) {
        emit(step, "MESSAGE_FAILED", queued, {
          reason: "SIMULATION_ENDED_BEFORE_RETRY",
          retryStep,
        });
        continue;
      }

      const retryBucket = arrivals.get(retryStep) ?? [];
      retryBucket.push(retried);
      arrivals.set(retryStep, retryBucket);
      emit(step, "RETRY_SCHEDULED", retried, {
        retryStep,
        delaySteps,
      });
    }
  }

  const metrics = calculateMmtcMetrics(config, strategy, logs);

  return { strategy, metrics, logs };
}
