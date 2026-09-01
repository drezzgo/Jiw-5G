import { describe, expect, it } from "vitest";
import { runMmtcComparison } from "../mmtc/compare";
import { createScenario } from "../scenarios/scenarios";

describe("FASE 2 - mMTC", () => {
  it("is deterministic for the same seed and configuration", () => {
    const config = createScenario("SCENARIO_HIGH_DENSITY");
    expect(runMmtcComparison(config)).toEqual(runMmtcComparison(config));
  });

  it("uses the same generated workload for baseline and proposed", () => {
    const result = runMmtcComparison(createScenario("SCENARIO_HIGH_DENSITY"));
    expect(result.proposed.metrics.generatedMessages).toBe(
      result.baseline.metrics.generatedMessages,
    );
  });

  it("transmission by exception reduces logical transmissions", () => {
    const result = runMmtcComparison(createScenario("SCENARIO_HIGH_DENSITY"));
    expect(result.proposed.metrics.avoidedTransmissions).toBeGreaterThan(0);
    expect(result.proposed.metrics.transmittedMessages).toBeLessThan(
      result.baseline.metrics.transmittedMessages,
    );
  });

  it("reduces the simplified energy proxy when physical attempts are reduced", () => {
    const result = runMmtcComparison(createScenario("SCENARIO_HIGH_DENSITY"));
    expect(result.proposed.metrics.physicalTransmissionAttempts).toBeLessThan(
      result.baseline.metrics.physicalTransmissionAttempts,
    );
    expect(result.proposed.metrics.energyProxy).toBeLessThan(
      result.baseline.metrics.energyProxy,
    );
  });

  it("uses random backoff for proposed retries in the congestion scenario", () => {
    const config = createScenario("SCENARIO_CONGESTION_CRITICAL");
    const result = runMmtcComparison(config);
    const retryLogs = result.proposed.logs.filter((entry) => entry.type === "RETRY_SCHEDULED");

    expect(result.proposed.metrics.retries).toBeGreaterThan(0);
    expect(retryLogs.length).toBeGreaterThan(0);
    for (const entry of retryLogs) {
      const delay = entry.payload.delaySteps as number;
      expect(delay).toBeGreaterThanOrEqual(config.mmtc.backoffMinSteps);
      expect(delay).toBeLessThanOrEqual(config.mmtc.backoffMaxSteps);
    }
  });

  it("keeps accounting identities and metric ranges consistent", () => {
    const result = runMmtcComparison(createScenario("SCENARIO_HIGH_DENSITY"));

    for (const strategy of [result.baseline, result.proposed]) {
      expect(strategy.metrics.successfulMessages + strategy.metrics.failedMessages).toBe(
        strategy.metrics.transmittedMessages,
      );
      expect(strategy.metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(strategy.metrics.successRate).toBeLessThanOrEqual(1);
      expect(strategy.metrics.channelUtilization).toBeGreaterThanOrEqual(0);
      expect(strategy.metrics.channelUtilization).toBeLessThanOrEqual(1);
    }

    expect(
      result.proposed.metrics.transmittedMessages + result.proposed.metrics.avoidedTransmissions,
    ).toBe(result.proposed.metrics.generatedMessages);
  });

  it("keeps metrics exactly auditable from the logs", () => {
    const result = runMmtcComparison(createScenario("SCENARIO_HIGH_DENSITY"));

    for (const strategy of [result.baseline, result.proposed]) {
      const count = (type: string) => strategy.logs.filter((entry) => entry.type === type).length;
      const transmittedIds = new Set(
        strategy.logs
          .filter((entry) => entry.type === "TRANSMISSION_ATTEMPT")
          .map((entry) => entry.messageId),
      );

      expect(count("MESSAGE_GENERATED")).toBe(strategy.metrics.generatedMessages);
      expect(transmittedIds.size).toBe(strategy.metrics.transmittedMessages);
      expect(count("MESSAGE_AVOIDED")).toBe(strategy.metrics.avoidedTransmissions);
      expect(count("COLLISION")).toBe(strategy.metrics.collisions);
      expect(count("MESSAGE_DELIVERED")).toBe(strategy.metrics.successfulMessages);
      expect(count("MESSAGE_FAILED")).toBe(strategy.metrics.failedMessages);
      expect(count("TRANSMISSION_ATTEMPT")).toBe(
        strategy.metrics.physicalTransmissionAttempts,
      );
      expect(
        strategy.logs.filter(
          (entry) => entry.type === "TRANSMISSION_ATTEMPT" && entry.attempt > 1,
        ).length,
      ).toBe(strategy.metrics.retries);
    }
  });
});
