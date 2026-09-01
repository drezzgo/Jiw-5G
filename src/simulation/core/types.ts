export type ScenarioId =
  | "SCENARIO_NORMAL"
  | "SCENARIO_HIGH_DENSITY"
  | "SCENARIO_CRITICAL_EVENT"
  | "SCENARIO_ROUTE_FAILURE"
  | "SCENARIO_CONGESTION_CRITICAL";

export type TrafficLevel = "LOW" | "MEDIUM" | "HIGH";
export type DataMode = "DEMO" | "REPLAY" | "LIVE";
export type Strategy = "BASELINE" | "PROPOSED";

export interface RouteConfig {
  enabled: boolean;
  baseLatencyMs: number;
  jitterMs: number;
  packetLoss: number;
}

export interface RiskConfig {
  threshold: number;
  pedestrianProbability: number;
  vehicleApproachingProbability: number;
  riskMin: number;
  riskMax: number;
  forcedCriticalWindow?: {
    startMs: number;
    endMs: number;
    risk: number;
  };
}

export interface MmtcConfig {
  periodicIntervalMs: number;
  exceptionProbability: number;
  channelCapacityPerStep: number;
  maxRetries: number;
  backoffMinSteps: number;
  backoffMaxSteps: number;
  energyTxUnits: number;
  energyIdleUnits: number;
}

export interface UrllcConfig {
  latencyThresholdMs: number;
  routeA: RouteConfig;
  routeB: RouteConfig;
}

export interface SimulationConfig {
  simulatorVersion: string;
  seed: number;
  scenarioId: ScenarioId;
  mode: DataMode;
  sensorCount: number;
  durationMs: number;
  stepMs: number;
  trafficLevel: TrafficLevel;
  vehicleArrivalRate: number;
  risk: RiskConfig;
  mmtc: MmtcConfig;
  urllc: UrllcConfig;
}

export interface SensorObservation {
  timestampMs: number;
  pedestrianPresent: boolean;
  vehicleApproaching: boolean;
  estimatedRisk: number;
}

export interface RiskEvaluation {
  critical: boolean;
  reason: "CRITICAL_CONDITION_MET" | "NO_CRITICAL_CONDITION";
}

export interface SimulationLogEntry {
  sequence: number;
  timestampMs: number;
  type: "SIMULATION_STARTED" | "OBSERVATION" | "CRITICAL_EVENT" | "SIMULATION_FINISHED";
  payload: Record<string, unknown>;
}

export interface Phase1Metrics {
  steps: number;
  observations: number;
  criticalEvents: number;
}

export interface SimulationRun {
  metadata: {
    executedAt: string;
    seed: number;
    scenarioId: ScenarioId;
    mode: DataMode;
    simulatorVersion: string;
  };
  config: SimulationConfig;
  logs: SimulationLogEntry[];
  metrics: Phase1Metrics;
}
