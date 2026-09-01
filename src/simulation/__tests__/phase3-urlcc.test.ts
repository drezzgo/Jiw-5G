import { describe, expect, it } from "vitest";
import { runUrllcComparison } from "../urlcc/compare";
import { generateUrllcWorkload } from "../urlcc/workload";
import { simulateUrllcStrategy } from "../urlcc/simulate";
import { createScenario } from "../scenarios/scenarios";

describe("FASE 3 - URLLC", () => {
  it("is deterministic for the same seed and configuration", () => {
    const config = createScenario("SCENARIO_CRITICAL_EVENT");
    expect(runUrllcComparison(config)).toEqual(runUrllcComparison(config));
  });

  it("uses the exact same critical workload and Route-A outcomes for both strategies", () => {
    const config = createScenario("SCENARIO_CRITICAL_EVENT");
    const workload = generateUrllcWorkload(config);
    const comparison = runUrllcComparison(config);

    expect(comparison.baseline.metrics.criticalEvents).toBe(workload.length);
    expect(comparison.proposed.metrics.criticalEvents).toBe(workload.length);

    const baselineA = comparison.baseline.logs.filter((entry) => entry.type === "ROUTE_ATTEMPT");
    const proposedA = comparison.proposed.logs.filter(
      (entry) => entry.type === "ROUTE_ATTEMPT" && entry.route === "A",
    );
    expect(proposedA.length).toBe(baselineA.length);

    for (let i = 0; i < baselineA.length; i += 1) {
      expect(proposedA[i].payload.physicalLatencyMs).toBe(
        baselineA[i].payload.physicalLatencyMs,
      );
    }
  });

  it("never loses a functional route because of packet loss when packetLoss = 0", () => {
    const config = createScenario("SCENARIO_CRITICAL_EVENT", {
      urllc: {
        ...createScenario("SCENARIO_CRITICAL_EVENT").urllc,
        routeA: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0 },
        routeB: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0 },
      },
    });
    const result = runUrllcComparison(config);

    expect(result.baseline.logs.filter((entry) => entry.type === "ROUTE_LOST")).toHaveLength(0);
    expect(result.proposed.logs.filter((entry) => entry.type === "ROUTE_LOST")).toHaveLength(0);
    expect(result.baseline.metrics.lostAlerts).toBe(0);
    expect(result.proposed.metrics.lostAlerts).toBe(0);
  });

  it("always loses routes through the loss model when packetLoss = 1", () => {
    const original = createScenario("SCENARIO_CRITICAL_EVENT");
    const config = createScenario("SCENARIO_CRITICAL_EVENT", {
      urllc: {
        ...original.urllc,
        routeA: { ...original.urllc.routeA, packetLoss: 1 },
        routeB: { ...original.urllc.routeB, packetLoss: 1 },
      },
    });
    const result = runUrllcComparison(config);

    expect(result.baseline.metrics.lostAlerts).toBe(result.baseline.metrics.criticalEvents);
    expect(result.proposed.metrics.lostAlerts).toBe(result.proposed.metrics.criticalEvents);
  });

  it("delivers through Route B when Route A fails", () => {
    const original = createScenario("SCENARIO_CRITICAL_EVENT");
    const config = createScenario("SCENARIO_CRITICAL_EVENT", {
      urllc: {
        ...original.urllc,
        routeA: { ...original.urllc.routeA, packetLoss: 1 },
        routeB: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0 },
      },
    });
    const result = runUrllcComparison(config);

    expect(result.baseline.metrics.deliveredAlerts).toBe(0);
    expect(result.proposed.metrics.deliveredAlerts).toBe(result.proposed.metrics.criticalEvents);
    expect(
      result.proposed.logs
        .filter((entry) => entry.type === "ALERT_DELIVERED")
        .every((entry) => entry.payload.firstValidRoute === "B"),
    ).toBe(true);
  });

  it("selects the earliest valid copy", () => {
    const original = createScenario("SCENARIO_CRITICAL_EVENT");
    const config = createScenario("SCENARIO_CRITICAL_EVENT", {
      urllc: {
        ...original.urllc,
        proposedPriorityQueueDelayMs: 0,
        latencyThresholdMs: 20,
        routeA: { enabled: true, baseLatencyMs: 5, jitterMs: 0, packetLoss: 0 },
        routeB: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0 },
      },
    });
    const proposed = runUrllcComparison(config).proposed;

    expect(
      proposed.logs
        .filter((entry) => entry.type === "ALERT_DELIVERED")
        .every((entry) => entry.payload.firstValidRoute === "B"),
    ).toBe(true);
    expect(proposed.logs.filter((entry) => entry.type === "COPY_DISCARDED").length).toBe(
      proposed.metrics.criticalEvents,
    );
  });

  it("two independent routes maintain or improve experimental reliability", () => {
    const original = createScenario("SCENARIO_CRITICAL_EVENT");
    const config = createScenario("SCENARIO_CRITICAL_EVENT", {
      durationMs: 10_000,
      risk: {
        ...original.risk,
        forcedCriticalWindow: { startMs: 0, endMs: 9_900, risk: 0.95 },
      },
      urllc: {
        ...original.urllc,
        latencyThresholdMs: 100,
        baselineSharedQueueDelayMs: 0,
        proposedPriorityQueueDelayMs: 0,
        routeA: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0.4 },
        routeB: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0.4 },
      },
    });
    const result = runUrllcComparison(config);

    expect(result.proposed.metrics.reliability).toBeGreaterThanOrEqual(
      result.baseline.metrics.reliability,
    );
    expect(result.proposed.metrics.deliveredAlerts).toBeGreaterThanOrEqual(
      result.baseline.metrics.deliveredAlerts,
    );
  });

  it("models priority as a smaller explicit queue delay under congestion", () => {
    const original = createScenario("SCENARIO_CONGESTION_CRITICAL");
    const config = createScenario("SCENARIO_CONGESTION_CRITICAL", {
      urllc: {
        ...original.urllc,
        latencyThresholdMs: 20,
        routeA: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0 },
        routeB: { enabled: true, baseLatencyMs: 1, jitterMs: 0, packetLoss: 0 },
      },
    });
    const result = runUrllcComparison(config);

    expect(result.baseline.metrics.latencyMean).not.toBeNull();
    expect(result.proposed.metrics.latencyMean).not.toBeNull();
    expect(result.proposed.metrics.latencyMean!).toBeLessThan(result.baseline.metrics.latencyMean!);
  });

  it("keeps redundancy overhead at 1x baseline and 2x proposed with both routes enabled", () => {
    const result = runUrllcComparison(createScenario("SCENARIO_CRITICAL_EVENT"));

    expect(result.baseline.metrics.redundancyOverhead).toBe(1);
    expect(result.proposed.metrics.redundancyOverhead).toBe(2);
    expect(result.baseline.metrics.physicalCopiesSent).toBe(result.baseline.metrics.criticalEvents);
    expect(result.proposed.metrics.physicalCopiesSent).toBe(
      result.proposed.metrics.criticalEvents * 2,
    );
  });

  it("keeps all displayed URLLC metrics auditable from logs", () => {
    const result = runUrllcComparison(createScenario("SCENARIO_ROUTE_FAILURE"));

    for (const strategy of [result.baseline, result.proposed]) {
      const count = (type: string) => strategy.logs.filter((entry) => entry.type === type).length;
      const delivered = strategy.logs.filter((entry) => entry.type === "ALERT_DELIVERED");
      const latencies = delivered.map((entry) => Number(entry.payload.latencyMs));

      expect(count("ALERT_GENERATED")).toBe(strategy.metrics.criticalEvents);
      expect(count("ALERT_DELIVERED")).toBe(strategy.metrics.deliveredAlerts);
      expect(count("ALERT_LOST")).toBe(strategy.metrics.lostAlerts);
      expect(count("ROUTE_ATTEMPT")).toBe(strategy.metrics.physicalCopiesSent);
      expect(
        delivered.filter((entry) => entry.payload.withinThreshold === true).length,
      ).toBe(strategy.metrics.deliveredWithinThreshold);
      expect(strategy.metrics.deliveredAlerts + strategy.metrics.lostAlerts).toBe(
        strategy.metrics.criticalEvents,
      );
      expect(strategy.metrics.maxLatency).toBe(
        latencies.length === 0 ? null : Math.max(...latencies),
      );
    }
  });
});
