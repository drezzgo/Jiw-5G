import type { TrafficLevel } from "../simulation/core/types";
import type {
  SimulationTrafficContext,
  TrafficMappingConfig,
  TrafficSnapshot,
} from "./types";

export const DEFAULT_TRAFFIC_MAPPING_CONFIG: TrafficMappingConfig = {
  highCongestionSpeedRatioMax: 0.55,
  mediumCongestionSpeedRatioMax: 0.8,
  vehicleArrivalRateByLevel: {
    LOW: 0.18,
    MEDIUM: 0.35,
    HIGH: 0.75,
  },
};

export function validateTrafficMappingConfig(config: TrafficMappingConfig): void {
  const { highCongestionSpeedRatioMax: high, mediumCongestionSpeedRatioMax: medium } = config;
  if (!Number.isFinite(high) || !Number.isFinite(medium) || high < 0 || medium < 0 || high > medium) {
    throw new Error("Traffic mapping thresholds must satisfy 0 <= HIGH <= MEDIUM.");
  }
  for (const level of ["LOW", "MEDIUM", "HIGH"] as const) {
    const rate = config.vehicleArrivalRateByLevel[level];
    if (!Number.isFinite(rate) || rate < 0) {
      throw new Error(`vehicleArrivalRateByLevel.${level} must be a finite value >= 0.`);
    }
  }
}

export function trafficLevelFromSnapshot(
  snapshot: TrafficSnapshot,
  mapping: TrafficMappingConfig,
  fallback: TrafficLevel,
): { level: TrafficLevel; speedRatio: number | null } {
  validateTrafficMappingConfig(mapping);

  const current = snapshot.currentSpeedKmh;
  const freeFlow = snapshot.freeFlowSpeedKmh;
  if (
    snapshot.available &&
    current !== null &&
    freeFlow !== null &&
    Number.isFinite(current) &&
    Number.isFinite(freeFlow) &&
    current >= 0 &&
    freeFlow > 0
  ) {
    const speedRatio = current / freeFlow;
    if (speedRatio <= mapping.highCongestionSpeedRatioMax) {
      return { level: "HIGH", speedRatio };
    }
    if (speedRatio <= mapping.mediumCongestionSpeedRatioMax) {
      return { level: "MEDIUM", speedRatio };
    }
    return { level: "LOW", speedRatio };
  }

  if (snapshot.congestionLevel !== "UNKNOWN") {
    return { level: snapshot.congestionLevel, speedRatio: null };
  }
  return { level: fallback, speedRatio: null };
}

/**
 * Parameterized model assumption that converts external traffic context into
 * the two scenario inputs consumed by the simulator. The engine never sees
 * provider-specific data.
 */
export function mapTrafficSnapshotToSimulationContext(
  snapshot: TrafficSnapshot,
  mapping: TrafficMappingConfig,
  fallbackTrafficLevel: TrafficLevel,
): SimulationTrafficContext {
  const { level, speedRatio } = trafficLevelFromSnapshot(snapshot, mapping, fallbackTrafficLevel);
  return {
    trafficLevel: level,
    vehicleArrivalRate: mapping.vehicleArrivalRateByLevel[level],
    speedRatio,
  };
}
