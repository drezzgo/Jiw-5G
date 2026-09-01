import type { DataMode, ScenarioId, SimulationConfig, Strategy } from "../core/types";
import type { MmtcComparisonResult, MmtcMetrics } from "../mmtc/types";
import type { UrllcComparisonResult, UrllcMetrics } from "../urlcc/types";

export interface MmtcComparisonSummary {
  /** Positive values mean PROPOSED transmits fewer logical messages. */
  transmissionReduction: number | null;
  /** Positive values mean PROPOSED performs fewer physical attempts. */
  physicalAttemptReduction: number | null;
  /** Positive values mean PROPOSED records fewer collisions. */
  collisionReduction: number | null;
  /** Positive values mean PROPOSED uses less simplified energy proxy. */
  energyProxyReduction: number | null;
  /** PROPOSED - BASELINE, expressed as a ratio delta (e.g. 0.2 = +20 percentage points). */
  successRateChange: number;
  /** PROPOSED - BASELINE channel utilization. Negative means lower utilization. */
  channelUtilizationChange: number;
}

export interface UrllcComparisonSummary {
  /** Delivery-rate change = PROPOSED - BASELINE. */
  deliveryRateChange: number;
  /** Reliability change = PROPOSED - BASELINE. */
  reliabilityChange: number;
  /** Positive values mean PROPOSED has lower mean latency. */
  meanLatencyReduction: number | null;
  /** Positive values mean PROPOSED has lower p95 latency. */
  p95LatencyReduction: number | null;
  /** BASELINE lost alerts - PROPOSED lost alerts. Positive means fewer logical losses. */
  lostAlertsAvoided: number;
  /** PROPOSED - BASELINE physical copies per logical alert. This is a cost metric. */
  redundancyOverheadIncrease: number;
  /** Positive values mean PROPOSED sends more physical copies. This is a cost metric. */
  physicalCopiesIncrease: number | null;
}

export interface ScenarioComparisonSummary {
  mmtc: MmtcComparisonSummary;
  urllc: UrllcComparisonSummary;
}

export interface ScenarioExperimentResult {
  metadata: {
    executedAt: string;
    seed: number;
    scenarioId: ScenarioId;
    mode: DataMode;
    simulatorVersion: string;
    trafficSource: string;
  };
  config: SimulationConfig;
  mmtc: MmtcComparisonResult;
  urllc: UrllcComparisonResult;
  summary: ScenarioComparisonSummary;
}

export interface ExperimentMatrixResult {
  metadata: {
    executedAt: string;
    simulatorVersion: string;
    seed: number;
    mode: DataMode;
    trafficSource: string;
  };
  scenarios: ScenarioExperimentResult[];
}

/** Flat row intended for dashboard tables and later CSV export. */
export interface ExperimentStrategyRow {
  executedAt: string;
  simulatorVersion: string;
  seed: number;
  scenarioId: ScenarioId;
  mode: DataMode;
  trafficSource: string;
  strategy: Strategy;

  sensorCount: number;
  durationMs: number;
  stepMs: number;
  trafficLevel: string;
  latencyThresholdMs: number;

  mmtc: MmtcMetrics;
  urllc: UrllcMetrics;
}
