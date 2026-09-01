# Jiw 5G — Formato REPLAY v1.0

FASE 6 introduce un formato JSON versionado para reproducir el **contexto externo de tráfico** sin depender de servicios HTTP.

## Alcance

Un Replay conserva:

- datos del contexto de tráfico;
- timestamp de la captura;
- fuente original declarada;
- parámetros usados para transformar velocidad/congestión en entradas del escenario simulado.

El Replay **no sustituye la seed** ni la configuración del experimento. Para reproducir los mismos resultados numéricos y logs deterministas se necesita:

1. mismo archivo Replay;
2. misma seed;
3. mismos parámetros del escenario;
4. misma versión del Simulation Engine.

El timestamp de la nueva ejecución puede cambiar; el timestamp del contexto capturado se conserva dentro del Replay.

## Esquema

```json
{
  "schemaVersion": "1.0",
  "capture": {
    "id": "capture-id",
    "capturedAt": "2026-09-01T12:00:00-05:00",
    "originalProvider": "SYNTHETIC | TOMTOM | OTHER",
    "description": "opcional"
  },
  "traffic": {
    "timestamp": "2026-09-01T12:00:00-05:00",
    "currentSpeedKmh": 15,
    "freeFlowSpeedKmh": 40,
    "currentTravelTimeSeconds": 120,
    "freeFlowTravelTimeSeconds": 70,
    "congestionLevel": "LOW | MEDIUM | HIGH | UNKNOWN",
    "incidents": 0,
    "available": true
  },
  "mapping": {
    "highCongestionSpeedRatioMax": 0.55,
    "mediumCongestionSpeedRatioMax": 0.8,
    "vehicleArrivalRateByLevel": {
      "LOW": 0.18,
      "MEDIUM": 0.35,
      "HIGH": 0.75
    }
  }
}
```

## Mapeo del contexto

Cuando existen `currentSpeedKmh` y `freeFlowSpeedKmh`, se calcula:

`speedRatio = currentSpeedKmh / freeFlowSpeedKmh`

Con los valores predeterminados de FASE 6:

- `speedRatio <= 0.55` → `HIGH`;
- `0.55 < speedRatio <= 0.80` → `MEDIUM`;
- `speedRatio > 0.80` → `LOW`.

Después `vehicleArrivalRate` se obtiene de `vehicleArrivalRateByLevel`.

**Estos umbrales y tasas son supuestos experimentales parametrizados del modelo. No son valores de TomTom ni requisitos 3GPP.**

Si las velocidades no están disponibles, el sistema usa `congestionLevel` cuando está definido; en último caso conserva el nivel del escenario como fallback.

## Fixtures incluidos

`public/replays/replay-normal.json` y `public/replays/replay-congestion.json` son datos **sintéticos** para validar FASE 6. No deben citarse como mediciones reales.
