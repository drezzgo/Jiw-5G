"use client";

import { useMemo, useState } from "react";
import { ConfigPanel, type DashboardControls } from "./components/ConfigPanel";
import { TrafficContextCard } from "./components/TrafficContextCard";
import { MmtcPanel } from "./components/MmtcPanel";
import { UrllcPanel } from "./components/UrllcPanel";
import { CriticalEventPanel } from "./components/CriticalEventPanel";
import { ComparisonSummary } from "./components/ComparisonSummary";
import { ExportActions } from "./components/ExportActions";
import { buildDemoTrafficSnapshot, buildLatestCriticalAlert } from "./dashboard/presentation";
import { runScenarioExperiment } from "../simulation/experiments/run";
import { createScenario, scenarioIds } from "../simulation/scenarios/scenarios";
import type { ScenarioId, SimulationConfig } from "../simulation/core/types";

function controlsFromScenario(scenarioId: ScenarioId, seed = 12345): DashboardControls {
  const config = createScenario(scenarioId, { seed });
  return {
    scenarioId,
    seed,
    sensorCount: config.sensorCount,
    durationSeconds: config.durationMs / 1000,
    riskThreshold: config.risk.threshold,
    exceptionProbability: config.mmtc.exceptionProbability,
    channelCapacity: config.mmtc.channelCapacityPerStep,
    latencyThresholdMs: config.urllc.latencyThresholdMs,
  };
}

function buildConfig(controls: DashboardControls): SimulationConfig {
  const base = createScenario(controls.scenarioId, { seed: controls.seed });
  return createScenario(controls.scenarioId, {
    seed: Math.trunc(controls.seed),
    sensorCount: Math.max(1, Math.trunc(controls.sensorCount)),
    durationMs: Math.max(1, controls.durationSeconds) * 1000,
    risk: {
      ...base.risk,
      threshold: Math.min(1, Math.max(0, controls.riskThreshold)),
    },
    mmtc: {
      ...base.mmtc,
      exceptionProbability: Math.min(1, Math.max(0, controls.exceptionProbability)),
      channelCapacityPerStep: Math.max(1, Math.trunc(controls.channelCapacity)),
    },
    urllc: {
      ...base.urllc,
      latencyThresholdMs: Math.max(0, controls.latencyThresholdMs),
    },
  });
}

const initialControls = controlsFromScenario("SCENARIO_CRITICAL_EVENT");
const initialResult = runScenarioExperiment(buildConfig(initialControls), {
  executedAt: "DEMO_PREVIEW",
  trafficSource: "SYNTHETIC",
});

export default function Home() {
  const [controls, setControls] = useState<DashboardControls>(initialControls);
  const [result, setResult] = useState(initialResult);

  const traffic = useMemo(
    () => buildDemoTrafficSnapshot(result.config.trafficLevel, result.metadata.executedAt),
    [result],
  );
  const latestAlert = useMemo(() => buildLatestCriticalAlert(result), [result]);

  const onScenarioChange = (scenarioId: ScenarioId) => {
    setControls(controlsFromScenario(scenarioId, controls.seed));
  };

  const run = () => {
    const config = buildConfig(controls);
    setResult(runScenarioExperiment(config, {
      executedAt: new Date().toISOString(),
      trafficSource: "SYNTHETIC",
    }));
  };

  return (
    <main className="dashboard-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Simulación académica · mMTC + URLLC</p>
          <h1>Jiw 5G</h1>
          <p className="hero__subtitle">Simulador de cruce peatonal escolar inteligente</p>
        </div>
        <div className="hero__meta">
          <span>Versión del simulador</span>
          <strong>{result.metadata.simulatorVersion}</strong>
          <span>Seed ejecutada</span>
          <strong>{result.metadata.seed}</strong>
        </div>
      </header>

      <div className="academic-warning">
        <strong>Alcance del modelo:</strong> compara estrategias bajo supuestos de simulación. No demuestra cumplimiento real de 3GPP; el energy proxy es adimensional y la independencia de rutas URLLC es un supuesto explícito.
      </div>

      <ConfigPanel
        controls={controls}
        scenarioIds={scenarioIds}
        onChange={(patch) => setControls((current) => ({ ...current, ...patch }))}
        onScenarioChange={onScenarioChange}
        onRun={run}
      />

      <div className="two-column-grid">
        <TrafficContextCard traffic={traffic} />
        <section className="panel panel--run" aria-labelledby="run-title">
          <div className="panel__heading"><div><p className="section-kicker">Ejecución activa</p><h2 id="run-title">{result.metadata.scenarioId}</h2></div><span className="status-pill status-pill--ok">COMPLETADA</span></div>
          <div className="stat-grid stat-grid--compact">
            <div className="stat"><span>Sensores</span><strong>{result.config.sensorCount}</strong></div>
            <div className="stat"><span>Duración</span><strong>{result.config.durationMs / 1000} s</strong></div>
            <div className="stat"><span>Nivel de tráfico</span><strong>{result.config.trafficLevel}</strong></div>
            <div className="stat"><span>Eventos críticos</span><strong>{result.urllc.proposed.metrics.criticalEvents}</strong></div>
          </div>
          <ExportActions result={result} />
        </section>
      </div>

      <CriticalEventPanel alert={latestAlert} />

      <div className="two-column-grid two-column-grid--metrics">
        <MmtcPanel result={result} />
        <UrllcPanel result={result} />
      </div>

      <ComparisonSummary result={result} />

      <footer className="dashboard-footer">
        <span>Jiw 5G · Ingeniería Telemática</span>
        <span>DEMO funciona sin servicios externos · REPLAY y LIVE se habilitan en fases posteriores</span>
      </footer>
    </main>
  );
}
