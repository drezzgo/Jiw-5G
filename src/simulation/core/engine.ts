import type {
  SensorObservation,
  SimulationConfig,
  SimulationLogEntry,
  SimulationRun,
} from "./types";
import type { EventBus } from "../events/EventBus";
import { LocalEventBus } from "../events/LocalEventBus";
import { Mulberry32 } from "../random/prng";
import { evaluateRisk } from "../risk/evaluateRisk";

export interface SimulationEngineOptions {
  eventBus?: EventBus<SimulationLogEntry>;
  executedAt?: string;
}

export class SimulationEngine {
  run(config: SimulationConfig, options: SimulationEngineOptions = {}): SimulationRun {
    this.validateConfig(config);

    const random = new Mulberry32(config.seed);
    const bus = options.eventBus ?? new LocalEventBus<SimulationLogEntry>();
    const logs: SimulationLogEntry[] = [];
    let sequence = 0;
    let criticalEvents = 0;

    const emit = (
      timestampMs: number,
      type: SimulationLogEntry["type"],
      payload: Record<string, unknown>,
    ) => {
      const entry: SimulationLogEntry = { sequence: sequence++, timestampMs, type, payload };
      logs.push(entry);
      bus.publish(entry);
    };

    emit(0, "SIMULATION_STARTED", {
      seed: config.seed,
      scenarioId: config.scenarioId,
      sensorCount: config.sensorCount,
    });

    const steps = Math.floor(config.durationMs / config.stepMs);

    for (let step = 0; step < steps; step += 1) {
      const timestampMs = step * config.stepMs;
      const observation = this.createObservation(timestampMs, config, random);
      const evaluation = evaluateRisk(observation, config.risk);

      emit(timestampMs, "OBSERVATION", {
        ...observation,
        critical: evaluation.critical,
      });

      if (evaluation.critical) {
        criticalEvents += 1;
        emit(timestampMs, "CRITICAL_EVENT", {
          estimatedRisk: observation.estimatedRisk,
          threshold: config.risk.threshold,
        });
      }
    }

    emit(config.durationMs, "SIMULATION_FINISHED", {
      steps,
      criticalEvents,
    });

    return {
      metadata: {
        // excluded from deterministic comparison by tests; callers may inject a fixed timestamp
        executedAt: options.executedAt ?? new Date().toISOString(),
        seed: config.seed,
        scenarioId: config.scenarioId,
        mode: config.mode,
        simulatorVersion: config.simulatorVersion,
      },
      config,
      logs,
      metrics: {
        steps,
        observations: steps,
        criticalEvents,
      },
    };
  }

  private createObservation(
    timestampMs: number,
    config: SimulationConfig,
    random: Mulberry32,
  ): SensorObservation {
    const forced = config.risk.forcedCriticalWindow;
    const inForcedWindow =
      forced !== undefined && timestampMs >= forced.startMs && timestampMs <= forced.endMs;

    if (inForcedWindow) {
      return {
        timestampMs,
        pedestrianPresent: true,
        vehicleApproaching: true,
        estimatedRisk: forced.risk,
      };
    }

    return {
      timestampMs,
      pedestrianPresent: random.chance(config.risk.pedestrianProbability),
      vehicleApproaching: random.chance(config.risk.vehicleApproachingProbability),
      estimatedRisk: random.between(config.risk.riskMin, config.risk.riskMax),
    };
  }

  private validateConfig(config: SimulationConfig): void {
    if (!Number.isInteger(config.seed)) throw new Error("seed must be an integer");
    if (config.sensorCount <= 0) throw new Error("sensorCount must be > 0");
    if (config.durationMs <= 0 || config.stepMs <= 0) {
      throw new Error("durationMs and stepMs must be > 0");
    }
    if (config.risk.threshold < 0 || config.risk.threshold > 1) {
      throw new Error("risk.threshold must be between 0 and 1");
    }
    if (config.risk.riskMin < 0 || config.risk.riskMax > 1 || config.risk.riskMax < config.risk.riskMin) {
      throw new Error("risk range must satisfy 0 <= min <= max <= 1");
    }
  }
}
