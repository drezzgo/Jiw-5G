# Especificación técnica y académica

## 1. Arquitectura definitiva

El repositorio es WEB-FIRST y full-stack con Next.js, pero el `Simulation Engine` es TypeScript puro y no importa React, APIs externas ni componentes de UI.

Flujo principal:

`TrafficDataProvider -> SimulationContext/Config -> Simulation Engine -> EventBus -> logs/metrics -> Dashboard/export`

Implementaciones previstas del proveedor: `SyntheticTrafficProvider` (DEMO), `ReplayTrafficProvider` (REPLAY) y `TomTomTrafficProvider` (LIVE). El proveedor LIVE del navegador solo llama `/api/traffic`; la clave de TomTom permanece en el servidor.

El `EventBus` actual es `LocalEventBus`. Una futura implementación `MqttEventBus` debe respetar la misma interfaz.

## 2. Modelo de tiempo

Se adopta simulación de tiempo discreto con pasos de `stepMs`. Es una abstracción académica, no un simulador de ranuras NR 5G.

## 3. Baseline y Proposed

### mMTC BASELINE

- Cada sensor intenta transmitir periódicamente cada `periodicIntervalMs`.
- Los intentos del mismo paso compiten por una capacidad finita `channelCapacityPerStep`.
- Si la capacidad se excede, el modelo contabiliza colisión/congestión según la regla que se implemente en FASE 2.
- Se permiten retransmisiones hasta `maxRetries`.

### mMTC PROPOSED

- Cada sensor genera mediciones, pero transmite solo cuando ocurre una excepción/evento relevante según un criterio parametrizable.
- Los mensajes ordinarios que compiten aplican backoff uniforme entero entre `backoffMinSteps` y `backoffMaxSteps`.
- Una alerta ya clasificada como URLLC crítica nunca recibe este backoff.

### URLLC BASELINE

- Una sola ruta (Ruta A).
- Prioridad ordinaria/cola compartida.
- Retardo y pérdida se toman de la configuración de la ruta.

### URLLC PROPOSED

- Alerta con prioridad superior.
- Se envían dos copias por Ruta A y Ruta B.
- Las rutas se modelan independientes por supuesto experimental.
- La primera copia válida recibida determina la latencia efectiva; la otra se descarta lógicamente.

## 4. Métricas y fórmulas

### mMTC

- `generatedMessages`: mensajes/mediciones generadas por sensores.
- `transmittedMessages`: intentos de transmisión efectivamente puestos en el canal (definiremos si incluye reintentos; decisión recomendada: sí para carga de canal, además de mantener `retries` separado).
- `avoidedTransmissions = generatedMessages - initialTransmissionsRequested` en PROPOSED. No debe mezclarse con pérdidas o colisiones.
- `collisions`: intentos que fallan por competencia según la regla de acceso.
- `retries`: intentos adicionales posteriores al primer intento.
- `successfulMessages`: mensajes lógicos entregados.
- `failedMessages`: mensajes lógicos agotados/descartados.
- `successRate = successfulMessages / generatedMessages` (si `generatedMessages = 0`, se reporta 0 y se marca muestra vacía en la UI).
- `channelUtilization = occupiedTransmissionSlots / availableTransmissionSlots`.
- `energyProxy = N_tx * E_tx + N_idle * E_idle`.

`energyProxy` es una métrica adimensional simplificada, no consumo físico real en J o Wh.

### URLLC

Sea `L` el conjunto de latencias de alertas entregadas:

- `criticalEvents = N`.
- `deliveredAlerts = |L|`.
- `lostAlerts = N - deliveredAlerts`.
- `latencyMean = sum(L)/|L|`.
- `latencyMedian = P50(L)`.
- `p95 = P95(L)`.
- `p99 = P99(L)` solo se interpretará cuando el tamaño de muestra sea suficiente; el software puede calcularlo, pero el informe debe advertir muestras pequeñas.
- `maxLatency = max(L)`.
- `deliveredWithinThreshold = count(latency <= latencyThresholdMs)`.
- `reliability = deliveredWithinThreshold / criticalEvents`.
- `redundancyOverhead = physicalCopiesSent / logicalAlertsGenerated`; baseline ideal = 1, proposed ideal = 2 antes de cancelaciones/optimizaciones.

No se interpretará `reliability` como cumplimiento real 3GPP.

## 5. Parámetros configurables

- Reproducibilidad: `seed`, `simulatorVersion`.
- Ejecución: `scenarioId`, `mode`, `durationMs`, `stepMs`.
- Escenario: `sensorCount`, `trafficLevel`, `vehicleArrivalRate`.
- Riesgo: probabilidades sintéticas, rango de riesgo, `threshold`, ventana crítica forzada opcional.
- mMTC: periodo, probabilidad/criterio de excepción, capacidad por paso, reintentos, límites de backoff, unidades proxy de energía.
- URLLC: umbral experimental de latencia y por ruta: habilitación, latencia base, jitter, pérdida.

## 6. Flujo exacto de una ejecución

1. Seleccionar modo de datos y obtener un `TrafficSnapshot`.
2. Transformar el contexto externo a parámetros del escenario mediante reglas explícitas y configurables.
3. Crear `SimulationConfig` con escenario + seed + parámetros.
4. Inicializar PRNG determinista.
5. Avanzar en pasos discretos.
6. Generar observaciones sintéticas/replay.
7. Evaluar `pedestrianPresent && vehicleApproaching && estimatedRisk > threshold`.
8. Publicar eventos en `EventBus` y guardar logs.
9. FASE 2: procesar tráfico ordinario con estrategia mMTC seleccionada.
10. FASE 3: procesar alerta crítica con estrategia URLLC seleccionada.
11. FASE 4: derivar métricas únicamente de logs/resultados.
12. FASE 5: presentar baseline vs proposed y exportar JSON/CSV.

## 7. Supuestos académicos que deben declararse

1. El modelo usa tiempo discreto; no reproduce PHY/MAC completo de 5G NR.
2. `sensorCount`, probabilidades, capacidades, retardos, jitter, pérdidas y umbrales son parámetros experimentales salvo que una fuente posterior los justifique.
3. Las rutas URLLC A/B se consideran independientes en el modelo proposed; es un supuesto, no una garantía de una red real.
4. El riesgo `[0,1]` es una variable abstracta generada por el escenario; no proviene de visión artificial ni de un modelo clínico/físico validado.
5. La ventana crítica forzada de algunos escenarios existe para garantizar experimentos reproducibles.
6. `energyProxy` es adimensional y solo sirve para comparar estrategias bajo el mismo modelo.
7. Los datos TomTom, cuando se integren, describen tráfico vial externo y no mMTC/URLLC.
8. Toda regla TomTom -> `trafficLevel`/`vehicleArrivalRate` debe quedar parametrizada y etiquetada como supuesto de transformación.
9. `latencyThresholdMs` es un requisito experimental mientras no se vincule explícitamente a una fuente; no debe presentarse como KPI 3GPP por defecto.
10. El uso de Mulberry32 garantiza repetibilidad de nuestro software con la misma implementación/versión; no es un RNG criptográfico.

## 8. Pruebas

FASE 1 implementada ahora:
- misma seed + mismos parámetros + timestamp fijo => mismo resultado;
- semillas distintas => stream distinto;
- la regla de evento crítico exige las tres condiciones.

FASES 2–4, obligatorias antes de cerrar el MVP:
- pérdida 0 en ruta funcional no produce pérdidas atribuibles al modelo de ruta;
- redundancia independiente mantiene o mejora probabilidad de entrega;
- transmisión por excepción reduce `transmittedMessages` cuando evita mensajes;
- `energyProxy` disminuye al disminuir transmisiones, bajo los mismos demás términos;
- métricas del dashboard se recalculan/contrastan con logs.
