import type { DataMode, TrafficLevel } from "../simulation/core/types";

export interface TrafficSnapshot {
  source: DataMode;
  timestamp: string;
  currentSpeedKmh: number | null;
  freeFlowSpeedKmh: number | null;
  currentTravelTimeSeconds: number | null;
  freeFlowTravelTimeSeconds: number | null;
  congestionLevel: TrafficLevel | "UNKNOWN";
  incidents: number | null;
  available: boolean;
}

export interface TrafficMappingConfig {
  highCongestionSpeedRatioMax: number;
  mediumCongestionSpeedRatioMax: number;
  vehicleArrivalRateByLevel: Record<TrafficLevel, number>;
}
