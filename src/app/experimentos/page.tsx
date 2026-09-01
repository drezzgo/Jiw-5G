"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./experimentos.module.css";
import {
  CORE_EXPERIMENT_SCENARIOS,
  DEFAULT_SCALABILITY_SENSOR_COUNTS,
  SCALABILITY_SCENARIOS,
  runReplicatedExperiments,
  type ReplicatedExperimentResult,
  type ReplicationAggregate,
} from "../../simulation/experiments/replications";
import {
  serializeReplicationsAggregateCsv,
  serializeReplicationsJson,
  serializeReplicationsRawCsv,
} from "../../simulation/experiments/replicationExport";

type Preset = "CORE" | "SCALABILITY";

function formatNumber(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${formatNumber(value * 100, 1)} %`;
}

function downloadText(filename: string, contents: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: `${mime};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function estimateRuns(preset: Preset, replications: number): number {
  const groups = preset === "CORE"
    ? CORE_EXPERIMENT_SCENARIOS.length
    : SCALABILITY_SCENARIOS.length * DEFAULT_SCALABILITY_SENSOR_COUNTS.length;
  return groups * Math.max(1, replications);
}

function SimpleLineChart({
  title,
  rows,
  getBaseline,
  getProposed,
  formatValue = formatNumber,
}: {
  title: string;
  rows: readonly ReplicationAggregate[];
  getBaseline: (row: ReplicationAggregate) => number | null;
  getProposed: (row: ReplicationAggregate) => number | null;
  formatValue?: (value: number | null) => string;
}) {
  const ordered = [...rows].sort((a, b) => a.sensorCount - b.sensorCount);
  const values = ordered.flatMap((row) => [getBaseline(row), getProposed(row)]).filter((v): v is number => v !== null && Number.isFinite(v));
  if (ordered.length < 2 || values.length === 0) return null;
  const max = Math.max(...values, 1);
  const width = 620;
  const height = 230;
  const padX = 46;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const x = (index: number) => padX + (ordered.length === 1 ? innerW / 2 : (index / (ordered.length - 1)) * innerW);
  const y = (value: number) => padY + innerH - (value / max) * innerH;
  const points = (selector: (row: ReplicationAggregate) => number | null) => ordered
    .map((row, index) => ({ value: selector(row), x: x(index) }))
    .filter((point): point is { value: number; x: number } => point.value !== null)
    .map((point) => `${point.x},${y(point.value)}`)
    .join(" ");
  return (
    <article className={styles.chartCard}>
      <div className={styles.chartHeading}>
        <div><span>Escalabilidad</span><h3>{title}</h3></div>
        <div className={styles.legend}><span><i className={styles.legendBaseline} />Baseline</span><span><i className={styles.legendProposed} />Propuesta</span></div>
      </div>
      <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line x1={padX} y1={padY + innerH} x2={width - padX} y2={padY + innerH} className={styles.axis} />
        <line x1={padX} y1={padY} x2={padX} y2={padY + innerH} className={styles.axis} />
        <polyline points={points(getBaseline)} className={styles.lineBaseline} />
        <polyline points={points(getProposed)} className={styles.lineProposed} />
        {ordered.map((row, index) => (
          <g key={row.sensorCount}>
            <text x={x(index)} y={height - 6} textAnchor="middle" className={styles.axisLabel}>{row.sensorCount}</text>
            {getBaseline(row) !== null && <circle cx={x(index)} cy={y(getBaseline(row)!)} r="3.5" className={styles.dotBaseline} />}
            {getProposed(row) !== null && <circle cx={x(index)} cy={y(getProposed(row)!)} r="3.5" className={styles.dotProposed} />}
          </g>
        ))}
        <text x="10" y={padY + 4} className={styles.axisLabel}>{formatValue(max)}</text>
        <text x="10" y={padY + innerH} className={styles.axisLabel}>0</text>
      </svg>
      <p className={styles.chartNote}>Eje X: número de sensores. Cada punto es la media de las réplicas configuradas.</p>
    </article>
  );
}

export default function ExperimentPage() {
  const [preset, setPreset] = useState<Preset>("CORE");
  const [baseSeed, setBaseSeed] = useState(12345);
  const [replications, setReplications] = useState(5);
  const [result, setResult] = useState<ReplicatedExperimentResult | null>(null);
  const [running, setRunning] = useState(false);
  const expectedRuns = estimateRuns(preset, replications);

  const run = () => {
    setRunning(true);
    window.setTimeout(() => {
      const executedAt = new Date().toISOString();
      const next = preset === "CORE"
        ? runReplicatedExperiments({
            scenarioIds: CORE_EXPERIMENT_SCENARIOS,
            baseSeed,
            replications,
            executedAt,
            trafficSource: "SYNTHETIC:CORE_MATRIX",
          })
        : runReplicatedExperiments({
            scenarioIds: SCALABILITY_SCENARIOS,
            sensorCounts: DEFAULT_SCALABILITY_SENSOR_COUNTS,
            baseSeed,
            replications,
            executedAt,
            trafficSource: "SYNTHETIC:SCALABILITY_SWEEP",
          });
      setResult(next);
      setRunning(false);
    }, 0);
  };

  const scalabilityGroups = useMemo(() => {
    if (!result || preset !== "SCALABILITY") return [];
    return SCALABILITY_SCENARIOS.map((scenarioId) => ({
      scenarioId,
      rows: result.aggregates.filter((row) => row.scenarioId === scenarioId),
    }));
  }, [result, preset]);

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p>Jiw 5G · FASE 9B.2</p>
          <h1>Laboratorio experimental</h1>
          <span>Repite el mismo experimento con varias semillas para observar tendencias, no una única ejecución afortunada.</span>
        </div>
        <Link href="/" className={styles.back}>← Volver al dashboard</Link>
      </header>

      <section className={styles.notice}>
        <strong>Lectura académica:</strong> estas son estadísticas descriptivas de ejecuciones del modelo. Varias semillas reducen la dependencia de una sola realización pseudoaleatoria, pero no convierten la simulación en evidencia de cumplimiento real de 3GPP ni en mediciones de una red comercial.
      </section>

      <section className={styles.controls}>
        <div className={styles.controlIntro}>
          <p>Diseño del experimento</p>
          <h2>¿Qué pregunta quieres responder?</h2>
        </div>
        <div className={styles.presetGrid}>
          <button className={preset === "CORE" ? styles.presetActive : styles.preset} onClick={() => { setPreset("CORE"); setResult(null); }}>
            <strong>Matriz principal</strong>
            <span>Los 5 escenarios con su cantidad de sensores definida. Sirve para comparar el comportamiento general del sistema.</span>
          </button>
          <button className={preset === "SCALABILITY" ? styles.presetActive : styles.preset} onClick={() => { setPreset("SCALABILITY"); setResult(null); }}>
            <strong>Escalabilidad</strong>
            <span>Alta densidad y congestión crítica con 50–1000 sensores. Sirve para observar cómo cambian mMTC y el canal al crecer la red.</span>
          </button>
        </div>
        <div className={styles.controlRow}>
          <label><span>Semilla inicial</span><input type="number" value={baseSeed} onChange={(event) => setBaseSeed(Number(event.target.value))} /></label>
          <label><span>Réplicas</span><input type="number" min={1} max={30} value={replications} onChange={(event) => setReplications(Math.min(30, Math.max(1, Number(event.target.value))))} /></label>
          <div className={styles.runEstimate}><span>Ejecuciones</span><strong>{expectedRuns}</strong><small>Baseline y Proposed comparten el mismo workload dentro de cada ejecución.</small></div>
          <button className={styles.runButton} disabled={running} onClick={run}>{running ? "Ejecutando…" : "Ejecutar experimento"}</button>
        </div>
        <p className={styles.methodNote}>Las semillas usadas son consecutivas desde la semilla inicial. Son réplicas pseudoaleatorias deterministas; no afirmamos independencia estadística perfecta. Para exploración usa 5–10 réplicas. Para resultados finales prueba 20–30 si el navegador mantiene tiempos razonables.</p>
      </section>

      {result && (
        <>
          <section className={styles.summaryStrip}>
            <div><span>Réplicas por grupo</span><strong>{result.metadata.replications}</strong></div>
            <div><span>Ejecuciones totales</span><strong>{result.metadata.totalRuns}</strong></div>
            <div><span>Semillas</span><strong>{result.options.seeds[0]}–{result.options.seeds[result.options.seeds.length - 1]}</strong></div>
            <div><span>Fuente</span><strong>Sintética</strong></div>
          </section>

          <section className={styles.panel}>
            <div className={styles.heading}><div><p>Resultados agregados</p><h2>Media de las réplicas</h2></div><span>{result.aggregates.length} grupos</span></div>
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Escenario</th><th>Sensores</th><th>TX B → P</th><th>Colisiones B → P</th><th>Energy proxy B → P</th><th>Reliability B → P</th><th>Latencia B → P</th><th>Overhead B → P</th></tr></thead>
                <tbody>
                  {result.aggregates.map((row) => (
                    <tr key={`${row.scenarioId}-${row.sensorCount}`}>
                      <td><strong>{row.scenarioId}</strong></td>
                      <td>{row.sensorCount}</td>
                      <td>{formatNumber(row.mmtc.transmittedMessages.baseline.mean)} → <b>{formatNumber(row.mmtc.transmittedMessages.proposed.mean)}</b><small>{formatPercent(row.mmtc.transmittedMessages.relativeReduction)} reducción</small></td>
                      <td>{formatNumber(row.mmtc.collisions.baseline.mean)} → <b>{formatNumber(row.mmtc.collisions.proposed.mean)}</b></td>
                      <td>{formatNumber(row.mmtc.energyProxy.baseline.mean)} → <b>{formatNumber(row.mmtc.energyProxy.proposed.mean)}</b></td>
                      <td>{formatPercent(row.urllc.reliability.baseline.mean)} → <b>{formatPercent(row.urllc.reliability.proposed.mean)}</b></td>
                      <td>{formatNumber(row.urllc.latencyMean.baseline.mean)} → <b>{formatNumber(row.urllc.latencyMean.proposed.mean)}</b><small>ms</small></td>
                      <td>{formatNumber(row.urllc.redundancyOverhead.baseline.mean)}× → <b>{formatNumber(row.urllc.redundancyOverhead.proposed.mean)}×</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {preset === "SCALABILITY" && scalabilityGroups.map((group) => (
            <section className={styles.panel} key={group.scenarioId}>
              <div className={styles.heading}><div><p>Comportamiento al crecer N</p><h2>{group.scenarioId}</h2></div><span>Media de {replications} réplicas</span></div>
              <div className={styles.chartGrid}>
                <SimpleLineChart title="Mensajes transmitidos" rows={group.rows} getBaseline={(r) => r.mmtc.transmittedMessages.baseline.mean} getProposed={(r) => r.mmtc.transmittedMessages.proposed.mean} />
                <SimpleLineChart title="Colisiones" rows={group.rows} getBaseline={(r) => r.mmtc.collisions.baseline.mean} getProposed={(r) => r.mmtc.collisions.proposed.mean} />
              </div>
            </section>
          ))}

          <section className={styles.panel}>
            <div className={styles.heading}><div><p>Auditoría y análisis posterior</p><h2>Exportar resultados</h2></div></div>
            <p className={styles.exportCopy}>El CSV crudo conserva cada seed por separado. El CSV agregado contiene las medias por escenario y número de sensores. El JSON auditable conserva configuración, métricas por seed, comparaciones y estadísticas descriptivas, pero omite los logs masivos por mensaje/ruta para mantener una exportación segura en navegador.</p>
            <div className={styles.actions}>
              <button onClick={() => downloadText("jiw-5g-experimento-crudo.csv", serializeReplicationsRawCsv(result), "text/csv")}>CSV crudo</button>
              <button onClick={() => downloadText("jiw-5g-experimento-agregado.csv", serializeReplicationsAggregateCsv(result), "text/csv")}>CSV agregado</button>
              <button onClick={() => downloadText("jiw-5g-experimento.json", serializeReplicationsJson(result), "application/json")}>JSON auditable</button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
