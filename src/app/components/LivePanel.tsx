"use client";

import { useEffect, useState } from "react";
import {
  coordinatesFromLivePreset,
  DEFAULT_LIVE_LOCATION_PRESET,
  findLivePreset,
  LIVE_LOCATION_PRESETS,
} from "../../traffic/livePresets";
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
  const matchedPreset = findLivePreset(coordinates.latitude, coordinates.longitude);
  const [selectedPreset, setSelectedPreset] = useState<string>(matchedPreset?.id ?? DEFAULT_LIVE_LOCATION_PRESET.id);
  const point = pointFromDraft(coordinates);
  const canCapture = point !== null && traffic.source === "LIVE" && traffic.available;
  const presetInfo = selectedPreset === "custom"
    ? null
    : LIVE_LOCATION_PRESETS.find((preset) => preset.id === selectedPreset) ?? matchedPreset;

  useEffect(() => {
    const match = findLivePreset(coordinates.latitude, coordinates.longitude);
    if (match && selectedPreset !== "custom") setSelectedPreset(match.id);
  }, [coordinates.latitude, coordinates.longitude, selectedPreset]);

  const choosePreset = (id: string) => {
    setSelectedPreset(id);
    if (id === "custom") return;
    const preset = LIVE_LOCATION_PRESETS.find((candidate) => candidate.id === id);
    if (preset) onChange(coordinatesFromLivePreset(preset));
  };

  const changeCoordinate = (patch: Partial<LiveCoordinatesDraft>) => {
    setSelectedPreset("custom");
    onChange({ ...coordinates, ...patch });
  };

  return (
    <section className="panel panel--live" aria-labelledby="live-title" data-tour="live-panel">
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
        Selecciona un cruce de referencia de Bogotá o usa coordenadas personalizadas. El navegador consulta únicamente <code>/api/traffic</code>; la clave de TomTom permanece en el servidor.
      </p>

      <div className="live-preset-block" data-tour="live-preset">
        <label className="field field--wide">
          <span>Punto de consulta LIVE</span>
          <select value={selectedPreset} onChange={(event) => choosePreset(event.target.value)}>
            {LIVE_LOCATION_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>{preset.name}</option>
            ))}
            <option value="custom">Personalizado…</option>
          </select>
        </label>
        <div className="live-preset-description">
          <strong>{presetInfo?.shortName ?? "Coordenadas personalizadas"}</strong>
          <span>{presetInfo?.description ?? "Edita latitud y longitud para consultar cualquier otro punto WGS84."}</span>
        </div>
      </div>

      <div className="live-coordinate-grid" data-tour="live-coordinates">
        <label className="field"><span>Latitud</span><input type="number" step="0.000001" min="-90" max="90" placeholder="Ej. 4.580456" value={coordinates.latitude} onChange={(event) => changeCoordinate({ latitude: event.target.value })} /></label>
        <label className="field"><span>Longitud</span><input type="number" step="0.000001" min="-180" max="180" placeholder="Ej. -74.157389" value={coordinates.longitude} onChange={(event) => changeCoordinate({ longitude: event.target.value })} /></label>
        <div className="live-coordinate-help">
          <span>Estado de coordenadas</span>
          <strong>{point ? "Válidas" : "Pendientes / inválidas"}</strong>
        </div>
      </div>
      <p className="live-query-note">La consulta se realiza al pulsar <strong>Ejecutar simulación</strong>; cambiar el selector no consume una llamada a TomTom.</p>
      {error && <div className="live-error"><strong>LIVE DATA UNAVAILABLE</strong><span>{error}</span><span>Puedes cambiar inmediatamente a REPLAY o DEMO.</span></div>}
      {canCapture && point && (
        <div className="live-capture" data-tour="live-replay-capture">
          <div><strong>Captura reproducible disponible</strong><span>Guarda este contexto TomTom como JSON y cárgalo posteriormente en REPLAY.</span></div>
          <button type="button" className="button button--secondary" onClick={() => downloadReplay(traffic, mapping, point)}>Guardar como Replay</button>
        </div>
      )}
    </section>
  );
}
