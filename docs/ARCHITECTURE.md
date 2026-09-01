# Arquitectura de Jiw 5G

## 1. Objetivo arquitectónico

Jiw 5G separa el motor de simulación de la interfaz y de las fuentes externas de tráfico. Esta separación permite cambiar el origen de los datos sin modificar la lógica matemática del experimento.

```text
                      ┌─────────────────────┐
                      │      Dashboard      │
                      │ Next.js + React     │
                      └─────────┬───────────┘
                                │
                                ▼
                      ┌─────────────────────┐
                      │ TrafficDataProvider │
                      └─────────┬───────────┘
                         ┌──────┼──────┐
                         ▼      ▼      ▼
                       DEMO   REPLAY   LIVE
                                │      │
                                │      └─ /api/traffic → TomTom
                                ▼
                        TrafficSnapshot
                                │
                                ▼
                    Mapping explícito Jiw 5G
                                │
                                ▼
                       SimulationConfig
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
            mMTC                                URLLC
              │                                   │
              └──────────────┬────────────────────┘
                             ▼
                      Experiment summary
```

## 2. Motor determinista

El motor usa PRNG determinista y streams derivados por subsistema. La intención es evitar que añadir aleatoriedad a un subsistema modifique silenciosamente la realización pseudoaleatoria de otro.

React no calcula métricas. La interfaz configura, ejecuta, presenta y exporta resultados producidos por el motor TypeScript.

## 3. EventBus

La abstracción `EventBus` desacopla generación y consumo de eventos.

La versión académica utiliza `LocalEventBus`.

MQTT fue deliberadamente omitido porque no era requerido por el docente y no aportaba evidencia adicional a la comparación mMTC/URLLC.

## 4. Fuente de tráfico

`TrafficDataProvider` entrega un `TrafficSnapshot` común a:

- Synthetic provider (DEMO)
- Replay provider (REPLAY)
- TomTom provider (LIVE)

Esto evita que el motor dependa directamente de TomTom.

## 5. Seguridad de TomTom

```text
Browser
  ↓
/api/traffic
  ↓
Servidor Next.js
  ↓ TOMTOM_API_KEY
TomTom API
```

La clave no se expone en el navegador.

## 6. Replay

Un Replay conserva:

- información de captura;
- contexto vial;
- proveedor original;
- mapping utilizado.

Guardar el mapping dentro del Replay evita que una futura modificación de umbrales cambie silenciosamente la interpretación de una captura histórica.

## 7. Capa pedagógica

La interfaz posee una capa de explainability separada del motor:

```text
src/app/explainability/
```

Contiene glosario, términos en inglés, temas pedagógicos, ecuaciones, snippets y enlaces a la implementación.

Blendy se usa únicamente para la transición visual de tarjetas explicativas; no interviene en la simulación.

## 8. Laboratorio de experimentos

`/experimentos` ejecuta réplicas del mismo motor variando seed, escenario y, cuando corresponde, cantidad de sensores.

La agregación es una capa posterior a las ejecuciones individuales y no altera sus resultados.
