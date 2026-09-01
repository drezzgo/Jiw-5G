"use client";
import { useMemo, useState } from "react";
import { ConfigPanel, type DashboardControls } from "./components/ConfigPanel";
import { TrafficContextCard } from "./components/TrafficContextCard";
import { ReplayPanel } from "./components/ReplayPanel";
import { MmtcPanel } from "./components/MmtcPanel";
import { UrllcPanel } from "./components/UrllcPanel";
import { CriticalEventPanel } from "./components/CriticalEventPanel";
import { ComparisonSummary } from "./components/ComparisonSummary";
import { ExportActions } from "./components/ExportActions";
import { buildDemoTrafficSnapshot, buildLatestCriticalAlert } from "./dashboard/presentation";
import { runScenarioExperiment } from "../simulation/experiments/run";
import { createScenario, scenarioIds } from "../simulation/scenarios/scenarios";
import type { DataMode, ScenarioId, SimulationConfig } from "../simulation/core/types";
import { DEFAULT_TRAFFIC_MAPPING_CONFIG, mapTrafficSnapshotToSimulationContext } from "../traffic/mapping";
import { ReplayTrafficProvider } from "../traffic/providers/ReplayTrafficProvider";
import { SyntheticTrafficProvider } from "../traffic/providers/SyntheticTrafficProvider";
import type { ReplayCapture, TrafficSnapshot } from "../traffic/types";

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

function configWithTrafficContext(
  baseConfig: SimulationConfig,
  mode: Exclude<DataMode, "LIVE">,
  traffic: TrafficSnapshot,
  replayCapture: ReplayCapture | null,
): SimulationConfig {
  const mapping = mode === "REPLAY" && replayCapture
    ? replayCapture.mapping
    : DEFAULT_TRAFFIC_MAPPING_CONFIG;
  const context = mapTrafficSnapshotToSimulationContext(
    traffic,
    mapping,
    baseConfig.trafficLevel,
  );
  return {
    ...baseConfig,
    mode,
    trafficLevel: context.trafficLevel,
    vehicleArrivalRate: context.vehicleArrivalRate,
  };
}

const initialControls = controlsFromScenario("SCENARIO_CRITICAL_EVENT");
const initialBaseConfig = buildConfig(initialControls);
const initialTraffic = buildDemoTrafficSnapshot(initialBaseConfig.trafficLevel, "DEMO_PREVIEW");
const initialResult = runScenarioExperiment(
  configWithTrafficContext(initialBaseConfig, "DEMO", initialTraffic, null),
  { executedAt: "DEMO_PREVIEW", trafficSource: "SYNTHETIC" },
);

export default function Home() {
  const [controls, setControls] = useState<DashboardControls>(initialControls);
  const [mode, setMode] = useState<Exclude<DataMode, "LIVE">>("DEMO");
  const [result, setResult] = useState(initialResult);
  const [traffic, setTraffic] = useState<TrafficSnapshot>(initialTraffic);
  const [replayCapture, setReplayCapture] = useState<ReplayCapture | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const latestAlert = useMemo(() => buildLatestCriticalAlert(result), [result]);

  const onScenarioChange = (scenarioId: ScenarioId) => {
    setControls(controlsFromScenario(scenarioId, controls.seed));
  };

  const onModeChange = (nextMode: Exclude<DataMode, "LIVE">) => {
    setMode(nextMode);
    setReplayError(null);
  };

  const run = async () => {
    if (mode === "REPLAY" && !replayCapture) {
      setReplayError("Selecciona un Replay válido antes de ejecutar la simulación.");
      return;
    }
    setRunning(true);
    try {
      const executedAt = new Date().toISOString();
      const baseConfig = buildConfig(controls);
      const provider = mode === "REPLAY" && replayCapture
        ? new ReplayTrafficProvider(replayCapture)
        : new SyntheticTrafficProvider(
            buildDemoTrafficSnapshot(baseConfig.trafficLevel, executedAt),
          );
      const snapshot = await provider.getSnapshot();
      const config = configWithTrafficContext(baseConfig, mode, snapshot, replayCapture);
      const trafficSource = mode === "REPLAY" && replayCapture
        ? `REPLAY:${replayCapture.capture.originalProvider}:${replayCapture.capture.id}`
        : "SYNTHETIC";
      setTraffic(snapshot);
      setResult(runScenarioExperiment(config, { executedAt, trafficSource }));
    } finally {
      setRunning(false);
    }
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
        mode={mode}
        scenarioIds={scenarioIds}
        onChange={(patch) => setControls((current) => ({ ...current, ...patch }))}
        onScenarioChange={onScenarioChange}
        onModeChange={onModeChange}
        onRun={() => void run()}
        runDisabled={running || (mode === "REPLAY" && !replayCapture)}
      />
      {mode === "REPLAY" && (
        <ReplayPanel
          capture={replayCapture}
          error={replayError}
          onLoaded={(capture) => {
            setReplayCapture(capture);
            setReplayError(null);
          }}
          onError={setReplayError}
        />
      )}
      <div className="two-column-grid">
        <TrafficContextCard traffic={traffic} />
        <section className="panel panel--run" aria-labelledby="run-title">
          <div className="panel__heading"><div><p className="section-kicker">Ejecución activa</p><h2 id="run-title">{result.metadata.scenarioId}</h2></div><span className="status-pill status-pill--ok">COMPLETADA</span></div>
          <div className="stat-grid stat-grid--compact">
            <div className="stat"><span>Modo</span><strong>{result.metadata.mode}</strong></div>
            <div className="stat"><span>Sensores</span><strong>{result.config.sensorCount}</strong></div>
            <div className="stat"><span>Duración</span><strong>{result.config.durationMs / 1000} s</strong></div>
            <div className="stat"><span>Nivel de tráfico derivado</span><strong>{result.config.trafficLevel}</strong></div>
            <div className="stat"><span>Tasa de llegada vehicular</span><strong>{result.config.vehicleArrivalRate}</strong></div>
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
        <span>DEMO + REPLAY funcionan sin servicios externos · LIVE se habilita en FASE 7</span>
      </footer>
    </main>
  );
}
