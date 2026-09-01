import type { TrafficSnapshot } from "../../traffic/types";
import { formatNumber } from "../dashboard/format";

export function TrafficContextCard({ traffic }: { traffic: TrafficSnapshot }) {
  return (
    <section className="panel panel--traffic" aria-labelledby="traffic-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Contexto externo</p>
          <h2 id="traffic-title">Tráfico del escenario</h2>
        </div>
        <span className="status-pill status-pill--demo">DEMO</span>
      </div>

      <div className="stat-grid stat-grid--compact">
        <div className="stat"><span>Origen</span><strong>{traffic.source === "DEMO" ? "Sintético" : traffic.source}</strong></div>
        <div className="stat"><span>Velocidad actual</span><strong>{traffic.currentSpeedKmh === null ? "—" : `${formatNumber(traffic.currentSpeedKmh, 0)} km/h`}</strong></div>
        <div className="stat"><span>Flujo libre</span><strong>{traffic.freeFlowSpeedKmh === null ? "—" : `${formatNumber(traffic.freeFlowSpeedKmh, 0)} km/h`}</strong></div>
        <div className="stat"><span>Congestión</span><strong>{traffic.congestionLevel}</strong></div>
      </div>

      <p className="panel-note">
        Valores sintéticos de presentación. No son lecturas TomTom y no alimentan el motor en esta fase.
      </p>
      <p className="timestamp">Ejecución: {traffic.timestamp === "DEMO_PREVIEW" ? "vista inicial reproducible" : traffic.timestamp}</p>
    </section>
  );
}
