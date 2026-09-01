import type { SimulationConfig, Strategy } from "../core/types";

export interface MmtcMetrics {
  generatedMessages: number;
  transmittedMessages: number;
  avoidedTransmissions: number;
  simultaneousAttempts: number;
  collisions: number;
  retries: number;
  successfulMessages: number;
  failedMessages: number;
  channelUtilization: number;
  energyProxy: number;
}

export interface MmtcStrategyResult {
  strategy: Strategy;
  metrics: MmtcMetrics;
}

export interface MmtcStrategy {
  readonly name: Strategy;
  run(config: SimulationConfig): MmtcStrategyResult;
}
