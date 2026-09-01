import type { ReactNode } from "react";
import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { formatInteger, formatNumber, formatPercent, formatPercentagePoints } from "../dashboard/format";
import { ExploreTopicButton } from "./ExploreTopicButton";
import { TechnicalTerm } from "./TechnicalTerm";

function ChangeCard({ title, value, detail, cost = false }: { title: ReactNode; value: string; detail: string; cost?: boolean }) {
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
    <section className="panel" aria-labelledby="comparison-title" data-tour="comparison">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Conclusión experimental inmediata</p>
          <h2 id="comparison-title">¿Qué mejora y cuál es el costo?</h2>
        </div>
        <ExploreTopicButton
          topicId="comparison"
          evidence={
            <div className="evidence-grid">
              <div><span>Reducción TX mMTC</span><strong>{formatPercent(mmtc.transmissionReduction)}</strong></div>
              <div><span>Cambio fiabilidad</span><strong>{formatPercentagePoints(urllc.reliabilityChange)}</strong></div>
              <div><span>Costo redundancia</span><strong>{`${urllc.redundancyOverheadIncrease >= 0 ? "+" : ""}${formatNumber(urllc.redundancyOverheadIncrease)}x`}</strong></div>
            </div>
          }
        />
      </div>
      <div className="change-grid">
        <ChangeCard title="Reducción de transmisiones mMTC" value={formatPercent(mmtc.transmissionReduction)} detail="Menor número de mensajes lógicos transmitidos frente al baseline." />
        <ChangeCard title="Reducción de colisiones" value={formatPercent(mmtc.collisionReduction)} detail="Cambio relativo bajo el modelo simplificado de capacidad y competencia." />
        <ChangeCard title={<TechnicalTerm id="energyProxy">Reducción del energy proxy</TechnicalTerm>} value={formatPercent(mmtc.energyProxyReduction)} detail="Proxy adimensional; no representa energía física medida." />
        <ChangeCard title={<TechnicalTerm id="reliability">Cambio de fiabilidad URLLC</TechnicalTerm>} value={formatPercentagePoints(urllc.reliabilityChange)} detail="Diferencia en puntos porcentuales de la fiabilidad experimental." />
        <ChangeCard title="Alertas perdidas evitadas" value={formatInteger(urllc.lostAlertsAvoided)} detail="Baseline perdidas menos propuesta perdidas para el mismo workload." />
        <ChangeCard cost title={<TechnicalTerm id="overhead">Costo: overhead de redundancia</TechnicalTerm>} value={`${urllc.redundancyOverheadIncrease >= 0 ? "+" : ""}${formatNumber(urllc.redundancyOverheadIncrease)}x`} detail="Copias físicas adicionales por alerta lógica; es el costo explícito de la propuesta." />
      </div>
    </section>
  );
}
