import { useRef, useState } from "react";
import { parseReplayJson, ReplayValidationError } from "../../traffic/replay";
import type { ReplayCapture } from "../../traffic/types";

interface ReplayPanelProps {
  capture: ReplayCapture | null;
  error: string | null;
  onLoaded: (capture: ReplayCapture) => void;
  onError: (message: string) => void;
}

const bundledExamples = [
  { label: "Ejemplo normal", path: "/replays/replay-normal.json" },
  { label: "Ejemplo congestión", path: "/replays/replay-congestion.json" },
] as const;

export function ReplayPanel({ capture, error, onLoaded, onError }: ReplayPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const loadText = (text: string) => {
    try {
      onLoaded(parseReplayJson(text));
    } catch (cause) {
      onError(cause instanceof ReplayValidationError ? cause.message : "No fue posible cargar el Replay.");
    }
  };

  const loadBundled = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      loadText(await response.text());
    } catch {
      onError("No fue posible cargar el Replay de ejemplo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel panel--replay" aria-labelledby="replay-title">
      <div className="panel__heading">
        <div><p className="section-kicker">REPLAY</p><h2 id="replay-title">Contexto reproducible</h2></div>
        <span className={`status-pill ${capture ? "status-pill--ok" : "status-pill--replay"}`}>{capture ? "LISTO" : "ESPERANDO JSON"}</span>
      </div>
      <p className="panel-note replay-intro">Carga un archivo con schemaVersion 1.0. El Replay reproduce el contexto externo y su mapeo; la aleatoriedad interna continúa controlada por la seed del simulador.</p>
      <div className="replay-actions">
        <input
          ref={inputRef}
          className="replay-file-input"
          type="file"
          accept="application/json,.json"
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            loadText(await file.text());
            input.value = "";
          }}
        />
        <button type="button" className="button button--primary" onClick={() => inputRef.current?.click()}>Seleccionar JSON</button>
        {bundledExamples.map((example) => (
          <button key={example.path} type="button" className="button button--secondary" disabled={loading} onClick={() => void loadBundled(example.path)}>{example.label}</button>
        ))}
      </div>
      {error && <div className="replay-error"><strong>REPLAY INVALID</strong><span>{error}</span></div>}
      {capture && (
        <div className="replay-summary">
          <div><span>ID</span><strong>{capture.capture.id}</strong></div>
          <div><span>Fuente original</span><strong>{capture.capture.originalProvider}</strong></div>
          <div><span>Capturado</span><strong>{capture.capture.capturedAt}</strong></div>
          <div><span>Esquema</span><strong>{capture.schemaVersion}</strong></div>
        </div>
      )}
    </section>
  );
}
