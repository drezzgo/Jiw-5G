# Metodología experimental final

## 1. Objetivo

La fase experimental no pretende estimar el rendimiento de una red 5G real. Su objetivo es comparar dos estrategias dentro del mismo modelo y bajo condiciones controladas.

## 2. Comparación justa

Dentro de una ejecución, Baseline y Proposed reciben:

- misma seed principal;
- misma configuración;
- mismo workload común cuando corresponde;
- misma realización de Ruta A para URLLC.

La Ruta B solo existe en Proposed y usa un stream pseudoaleatorio independiente dentro del modelo.

## 3. Matriz principal

Configuración utilizada para el cierre experimental:

```text
Seed inicial: 12345
Réplicas: 20
Seeds: 12345 ... 12364
Escenarios: 5
Total: 100 ejecuciones
```

Cada ejecución contiene internamente Baseline y Proposed.

## 4. Escalabilidad

Preset de escalabilidad:

```text
Escenarios:
- SCENARIO_HIGH_DENSITY
- SCENARIO_CONGESTION_CRITICAL

Cantidad de sensores:
50, 100, 200, 300, 500, 750, 1000

Réplicas utilizadas en cierre: 10
```

Pregunta experimental:

> ¿Cómo evoluciona la carga del modelo mMTC al aumentar la cantidad de sensores y se conserva la ventaja relativa de Proposed?

No se interpreta como prueba de escalabilidad de una red 5G comercial.

## 5. Estadística descriptiva

Para los valores por réplica se utilizan:

- media;
- mediana;
- mínimo;
- máximo;
- desviación estándar muestral.

No se presentan p-values ni afirmaciones de significancia estadística.

## 6. Evidencia principal observada en la matriz controlada

Los siguientes valores resumen la matriz principal ejecutada durante el cierre del proyecto. Deben citarse como **resultados del simulador bajo esta configuración**, no como mediciones físicas.

### NORMAL — 50 sensores

Aproximadamente:

- transmisiones mMTC: `500 → 39.6`;
- reducción de transmisiones: `~92 %`;
- `energyProxy`: `545 → 89.2`;
- reducción de `energyProxy`: `~84 %`.

Con capacidad suficiente, ambas estrategias pueden mantener éxito de transmisión alto. El principal efecto es evitar tráfico ordinario innecesario.

### HIGH_DENSITY — 300 sensores

Aproximadamente:

- transmisiones: `3000 → 239`;
- reducción de transmisiones: `~92 %`;
- colisiones: `~8625 → 0`;
- `energyProxy`: `~10027 → 537`;
- tasa de éxito: `40 % → 100 %` en la matriz observada.

La interpretación correcta es que la transmisión por excepción reduce tanto el workload efectivo que el Proposed deja de saturar el canal bajo esta configuración. No debe atribuirse toda la mejora exclusivamente al backoff.

### CRITICAL_EVENT — 100 sensores

En las réplicas que contienen eventos críticos se observa una reducción importante de latencia en Proposed, mientras Baseline puede conservar buena fiabilidad cuando Ruta A no está degradada.

La conclusión útil es el trade-off:

```text
prioridad + redundancia
→ menor latencia experimental
→ mayor costo físico de copias
```

### ROUTE_FAILURE — 100 sensores

Es el escenario que mejor muestra el beneficio de la redundancia del modelo:

- degradación explícita de Ruta A;
- pérdidas y latencia mayores en Baseline;
- Proposed puede recuperar alertas mediante Ruta B;
- el overhead físico se aproxima al doble cuando ambas rutas están activas.

### CONGESTION_CRITICAL — 300 sensores

La matriz observada mostró simultáneamente:

- fuerte reducción de transmisiones mMTC;
- reducción muy alta de colisiones;
- reducción importante de `energyProxy`;
- latencia crítica Proposed por debajo de la del Baseline en las ejecuciones con eventos.

Este escenario es el más representativo de la integración conceptual mMTC + URLLC.

## 7. Advertencia de agregación URLLC

En la versión académica estable existe una limitación conocida: una réplica con `criticalEvents = 0` puede aportar `reliability = 0` y `redundancyOverhead = 0` al agregador por réplica.

Esto **no significa que haya fallado una alerta**, sino que no hubo una alerta que medir.

Por ello:

- las ejecuciones individuales y el CSV crudo son la fuente preferida para interpretar URLLC;
- las latencias `null` se interpretan como “sin observación”;
- no se debe afirmar una reliability global a partir de un promedio que mezcle réplicas sin eventos;
- esta limitación no modifica las ejecuciones físicas individuales del simulador.

La limitación se conserva documentada para evitar introducir cambios metodológicos tardíos antes de la entrega.

## 8. LIVE y REPLAY

TomTom LIVE se utiliza como contexto demostrativo, no como base de la matriz estadística.

Para conservar un caso real reproducible:

```text
LIVE → TrafficSnapshot → Guardar como Replay → REPLAY
```

Así se separa la variación externa del tráfico de la variación pseudoaleatoria del simulador.

## 9. Archivos de evidencia

Para conservar trazabilidad se recomienda guardar junto al material de entrega:

```text
matriz-principal/
  CSV crudo
  CSV agregado
  JSON auditable

escalabilidad/
  CSV crudo
  CSV agregado

replays/
  captura TomTom utilizada en la demostración, si se conserva
```
