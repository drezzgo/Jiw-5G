# FASE 9B.2 — Diseño experimental reproducible

Esta fase agrega un laboratorio separado del dashboard principal en `/experimentos`.
Su objetivo no es cambiar el modelo de simulación, sino ejecutar el mismo modelo varias veces con semillas distintas y resumir los resultados mediante estadística descriptiva.

## Por qué usar varias semillas

Una sola seed describe una realización pseudoaleatoria concreta. Puede ser útil para una demostración reproducible, pero no es suficiente para describir el comportamiento típico del modelo.

Por eso Jiw 5G ejecuta varias réplicas y conserva:

- cada resultado individual;
- media;
- mediana;
- mínimo;
- máximo;
- desviación estándar muestral.

No se realizan pruebas de significancia estadística ni se afirma independencia estadística perfecta entre seeds consecutivas. Las seeds son entradas deterministas distintas al PRNG del simulador.

## Preset 1 — Matriz principal

Ejecuta los cinco escenarios con la cantidad de sensores definida por cada escenario:

- SCENARIO_NORMAL;
- SCENARIO_HIGH_DENSITY;
- SCENARIO_CRITICAL_EVENT;
- SCENARIO_ROUTE_FAILURE;
- SCENARIO_CONGESTION_CRITICAL.

Pregunta principal: **¿en qué escenarios la estrategia propuesta mejora el comportamiento y cuál es el costo?**

## Preset 2 — Escalabilidad

Ejecuta inicialmente:

- SCENARIO_HIGH_DENSITY;
- SCENARIO_CONGESTION_CRITICAL;

para:

`50, 100, 200, 300, 500, 750, 1000` sensores.

Pregunta principal: **¿cómo cambian las transmisiones y colisiones mMTC cuando aumenta el número de dispositivos?**

Los valores de N son parámetros experimentales elegidos para observar tendencia. No representan un requisito 3GPP.

## Réplicas recomendadas

- 5: comprobación rápida durante desarrollo;
- 10: exploración de tendencias;
- 20–30: candidato para resultados finales si el tiempo de ejecución del navegador sigue siendo razonable.

La cantidad final debe quedar registrada en el informe junto con la lista de seeds utilizada.

## Comparación justa

Dentro de cada ejecución, BASELINE y PROPOSED reciben el mismo workload determinista y la misma seed. Por ello las diferencias observadas se atribuyen al mecanismo comparado dentro de los supuestos del modelo y no a workloads distintos.

## Exportaciones

### CSV crudo

Una fila por:

`escenario × sensorCount × seed × estrategia`

Es el formato recomendado para análisis posterior en pandas/Colab.

### CSV agregado

Una fila por:

`escenario × sensorCount`

Contiene medias de las principales métricas BASELINE/PROPOSED.

### JSON

Conserva resultados individuales, agregados, seeds, metadata y estadísticas descriptivas completas.

## Interpretación académica

Los resultados de esta fase son **resultados del simulador bajo sus parámetros y supuestos**. No son mediciones de una red 5G real y no prueban cumplimiento de KPIs 3GPP.
