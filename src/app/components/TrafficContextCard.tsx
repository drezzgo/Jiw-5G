import type { TrafficSnapshot } from "../../traffic/types";
import { formatNumber } from "../dashboard/format";

export function TrafficContextCard({ traffic }: { traffic: TrafficSnapshot }) {
  const replay = traffic.source === "REPLAY";
  return (
    <section className="panel panel--traffic" aria-labelledby="traffic-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Contexto externo</p>
          <h2 id="traffic-title">Tráfico del escenario</h2>
        </div>
        <span className={`status-pill ${replay ? "status-pill--replay" : "status-pill--demo"}`}>{traffic.source}</span>
      </div>
      <div className="stat-grid stat-grid--compact">
        <div className="stat"><span>Origen</span><strong>{replay ? "Archivo Replay" : "Sintético"}</strong></div>
        <div className="stat"><span>Velocidad actual</span><strong>{traffic.currentSpeedKmh === null ? "—" : `${formatNumber(traffic.currentSpeedKmh, 0)} km/h`}</strong></div>
        <div className="stat"><span>Flujo libre</span><strong>{traffic.freeFlowSpeedKmh === null ? "—" : `${formatNumber(traffic.freeFlowSpeedKmh, 0)} km/h`}</strong></div>
        <div className="stat"><span>Congestión</span><strong>{traffic.congestionLevel}</strong></div>
      </div>
      <p className="panel-note">
        {replay
          ? "Contexto reproducido desde un JSON validado. El archivo conserva los datos y parámetros de mapeo usados para derivar el escenario."
          : "Contexto sintético DEMO. Desde FASE 6 usa la misma interfaz TrafficDataProvider que REPLAY."}
      </p>
      <p className="timestamp">Timestamp del contexto: {traffic.timestamp === "DEMO_PREVIEW" ? "vista inicial reproducible" : traffic.timestamp}</p>
    </section>
  );
}
