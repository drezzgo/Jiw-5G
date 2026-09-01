import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { formatInteger, formatNumber, formatPercent } from "../dashboard/format";
import { ComparisonBar } from "./ComparisonBar";
import { MetricTable } from "./MetricTable";

export function MmtcPanel({ result }: { result: ScenarioExperimentResult }) {
  const baseline = result.mmtc.baseline.metrics;
  const proposed = result.mmtc.proposed.metrics;

  return (
    <section className="panel" aria-labelledby="mmtc-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Acceso masivo</p>
          <h2 id="mmtc-title">mMTC · Baseline vs propuesta</h2>
        </div>
        <span className="panel-chip">{result.config.sensorCount} sensores</span>
      </div>

      <MetricTable rows={[
        { label: "Mensajes generados", baseline: formatInteger(baseline.generatedMessages), proposed: formatInteger(proposed.generatedMessages) },
        { label: "Mensajes transmitidos", baseline: formatInteger(baseline.transmittedMessages), proposed: formatInteger(proposed.transmittedMessages) },
        { label: "Transmisiones evitadas", baseline: formatInteger(baseline.avoidedTransmissions), proposed: formatInteger(proposed.avoidedTransmissions) },
        { label: "Intentos simultáneos", baseline: formatInteger(baseline.simultaneousAttempts), proposed: formatInteger(proposed.simultaneousAttempts), note: "intentos físicos durante pasos sobrecargados" },
        { label: "Colisiones", baseline: formatInteger(baseline.collisions), proposed: formatInteger(proposed.collisions) },
        { label: "Retransmisiones", baseline: formatInteger(baseline.retries), proposed: formatInteger(proposed.retries) },
        { label: "Mensajes exitosos", baseline: formatInteger(baseline.successfulMessages), proposed: formatInteger(proposed.successfulMessages) },
        { label: "Mensajes fallidos", baseline: formatInteger(baseline.failedMessages), proposed: formatInteger(proposed.failedMessages) },
        { label: "Tasa de éxito", baseline: formatPercent(baseline.successRate), proposed: formatPercent(proposed.successRate) },
        { label: "Utilización del canal", baseline: formatPercent(baseline.channelUtilization), proposed: formatPercent(proposed.channelUtilization) },
        { label: "Energy proxy", baseline: formatNumber(baseline.energyProxy), proposed: formatNumber(proposed.energyProxy), note: "adimensional; no es consumo físico" },
      ]} />

      <div className="chart-stack" aria-label="Gráficas comparativas mMTC">
        <ComparisonBar label="¿Se reduce el tráfico transmitido?" baseline={baseline.transmittedMessages} proposed={proposed.transmittedMessages} format={formatInteger} />
        <ComparisonBar label="¿Se reducen las colisiones?" baseline={baseline.collisions} proposed={proposed.collisions} format={formatInteger} />
      </div>
    </section>
  );
}
