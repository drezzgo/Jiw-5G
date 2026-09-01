import type { CriticalAlertDisplay, RouteDisplay } from "../dashboard/presentation";
import { formatMilliseconds, formatNumber } from "../dashboard/format";

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
        {alert ? <span className={`status-pill ${alert.delivered ? "status-pill--ok" : "status-pill--danger"}`}>{alert.delivered ? "ALERTA ENTREGADA" : "ALERTA PERDIDA"}</span> : <span className="status-pill">SIN EVENTOS</span>}
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
            <div className="alert-source"><span>ALERTA</span><strong>URLLC</strong></div>
            <div className="route-stack">
              <RouteCard route={alert.routeA} />
              <RouteCard route={alert.routeB} />
            </div>
          </div>

          <div className="alert-result-grid">
            <div className="stat"><span>Primera copia válida</span><strong>{alert.firstValidRoute ? `Ruta ${alert.firstValidRoute}` : "Ninguna"}</strong></div>
            <div className="stat"><span>Latencia lógica</span><strong>{formatMilliseconds(alert.latencyMs)}</strong></div>
            <div className="stat"><span>Dentro del umbral</span><strong>{alert.withinThreshold ? "Sí" : "No"}</strong></div>
            <div className="stat"><span>Instante simulado</span><strong>{alert.generatedAtMs} ms</strong></div>
          </div>
        </>
      )}
    </section>
  );
}
