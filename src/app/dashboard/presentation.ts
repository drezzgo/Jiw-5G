import type { ScenarioExperimentResult, ExperimentMatrixResult } from "../../simulation/experiments/types";
import type { TrafficLevel } from "../../simulation/core/types";
import type { UrllcLogEntry } from "../../simulation/urlcc/types";
import type { TrafficSnapshot } from "../../traffic/types";

export interface RouteDisplay {
  route: "A" | "B";
  status: "DELIVERED" | "LOST" | "NOT_SENT";
  latencyMs: number | null;
}

export interface CriticalAlertDisplay {
  alertId: string;
  generatedAtMs: number;
  estimatedRisk: number;
  threshold: number;
  routeA: RouteDisplay;
  routeB: RouteDisplay;
  firstValidRoute: "A" | "B" | null;
  latencyMs: number | null;
  delivered: boolean;
  withinThreshold: boolean;
}

/**
 * Presentation-only synthetic traffic context for Phase 5.
 * These values are illustrative DEMO fixtures. They are not TomTom readings,
 * are not 3GPP parameters, and do not feed the simulation engine.
 */
export function buildDemoTrafficSnapshot(
  level: TrafficLevel,
  timestamp: string,
): TrafficSnapshot {
  const currentSpeedByLevel: Record<TrafficLevel, number> = {
    LOW: 34,
    MEDIUM: 24,
    HIGH: 14,
  };

  return {
    source: "DEMO",
    timestamp,
    currentSpeedKmh: currentSpeedByLevel[level],
    freeFlowSpeedKmh: 40,
    currentTravelTimeSeconds: null,
    freeFlowTravelTimeSeconds: null,
    congestionLevel: level,
    incidents: null,
    available: true,
  };
}

function numberPayload(log: UrllcLogEntry | undefined, key: string): number | null {
  if (!log) return null;
  const value = log.payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function routeDisplay(logs: readonly UrllcLogEntry[], route: "A" | "B"): RouteDisplay {
  const lost = logs.find((entry) => entry.route === route && entry.type === "ROUTE_LOST");
  if (lost) return { route, status: "LOST", latencyMs: null };

  const delivered = logs.find(
    (entry) => entry.route === route && entry.type === "ROUTE_DELIVERED",
  );
  if (delivered) {
    return {
      route,
      status: "DELIVERED",
      latencyMs: numberPayload(delivered, "totalLatencyMs"),
    };
  }

  return { route, status: "NOT_SENT", latencyMs: null };
}

/** Extracts the latest PROPOSED logical alert directly from URLLC logs. */
export function buildLatestCriticalAlert(
  result: ScenarioExperimentResult,
): CriticalAlertDisplay | null {
  const logs = result.urllc.proposed.logs;
  const generated = [...logs].reverse().find((entry) => entry.type === "ALERT_GENERATED");
  if (!generated) return null;

  const alertLogs = logs.filter((entry) => entry.alertId === generated.alertId);
  const delivered = alertLogs.find((entry) => entry.type === "ALERT_DELIVERED");

  const firstRoute = delivered?.payload.firstValidRoute;
  const firstValidRoute = firstRoute === "A" || firstRoute === "B" ? firstRoute : null;

  return {
    alertId: generated.alertId,
    generatedAtMs: generated.timestampMs,
    estimatedRisk: numberPayload(generated, "estimatedRisk") ?? 0,
    threshold: result.config.risk.threshold,
    routeA: routeDisplay(alertLogs, "A"),
    routeB: routeDisplay(alertLogs, "B"),
    firstValidRoute,
    latencyMs: numberPayload(delivered, "latencyMs"),
    delivered: delivered !== undefined,
    withinThreshold: delivered?.payload.withinThreshold === true,
  };
}

/** Wraps one exact scenario execution in the Phase-4 export schema. */
export function toSingleScenarioMatrix(
  result: ScenarioExperimentResult,
): ExperimentMatrixResult {
  return {
    metadata: {
      executedAt: result.metadata.executedAt,
      simulatorVersion: result.metadata.simulatorVersion,
      seed: result.metadata.seed,
      mode: result.metadata.mode,
      trafficSource: result.metadata.trafficSource,
    },
    scenarios: [result],
  };
}
