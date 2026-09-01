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
  /** currentSpeed / freeFlowSpeed <= this value maps to HIGH congestion. */
  highCongestionSpeedRatioMax: number;
  /** Ratios above HIGH and <= this value map to MEDIUM congestion. */
  mediumCongestionSpeedRatioMax: number;
  /** Experimental arrival-rate assumptions; they are not TomTom or 3GPP KPIs. */
  vehicleArrivalRateByLevel: Record<TrafficLevel, number>;
}

export interface SimulationTrafficContext {
  trafficLevel: TrafficLevel;
  vehicleArrivalRate: number;
  speedRatio: number | null;
}

export type ReplayOriginalProvider = "SYNTHETIC" | "TOMTOM" | "OTHER";

export interface ReplayCapture {
  schemaVersion: "1.0";
  capture: {
    id: string;
    capturedAt: string;
    originalProvider: ReplayOriginalProvider;
    description?: string;
  };
  /** The stored snapshot omits source because replay always exposes source=REPLAY. */
  traffic: Omit<TrafficSnapshot, "source">;
  /** Stored with the capture so the TrafficSnapshot -> simulation mapping is replayable. */
  mapping: TrafficMappingConfig;
}
