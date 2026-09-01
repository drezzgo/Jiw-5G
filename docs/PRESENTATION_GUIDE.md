# Guía de sustentación — Jiw 5G

## Objetivo

La exposición debe explicar primero el problema y después la implementación. El dashboard ya está diseñado para que una persona no técnica pueda seguir la demostración.

## Ruta sugerida

### 1. Problema

Explicación breve:

> En un cruce escolar existen muchos sensores que generan información ordinaria, pero cuando aparece un riesgo peatonal hay mensajes que dejan de ser ordinarios y deben tratarse como críticos. Jiw 5G estudia cómo separar esos dos comportamientos dentro de un único escenario.

### 2. Arquitectura

```text
sensores → mMTC → detección de riesgo → URLLC → actuador
```

No empezar hablando de APIs o código.

### 3. mMTC

Explicación simple:

> Si todos los sensores hablan todo el tiempo, pueden saturar un canal limitado. Proposed intenta mantener en silencio los mensajes ordinarios que no aportan un cambio relevante.

Mostrar Baseline vs Proposed y abrir la tarjeta pedagógica.

Conceptos clave:

- transmisión por excepción;
- colisiones;
- backoff;
- `energyProxy`.

### 4. URLLC

Explicación simple:

> Una alerta crítica no debería esperar detrás del tráfico ordinario. Proposed le da prioridad y además envía una segunda copia simulada para reducir el impacto del fallo de una ruta.

Mostrar:

```text
L_alerta = min(L_A, L_B)
```

para copias válidas.

### 5. Escenario ROUTE_FAILURE

Este es el mejor ejemplo para explicar redundancia.

Mensaje:

> Deliberadamente degradamos Ruta A. No estamos diciendo que una red 5G falle así; usamos el escenario para comprobar si la redundancia del modelo aporta valor cuando una ruta empeora.

### 6. Escenario CONGESTION_CRITICAL

Mensaje:

> Aquí mezclamos los dos problemas: muchos mensajes ordinarios y, al mismo tiempo, una alerta que necesita prioridad.

Es el escenario más importante para defender que el proyecto es integrado y no dos simulaciones independientes.

### 7. TomTom LIVE

Mensaje:

> TomTom no simula 5G. Solo aporta contexto vial externo. Jiw 5G toma velocidad actual y velocidad de flujo libre, calcula una relación y la convierte en una condición experimental del modelo.

Mostrar la clasificación de procedencia:

```text
dato TomTom → cálculo → parámetro Jiw → simulación
```

### 8. REPLAY

Mensaje:

> LIVE puede cambiar con el tiempo. Replay congela la captura y el mapping para poder repetir el experimento.

### 9. /experimentos

Mensaje:

> Una sola seed demuestra reproducibilidad, pero no queremos depender de una realización particular. Por eso ejecutamos múltiples seeds y mostramos estadísticas descriptivas.

Mostrar la matriz y la escalabilidad.

## Preguntas probables

### “¿Esto es realmente 5G?”

Respuesta:

> Es un simulador académico de comportamientos asociados a mMTC y URLLC, no una implementación completa de 5G NR. La simplificación es deliberada para aislar generación, congestión, prioridad, pérdida, latencia y redundancia.

### “¿Por qué 5 ms?”

> Es un umbral experimental configurable usado para decidir si una entrega cuenta como éxito de reliability. No lo presentamos como un requisito universal de 3GPP.

### “¿Por qué dos rutas?”

> Para representar un mecanismo simple de redundancia. La primera copia válida gana. El costo es aproximadamente duplicar copias físicas, y el beneficio se observa especialmente cuando una ruta se degrada.

### “¿El energy proxy es consumo real?”

> No. Es una métrica adimensional basada en intentos de transmisión y actividad idle. Solo permite comparar las dos estrategias dentro del mismo modelo.

### “¿Qué hace TomTom?”

> Aporta contexto vial. No entrega información mMTC ni URLLC.

### “¿Qué demuestra HIGH_DENSITY?”

> Que con una capacidad de canal limitada, el baseline periódico puede saturarse, mientras la transmisión por excepción reduce el workload efectivo. Es un resultado del modelo, no una cifra de capacidad de una red comercial.

### “¿Por qué omitieron MQTT?”

> Porque el proyecto evalúa el comportamiento del modelo de comunicación y el docente no exige un broker o infraestructura de mensajería real. El EventBus ya deja desacoplada esa posibilidad sin añadir complejidad que no produce evidencia nueva.

### “¿Qué significa seed?”

> Es el valor inicial del generador pseudoaleatorio determinista. Con la misma seed y configuración obtenemos la misma ejecución.

### “¿Cuál es la mayor limitación?”

> La abstracción: no modelamos la capa física ni un scheduler 5G real. Las latencias, pérdidas y colas son experimentales. Esto limita la generalización, pero permite comparar de forma transparente las estrategias propuestas.

## Cierre recomendado

> Jiw 5G no intenta demostrar que esta configuración sea una red 5G real. Demuestra, dentro de un modelo reproducible, por qué reducir tráfico ordinario y dar prioridad y redundancia a eventos críticos puede ser útil en un cruce escolar inteligente, y también muestra el costo de esa decisión.

---

## Modo de exposición guiada con Driver.js

La versión final incorpora dos recorridos desde el dashboard:

- **Exposición completa:** narrativa guiada desde el problema hasta `/experimentos`. Integra Driver.js con una apertura pedagógica de mMTC mediante Blendy y continúa el tour en el laboratorio experimental.
- **Demo rápida:** resume problema, mMTC, riesgo, URLLC, trade-off, LIVE y alcance del modelo.

La exposición completa está diseñada para que el propio sitio funcione como material de sustentación. Driver.js actúa como narrador; las tarjetas Blendy permiten profundizar y los popovers/hover mantienen las definiciones disponibles durante la exploración libre.

### LIVE durante la exposición

El selector LIVE incluye tres referencias de Bogotá:

1. Universidad Distrital · Sede Tecnológica — `4.580456693482892, -74.15738921821736`.
2. Av. Carrera 68 × Av. de las Américas — `4.625802, -74.123718`.
3. Av. Caracas × Calle 26 — `4.6166596589073, -74.072168554136`.

También existe `Personalizado…` para mantener la capacidad de consultar cualquier punto WGS84 válido.

Cambiar un preset **no realiza una consulta a TomTom**. La API se consulta únicamente al ejecutar la simulación en modo LIVE.

### Recomendación práctica

Antes de comenzar la clase:

1. abrir la producción de Jiw 5G;
2. verificar que `/` y `/experimentos` cargan;
3. comprobar LIVE una vez si se quiere demostrar TomTom;
4. regresar a DEMO;
5. iniciar **Exposición completa**;
6. mantener un Replay válido como respaldo si Internet o TomTom no están disponibles.

El tour no altera el Simulation Engine. Solo coordina la presentación de los elementos ya existentes.
