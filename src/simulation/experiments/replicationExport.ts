import type { ReplicatedExperimentResult } from "./replications";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * JSON export intentionally excludes per-packet/per-message logs.
 *
 * A replicated experiment can contain millions of mMTC/URLLC log entries,
 * especially in high-density scenarios. Serializing every log entry into one
 * browser string can exceed JavaScript's maximum string length and is also
 * unnecessary for the aggregate academic analysis.
 *
 * The export keeps everything required to audit/reproduce the experiment at
 * the metrics level: metadata, options, seeds, scenario configuration,
 * baseline/proposed metrics, comparison summaries and descriptive aggregates.
 */
export function toReplicationsPortableObject(result: ReplicatedExperimentResult) {
  return {
    schemaVersion: "1.0",
    exportKind: "JIW_5G_REPLICATED_EXPERIMENT_METRICS",
    logsIncluded: false,
    logPolicy: {
      reason: "Per-message and per-route logs are omitted to keep replicated experiment exports browser-safe.",
      auditAlternative: "Use the raw CSV for per-seed metrics or export an individual dashboard execution when detailed logs are required.",
    },
    metadata: result.metadata,
    options: result.options,
    runs: result.runs.map((run) => ({
      scenarioId: run.scenarioId,
      sensorCount: run.sensorCount,
      seed: run.seed,
      result: {
        metadata: run.result.metadata,
        config: run.result.config,
        mmtc: {
          baseline: {
            strategy: run.result.mmtc.baseline.strategy,
            metrics: run.result.mmtc.baseline.metrics,
          },
          proposed: {
            strategy: run.result.mmtc.proposed.strategy,
            metrics: run.result.mmtc.proposed.metrics,
          },
        },
        urllc: {
          baseline: {
            strategy: run.result.urllc.baseline.strategy,
            metrics: run.result.urllc.baseline.metrics,
          },
          proposed: {
            strategy: run.result.urllc.proposed.strategy,
            metrics: run.result.urllc.proposed.metrics,
          },
        },
        summary: run.result.summary,
      },
    })),
    aggregates: result.aggregates,
  };
}

export function serializeReplicationsJson(result: ReplicatedExperimentResult, pretty = true): string {
  return JSON.stringify(toReplicationsPortableObject(result), null, pretty ? 2 : 0);
}

/** One row per seed/scenario/sensorCount/strategy for later Colab/pandas analysis. */
export function serializeReplicationsRawCsv(result: ReplicatedExperimentResult): string {
  const header = [
    "executedAt", "scenarioId", "sensorCount", "seed", "strategy",
    "mmtc.transmittedMessages", "mmtc.collisions", "mmtc.energyProxy", "mmtc.successRate",
    "urllc.latencyMean", "urllc.reliability", "urllc.lostAlerts", "urllc.redundancyOverhead",
  ];
  const rows: unknown[][] = [];
  for (const run of result.runs) {
    for (const [strategy, mmtc, urllc] of [
      ["BASELINE", run.result.mmtc.baseline.metrics, run.result.urllc.baseline.metrics],
      ["PROPOSED", run.result.mmtc.proposed.metrics, run.result.urllc.proposed.metrics],
    ] as const) {
      rows.push([
        result.metadata.executedAt, run.scenarioId, run.sensorCount, run.seed, strategy,
        mmtc.transmittedMessages, mmtc.collisions, mmtc.energyProxy, mmtc.successRate,
        urllc.latencyMean, urllc.reliability, urllc.lostAlerts, urllc.redundancyOverhead,
      ]);
    }
  }
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

/** One row per scenario/sensorCount with descriptive means and dispersion. */
export function serializeReplicationsAggregateCsv(result: ReplicatedExperimentResult): string {
  const header = [
    "scenarioId", "sensorCount", "replications",
    "mmtc.tx.baseline.mean", "mmtc.tx.proposed.mean", "mmtc.tx.relativeReduction",
    "mmtc.collisions.baseline.mean", "mmtc.collisions.proposed.mean", "mmtc.collisions.relativeReduction",
    "mmtc.energy.baseline.mean", "mmtc.energy.proposed.mean", "mmtc.energy.relativeReduction",
    "urllc.latency.baseline.mean", "urllc.latency.proposed.mean", "urllc.latency.relativeReduction",
    "urllc.reliability.baseline.mean", "urllc.reliability.proposed.mean",
    "urllc.overhead.baseline.mean", "urllc.overhead.proposed.mean",
  ];
  const rows = result.aggregates.map((row) => [
    row.scenarioId, row.sensorCount, row.replications,
    row.mmtc.transmittedMessages.baseline.mean, row.mmtc.transmittedMessages.proposed.mean, row.mmtc.transmittedMessages.relativeReduction,
    row.mmtc.collisions.baseline.mean, row.mmtc.collisions.proposed.mean, row.mmtc.collisions.relativeReduction,
    row.mmtc.energyProxy.baseline.mean, row.mmtc.energyProxy.proposed.mean, row.mmtc.energyProxy.relativeReduction,
    row.urllc.latencyMean.baseline.mean, row.urllc.latencyMean.proposed.mean, row.urllc.latencyMean.relativeReduction,
    row.urllc.reliability.baseline.mean, row.urllc.reliability.proposed.mean,
    row.urllc.redundancyOverhead.baseline.mean, row.urllc.redundancyOverhead.proposed.mean,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}
