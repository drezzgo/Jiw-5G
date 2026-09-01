# FASE 7 - TomTom LIVE

Jiw 5G utiliza TomTom Traffic API exclusivamente como **contexto vial externo**. Los datos TomTom no representan la red mMTC ni URLLC y no demuestran cumplimiento 3GPP.

## Arquitectura

```text
Browser
  -> /api/traffic?lat=...&lon=...
  -> Next.js server route
  -> TomTom Traffic API
  -> TrafficSnapshot
  -> Traffic mapping parametrizado
  -> SimulationConfig
  -> Simulation Engine
```

La clave `TOMTOM_API_KEY` se lee únicamente dentro de la ruta server-side de Next.js. Nunca se utiliza una variable `NEXT_PUBLIC_*` para esta credencial.

## Fuente TomTom utilizada

El contexto principal proviene de **Traffic Flow Segment Data, service version 4**. La consulta pide el segmento vial más cercano al punto WGS84 seleccionado y solicita velocidades en `KMPH`.

Endpoint de referencia:

```text
GET https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json
```

Campos usados:

- `currentSpeed`
- `freeFlowSpeed`
- `currentTravelTime`
- `freeFlowTravelTime`

Documentación oficial:

- https://docs.tomtom.com/traffic-api/documentation/tomtom-maps/v1/traffic-flow/flow-segment-data

## Incidentes

Como contexto adicional, el backend intenta consultar **Incident Details service version 5** alrededor del punto seleccionado. La cantidad de incidentes es informativa y no modifica directamente el Simulation Engine.

Se usa un bounding box aproximado equivalente a un radio local de 500 m. Esta aproximación es una decisión de implementación de Jiw 5G, no un parámetro TomTom ni 3GPP.

Documentación oficial:

- https://docs.tomtom.com/traffic-api/documentation/tomtom-maps/v1/traffic-incidents/incident-details

Si esta consulta adicional falla pero Flow Segment Data funciona, el snapshot LIVE sigue siendo utilizable y `incidents` queda en `null`.

## Mapping hacia el simulador

FASE 7 reutiliza exactamente el mapping parametrizado introducido en FASE 6. TomTom entrega datos viales; Jiw 5G decide cómo convertirlos en `trafficLevel` y `vehicleArrivalRate`.

Los umbrales y tasas siguen siendo **supuestos experimentales del modelo**.

## Fallback

Si falta la API key, TomTom no responde, hay timeout o la respuesta no cumple el esquema esperado:

- `/api/traffic` devuelve estado no exitoso y un `TrafficSnapshot` con `available=false`;
- el navegador muestra `LIVE DATA UNAVAILABLE`;
- no se ejecuta silenciosamente una nueva simulación LIVE con datos inventados;
- DEMO y REPLAY siguen disponibles inmediatamente.

## LIVE -> REPLAY

Después de una consulta LIVE exitosa, el dashboard permite **Guardar como Replay**. El JSON resultante conserva:

- snapshot de tráfico TomTom;
- timestamp;
- `originalProvider = TOMTOM`;
- mapping experimental usado.

Así una demostración real puede repetirse posteriormente sin depender de disponibilidad de TomTom.

## Configuración local

Crear `.env.local` (no versionar):

```env
TOMTOM_API_KEY=tu_clave_real
```

`.env.example` debe conservar únicamente:

```env
TOMTOM_API_KEY=
```

## Vercel

Crear la variable `TOMTOM_API_KEY` en Project Settings -> Environment Variables para Preview y/o Production según el entorno que se quiera probar. Después se debe redeployar para que el deployment reciba la variable.
