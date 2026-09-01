import { SimulationEngine } from "../core/engine";
import type { RouteConfig, SimulationConfig } from "../core/types";
import { Mulberry32, deriveSeed } from "../random/prng";
import type { UrllcCriticalAlert, UrllcRouteId, UrllcRouteSample } from "./types";

function sampleRoute(
  route: UrllcRouteId,
  config: RouteConfig,
  random: Mulberry32,
): UrllcRouteSample {
  if (config.packetLoss < 0 || config.packetLoss > 1) {
    throw new Error(`URLLC Route ${route} packetLoss must be between 0 and 1`);
  }
  if (config.baseLatencyMs < 0 || config.jitterMs < 0) {
    throw new Error(`URLLC Route ${route} latency and jitter must be >= 0`);
  }
  if (!config.enabled) {
    return {
      route,
      enabled: false,
      lostByChannel: false,
      physicalLatencyMs: null,
    };
  }

  const lostByChannel = random.chance(config.packetLoss);
  const jitter = random.between(0, config.jitterMs);

  return {
    route,
    enabled: true,
    lostByChannel,
    // We generate latency even for lost copies so the random stream is stable
    // if logging/analysis changes later. Lost copies never contribute latency
    // to delivered-alert metrics.
    physicalLatencyMs: config.baseLatencyMs + jitter,
  };
}

/**
 * Generates the deterministic critical-alert workload shared by BASELINE and
 * PROPOSED. Critical-event timestamps come from the same Phase-1 risk engine.
 * Route A and B use separate derived random streams; their independence is an
 * explicit academic simulation assumption, not a claim about real networks.
 */
export function generateUrllcWorkload(config: SimulationConfig): UrllcCriticalAlert[] {
  if (!Number.isFinite(config.urllc.latencyThresholdMs) || config.urllc.latencyThresholdMs < 0) {
    throw new Error("urllc.latencyThresholdMs must be a finite number >= 0");
  }

  const routeA = new Mulberry32(deriveSeed(config.seed, "urlcc-route-a-workload"));
  const routeB = new Mulberry32(deriveSeed(config.seed, "urlcc-route-b-workload"));

  const phase1 = new SimulationEngine().run(config, {
    executedAt: "1970-01-01T00:00:00.000Z",
  });

  const events = phase1.logs.filter((entry) => entry.type === "CRITICAL_EVENT");

  return events.map((entry, eventIndex) => ({
    id: `urlcc-${eventIndex}-${entry.timestampMs}`,
    eventIndex,
    generatedAtMs: entry.timestampMs,
    estimatedRisk: Number(entry.payload.estimatedRisk),
    routeA: sampleRoute("A", config.urllc.routeA, routeA),
    routeB: sampleRoute("B", config.urllc.routeB, routeB),
  }));
}
