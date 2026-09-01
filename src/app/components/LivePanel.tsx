import type { TrafficMappingConfig, TrafficSnapshot } from "../../traffic/types";
import {
  buildTomTomReplayCapture,
  isValidTomTomPoint,
  type TomTomPoint,
} from "../../traffic/tomtom";

export interface LiveCoordinatesDraft {
  latitude: string;
  longitude: string;
}

interface LivePanelProps {
  coordinates: LiveCoordinatesDraft;
  traffic: TrafficSnapshot;
  mapping: TrafficMappingConfig;
  error: string | null;
  onChange: (coordinates: LiveCoordinatesDraft) => void;
}

function pointFromDraft(draft: LiveCoordinatesDraft): TomTomPoint | null {
  if (draft.latitude.trim() === "" || draft.longitude.trim() === "") return null;
  const point = { latitude: Number(draft.latitude), longitude: Number(draft.longitude) };
  return isValidTomTomPoint(point) ? point : null;
}

function downloadReplay(traffic: TrafficSnapshot, mapping: TrafficMappingConfig, point: TomTomPoint) {
  const capture = buildTomTomReplayCapture(traffic, mapping, point);
  const blob = new Blob([JSON.stringify(capture, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${capture.capture.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LivePanel({ coordinates, traffic, mapping, error, onChange }: LivePanelProps) {
  const point = pointFromDraft(coordinates);
  const canCapture = point !== null && traffic.source === "LIVE" && traffic.available;

  return (
    <section className="panel panel--live" aria-labelledby="live-title">
      <div className="panel__heading">
        <div>
          <p className="section-kicker">LIVE · TomTom Traffic API</p>
          <h2 id="live-title">Punto del cruce</h2>
        </div>
        <span className={`status-pill ${traffic.source === "LIVE" && traffic.available ? "status-pill--ok" : "status-pill--live"}`}>
          {traffic.source === "LIVE" && traffic.available ? "LIVE DATA" : "SIN CONSULTA"}
        </span>
      </div>
      <p className="panel-note live-intro">
        Introduce las coordenadas WGS84 del punto cercano al cruce. El navegador consulta únicamente <code>/api/traffic</code>; la clave de TomTom permanece en el servidor.
      </p>
      <div className="live-coordinate-grid">
        <label className="field"><span>Latitud</span><input type="number" step="0.000001" min="-90" max="90" placeholder="Ej. 4.123456" value={coordinates.latitude} onChange={(event) => onChange({ ...coordinates, latitude: event.target.value })} /></label>
        <label className="field"><span>Longitud</span><input type="number" step="0.000001" min="-180" max="180" placeholder="Ej. -74.123456" value={coordinates.longitude} onChange={(event) => onChange({ ...coordinates, longitude: event.target.value })} /></label>
        <div className="live-coordinate-help">
          <span>Estado de coordenadas</span>
          <strong>{point ? "Válidas" : "Pendientes / inválidas"}</strong>
        </div>
      </div>
      {error && <div className="live-error"><strong>LIVE DATA UNAVAILABLE</strong><span>{error}</span><span>Puedes cambiar inmediatamente a REPLAY o DEMO.</span></div>}
      {canCapture && point && (
        <div className="live-capture">
          <div><strong>Captura reproducible disponible</strong><span>Guarda este contexto TomTom como JSON y cárgalo posteriormente en REPLAY.</span></div>
          <button type="button" className="button button--secondary" onClick={() => downloadReplay(traffic, mapping, point)}>Guardar como Replay</button>
        </div>
      )}
    </section>
  );
}
