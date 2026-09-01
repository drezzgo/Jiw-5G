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
- `channelCapacityPerStep` representa cuántas transmisiones mMTC ordinarias pueden ser atendidas en un paso. Si la demanda la excede, los intentos excedentes se contabilizan como colisión/congestión. Es una abstracción y no un modelo PHY/MAC de 5G NR.
- Se permiten retransmisiones hasta `maxRetries`.

### mMTC PROPOSED

- Cada sensor genera oportunidades periódicas de medición, pero transmite solo cuando la medición se marca como cambio/evento relevante. En el MVP esa relevancia se genera con `exceptionProbability`, un parámetro experimental del modelo.
- Los mensajes ordinarios que compiten aplican backoff uniforme entero entre `backoffMinSteps` y `backoffMaxSteps`.
- Una alerta ya clasificada como URLLC crítica nunca recibe este backoff.

### URLLC BASELINE

- Una sola ruta (Ruta A).
- Prioridad ordinaria/cola compartida.
- El efecto de compartir cola se abstrae mediante `baselineSharedQueueDelayMs`, un retardo experimental explícito del escenario. En FASE 3 no se modela un scheduler 5G ni una cola NR real.
- Retardo físico y pérdida se toman de la configuración de Ruta A.

### URLLC PROPOSED

- Alerta con prioridad superior.
- La prioridad se abstrae mediante un retardo residual `proposedPriorityQueueDelayMs`, normalmente menor que el baseline. Es un supuesto de modelo, no una garantía 3GPP.
- Se envían simultáneamente dos copias por Ruta A y Ruta B cuando ambas están habilitadas.
- Las rutas se modelan independientes por supuesto experimental y usan streams pseudoaleatorios derivados distintos.
- BASELINE y PROPOSED comparten exactamente la misma realización física de Ruta A para evitar comparar muestras aleatorias distintas.
- La primera copia válida recibida determina la latencia efectiva; cualquier segunda copia válida se registra como descartada lógicamente, aunque ya cuenta como copia física enviada.
- Para cada ruta: `physicalLatencyMs = baseLatencyMs + U(0, jitterMs)`. La pérdida se evalúa con `packetLoss`.

## 4. Métricas y fórmulas

### mMTC

- `generatedMessages`: oportunidades lógicas de reporte/mediciones candidatas generadas por el modelo de sensores antes de aplicar la estrategia.
- `transmittedMessages`: mensajes lógicos distintos que realizan al menos un intento de transmisión. No incluye los reintentos como mensajes nuevos.
- `avoidedTransmissions = generatedMessages - transmittedMessages` en PROPOSED, cuando la medición no supera el criterio de excepción. No debe mezclarse con pérdidas o colisiones.
- `physicalTransmissionAttempts = transmittedMessages + retries`: métrica interna de auditoría usada para carga y energía.
- `collisions`: intentos físicos que fallan por exceder la capacidad simplificada del canal en un paso.
- `retries`: intentos físicos adicionales posteriores al primer intento.
- `successfulMessages`: mensajes lógicos entregados.
- `failedMessages`: mensajes lógicos agotados/descartados.
- `successRate = successfulMessages / transmittedMessages`; las transmisiones evitadas no se contabilizan como fallos.
- `channelUtilization = occupiedCapacityUnits / availableCapacityUnits`, acotada a `[0,1]`.
- `energyProxy = N_tx_attempts * E_tx + N_idle_sensor_steps * E_idle`.

`energyProxy` es una métrica adimensional simplificada, no consumo físico real en J o Wh.

### URLLC

Sea `L` el conjunto de latencias de alertas entregadas:

- `criticalEvents = N`.
- `deliveredAlerts = |L|`.
- `lostAlerts = N - deliveredAlerts`.
- `latencyMean = sum(L)/|L|`.
- `latencyMedian`: mediana estadística; para muestras pares se promedian los dos valores centrales.
- `p95 = P95(L)` mediante método nearest-rank.
- `p99 = P99(L)` mediante método nearest-rank; solo se interpretará cuando el tamaño de muestra sea suficiente. El software puede calcularlo con muestras pequeñas, pero el informe debe advertir su baja robustez estadística.
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
- URLLC: umbral experimental de latencia, `baselineSharedQueueDelayMs`, `proposedPriorityQueueDelayMs` y por ruta: habilitación, latencia base, jitter, pérdida.

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
10. `baselineSharedQueueDelayMs` y `proposedPriorityQueueDelayMs` son abstracciones configurables del efecto de cola/prioridad. En FASE 3 no se simula un scheduler 5G real ni se deriva automáticamente el retardo desde `trafficLevel`.
11. El uso de Mulberry32 garantiza repetibilidad de nuestro software con la misma implementación/versión; no es un RNG criptográfico.

## 8. Pruebas

FASE 1 implementada ahora:
- misma seed + mismos parámetros + timestamp fijo => mismo resultado;
- semillas distintas => stream distinto;
- la regla de evento crítico exige las tres condiciones.

FASE 2 implementa además:
- workload mMTC determinista compartido por BASELINE y PROPOSED;
- fase aleatoria inicial por sensor para no sincronizar artificialmente todos los dispositivos;
- reintento BASELINE al paso siguiente;
- backoff uniforme entero PROPOSED entre `backoffMinSteps` y `backoffMaxSteps`;
- cálculo de métricas mMTC directamente desde logs como fuente única de verdad;
- `SCENARIO_CONGESTION_CRITICAL` usa `exceptionProbability = 0.2` y `channelCapacityPerStep = 8` como parámetros experimentales para que la estrategia PROPOSED todavía experimente competencia y permita observar el backoff. Estos valores no son requisitos 3GPP.

FASE 3 implementa además:
- workload URLLC determinista compartido por BASELINE y PROPOSED;
- eventos críticos derivados del mismo motor de riesgo de FASE 1;
- `packetLoss = 0` no produce pérdidas atribuibles al modelo probabilístico de una ruta funcional;
- `packetLoss = 1` hace fallar siempre esa ruta por el modelo de pérdida;
- Ruta B puede rescatar una alerta cuando Ruta A falla;
- primera copia válida = copia de menor latencia total;
- redundancia independiente mantiene o mejora la fiabilidad experimental frente a Ruta A sola bajo los mismos resultados físicos de Ruta A;
- prioridad modelada como menor retardo de cola explícito, especialmente observable en `SCENARIO_CONGESTION_CRITICAL`;
- métricas URLLC calculadas únicamente desde logs;
- overhead físico esperado = 1x para BASELINE y 2x para PROPOSED cuando A y B están habilitadas.

FASE 4–5, obligatorias antes de cerrar el MVP:
- consolidar comparación mMTC + URLLC por escenario y estrategia;
- verificar tablas agregadas contra logs;
- exportar resultados y garantizar que las métricas del dashboard correspondan exactamente a los logs.
