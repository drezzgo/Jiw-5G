# Limitaciones de Jiw 5G

Estas limitaciones forman parte del alcance académico y deben comunicarse explícitamente.

## 1. No es un simulador 5G NR completo

Jiw 5G no implementa:

- numerología NR;
- OFDM;
- modulación y codificación;
- HARQ real;
- scheduler 3GPP;
- RLC/PDCP completos;
- beamforming;
- canal radio físico;
- core 5G;
- network slicing real.

Los términos mMTC y URLLC se utilizan como **modelos conceptuales de comportamiento** dentro del escenario propuesto.

## 2. Latencias experimentales

Los valores de latencia base, jitter y retardo de cola son parámetros del experimento.

Un resultado como `1.8 ms` significa:

> el modelo produjo 1.8 ms bajo su configuración.

No significa:

> una red comercial 5G garantiza 1.8 ms en este cruce.

## 3. Umbral URLLC

El umbral utilizado para la reliability es experimental. No implica certificación ni cumplimiento de una clase de servicio 3GPP.

## 4. Rutas A y B

La independencia de las rutas se aproxima usando streams aleatorios separados.

En una red real pueden existir fallos correlacionados, recursos compartidos y dependencias que el modelo no representa.

## 5. Energy proxy

`energyProxy` es adimensional y solo permite comparación interna entre estrategias bajo los mismos parámetros.

No debe convertirse a joules, Wh ni duración de batería.

## 6. Detección de riesgo

El sistema no incorpora cámara, visión artificial, radar ni sensores físicos reales.

Las variables de peatón, vehículo y riesgo son observaciones generadas por el modelo.

## 7. TomTom

TomTom aporta contexto vial externo. No entrega métricas 5G ni representa el canal mMTC/URLLC.

Los umbrales que convierten velocidad relativa en `LOW/MEDIUM/HIGH` pertenecen a Jiw 5G.

## 8. Cobertura y disponibilidad LIVE

LIVE depende de:

- conectividad;
- disponibilidad de TomTom;
- validez de la API key;
- cobertura del punto consultado.

Una falla LIVE no debe impedir el uso de DEMO o REPLAY.

## 9. Agregación de réplicas URLLC sin eventos

Una réplica sin eventos críticos puede registrar `reliability = 0` a nivel de métricas, aunque conceptualmente no haya una alerta fallida.

Por ello, los promedios agregados de reliability deben interpretarse solo con conocimiento del número de réplicas que realmente contienen eventos críticos.

Para conclusiones URLLC se prefieren:

- métricas por ejecución;
- eventos críticos totales;
- CSV crudo;
- escenarios diseñados específicamente para producir eventos.

## 10. Seeds

Las seeds generan realizaciones pseudoaleatorias deterministas distintas. No se afirma que constituyan muestras independientes demostradas en sentido estadístico.

## 11. Escalabilidad

Aumentar el número de sensores estudia el comportamiento del modelo bajo mayor concurrencia. No representa benchmarking de capacidad radio 5G real.
