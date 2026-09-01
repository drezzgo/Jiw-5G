# Jiw 5G

**Simulador académico de cruce peatonal escolar inteligente con integración conceptual de mMTC y URLLC.**

Jiw 5G es una aplicación web desarrollada para la asignatura **Teoría de la Información**. Su objetivo es comparar, mediante un modelo simplificado y reproducible, dos estrategias de comunicación dentro de un mismo cruce peatonal escolar inteligente:

- **mMTC** para la adquisición masiva de datos provenientes de sensores.
- **URLLC** para el transporte prioritario de alertas críticas hacia el controlador/actuador.

> Jiw 5G **no implementa una pila 5G NR completa ni pretende certificar cumplimiento 3GPP**. Modela únicamente fenómenos relevantes para el experimento: generación de mensajes, concurrencia, colisiones, reintentos, backoff, colas, latencia, pérdida, prioridad, redundancia y un proxy energético simplificado.

## Idea general

```text
Sensores
  ↓
mMTC
  ↓
Adquisición y detección de riesgo
  ↓
¿Evento normal o crítico?
  ├── normal → flujo ordinario
  └── crítico → URLLC → semáforo/actuador
```

La condición crítica del modelo se activa cuando coinciden:

```text
peatón presente
AND vehículo aproximándose
AND riesgo estimado > umbral
```

## Baseline vs Proposed

### mMTC

**Baseline:** los sensores generan reportes periódicos y compiten por una capacidad de canal finita. En condiciones de alta concurrencia pueden aparecer colisiones, reintentos y fallos.

**Proposed:** utiliza transmisión por excepción para evitar mensajes ordinarios innecesarios. Cuando existe competencia entre mensajes no críticos puede aplicar backoff pseudoaleatorio determinista.

### URLLC

**Baseline:** una alerta crítica utiliza una única Ruta A y una cola compartida/ordinaria.

**Proposed:** la alerta recibe prioridad y se envían copias por Ruta A y Ruta B. La primera copia válida en llegar se considera la entrega lógica.

La independencia entre las rutas A y B es un **supuesto experimental del simulador**, no una garantía de una red 5G real.

## Modos de tráfico

### DEMO

Usa configuraciones sintéticas controladas. Es el modo recomendado para explicar el funcionamiento del simulador y realizar comparaciones reproducibles.

### REPLAY

Carga una captura versionada de contexto de tráfico y reproduce la transformación usando el mismo mapping almacenado. Permite repetir una prueba sin depender de cambios externos.

### LIVE

Consulta contexto vial mediante TomTom a través de `/api/traffic`. La API key permanece en el servidor mediante `TOMTOM_API_KEY` y **nunca debe exponerse como `NEXT_PUBLIC_*`**.

TomTom aporta contexto externo de tráfico; **no modela mMTC ni URLLC**.

## Escenarios incluidos

- `SCENARIO_NORMAL`
- `SCENARIO_HIGH_DENSITY`
- `SCENARIO_CRITICAL_EVENT`
- `SCENARIO_ROUTE_FAILURE`
- `SCENARIO_CONGESTION_CRITICAL`

Los escenarios son configuraciones del mismo motor, no simuladores independientes.

## Dashboard pedagógico

La interfaz está diseñada para dos públicos:

- una persona no técnica puede entender primero la idea y el resultado;
- una persona técnica puede abrir términos, ecuaciones, supuestos y fragmentos del código real.

Incluye:

- popovers conceptuales;
- ayudas por hover/focus para términos técnicos en inglés;
- tarjetas expandibles con Blendy;
- explicación simple dominante y resumen técnico breve;
- ecuaciones relevantes;
- fragmentos de implementación;
- modo presentación.

## Laboratorio experimental

La ruta:

```text
/experimentos
```

permite ejecutar múltiples réplicas deterministas usando distintas seeds y exportar:

- CSV crudo: una fila por seed/escenario/estrategia;
- CSV agregado: resumen por escenario y cantidad de sensores;
- JSON auditable: configuración, métricas y agregados sin logs masivos.

Los logs detallados se excluyen del JSON replicado para evitar exportaciones de tamaño excesivo en navegador.

## Métricas principales

### mMTC

- mensajes generados;
- mensajes transmitidos;
- transmisiones evitadas;
- intentos físicos;
- colisiones;
- reintentos;
- mensajes exitosos/fallidos;
- tasa de éxito;
- utilización del canal;
- `energyProxy`.

`energyProxy` es una **métrica adimensional**:

```text
energyProxy = intentos_tx · E_tx + pasos_idle · E_idle
```

No representa joules, watts ni consumo físico de un módem 5G.

### URLLC

- eventos críticos;
- alertas entregadas/perdidas;
- latencia media;
- mediana;
- P95 y P99;
- latencia máxima;
- entregas dentro del umbral;
- fiabilidad experimental;
- copias físicas enviadas;
- overhead de redundancia.

La fiabilidad experimental se interpreta respecto al **umbral de latencia configurado para el experimento**.

## Reproducibilidad

Jiw 5G utiliza un PRNG determinista. Una ejecución se considera reproducible cuando conserva:

```text
misma seed
+ misma configuración
+ mismo Replay/contexto
+ misma versión del simulador
```

El timestamp de ejecución no forma parte de la salida determinista.

## Instalación

Requisitos del proyecto:

- Node.js según `package.json` (`24.x` en la versión académica estable)
- pnpm

```powershell
pnpm install
```

Para desarrollo:

```powershell
pnpm dev
```

Para validar:

```powershell
pnpm run test:phase1
pnpm test
pnpm build
```

## TomTom local

Crear `.env.local`:

```text
TOMTOM_API_KEY=tu_clave_real
```

No subir `.env.local` al repositorio.

La plantilla `.env.example` debe conservar la variable vacía.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Especificación del modelo](docs/MODEL_SPEC.md)
- [Metodología experimental](docs/FINAL_EXPERIMENTS.md)
- [Limitaciones](docs/LIMITATIONS.md)
- [Guía de sustentación](docs/PRESENTATION_GUIDE.md)
- [Validación final](docs/VALIDATION_FINAL.md)
- [Notas de release v1.0.0](docs/RELEASE_NOTES_v1.0.0.md)

## Alcance académico

El proyecto busca responder experimentalmente preguntas como:

1. ¿Cuánto tráfico puede evitar una estrategia mMTC basada en transmisión por excepción?
2. ¿Qué ocurre con colisiones, reintentos y proxy energético al aumentar la concurrencia?
3. ¿Qué beneficio ofrece prioridad + redundancia para alertas críticas bajo congestión o fallo de ruta?
4. ¿Qué costo introduce la redundancia en términos de copias físicas?

Las conclusiones deben formularse siempre como **resultados del modelo bajo sus parámetros y supuestos experimentales**, no como mediciones de una red 5G desplegada.
