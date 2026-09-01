import type { SimulationConfig } from "../core/types";
import { Mulberry32, deriveSeed } from "../random/prng";
import type { MmtcCandidateMessage } from "./types";

/**
 * Generates one deterministic set of sensor reporting opportunities shared by
 * BASELINE and PROPOSED. Sharing the workload avoids comparing two different
 * random traffic realizations.
 *
 * Each sensor receives a deterministic random phase within its reporting
 * period. This avoids the artificial assumption that every sensor transmits at
 * exactly t=0, 1 s, 2 s, ...
 */
export function generateMmtcWorkload(config: SimulationConfig): MmtcCandidateMessage[] {
  const periodSteps = config.mmtc.periodicIntervalMs / config.stepMs;

  if (!Number.isInteger(periodSteps) || periodSteps < 1) {
    throw new Error("mmtc.periodicIntervalMs must be an integer multiple of stepMs");
  }

  const totalSteps = Math.floor(config.durationMs / config.stepMs);
  const random = new Mulberry32(deriveSeed(config.seed, "mmtc-workload"));
  const messages: MmtcCandidateMessage[] = [];

  for (let sensorId = 0; sensorId < config.sensorCount; sensorId += 1) {
    const phase = random.integer(0, periodSteps - 1);

    for (let step = phase; step < totalSteps; step += periodSteps) {
      messages.push({
        id: `mmtc-${sensorId}-${step}`,
        sensorId,
        generatedStep: step,
        generatedAtMs: step * config.stepMs,
        exceptionRelevant: random.chance(config.mmtc.exceptionProbability),
      });
    }
  }

  return messages.sort(
    (a, b) => a.generatedStep - b.generatedStep || a.sensorId - b.sensorId,
  );
}
