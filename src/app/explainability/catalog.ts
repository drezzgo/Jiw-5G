import type { ExplainabilityTopic, GlossaryEntry } from "./types";

export const glossaryEntries = {
  mmtc: {
    id: "mmtc",
    term: "mMTC",
    simple: "Comunicación pensada para muchos dispositivos pequeños que envían datos, como sensores IoT.",
    technical: "Massive Machine Type Communications. En Jiw 5G abstrae el acceso concurrente de numerosos sensores y permite comparar transmisión periódica frente a transmisión por excepción.",
    kind: "CONCEPTO",
  },
  urllc: {
    id: "urllc",
    term: "URLLC",
    simple: "Comunicación usada para alertas que deben llegar rápido y con alta probabilidad de éxito.",
    technical: "Ultra-Reliable Low-Latency Communications. Jiw 5G no implementa una red 5G NR real: modela prioridad, pérdida, retardo y redundancia de dos rutas para comparar estrategias.",
    kind: "CONCEPTO",
  },
  baseline: {
    id: "baseline",
    term: "Baseline",
    simple: "La versión de referencia contra la que comparamos la propuesta.",
    technical: "Estrategia base del experimento. Se ejecuta con el mismo workload que la propuesta para reducir sesgos en la comparación.",
    kind: "CONCEPTO",
  },
  backoff: {
    id: "backoff",
    term: "Backoff",
    simple: "Cuando hay demasiados sensores intentando transmitir, un sensor espera un tiempo aleatorio antes de volver a intentarlo.",
    technical: "En PROPOSED mMTC el reintento se agenda entre backoffMinSteps y backoffMaxSteps usando un PRNG determinista. No se aplica deliberadamente a alertas URLLC.",
    kind: "CONCEPTO",
  },
  collision: {
    id: "collision",
    term: "Colisión / competencia",
    simple: "Ocurre cuando hay más intentos de transmisión de los que el canal simplificado puede atender al mismo tiempo.",
    technical: "Jiw 5G modela una capacidad por paso. Los intentos que exceden channelCapacityPerStep se registran como fallos de contención; no es un modelo PHY/MAC completo de 5G NR.",
    kind: "SUPUESTO_MODELO",
  },
  energyProxy: {
    id: "energyProxy",
    term: "Energy proxy",
    simple: "Una medida aproximada para comparar cuánto trabajo energético implica cada estrategia.",
    technical: "Métrica adimensional derivada de intentos de transmisión y actividad idle. Sirve para comparación interna y no representa joules, watts ni consumo físico de un dispositivo 5G.",
    kind: "SUPUESTO_MODELO",
  },
  channelUtilization: {
    id: "channelUtilization",
    term: "Utilización del canal",
    simple: "Qué tanto de la capacidad disponible del canal simplificado está siendo usada.",
    technical: "Métrica del modelo de acceso mMTC. Depende de la capacidad configurada por paso de simulación y no equivale directamente a utilización de recursos radio NR reales.",
    kind: "RESULTADO_SIMULADO",
  },
  latency: {
    id: "latency",
    term: "Latencia",
    simple: "El tiempo que tarda una alerta desde que se genera hasta que llega al receptor simulado.",
    technical: "En URLLC se compone del retardo físico muestreado de la ruta más el retardo de cola configurado para cada estrategia.",
    kind: "RESULTADO_SIMULADO",
  },
  p95: {
    id: "p95",
    term: "P95",
    simple: "Un valor que indica que aproximadamente el 95 % de las latencias observadas quedan en o por debajo de ese punto.",
    technical: "Percentil 95 calculado sobre las alertas entregadas. Su interpretación estadística es limitada cuando la muestra contiene pocos eventos críticos.",
    kind: "RESULTADO_SIMULADO",
  },
  p99: {
    id: "p99",
    term: "P99",
    simple: "Un valor de cola que ayuda a observar casos de latencia más extremos que el promedio.",
    technical: "Percentil 99 de las latencias entregadas. Puede calcularse con muestras pequeñas, pero no debe presentarse como una estimación robusta sin suficiente número de eventos.",
    kind: "RESULTADO_SIMULADO",
  },
  reliability: {
    id: "reliability",
    term: "Fiabilidad experimental",
    simple: "Qué proporción de alertas críticas llegó dentro del límite de tiempo definido para el experimento.",
    technical: "Se calcula como deliveredWithinThreshold / criticalEvents. El umbral es un parámetro experimental de Jiw 5G y no demuestra cumplimiento real de 3GPP.",
    kind: "RESULTADO_SIMULADO",
  },
  redundancy: {
    id: "redundancy",
    term: "Redundancia",
    simple: "Enviar más de una copia de la misma alerta para aumentar la posibilidad de que al menos una llegue.",
    technical: "PROPOSED URLLC envía simultáneamente por Ruta A y Ruta B y selecciona la primera copia válida. La independencia de rutas es un supuesto explícito del modelo.",
    kind: "SUPUESTO_MODELO",
  },
  overhead: {
    id: "overhead",
    term: "Overhead de redundancia",
    simple: "El costo adicional de enviar copias extra para ganar fiabilidad.",
    technical: "Relación entre copias físicas enviadas y alertas lógicas generadas. Permite mostrar el trade-off de la propuesta URLLC.",
    kind: "RESULTADO_SIMULADO",
  },
  freeFlow: {
    id: "freeFlow",
    term: "Velocidad de flujo libre",
    simple: "La velocidad esperada cuando la vía no está afectada por congestión importante.",
    technical: "En modo LIVE proviene de TomTom como freeFlowSpeed. Jiw 5G la compara con currentSpeed para derivar un nivel de tráfico mediante umbrales experimentales.",
    kind: "DATO_EXTERNO",
  },
  trafficMapping: {
    id: "trafficMapping",
    term: "Mapping de tráfico",
    simple: "La regla que convierte datos de velocidad del tráfico en parámetros que el simulador puede usar.",
    technical: "Jiw 5G calcula currentSpeed/freeFlowSpeed y aplica umbrales parametrizados para producir trafficLevel y vehicleArrivalRate. Es una decisión del modelo, no una clasificación de TomTom.",
    kind: "PARAMETRO_EXPERIMENTAL",
  },
  threshold: {
    id: "threshold",
    term: "Umbral experimental",
    simple: "Un límite elegido para decidir si una condición cumple o no una regla del experimento.",
    technical: "Los umbrales de riesgo, congestión y latencia se configuran para estudiar el modelo. No deben confundirse automáticamente con requisitos normativos.",
    kind: "PARAMETRO_EXPERIMENTAL",
  },
  seed: {
    id: "seed",
    term: "Seed",
    simple: "Un número que permite repetir la misma secuencia pseudoaleatoria y obtener nuevamente el mismo experimento.",
    technical: "Inicializa Mulberry32. Jiw 5G deriva streams por namespace para evitar que añadir un subsistema cambie silenciosamente la aleatoriedad de otro.",
    kind: "CONCEPTO",
  },
  replay: {
    id: "replay",
    term: "Replay",
    simple: "Un archivo que guarda el contexto externo para poder repetir una demostración después.",
    technical: "Conserva TrafficSnapshot y parámetros de mapping. La reproducibilidad completa requiere además la misma seed, configuración y versión del simulador.",
    kind: "CONCEPTO",
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryId = keyof typeof glossaryEntries;

export const explainabilityTopics: Record<ExplainabilityTopic["id"], ExplainabilityTopic> = {
  traffic: {
    id: "traffic",
    kicker: "Datos externos → modelo",
    title: "Contexto de tráfico",
    simpleSummary: "Tomamos una fotografía del tráfico y la convertimos en un nivel que el simulador puede comprender.",
    technicalSummary: "TrafficDataProvider desacopla DEMO, REPLAY y LIVE. El mapper usa la relación currentSpeed/freeFlowSpeed y umbrales experimentales para derivar trafficLevel y vehicleArrivalRate.",
    steps: [
      "Obtener currentSpeed y freeFlowSpeed desde el provider activo.",
      "Calcular speedRatio = currentSpeed / freeFlowSpeed cuando los datos están disponibles.",
      "Clasificar LOW, MEDIUM o HIGH con umbrales configurables.",
      "Convertir ese nivel en vehicleArrivalRate para el escenario simulado.",
    ],
    code: {
      file: "src/traffic/mapping.ts",
      language: "ts",
      snippet: String.raw`const speedRatio = current / freeFlow;
if (speedRatio <= mapping.highCongestionSpeedRatioMax) {
  return { level: "HIGH", speedRatio };
}
if (speedRatio <= mapping.mediumCongestionSpeedRatioMax) {
  return { level: "MEDIUM", speedRatio };
}
return { level: "LOW", speedRatio };`,
    },
    notes: [
      { kind: "DATO_EXTERNO", title: "Dato externo", text: "En LIVE, currentSpeed y freeFlowSpeed vienen de TomTom. En DEMO/REPLAY provienen del provider correspondiente." },
      { kind: "PARAMETRO_EXPERIMENTAL", title: "Transformación", text: "Los umbrales 0.55 / 0.80 y las tasas por nivel pertenecen al modelo Jiw 5G; no son categorías entregadas por TomTom." },
    ],
    glossaryIds: ["freeFlow", "trafficMapping", "threshold"],
  },
  risk: {
    id: "risk",
    kicker: "Clasificación transparente",
    title: "Detección del evento crítico",
    simpleSummary: "La alerta aparece cuando hay peatón, un vehículo aproximándose y el riesgo supera un límite.",
    technicalSummary: "La lógica de riesgo es deliberadamente booleana y parametrizable. No usa visión artificial: consume observaciones del modelo y produce una decisión auditable.",
    steps: [
      "Comprobar presencia peatonal.",
      "Comprobar vehículo aproximándose.",
      "Comparar estimatedRisk contra risk.threshold.",
      "Crear CRITICAL_EVENT únicamente cuando las tres condiciones son verdaderas.",
    ],
    code: {
      file: "src/simulation/risk/evaluateRisk.ts",
      language: "ts",
      snippet: String.raw`const critical =
  observation.pedestrianPresent &&
  observation.vehicleApproaching &&
  observation.estimatedRisk > config.threshold;`,
    },
    notes: [
      { kind: "PARAMETRO_EXPERIMENTAL", title: "Umbral de riesgo", text: "risk.threshold es configurable y forma parte del experimento; no se presenta como un límite físico universal." },
      { kind: "SUPUESTO_MODELO", title: "Abstracción", text: "estimatedRisk es una variable normalizada del simulador. El MVP no implementa cámaras ni visión artificial." },
    ],
    glossaryIds: ["threshold"],
  },
  mmtc: {
    id: "mmtc",
    kicker: "Acceso masivo de sensores",
    title: "mMTC: baseline vs propuesta",
    simpleSummary: "La propuesta intenta evitar mensajes innecesarios y, cuando existe competencia, separa los reintentos usando backoff.",
    technicalSummary: "Ambas estrategias reciben el mismo workload. BASELINE selecciona todas las oportunidades; PROPOSED solo las marcadas como exceptionRelevant y aplica backoff pseudoaleatorio a reintentos ordinarios.",
    steps: [
      "Generar el mismo workload candidato para BASELINE y PROPOSED.",
      "BASELINE transmite todas las oportunidades; PROPOSED evita las que no representan cambio relevante.",
      "Atender hasta channelCapacityPerStep intentos por paso.",
      "Registrar el exceso como contención/colisión y reintentar; PROPOSED usa backoff aleatorio determinista.",
    ],
    code: {
      file: "src/simulation/mmtc/simulate.ts",
      language: "ts",
      snippet: String.raw`const selected = workload.filter(
  (message) => strategy === "BASELINE" || message.exceptionRelevant,
);

const delaySteps =
  strategy === "PROPOSED"
    ? random.integer(config.mmtc.backoffMinSteps, config.mmtc.backoffMaxSteps)
    : 1;`,
    },
    notes: [
      { kind: "SUPUESTO_MODELO", title: "Canal simplificado", text: "channelCapacityPerStep abstrae cuántas transmisiones ordinarias pueden atenderse por paso. No reproduce PHY/MAC 5G NR." },
      { kind: "SUPUESTO_MODELO", title: "Energy proxy", text: "La métrica energética es adimensional y solo sirve para comparar estrategias dentro del modelo." },
    ],
    glossaryIds: ["mmtc", "baseline", "backoff", "collision", "channelUtilization", "energyProxy"],
  },
  urllc: {
    id: "urllc",
    kicker: "Entrega crítica prioritaria",
    title: "URLLC: prioridad + redundancia",
    simpleSummary: "La propuesta envía la alerta por dos rutas y usa la primera copia válida que llegue.",
    technicalSummary: "BASELINE procesa Ruta A con retardo de cola compartida. PROPOSED procesa A y B con retardo prioritario; las copias válidas se ordenan por latencia total y la primera gana.",
    steps: [
      "Generar una alerta para cada CRITICAL_EVENT.",
      "BASELINE usa únicamente Ruta A; PROPOSED usa A y B.",
      "Sumar latencia física de la ruta y retardo de cola de la estrategia.",
      "Seleccionar la copia válida de menor latencia y contabilizar las copias adicionales como overhead.",
    ],
    code: {
      file: "src/simulation/urlcc/simulate.ts",
      language: "ts",
      snippet: String.raw`const routeSamples =
  strategy === "BASELINE" ? [alert.routeA] : [alert.routeA, alert.routeB];

const validCopies = routeSamples
  .map((sample) => processRoute(alert, sample))
  .filter((copy): copy is ValidCopy => copy !== null)
  .sort((a, b) => a.totalLatencyMs - b.totalLatencyMs);

const winner = validCopies[0];`,
    },
    notes: [
      { kind: "SUPUESTO_MODELO", title: "Independencia", text: "Ruta A y Ruta B se modelan con streams separados y se asumen independientes para estudiar el efecto de redundancia." },
      { kind: "PARAMETRO_EXPERIMENTAL", title: "Umbral de latencia", text: "La fiabilidad se evalúa contra latencyThresholdMs configurado para el experimento; no certifica cumplimiento 3GPP." },
    ],
    glossaryIds: ["urllc", "latency", "p95", "p99", "reliability", "redundancy", "overhead", "threshold"],
  },
  comparison: {
    id: "comparison",
    kicker: "Beneficio frente a costo",
    title: "Comparación experimental",
    simpleSummary: "No basta con decir que la propuesta mejora: mostramos cuánto cambia y qué costo introduce.",
    technicalSummary: "La capa de experimentos calcula reducciones relativas para mMTC, cambios de fiabilidad en puntos porcentuales y aumento del overhead URLLC a partir de métricas previamente derivadas de logs.",
    steps: [
      "Ejecutar BASELINE y PROPOSED con workloads compartidos.",
      "Derivar métricas desde los logs de cada estrategia.",
      "Calcular reducciones relativas solo cuando el baseline es distinto de cero.",
      "Mostrar por separado los beneficios y el costo de redundancia.",
    ],
    code: {
      file: "src/simulation/experiments/summary.ts",
      language: "ts",
      snippet: String.raw`export function relativeReduction(
  baseline: number,
  proposed: number,
): number | null {
  return baseline === 0 ? null : (baseline - proposed) / baseline;
}

reliabilityChange:
  urllc.proposed.metrics.reliability - urllc.baseline.metrics.reliability,`,
    },
    notes: [
      { kind: "RESULTADO_SIMULADO", title: "Evidencia", text: "Los valores visibles dependen de la seed, escenario y parámetros de la ejecución activa." },
      { kind: "SUPUESTO_MODELO", title: "Alcance", text: "Una mejora experimental dentro de Jiw 5G no equivale a demostrar rendimiento de una red comercial o certificación normativa." },
    ],
    glossaryIds: ["baseline", "reliability", "overhead", "energyProxy"],
  },
};

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return (glossaryEntries as Record<string, GlossaryEntry>)[id];
}
