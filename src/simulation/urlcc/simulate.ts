import type { SimulationConfig, Strategy } from "../core/types";
import { calculateUrllcMetrics } from "./metrics";
import type {
  UrllcCriticalAlert,
  UrllcLogEntry,
  UrllcRouteSample,
  UrllcStrategyResult,
} from "./types";

interface ValidCopy {
  route: "A" | "B";
  totalLatencyMs: number;
  physicalLatencyMs: number;
  queueDelayMs: number;
}

/**
 * Simplified URLLC delivery model.
 *
 * BASELINE: Route A only + an explicit shared-queue delay.
 * PROPOSED: priority queue delay + simultaneous Route A/Route B copies.
 *
 * The route-loss/jitter outcome is pre-generated in the shared workload so
 * BASELINE and PROPOSED see the exact same Route-A physical realization.
 */
export function simulateUrllcStrategy(
  config: SimulationConfig,
  strategy: Strategy,
  workload: readonly UrllcCriticalAlert[],
): UrllcStrategyResult {
  const logs: UrllcLogEntry[] = [];
  let sequence = 0;

  const queueDelayMs =
    strategy === "BASELINE"
      ? config.urllc.baselineSharedQueueDelayMs
      : config.urllc.proposedPriorityQueueDelayMs;

  if (!Number.isFinite(queueDelayMs) || queueDelayMs < 0) {
    throw new Error("URLLC queue delay must be a finite number >= 0");
  }

  const emit = (
    alert: UrllcCriticalAlert,
    type: UrllcLogEntry["type"],
    route: UrllcLogEntry["route"],
    payload: Record<string, unknown> = {},
  ) => {
    logs.push({
      sequence: sequence++,
      timestampMs: alert.generatedAtMs,
      strategy,
      type,
      alertId: alert.id,
      route,
      payload,
    });
  };

  const processRoute = (
    alert: UrllcCriticalAlert,
    sample: UrllcRouteSample,
  ): ValidCopy | null => {
    if (!sample.enabled) return null;

    emit(alert, "ROUTE_ATTEMPT", sample.route, {
      physicalLatencyMs: sample.physicalLatencyMs,
      queueDelayMs,
    });

    if (sample.lostByChannel) {
      emit(alert, "ROUTE_LOST", sample.route, { reason: "PACKET_LOSS_MODEL" });
      return null;
    }

    if (sample.physicalLatencyMs === null) {
      throw new Error("enabled URLLC route must have physical latency");
    }

    const totalLatencyMs = sample.physicalLatencyMs + queueDelayMs;
    const copy: ValidCopy = {
      route: sample.route,
      totalLatencyMs,
      physicalLatencyMs: sample.physicalLatencyMs,
      queueDelayMs,
    };

    emit(alert, "ROUTE_DELIVERED", sample.route, {
      physicalLatencyMs: copy.physicalLatencyMs,
      queueDelayMs: copy.queueDelayMs,
      totalLatencyMs: copy.totalLatencyMs,
    });

    return copy;
  };

  for (const alert of workload) {
    emit(alert, "ALERT_GENERATED", null, {
      estimatedRisk: alert.estimatedRisk,
      latencyThresholdMs: config.urllc.latencyThresholdMs,
    });

    const routeSamples =
      strategy === "BASELINE" ? [alert.routeA] : [alert.routeA, alert.routeB];
    const validCopies = routeSamples
      .map((sample) => processRoute(alert, sample))
      .filter((copy): copy is ValidCopy => copy !== null)
      .sort(
        (a, b) =>
          a.totalLatencyMs - b.totalLatencyMs || (a.route === "A" ? -1 : 1),
      );

    const winner = validCopies[0];
    if (winner === undefined) {
      emit(alert, "ALERT_LOST", null, { reason: "NO_VALID_ROUTE_COPY" });
      continue;
    }

    const withinThreshold = winner.totalLatencyMs <= config.urllc.latencyThresholdMs;
    emit(alert, "ALERT_DELIVERED", winner.route, {
      firstValidRoute: winner.route,
      latencyMs: winner.totalLatencyMs,
      withinThreshold,
      latencyThresholdMs: config.urllc.latencyThresholdMs,
    });

    for (const copy of validCopies.slice(1)) {
      emit(alert, "COPY_DISCARDED", copy.route, {
        reason: "FIRST_VALID_COPY_ALREADY_SELECTED",
        firstValidRoute: winner.route,
        copyLatencyMs: copy.totalLatencyMs,
      });
    }
  }

  return {
    strategy,
    logs,
    metrics: calculateUrllcMetrics(logs),
  };
}
