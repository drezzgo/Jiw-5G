import type { ScenarioId } from "../../simulation/core/types";

export interface DashboardControls {
  scenarioId: ScenarioId;
  seed: number;
  sensorCount: number;
  durationSeconds: number;
  riskThreshold: number;
  exceptionProbability: number;
  channelCapacity: number;
  latencyThresholdMs: number;
}

interface ConfigPanelProps {
  controls: DashboardControls;
  scenarioIds: readonly ScenarioId[];
  onChange: (patch: Partial<DashboardControls>) => void;
  onScenarioChange: (scenarioId: ScenarioId) => void;
  onRun: () => void;
}

const scenarioLabels: Record<ScenarioId, string> = {
  SCENARIO_NORMAL: "Operación normal",
  SCENARIO_HIGH_DENSITY: "Alta densidad",
  SCENARIO_CRITICAL_EVENT: "Evento crítico",
  SCENARIO_ROUTE_FAILURE: "Fallo de ruta",
  SCENARIO_CONGESTION_CRITICAL: "Evento crítico bajo congestión",
};

export function ConfigPanel({ controls, scenarioIds, onChange, onScenarioChange, onRun }: ConfigPanelProps) {
  return (
    <section className="panel panel--config" aria-labelledby="config-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Configuración</p>
          <h2 id="config-title">Parámetros de ejecución</h2>
        </div>
        <div className="mode-switch" aria-label="Modo de datos">
          <button type="button" className="mode-switch__item mode-switch__item--active">DEMO</button>
          <button type="button" className="mode-switch__item" disabled title="Se implementa en FASE 6">REPLAY · F6</button>
          <button type="button" className="mode-switch__item" disabled title="Se implementa en FASE 7">LIVE · F7</button>
        </div>
      </div>

      <div className="form-grid">
        <label className="field field--wide"><span>Escenario</span><select value={controls.scenarioId} onChange={(event) => onScenarioChange(event.target.value as ScenarioId)}>{scenarioIds.map((id) => <option value={id} key={id}>{scenarioLabels[id]}</option>)}</select></label>
        <label className="field"><span>Seed</span><input type="number" step="1" value={controls.seed} onChange={(event) => onChange({ seed: Number(event.target.value) })} /></label>
        <label className="field"><span>Sensores</span><input type="number" min="1" step="1" value={controls.sensorCount} onChange={(event) => onChange({ sensorCount: Number(event.target.value) })} /></label>
        <label className="field"><span>Duración (s)</span><input type="number" min="1" step="1" value={controls.durationSeconds} onChange={(event) => onChange({ durationSeconds: Number(event.target.value) })} /></label>
        <label className="field"><span>Umbral de riesgo</span><input type="number" min="0" max="1" step="0.01" value={controls.riskThreshold} onChange={(event) => onChange({ riskThreshold: Number(event.target.value) })} /></label>
        <label className="field"><span>Prob. de excepción</span><input type="number" min="0" max="1" step="0.01" value={controls.exceptionProbability} onChange={(event) => onChange({ exceptionProbability: Number(event.target.value) })} /></label>
        <label className="field"><span>Capacidad / paso</span><input type="number" min="1" step="1" value={controls.channelCapacity} onChange={(event) => onChange({ channelCapacity: Number(event.target.value) })} /></label>
        <label className="field"><span>Umbral URLLC (ms)</span><input type="number" min="0" step="0.1" value={controls.latencyThresholdMs} onChange={(event) => onChange({ latencyThresholdMs: Number(event.target.value) })} /></label>
      </div>

      <div className="config-footer">
        <p>Los valores editables son parámetros experimentales del modelo, no requisitos 3GPP.</p>
        <button type="button" className="button button--primary" onClick={onRun}>Ejecutar simulación</button>
      </div>
    </section>
  );
}
