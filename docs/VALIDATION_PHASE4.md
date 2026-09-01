# Validación FASE 4 — Métricas y comparación consolidada

## Objetivo

Consolidar mMTC y URLLC en una capa experimental única sin modificar sus modelos internos. La FASE 4 no recalcula métricas mediante fórmulas paralelas: reutiliza los resultados de FASE 2 y FASE 3, cuyas métricas ya se derivan de logs.

## Resultado por escenario

Cada `ScenarioExperimentResult` incluye:

- metadata (`executedAt`, seed, escenario, modo, versión y fuente de tráfico);
- configuración completa utilizada;
- comparación mMTC BASELINE vs PROPOSED;
- comparación URLLC BASELINE vs PROPOSED;
- resumen de beneficios y costos calculado sobre esas métricas.

`executedAt` es metadata de auditoría y no participa en el PRNG. Para pruebas puede inyectarse un timestamp fijo.

## Resumen mMTC

Las reducciones relativas usan:

`reduction = (baseline - proposed) / baseline`

Un valor positivo significa que PROPOSED es menor. Si el baseline es cero, la reducción relativa se representa como `null` porque el porcentaje sería indefinido.

Se resumen:

- reducción de mensajes transmitidos;
- reducción de intentos físicos;
- reducción de colisiones;
- reducción del `energyProxy`;
- cambio absoluto de tasa de éxito;
- cambio absoluto de utilización de canal.

## Resumen URLLC

Se resumen por separado beneficio y costo:

- cambio de tasa de entrega;
- cambio de fiabilidad experimental;
- reducción relativa de latencia media y p95 cuando es calculable;
- alertas perdidas evitadas;
- incremento del overhead de redundancia;
- incremento relativo de copias físicas.

El overhead no se interpreta como una mejora; es el costo explícito de la estrategia redundante.

## Matriz experimental

`runExperimentMatrix()` ejecuta por defecto los cinco escenarios configurados con una semilla común. Produce una estructura apta para comparación y para alimentar el dashboard en FASE 5.

## Exportación preparada

La capa pura incluye serialización JSON y CSV, pero FASE 4 no implementa botones ni APIs de descarga. FASE 5 conectará estas funciones a la interfaz.

- JSON conserva configuración completa, logs, métricas y summaries.
- CSV produce dos filas por escenario (BASELINE/PROPOSED) y aplana las métricas principales para análisis posterior con pandas/Colab.

## Pruebas automatizadas

FASE 4 verifica:

1. determinismo con misma seed/config y timestamp inyectado;
2. igualdad entre resultados consolidados y ejecuciones directas mMTC/URLLC;
3. manejo explícito del caso baseline = 0 en reducciones relativas;
4. reducción de transmisiones/energy proxy en alta densidad bajo la configuración actual;
5. beneficio de fiabilidad y costo de redundancia en fallo de ruta;
6. ejecución de la matriz completa de cinco escenarios;
7. dos filas de exportación por escenario;
8. CSV con esquema estable;
9. métricas exportadas exactamente iguales a las métricas derivadas de logs.

Los resultados siguen siendo resultados del modelo y sus parámetros experimentales. No constituyen evidencia de cumplimiento real de 3GPP.
