import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { formatInteger, formatMilliseconds, formatNumber, formatPercent } from "../dashboard/format";
import { ComparisonBar } from "./ComparisonBar";
import { ExploreTopicButton } from "./ExploreTopicButton";
import { HoverTerm } from "./HoverTerm";
import { MetricTable } from "./MetricTable";
import { TechnicalTerm } from "./TechnicalTerm";

export function UrllcPanel({ result }: { result: ScenarioExperimentResult }) {
  const baseline = result.urllc.baseline.metrics;
  const proposed = result.urllc.proposed.metrics;

  return (
    <section className="panel" aria-labelledby="urllc-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Alertas críticas</p>
          <h2 id="urllc-title"><TechnicalTerm id="urllc">URLLC</TechnicalTerm> · <HoverTerm id="baseline">Baseline</HoverTerm> vs propuesta</h2>
        </div>
        <div className="panel-heading-actions">
          <span className="panel-chip"><TechnicalTerm id="threshold">Umbral experimental</TechnicalTerm> {formatMilliseconds(result.config.urllc.latencyThresholdMs)}</span>
          <ExploreTopicButton
            topicId="urllc"
            evidence={
              <div className="evidence-grid">
                <div><span>Fiabilidad</span><strong>{formatPercent(baseline.reliability)} → {formatPercent(proposed.reliability)}</strong></div>
                <div><span>Latencia media</span><strong>{formatMilliseconds(baseline.latencyMean)} → {formatMilliseconds(proposed.latencyMean)}</strong></div>
                <div><span><HoverTerm id="overhead">Overhead</HoverTerm></span><strong>{formatNumber(baseline.redundancyOverhead)}x → {formatNumber(proposed.redundancyOverhead)}x</strong></div>
              </div>
            }
          />
        </div>
      </div>
      <MetricTable rows={[
        { key: "critical", label: "Eventos críticos", baseline: formatInteger(baseline.criticalEvents), proposed: formatInteger(proposed.criticalEvents) },
        { key: "delivered", label: "Alertas entregadas", baseline: formatInteger(baseline.deliveredAlerts), proposed: formatInteger(proposed.deliveredAlerts) },
        { key: "lost", label: "Alertas perdidas", baseline: formatInteger(baseline.lostAlerts), proposed: formatInteger(proposed.lostAlerts) },
        { key: "mean", label: <TechnicalTerm id="latency">Latencia media</TechnicalTerm>, baseline: formatMilliseconds(baseline.latencyMean), proposed: formatMilliseconds(proposed.latencyMean) },
        { key: "median", label: "Mediana", baseline: formatMilliseconds(baseline.latencyMedian), proposed: formatMilliseconds(proposed.latencyMedian) },
        { key: "p95", label: <TechnicalTerm id="p95">P95</TechnicalTerm>, baseline: formatMilliseconds(baseline.p95), proposed: formatMilliseconds(proposed.p95) },
        { key: "p99", label: <TechnicalTerm id="p99">P99</TechnicalTerm>, baseline: formatMilliseconds(baseline.p99), proposed: formatMilliseconds(proposed.p99) },
        { key: "max", label: "Latencia máxima", baseline: formatMilliseconds(baseline.maxLatency), proposed: formatMilliseconds(proposed.maxLatency) },
        { key: "reliability", label: <TechnicalTerm id="reliability">Fiabilidad experimental</TechnicalTerm>, baseline: formatPercent(baseline.reliability), proposed: formatPercent(proposed.reliability) },
        { key: "threshold", label: "Dentro del umbral", baseline: formatInteger(baseline.deliveredWithinThreshold), proposed: formatInteger(proposed.deliveredWithinThreshold) },
        { key: "overhead", label: <HoverTerm id="overhead">Overhead de redundancia</HoverTerm>, baseline: `${formatNumber(baseline.redundancyOverhead)}x`, proposed: `${formatNumber(proposed.redundancyOverhead)}x` },
      ]} />
      <div className="chart-stack" aria-label="Gráficas comparativas URLLC">
        <ComparisonBar label="¿Se reduce la latencia media?" baseline={baseline.latencyMean ?? 0} proposed={proposed.latencyMean ?? 0} format={formatMilliseconds} />
        <ComparisonBar label="Fiabilidad experimental" baseline={baseline.reliability} proposed={proposed.reliability} format={(value) => formatPercent(value)} />
      </div>
    </section>
  );
}
