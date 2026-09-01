# Jiw 5G v1.0.0

Primera versión académica estable de Jiw 5G.

## Incluye

- motor determinista en TypeScript;
- generación de eventos de riesgo;
- comparación mMTC Baseline vs Proposed;
- transmisión por excepción;
- capacidad finita, colisiones, reintentos y backoff;
- `energyProxy` adimensional;
- comparación URLLC Baseline vs Proposed;
- prioridad experimental;
- redundancia por Ruta A + Ruta B;
- métricas de latencia, P95, P99 y reliability experimental;
- cinco escenarios configurables;
- dashboard académico;
- modo DEMO;
- REPLAY versionado;
- TomTom LIVE mediante backend seguro;
- guardado LIVE → Replay;
- dashboard pedagógico con popovers;
- términos en inglés explicados por hover/focus;
- tarjetas Blendy con explicación, ecuaciones y código;
- modo presentación;
- laboratorio `/experimentos`;
- réplicas deterministas;
- estudio de escalabilidad;
- exportación CSV cruda/agregada;
- JSON auditable sin logs masivos;
- suite automatizada de tests.

## Decisiones de alcance

MQTT no se incluye en v1.0.0 porque no era necesario para el objetivo académico y no añade evidencia experimental al estudio central.

## Limitaciones conocidas

- modelo abstracto, no una pila 5G NR completa;
- parámetros de latencia/pérdida/colas experimentales;
- independencia de rutas simplificada;
- `energyProxy` no físico;
- TomTom solo aporta contexto vial;
- agregación de URLLC por réplica requiere cuidado cuando `criticalEvents = 0`.

Consultar `docs/LIMITATIONS.md` para el detalle completo.
