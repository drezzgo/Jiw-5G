# Validación — FASE 5 Dashboard

## Objetivo

Convertir las salidas ya validadas del motor en una interfaz web para sustentación sin trasladar cálculos de simulación a React.

## Contrato de presentación

- React configura y ejecuta `runScenarioExperiment`.
- Las métricas mMTC/URLLC mostradas provienen directamente de `ScenarioExperimentResult`.
- La visualización de la alerta crítica se deriva de los logs URLLC `PROPOSED`.
- La exportación JSON/CSV envuelve exactamente la ejecución visible; no vuelve a ejecutar el motor.
- REPLAY y LIVE permanecen deshabilitados hasta sus fases respectivas.

## Contexto de tráfico DEMO

FASE 5 presenta un `TrafficSnapshot` sintético para demostrar la interfaz común de datos. Las velocidades son fixtures de presentación parametrizados por `trafficLevel`:

| trafficLevel | currentSpeedKmh | freeFlowSpeedKmh |
| --- | ---: | ---: |
| LOW | 34 | 40 |
| MEDIUM | 24 | 40 |
| HIGH | 14 | 40 |

Estos valores:

- no proceden de TomTom;
- no son requisitos 3GPP;
- no alimentan el motor de simulación en FASE 5;
- serán sustituidos/extendidos por REPLAY y LIVE en FASES 6 y 7.

## Gráficas del MVP

Cada visual responde una pregunta experimental concreta:

1. mensajes transmitidos: ¿la transmisión por excepción reduce tráfico?;
2. colisiones: ¿la propuesta reduce competencia?;
3. latencia media URLLC: ¿prioridad + redundancia reducen latencia lógica?;
4. fiabilidad experimental: ¿cambia el porcentaje de alertas entregadas dentro del umbral?.

No se utiliza una librería externa de gráficas; las barras comparativas son HTML/CSS.

## Pruebas añadidas

`phase5-dashboard.test.ts` comprueba:

1. la alerta visual se deriva de logs URLLC;
2. el export de una ejecución conserva exactamente el resultado mostrado;
3. el contexto de tráfico de FASE 5 queda marcado como DEMO sintético.

## Criterio de cierre

FASE 5 se considera validada cuando pasan:

```text
pnpm run test:phase1
pnpm test
pnpm build
```

y el Preview de Vercel permite ejecutar escenarios, modificar parámetros y exportar JSON/CSV sin servicios externos.
