# Validación FASE 1

Comando ejecutado en el entorno de construcción:

```bash
tsc -p tsconfig.simulation.json
node scripts/validate-phase1.cjs
```

Resultado observado:

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

La validación comprueba:

1. dos ejecuciones con la misma configuración y un `executedAt` fijo son estructuralmente idénticas;
2. el escenario crítico produce al menos un evento crítico;
3. la función de riesgo exige simultáneamente peatón, vehículo aproximándose y riesgo superior al umbral.

Nota: `executedAt` es metadata de auditoría y por diseño puede cambiar entre ejecuciones reales. La reproducibilidad académica se exige sobre el stream simulado, logs y métricas dados seed/config/versión iguales.
