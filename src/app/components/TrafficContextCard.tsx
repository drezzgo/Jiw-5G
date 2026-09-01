import type { TrafficLevel } from "../../simulation/core/types";
import type { TrafficSnapshot } from "../../traffic/types";
import { formatNumber } from "../dashboard/format";
import { ExploreTopicButton } from "./ExploreTopicButton";
import { TechnicalTerm } from "./TechnicalTerm";

interface TrafficContextCardProps {
  traffic: TrafficSnapshot;
  derivedTrafficLevel: TrafficLevel;
}
export function TrafficContextCard({ traffic, derivedTrafficLevel }: TrafficContextCardProps) {
  const replay = traffic.source === "REPLAY";
  const live = traffic.source === "LIVE";
  const statusClass = live
    ? (traffic.available ? "status-pill--ok" : "status-pill--live")
    : replay ? "status-pill--replay" : "status-pill--demo";
  const origin = live ? "TomTom Traffic API" : replay ? "Archivo Replay" : "Sintético";
  return (
    <section className="panel panel--traffic" aria-labelledby="traffic-title" data-tour="traffic-context">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">Contexto externo</p>
          <h2 id="traffic-title">Tráfico del escenario</h2>
        </div>
        <div className="panel-heading-actions">
          <span className={`status-pill ${statusClass}`}>{traffic.source}</span>
          <ExploreTopicButton
            topicId="traffic"
            evidence={
              <div className="evidence-grid">
                <div><span>Velocidad actual</span><strong>{traffic.currentSpeedKmh === null ? "—" : `${formatNumber(traffic.currentSpeedKmh, 0)} km/h`}</strong></div>
                <div><span>Flujo libre</span><strong>{traffic.freeFlowSpeedKmh === null ? "—" : `${formatNumber(traffic.freeFlowSpeedKmh, 0)} km/h`}</strong></div>
                <div><span>Nivel derivado</span><strong>{derivedTrafficLevel}</strong></div>
              </div>
            }
          />
        </div>
      </div>
      <div className="stat-grid stat-grid--compact">
        <div className="stat"><span>Origen</span><strong>{origin}</strong></div>
        <div className="stat"><span>Disponibilidad</span><strong>{traffic.available ? "Disponible" : "No disponible"}</strong></div>
        <div className="stat"><span>Velocidad actual</span><strong>{traffic.currentSpeedKmh === null ? "—" : `${formatNumber(traffic.currentSpeedKmh, 0)} km/h`}</strong></div>
        <div className="stat"><span><TechnicalTerm id="freeFlow">Flujo libre</TechnicalTerm></span><strong>{traffic.freeFlowSpeedKmh === null ? "—" : `${formatNumber(traffic.freeFlowSpeedKmh, 0)} km/h`}</strong></div>
        <div className="stat"><span>Tiempo actual</span><strong>{traffic.currentTravelTimeSeconds === null ? "—" : `${formatNumber(traffic.currentTravelTimeSeconds, 0)} s`}</strong></div>
        <div className="stat"><span>Tiempo libre</span><strong>{traffic.freeFlowTravelTimeSeconds === null ? "—" : `${formatNumber(traffic.freeFlowTravelTimeSeconds, 0)} s`}</strong></div>
        <div className="stat"><span><TechnicalTerm id="trafficMapping">Nivel usado por modelo</TechnicalTerm></span><strong>{derivedTrafficLevel}</strong></div>
        <div className="stat"><span>Incidentes cercanos</span><strong>{traffic.incidents === null ? "—" : formatNumber(traffic.incidents, 0)}</strong></div>
      </div>
      <p className="panel-note">
        {live
          ? (traffic.available
              ? "TomTom aporta el contexto vial externo. Jiw 5G transforma velocidad actual / flujo libre mediante el mapping experimental; TomTom no representa la red mMTC ni URLLC."
              : "LIVE DATA UNAVAILABLE. No se ejecutó una nueva simulación LIVE; DEMO y REPLAY permanecen disponibles.")
          : replay
            ? "Contexto reproducido desde un JSON validado. El archivo conserva los datos y parámetros de mapeo usados para derivar el escenario."
            : "Contexto sintético DEMO. Usa la misma interfaz TrafficDataProvider que REPLAY y LIVE."}
      </p>
      <p className="timestamp">Timestamp del contexto: {traffic.timestamp === "DEMO_PREVIEW" ? "vista inicial reproducible" : traffic.timestamp}</p>
    </section>
  );
}
