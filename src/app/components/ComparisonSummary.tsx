import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { formatInteger, formatNumber, formatPercent, formatPercentagePoints } from "../dashboard/format";

function ChangeCard({ title, value, detail, cost = false }: { title: string; value: string; detail: string; cost?: boolean }) {
  return (
    <article className={`change-card ${cost ? "change-card--cost" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export function ComparisonSummary({ result }: { result: ScenarioExperimentResult }) {
  const { mmtc, urllc } = result.summary;
  return (
    <section className="panel" aria-labelledby="comparison-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Conclusión experimental inmediata</p>
          <h2 id="comparison-title">¿Qué mejora y cuál es el costo?</h2>
        </div>
      </div>

      <div className="change-grid">
        <ChangeCard title="Reducción de transmisiones mMTC" value={formatPercent(mmtc.transmissionReduction)} detail="Menor número de mensajes lógicos transmitidos frente al baseline." />
        <ChangeCard title="Reducción de colisiones" value={formatPercent(mmtc.collisionReduction)} detail="Cambio relativo bajo el modelo simplificado de capacidad y competencia." />
        <ChangeCard title="Reducción del energy proxy" value={formatPercent(mmtc.energyProxyReduction)} detail="Proxy adimensional; no representa energía física medida." />
        <ChangeCard title="Cambio de fiabilidad URLLC" value={formatPercentagePoints(urllc.reliabilityChange)} detail="Diferencia en puntos porcentuales de la fiabilidad experimental." />
        <ChangeCard title="Alertas perdidas evitadas" value={formatInteger(urllc.lostAlertsAvoided)} detail="Baseline perdidas menos propuesta perdidas para el mismo workload." />
        <ChangeCard cost title="Costo: overhead de redundancia" value={`${urllc.redundancyOverheadIncrease >= 0 ? "+" : ""}${formatNumber(urllc.redundancyOverheadIncrease)}x`} detail="Copias físicas adicionales por alerta lógica; es el costo explícito de la propuesta." />
      </div>
    </section>
  );
}
