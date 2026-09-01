import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { formatInteger, formatNumber, formatPercent } from "../dashboard/format";
import { ComparisonBar } from "./ComparisonBar";
import { ExploreTopicButton } from "./ExploreTopicButton";
import { HoverTerm } from "./HoverTerm";
import { MetricTable } from "./MetricTable";
import { TechnicalTerm } from "./TechnicalTerm";

export function MmtcPanel({ result }: { result: ScenarioExperimentResult }) {
  const baseline = result.mmtc.baseline.metrics;
  const proposed = result.mmtc.proposed.metrics;

  return (
    <section className="panel" aria-labelledby="mmtc-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Acceso masivo</p>
          <h2 id="mmtc-title"><TechnicalTerm id="mmtc">mMTC</TechnicalTerm> · <HoverTerm id="baseline">Baseline</HoverTerm> vs propuesta</h2>
        </div>
        <div className="panel-heading-actions">
          <span className="panel-chip">{result.config.sensorCount} sensores</span>
          <ExploreTopicButton
            topicId="mmtc"
            evidence={
              <div className="evidence-grid">
                <div><span>Transmisiones</span><strong>{formatInteger(baseline.transmittedMessages)} → {formatInteger(proposed.transmittedMessages)}</strong></div>
                <div><span>Colisiones</span><strong>{formatInteger(baseline.collisions)} → {formatInteger(proposed.collisions)}</strong></div>
                <div><span><HoverTerm id="energyProxy">Energy proxy</HoverTerm></span><strong>{formatNumber(baseline.energyProxy)} → {formatNumber(proposed.energyProxy)}</strong></div>
              </div>
            }
          />
        </div>
      </div>
      <MetricTable rows={[
        { key: "generated", label: "Mensajes generados", baseline: formatInteger(baseline.generatedMessages), proposed: formatInteger(proposed.generatedMessages) },
        { key: "transmitted", label: "Mensajes transmitidos", baseline: formatInteger(baseline.transmittedMessages), proposed: formatInteger(proposed.transmittedMessages) },
        { key: "avoided", label: "Transmisiones evitadas", baseline: formatInteger(baseline.avoidedTransmissions), proposed: formatInteger(proposed.avoidedTransmissions) },
        { key: "simultaneous", label: "Intentos simultáneos", baseline: formatInteger(baseline.simultaneousAttempts), proposed: formatInteger(proposed.simultaneousAttempts), note: "intentos físicos durante pasos sobrecargados" },
        { key: "collisions", label: <TechnicalTerm id="collision">Colisiones</TechnicalTerm>, baseline: formatInteger(baseline.collisions), proposed: formatInteger(proposed.collisions) },
        { key: "retries", label: "Retransmisiones", baseline: formatInteger(baseline.retries), proposed: formatInteger(proposed.retries), note: <>En la propuesta pueden usar <HoverTerm id="backoff">backoff</HoverTerm>.</> },
        { key: "success", label: "Mensajes exitosos", baseline: formatInteger(baseline.successfulMessages), proposed: formatInteger(proposed.successfulMessages) },
        { key: "failed", label: "Mensajes fallidos", baseline: formatInteger(baseline.failedMessages), proposed: formatInteger(proposed.failedMessages) },
        { key: "success-rate", label: "Tasa de éxito", baseline: formatPercent(baseline.successRate), proposed: formatPercent(proposed.successRate) },
        { key: "utilization", label: <TechnicalTerm id="channelUtilization">Utilización del canal</TechnicalTerm>, baseline: formatPercent(baseline.channelUtilization), proposed: formatPercent(proposed.channelUtilization) },
        { key: "energy", label: <HoverTerm id="energyProxy">Energy proxy</HoverTerm>, baseline: formatNumber(baseline.energyProxy), proposed: formatNumber(proposed.energyProxy), note: "adimensional; no es consumo físico" },
      ]} />
      <div className="chart-stack" aria-label="Gráficas comparativas mMTC">
        <ComparisonBar label="¿Se reduce el tráfico transmitido?" baseline={baseline.transmittedMessages} proposed={proposed.transmittedMessages} format={formatInteger} />
        <ComparisonBar label="¿Se reducen las colisiones?" baseline={baseline.collisions} proposed={proposed.collisions} format={formatInteger} />
      </div>
    </section>
  );
}
