# Especificación del modelo

## 1. Clasificación de la información

Jiw 5G distingue cuatro categorías que no deben mezclarse en el informe ni en la sustentación.

| Categoría | Ejemplos |
|---|---|
| Dato externo | `currentSpeed`, `freeFlowSpeed`, tiempos e incidentes obtenidos en LIVE |
| Cálculo Jiw 5G | `speedRatio`, métricas derivadas, estadísticas |
| Parámetro experimental | umbral de riesgo, capacidad del canal, `exceptionProbability`, umbral URLLC |
| Supuesto del modelo | independencia simulada entre Ruta A y Ruta B, colas simplificadas |
| Resultado simulado | colisiones, latencias, pérdidas, reliability, `energyProxy` |

## 2. Riesgo

Un evento crítico se produce cuando:

```text
pedestrianPresent
AND vehicleApproaching
AND estimatedRisk > threshold
```

No se implementa visión artificial. Las observaciones son variables generadas por el modelo.

## 3. mMTC

### Baseline

- reportes periódicos;
- capacidad de canal finita por paso;
- competencia y colisiones;
- reintento hasta `maxRetries`;
- un mensaje agotado se contabiliza como fallido.

### Proposed

- mismo workload base para comparación justa;
- transmisión por excepción de tráfico no crítico;
- ante competencia ordinaria puede aplicarse backoff aleatorio determinista;
- el backoff no se utiliza para retrasar eventos URLLC críticos.

### Éxito

```text
successRate = successfulMessages / transmittedMessages
```

Los mensajes evitados por transmisión por excepción no se consideran fallos.

### Energy proxy

```text
energyProxy = physicalTransmissionAttempts · E_tx
            + idleSensorSteps · E_idle
```

Las unidades son abstractas/adimensionales.

## 4. URLLC

### Baseline

- una copia por Ruta A;
- cola compartida con retardo experimental;
- la ruta puede perder paquetes.

### Proposed

- prioridad para alerta crítica;
- una copia por Ruta A y una por Ruta B;
- las rutas usan streams pseudoaleatorios separados;
- la primera copia válida determina la entrega lógica;
- una segunda copia que llega después puede descartarse lógicamente, aunque conserva su costo físico.

### Latencia por ruta

Modelo simplificado:

```text
latencia = latencia_base + jitter_uniforme + retardo_de_cola
```

No es un scheduler 5G NR ni un modelo de capa física.

### Reliability experimental

```text
reliability = deliveredWithinThreshold / criticalEvents
```

Si una alerta llega después del umbral, puede estar entregada pero no contar como éxito de reliability.

### Percentiles

P95 y P99 utilizan nearest-rank sobre las latencias entregadas.

## 5. Mapping de tráfico

```text
speedRatio = currentSpeedKmh / freeFlowSpeedKmh
```

Mapping experimental almacenado en Replay:

```text
speedRatio <= 0.55        → HIGH
0.55 < speedRatio <= 0.80 → MEDIUM
speedRatio > 0.80         → LOW
```

Tasas de llegada experimentales:

```text
LOW    → 0.18
MEDIUM → 0.35
HIGH   → 0.75
```

Estos umbrales y tasas pertenecen a Jiw 5G. No deben atribuirse a TomTom ni a 3GPP.

## 6. Escenarios

### NORMAL

Baja densidad y capacidad suficiente. Sirve como referencia.

### HIGH_DENSITY

Mayor número de sensores con capacidad finita. Sirve para evidenciar competencia y saturación del baseline.

### CRITICAL_EVENT

Aumenta la probabilidad de observar eventos críticos y permite estudiar latencia y prioridad.

### ROUTE_FAILURE

Degrada experimentalmente Ruta A para estudiar el valor de la segunda ruta.

### CONGESTION_CRITICAL

Combina alta carga mMTC con eventos críticos y retardo de cola baseline mayor. Es el escenario más útil para mostrar integración entre adquisición masiva y alertas prioritarias.
