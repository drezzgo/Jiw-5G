import type { SimulationConfig, Strategy } from "../core/types";

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
  redundancyOverhead: number;
}

export interface UrllcStrategyResult {
  strategy: Strategy;
  metrics: UrllcMetrics;
}

export interface UrllcStrategy {
  readonly name: Strategy;
  run(config: SimulationConfig): UrllcStrategyResult;
}
