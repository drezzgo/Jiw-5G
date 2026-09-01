import type { TrafficLevel } from "../simulation/core/types";
import { validateTrafficMappingConfig } from "./mapping";
import type {
  ReplayCapture,
  ReplayOriginalProvider,
  TrafficMappingConfig,
} from "./types";

export const REPLAY_SCHEMA_VERSION = "1.0" as const;

export class ReplayValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReplayValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new ReplayValidationError(`${path} must be an object.`);
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ReplayValidationError(`${path} must be a non-empty string.`);
  }
  return value;
}

function requireNonNegativeNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new ReplayValidationError(`${path} must be a finite number >= 0.`);
  }
  return value;
}

function nullableNonNegativeNumber(value: unknown, path: string): number | null {
  if (value === null) return null;
  return requireNonNegativeNumber(value, path);
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new ReplayValidationError(`${path} must be boolean.`);
  return value;
}

function parseTrafficLevel(value: unknown, path: string): TrafficLevel | "UNKNOWN" {
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "UNKNOWN") return value;
  throw new ReplayValidationError(`${path} must be LOW, MEDIUM, HIGH or UNKNOWN.`);
}

function parseOriginalProvider(value: unknown): ReplayOriginalProvider {
  if (value === "SYNTHETIC" || value === "TOMTOM" || value === "OTHER") return value;
  throw new ReplayValidationError("capture.originalProvider must be SYNTHETIC, TOMTOM or OTHER.");
}

function parseMapping(value: unknown): TrafficMappingConfig {
  const mapping = requireRecord(value, "mapping");
  const rates = requireRecord(mapping.vehicleArrivalRateByLevel, "mapping.vehicleArrivalRateByLevel");
  const parsed: TrafficMappingConfig = {
    highCongestionSpeedRatioMax: requireNonNegativeNumber(
      mapping.highCongestionSpeedRatioMax,
      "mapping.highCongestionSpeedRatioMax",
    ),
    mediumCongestionSpeedRatioMax: requireNonNegativeNumber(
      mapping.mediumCongestionSpeedRatioMax,
      "mapping.mediumCongestionSpeedRatioMax",
    ),
    vehicleArrivalRateByLevel: {
      LOW: requireNonNegativeNumber(rates.LOW, "mapping.vehicleArrivalRateByLevel.LOW"),
      MEDIUM: requireNonNegativeNumber(rates.MEDIUM, "mapping.vehicleArrivalRateByLevel.MEDIUM"),
      HIGH: requireNonNegativeNumber(rates.HIGH, "mapping.vehicleArrivalRateByLevel.HIGH"),
    },
  };
  try {
    validateTrafficMappingConfig(parsed);
  } catch (error) {
    throw new ReplayValidationError(error instanceof Error ? error.message : "Invalid traffic mapping.");
  }
  return parsed;
}

export function validateReplayCapture(value: unknown): ReplayCapture {
  const root = requireRecord(value, "replay");
  if (root.schemaVersion !== REPLAY_SCHEMA_VERSION) {
    throw new ReplayValidationError(
      `Unsupported schemaVersion. Expected ${REPLAY_SCHEMA_VERSION}.`,
    );
  }

  const capture = requireRecord(root.capture, "capture");
  const traffic = requireRecord(root.traffic, "traffic");
  const description = capture.description;
  if (description !== undefined && typeof description !== "string") {
    throw new ReplayValidationError("capture.description must be a string when present.");
  }

  return {
    schemaVersion: REPLAY_SCHEMA_VERSION,
    capture: {
      id: requireString(capture.id, "capture.id"),
      capturedAt: requireString(capture.capturedAt, "capture.capturedAt"),
      originalProvider: parseOriginalProvider(capture.originalProvider),
      ...(description === undefined ? {} : { description }),
    },
    traffic: {
      timestamp: requireString(traffic.timestamp, "traffic.timestamp"),
      currentSpeedKmh: nullableNonNegativeNumber(traffic.currentSpeedKmh, "traffic.currentSpeedKmh"),
      freeFlowSpeedKmh: nullableNonNegativeNumber(traffic.freeFlowSpeedKmh, "traffic.freeFlowSpeedKmh"),
      currentTravelTimeSeconds: nullableNonNegativeNumber(
        traffic.currentTravelTimeSeconds,
        "traffic.currentTravelTimeSeconds",
      ),
      freeFlowTravelTimeSeconds: nullableNonNegativeNumber(
        traffic.freeFlowTravelTimeSeconds,
        "traffic.freeFlowTravelTimeSeconds",
      ),
      congestionLevel: parseTrafficLevel(traffic.congestionLevel, "traffic.congestionLevel"),
      incidents: nullableNonNegativeNumber(traffic.incidents, "traffic.incidents"),
      available: requireBoolean(traffic.available, "traffic.available"),
    },
    mapping: parseMapping(root.mapping),
  };
}

export function parseReplayJson(text: string): ReplayCapture {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ReplayValidationError("The selected file is not valid JSON.");
  }
  return validateReplayCapture(parsed);
}
