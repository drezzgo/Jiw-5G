import type { ScenarioId, SimulationConfig } from "../core/types";

const base: Omit<SimulationConfig, "scenarioId"> = {
  simulatorVersion: "0.4.0-phase4",
  seed: 12345,
  mode: "DEMO",
  sensorCount: 100,
  durationMs: 10_000,
  stepMs: 100,
  trafficLevel: "MEDIUM",
  vehicleArrivalRate: 0.35,
  risk: {
    threshold: 0.75,
    pedestrianProbability: 0.08,
    vehicleApproachingProbability: 0.25,
    riskMin: 0.1,
    riskMax: 0.9,
  },
  mmtc: {
    periodicIntervalMs: 1_000,
    exceptionProbability: 0.08,
    channelCapacityPerStep: 12,
    maxRetries: 3,
    backoffMinSteps: 1,
    backoffMaxSteps: 5,
    energyTxUnits: 1,
    energyIdleUnits: 0.01,
  },
  urllc: {
    latencyThresholdMs: 5,
    // Experimental queueing parameters. They are explicit scenario inputs,
    // not values derived from 3GPP or automatically inferred from trafficLevel.
    baselineSharedQueueDelayMs: 2,
    proposedPriorityQueueDelayMs: 0.2,
    routeA: { enabled: true, baseLatencyMs: 1.2, jitterMs: 0.5, packetLoss: 0.02 },
    routeB: { enabled: true, baseLatencyMs: 1.6, jitterMs: 0.8, packetLoss: 0.03 },
  },
};

const overrides: Record<ScenarioId, Partial<SimulationConfig>> = {
  SCENARIO_NORMAL: {
    sensorCount: 50,
    trafficLevel: "LOW",
    vehicleArrivalRate: 0.18,
    urllc: {
      ...base.urllc,
      baselineSharedQueueDelayMs: 1,
      proposedPriorityQueueDelayMs: 0.2,
    },
  },
  SCENARIO_HIGH_DENSITY: {
    sensorCount: 300,
    trafficLevel: "HIGH",
    vehicleArrivalRate: 0.7,
    urllc: {
      ...base.urllc,
      baselineSharedQueueDelayMs: 6,
      proposedPriorityQueueDelayMs: 0.3,
    },
    risk: {
      ...base.risk,
      pedestrianProbability: 0.15,
      vehicleApproachingProbability: 0.6,
    },
  },
  SCENARIO_CRITICAL_EVENT: {
    trafficLevel: "MEDIUM",
    risk: {
      ...base.risk,
      forcedCriticalWindow: { startMs: 4_000, endMs: 4_500, risk: 0.95 },
    },
  },
  SCENARIO_ROUTE_FAILURE: {
    risk: {
      ...base.risk,
      forcedCriticalWindow: { startMs: 4_000, endMs: 4_500, risk: 0.95 },
    },
    urllc: {
      ...base.urllc,
      routeA: { enabled: true, baseLatencyMs: 30, jitterMs: 10, packetLoss: 0.65 },
    },
  },
  SCENARIO_CONGESTION_CRITICAL: {
    sensorCount: 300,
    trafficLevel: "HIGH",
    vehicleArrivalRate: 0.8,
    urllc: {
      ...base.urllc,
      baselineSharedQueueDelayMs: 8,
      proposedPriorityQueueDelayMs: 0.3,
    },
    mmtc: {
      ...base.mmtc,
      // Experimental values chosen so PROPOSED still experiences contention
      // and therefore exercises its random backoff mechanism.
      exceptionProbability: 0.2,
      channelCapacityPerStep: 8,
    },
    risk: {
      ...base.risk,
      pedestrianProbability: 0.2,
      vehicleApproachingProbability: 0.7,
      forcedCriticalWindow: { startMs: 4_000, endMs: 4_500, risk: 0.95 },
    },
  },
};

export const scenarioIds = Object.keys(overrides) as ScenarioId[];

export function createScenario(
  scenarioId: ScenarioId,
  patch: Partial<SimulationConfig> = {},
): SimulationConfig {
  const scenarioOverride = overrides[scenarioId];

  return {
    ...base,
    ...scenarioOverride,
    ...patch,
    scenarioId,
    risk: {
      ...base.risk,
      ...(scenarioOverride.risk ?? {}),
      ...(patch.risk ?? {}),
    },
    mmtc: {
      ...base.mmtc,
      ...(scenarioOverride.mmtc ?? {}),
      ...(patch.mmtc ?? {}),
    },
    urllc: {
      ...base.urllc,
      ...(scenarioOverride.urllc ?? {}),
      ...(patch.urllc ?? {}),
      routeA: {
        ...base.urllc.routeA,
        ...(scenarioOverride.urllc?.routeA ?? {}),
        ...(patch.urllc?.routeA ?? {}),
      },
      routeB: {
        ...base.urllc.routeB,
        ...(scenarioOverride.urllc?.routeB ?? {}),
        ...(patch.urllc?.routeB ?? {}),
      },
    },
  };
}
