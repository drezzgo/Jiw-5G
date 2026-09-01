import type {
  ExperimentMatrixResult,
  ExperimentStrategyRow,
  ScenarioExperimentResult,
} from "./types";

export function toStrategyRows(
  result: ScenarioExperimentResult,
): ExperimentStrategyRow[] {
  const shared = {
    executedAt: result.metadata.executedAt,
    simulatorVersion: result.metadata.simulatorVersion,
    seed: result.metadata.seed,
    scenarioId: result.metadata.scenarioId,
    mode: result.metadata.mode,
    trafficSource: result.metadata.trafficSource,
    sensorCount: result.config.sensorCount,
    durationMs: result.config.durationMs,
    stepMs: result.config.stepMs,
    trafficLevel: result.config.trafficLevel,
    latencyThresholdMs: result.config.urllc.latencyThresholdMs,
  };

  return [
    {
      ...shared,
      strategy: "BASELINE",
      mmtc: result.mmtc.baseline.metrics,
      urllc: result.urllc.baseline.metrics,
    },
    {
      ...shared,
      strategy: "PROPOSED",
      mmtc: result.mmtc.proposed.metrics,
      urllc: result.urllc.proposed.metrics,
    },
  ];
}

export function matrixToStrategyRows(
  matrix: ExperimentMatrixResult,
): ExperimentStrategyRow[] {
  return matrix.scenarios.flatMap(toStrategyRows);
}

/** JSON serializer kept pure so Phase 5 can trigger a browser download without changing the engine. */
export function serializeExperimentJson(
  matrix: ExperimentMatrixResult,
  pretty = true,
): string {
  return JSON.stringify(matrix, null, pretty ? 2 : 0);
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Flattens the metrics into a stable CSV schema suitable for pandas/Colab.
 * Full nested configuration remains available in JSON export.
 */
export function serializeExperimentCsv(matrix: ExperimentMatrixResult): string {
  const rows = matrixToStrategyRows(matrix);
  const header = [
    "executedAt",
    "simulatorVersion",
    "seed",
    "scenarioId",
    "mode",
    "trafficSource",
    "strategy",
    "sensorCount",
    "durationMs",
    "stepMs",
    "trafficLevel",
    "latencyThresholdMs",
    "mmtc.generatedMessages",
    "mmtc.transmittedMessages",
    "mmtc.avoidedTransmissions",
    "mmtc.simultaneousAttempts",
    "mmtc.collisions",
    "mmtc.retries",
    "mmtc.successfulMessages",
    "mmtc.failedMessages",
    "mmtc.successRate",
    "mmtc.channelUtilization",
    "mmtc.energyProxy",
    "mmtc.physicalTransmissionAttempts",
    "urllc.criticalEvents",
    "urllc.deliveredAlerts",
    "urllc.lostAlerts",
    "urllc.latencyMean",
    "urllc.latencyMedian",
    "urllc.p95",
    "urllc.p99",
    "urllc.maxLatency",
    "urllc.reliability",
    "urllc.deliveredWithinThreshold",
    "urllc.redundancyOverhead",
    "urllc.physicalCopiesSent",
  ];

  const values = rows.map((row) => [
    row.executedAt,
    row.simulatorVersion,
    row.seed,
    row.scenarioId,
    row.mode,
    row.trafficSource,
    row.strategy,
    row.sensorCount,
    row.durationMs,
    row.stepMs,
    row.trafficLevel,
    row.latencyThresholdMs,
    row.mmtc.generatedMessages,
    row.mmtc.transmittedMessages,
    row.mmtc.avoidedTransmissions,
    row.mmtc.simultaneousAttempts,
    row.mmtc.collisions,
    row.mmtc.retries,
    row.mmtc.successfulMessages,
    row.mmtc.failedMessages,
    row.mmtc.successRate,
    row.mmtc.channelUtilization,
    row.mmtc.energyProxy,
    row.mmtc.physicalTransmissionAttempts,
    row.urllc.criticalEvents,
    row.urllc.deliveredAlerts,
    row.urllc.lostAlerts,
    row.urllc.latencyMean,
    row.urllc.latencyMedian,
    row.urllc.p95,
    row.urllc.p99,
    row.urllc.maxLatency,
    row.urllc.reliability,
    row.urllc.deliveredWithinThreshold,
    row.urllc.redundancyOverhead,
    row.urllc.physicalCopiesSent,
  ]);

  return [header, ...values]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
}
