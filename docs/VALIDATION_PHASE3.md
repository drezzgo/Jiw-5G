# Validación FASE 3 — URLLC

## Objetivo

Validar la implementación académica de comparación URLLC sin afirmar cumplimiento real de 3GPP. La comparación utiliza los mismos eventos críticos y la misma realización física de Ruta A para BASELINE y PROPOSED.

## Modelo implementado

- BASELINE: una copia por Ruta A + `baselineSharedQueueDelayMs`.
- PROPOSED: dos copias simultáneas (A/B) + `proposedPriorityQueueDelayMs`; gana la primera copia válida.
- Ruta A y Ruta B usan streams pseudoaleatorios derivados diferentes. Su independencia es un supuesto de simulación.
- Retardo físico de ruta: `baseLatencyMs + U(0, jitterMs)`.
- Los retardos de cola/prioridad son parámetros experimentales explícitos; no modelan un scheduler NR real.
- Todas las métricas se reconstruyen desde logs.

## Pruebas automatizadas previstas

1. Misma seed + misma configuración = mismo resultado URLLC.
2. BASELINE y PROPOSED comparten eventos críticos y la realización física de Ruta A.
3. `packetLoss = 0` no genera pérdidas probabilísticas de una ruta funcional.
4. `packetLoss = 1` hace fallar siempre la ruta por el modelo de pérdida.
5. Si A falla y B funciona, PROPOSED entrega la alerta por B.
6. La primera copia válida es la de menor latencia total.
7. Dos rutas independientes mantienen o mejoran la fiabilidad frente a A sola bajo la misma realización de A.
8. La prioridad se representa como menor retardo explícito de cola.
9. Overhead físico = 1x BASELINE y 2x PROPOSED cuando ambas rutas están habilitadas.
10. Las métricas coinciden con los logs.

## Ejecución de consistencia realizada durante desarrollo

La compilación independiente del motor conserva la validación de FASE 1:

```json
{
  "ok": true,
  "seed": 12345,
  "scenario": "SCENARIO_CRITICAL_EVENT",
  "steps": 100,
  "criticalEvents": 6,
  "logEntries": 108
}
```

Resultados de comprobación del modelo actual con `seed = 12345` (no son todavía conclusiones finales del informe):

### SCENARIO_ROUTE_FAILURE

- BASELINE: 6 eventos, 3 entregados, 3 perdidos, fiabilidad dentro del umbral = 0.0.
- PROPOSED: 6 eventos, 6 entregados, 0 perdidos, fiabilidad dentro del umbral = 1.0.
- Overhead: 1.0x vs 2.0x.

### SCENARIO_CONGESTION_CRITICAL

- BASELINE: 8 eventos, latencia media aproximada 9.45 ms, 0/8 dentro del umbral experimental de 5 ms.
- PROPOSED: 8 eventos, latencia media aproximada 1.75 ms, 8/8 dentro del umbral experimental de 5 ms.
- Overhead: 1.0x vs 2.0x.

Estos resultados dependen completamente de los parámetros experimentales actuales, en particular pérdidas de ruta, jitter, umbral de 5 ms y retardos de cola configurados. No demuestran cumplimiento de una red 5G real.
