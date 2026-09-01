import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { formatInteger, formatMilliseconds, formatNumber, formatPercent } from "../dashboard/format";
import { ComparisonBar } from "./ComparisonBar";
import { MetricTable } from "./MetricTable";

export function UrllcPanel({ result }: { result: ScenarioExperimentResult }) {
  const baseline = result.urllc.baseline.metrics;
  const proposed = result.urllc.proposed.metrics;

  return (
    <section className="panel" aria-labelledby="urllc-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Alertas críticas</p>
          <h2 id="urllc-title">URLLC · Baseline vs propuesta</h2>
        </div>
        <span className="panel-chip">Umbral experimental {formatMilliseconds(result.config.urllc.latencyThresholdMs)}</span>
      </div>

      <MetricTable rows={[
        { label: "Eventos críticos", baseline: formatInteger(baseline.criticalEvents), proposed: formatInteger(proposed.criticalEvents) },
        { label: "Alertas entregadas", baseline: formatInteger(baseline.deliveredAlerts), proposed: formatInteger(proposed.deliveredAlerts) },
        { label: "Alertas perdidas", baseline: formatInteger(baseline.lostAlerts), proposed: formatInteger(proposed.lostAlerts) },
        { label: "Latencia media", baseline: formatMilliseconds(baseline.latencyMean), proposed: formatMilliseconds(proposed.latencyMean) },
        { label: "Mediana", baseline: formatMilliseconds(baseline.latencyMedian), proposed: formatMilliseconds(proposed.latencyMedian) },
        { label: "P95", baseline: formatMilliseconds(baseline.p95), proposed: formatMilliseconds(proposed.p95) },
        { label: "P99", baseline: formatMilliseconds(baseline.p99), proposed: formatMilliseconds(proposed.p99) },
        { label: "Latencia máxima", baseline: formatMilliseconds(baseline.maxLatency), proposed: formatMilliseconds(proposed.maxLatency) },
        { label: "Fiabilidad experimental", baseline: formatPercent(baseline.reliability), proposed: formatPercent(proposed.reliability) },
        { label: "Dentro del umbral", baseline: formatInteger(baseline.deliveredWithinThreshold), proposed: formatInteger(proposed.deliveredWithinThreshold) },
        { label: "Overhead de redundancia", baseline: `${formatNumber(baseline.redundancyOverhead)}x`, proposed: `${formatNumber(proposed.redundancyOverhead)}x` },
      ]} />

      <div className="chart-stack" aria-label="Gráficas comparativas URLLC">
        <ComparisonBar label="¿Se reduce la latencia media?" baseline={baseline.latencyMean ?? 0} proposed={proposed.latencyMean ?? 0} format={formatMilliseconds} />
        <ComparisonBar label="Fiabilidad experimental" baseline={baseline.reliability} proposed={proposed.reliability} format={(value) => formatPercent(value)} />
      </div>
    </section>
  );
}
