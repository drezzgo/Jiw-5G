import type { CriticalAlertDisplay, RouteDisplay } from "../dashboard/presentation";
import { formatMilliseconds, formatNumber } from "../dashboard/format";
import { ExploreTopicButton } from "./ExploreTopicButton";
import { TechnicalTerm } from "./TechnicalTerm";

function RouteCard({ route }: { route: RouteDisplay }) {
  const label = route.status === "DELIVERED" ? "Entregada" : route.status === "LOST" ? "Perdida" : "No enviada";
  return (
    <div className={`route-card route-card--${route.status.toLowerCase()}`}>
      <div><span>Ruta {route.route}</span><strong>{label}</strong></div>
      <b>{route.status === "DELIVERED" ? formatMilliseconds(route.latencyMs) : route.status === "LOST" ? "pérdida" : "—"}</b>
    </div>
  );
}
export function CriticalEventPanel({ alert }: { alert: CriticalAlertDisplay | null }) {
  return (
    <section className="panel panel--critical" aria-labelledby="critical-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Trazabilidad del evento</p>
          <h2 id="critical-title">Evento crítico actual</h2>
        </div>
        <div className="panel-heading-actions">
          {alert ? <span className={`status-pill ${alert.delivered ? "status-pill--ok" : "status-pill--danger"}`}>{alert.delivered ? "ALERTA ENTREGADA" : "ALERTA PERDIDA"}</span> : <span className="status-pill">SIN EVENTOS</span>}
          <ExploreTopicButton
            topicId="risk"
            evidence={alert ? (
              <div className="evidence-grid">
                <div><span>Riesgo</span><strong>{formatNumber(alert.estimatedRisk, 3)}</strong></div>
                <div><span>Umbral</span><strong>{formatNumber(alert.threshold, 2)}</strong></div>
                <div><span>Resultado</span><strong>{alert.delivered ? "Alerta entregada" : "Alerta perdida"}</strong></div>
              </div>
            ) : <p className="evidence-empty">La ejecución actual no generó un evento crítico; el algoritmo sigue siendo el mismo.</p>}
          />
        </div>
      </div>
      {!alert ? (
        <div className="empty-state">Este escenario no generó eventos críticos con la seed y parámetros actuales.</div>
      ) : (
        <>
          <div className="risk-flow">
            <div className="risk-node"><span>Peatón</span><strong>Presente ✓</strong></div>
            <span className="risk-operator">+</span>
            <div className="risk-node"><span>Vehículo</span><strong>Aproximándose ✓</strong></div>
            <span className="risk-operator">+</span>
            <div className="risk-node"><span>Riesgo estimado</span><strong>{formatNumber(alert.estimatedRisk, 3)} &gt; {formatNumber(alert.threshold, 2)}</strong></div>
            <span className="risk-arrow">→</span>
            <div className="risk-node risk-node--critical"><span>Clasificación</span><strong>EVENTO CRÍTICO</strong></div>
          </div>
          <div className="alert-route-layout">
            <div className="alert-source"><span>ALERTA</span><strong><TechnicalTerm id="urllc">URLLC</TechnicalTerm></strong></div>
            <div className="route-stack">
              <RouteCard route={alert.routeA} />
              <RouteCard route={alert.routeB} />
            </div>
          </div>
          <div className="alert-result-grid">
            <div className="stat"><span><TechnicalTerm id="redundancy">Primera copia válida</TechnicalTerm></span><strong>{alert.firstValidRoute ? `Ruta ${alert.firstValidRoute}` : "Ninguna"}</strong></div>
            <div className="stat"><span><TechnicalTerm id="latency">Latencia lógica</TechnicalTerm></span><strong>{formatMilliseconds(alert.latencyMs)}</strong></div>
            <div className="stat"><span><TechnicalTerm id="threshold">Dentro del umbral</TechnicalTerm></span><strong>{alert.withinThreshold ? "Sí" : "No"}</strong></div>
            <div className="stat"><span>Instante simulado</span><strong>{alert.generatedAtMs} ms</strong></div>
          </div>
        </>
      )}
    </section>
  );
}
