import type { Strategy } from "../core/types";

export interface MmtcCandidateMessage {
  id: string;
  sensorId: number;
  generatedStep: number;
  generatedAtMs: number;
  exceptionRelevant: boolean;
}

export type MmtcLogType =
  | "MESSAGE_GENERATED"
  | "MESSAGE_AVOIDED"
  | "TRANSMISSION_ATTEMPT"
  | "COLLISION"
  | "RETRY_SCHEDULED"
  | "MESSAGE_DELIVERED"
  | "MESSAGE_FAILED";

export interface MmtcLogEntry {
  sequence: number;
  step: number;
  timestampMs: number;
  strategy: Strategy;
  type: MmtcLogType;
  messageId: string;
  sensorId: number;
  attempt: number;
  payload: Record<string, unknown>;
}

export interface MmtcMetrics {
  /** Candidate reporting opportunities before the strategy decision. */
  generatedMessages: number;
  /** Logical messages that perform at least one channel transmission attempt. */
  transmittedMessages: number;
  /** Candidate reports suppressed by transmission-by-exception. */
  avoidedTransmissions: number;
  /** Physical attempts made during overloaded channel steps. */
  simultaneousAttempts: number;
  /** Failed physical attempts caused by the simplified capacity/contention model. */
  collisions: number;
  /** Physical retransmission attempts after an earlier collision. */
  retries: number;
  /** Logical messages delivered before simulation end. */
  successfulMessages: number;
  /** Logical messages not delivered after retry exhaustion or simulation end. */
  failedMessages: number;
  /** successfulMessages / transmittedMessages, [0, 1]. */
  successRate: number;
  /** Occupied channel capacity divided by total available channel capacity, [0, 1]. */
  channelUtilization: number;
  /** Dimensionless simplified energy proxy; it is not physical energy consumption. */
  energyProxy: number;
  /** Internal/audit metric: first attempts + retries. */
  physicalTransmissionAttempts: number;
}

export interface MmtcStrategyResult {
  strategy: Strategy;
  metrics: MmtcMetrics;
  logs: MmtcLogEntry[];
}

export interface MmtcComparisonResult {
  baseline: MmtcStrategyResult;
  proposed: MmtcStrategyResult;
}
