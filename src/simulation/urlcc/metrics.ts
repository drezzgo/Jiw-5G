import { median, percentile } from "../metrics/formulas";
import type { UrllcLogEntry, UrllcMetrics } from "./types";

/** Derives URLLC metrics exclusively from the detailed event log. */
export function calculateUrllcMetrics(logs: readonly UrllcLogEntry[]): UrllcMetrics {
  let criticalEvents = 0;
  let deliveredAlerts = 0;
  let lostAlerts = 0;
  let deliveredWithinThreshold = 0;
  let physicalCopiesSent = 0;
  const latencies: number[] = [];

  for (const entry of logs) {
    switch (entry.type) {
      case "ALERT_GENERATED":
        criticalEvents += 1;
        break;
      case "ROUTE_ATTEMPT":
        physicalCopiesSent += 1;
        break;
      case "ALERT_DELIVERED": {
        deliveredAlerts += 1;
        const latency = Number(entry.payload.latencyMs);
        if (!Number.isFinite(latency) || latency < 0) {
          throw new Error("invalid delivered URLLC latency in log");
        }
        latencies.push(latency);
        if (entry.payload.withinThreshold === true) deliveredWithinThreshold += 1;
        break;
      }
      case "ALERT_LOST":
        lostAlerts += 1;
        break;
      case "ROUTE_LOST":
      case "ROUTE_DELIVERED":
      case "COPY_DISCARDED":
        break;
    }
  }

  if (deliveredAlerts + lostAlerts !== criticalEvents) {
    throw new Error("URLLC accounting invariant violated: delivered + lost != criticalEvents");
  }

  const latencyMean =
    latencies.length === 0
      ? null
      : latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length;

  return {
    criticalEvents,
    deliveredAlerts,
    lostAlerts,
    latencyMean,
    latencyMedian: median(latencies),
    p95: percentile(latencies, 0.95),
    p99: percentile(latencies, 0.99),
    maxLatency: latencies.length === 0 ? null : Math.max(...latencies),
    reliability: criticalEvents === 0 ? 0 : deliveredWithinThreshold / criticalEvents,
    deliveredWithinThreshold,
    redundancyOverhead: criticalEvents === 0 ? 0 : physicalCopiesSent / criticalEvents,
    physicalCopiesSent,
  };
}
