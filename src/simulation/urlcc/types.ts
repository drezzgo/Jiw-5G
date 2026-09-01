import type { Strategy } from "../core/types";

export type UrllcRouteId = "A" | "B";

/**
 * Physical route outcome generated once and shared by both strategies.
 * Queue/priority effects are deliberately NOT included here because they are
 * strategy-specific.
 */
export interface UrllcRouteSample {
  route: UrllcRouteId;
  enabled: boolean;
  lostByChannel: boolean;
  /** baseLatencyMs + deterministic uniform additive jitter in [0, jitterMs]. */
  physicalLatencyMs: number | null;
}

export interface UrllcCriticalAlert {
  id: string;
  eventIndex: number;
  generatedAtMs: number;
  estimatedRisk: number;
  routeA: UrllcRouteSample;
  routeB: UrllcRouteSample;
}

export type UrllcLogType =
  | "ALERT_GENERATED"
  | "ROUTE_ATTEMPT"
  | "ROUTE_LOST"
  | "ROUTE_DELIVERED"
  | "COPY_DISCARDED"
  | "ALERT_DELIVERED"
  | "ALERT_LOST";

export interface UrllcLogEntry {
  sequence: number;
  timestampMs: number;
  strategy: Strategy;
  type: UrllcLogType;
  alertId: string;
  route: UrllcRouteId | null;
  payload: Record<string, unknown>;
}

export interface UrllcMetrics {
  criticalEvents: number;
  deliveredAlerts: number;
  lostAlerts: number;
  latencyMean: number | null;
  latencyMedian: number | null;
  p95: number | null;
  p99: number | null;
  maxLatency: number | null;
  reliability: number;
  deliveredWithinThreshold: number;
  /** Number of physical route copies sent / logical critical alerts. */
  redundancyOverhead: number;
  /** Internal/audit metric used to derive redundancyOverhead. */
  physicalCopiesSent: number;
}

export interface UrllcStrategyResult {
  strategy: Strategy;
  metrics: UrllcMetrics;
  logs: UrllcLogEntry[];
}

export interface UrllcComparisonResult {
  baseline: UrllcStrategyResult;
  proposed: UrllcStrategyResult;
}
