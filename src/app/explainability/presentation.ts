import type { ExplainabilityTopic } from "./types";
import type { EnglishTermId } from "./englishTerms";

export interface PedagogicalTopic {
  id: ExplainabilityTopic["id"];
  lead: string;
  whyItMatters: string;
  analogy: string;
  technicalOneLiner: string;
  equations: readonly {
    expression: string;
    meaning: string;
  }[];
  englishTerms: readonly EnglishTermId[];
}

export const pedagogicalTopics: Record<PedagogicalTopic["id"], PedagogicalTopic> = {
  traffic: {
    id: "traffic",
    lead: "Miramos cómo se está moviendo el tráfico y lo traducimos a una condición sencilla que el simulador pueda utilizar.",
    whyItMatters: "Así podemos usar el mismo motor con tráfico inventado, un archivo guardado o datos actuales de TomTom sin cambiar la lógica interna de mMTC y URLLC.",
    analogy: "Es como leer un velocímetro y después decir: la vía está fluida, intermedia o congestionada. TomTom aporta los números; Jiw 5G decide cómo interpretarlos dentro del experimento.",
    technicalOneLiner: "El mapper compara velocidad actual y velocidad de flujo libre, clasifica el cociente con umbrales configurables y asigna una tasa de llegada vehicular.",
    equations: [
      {
        expression: "r = v_actual / v_libre",
        meaning: "Compara qué tan cerca está la velocidad actual de la velocidad esperada sin congestión.",
      },
    ],
    englishTerms: ["provider", "mapping", "live", "replay"],
  },
  risk: {
    id: "risk",
    lead: "Jiw 5G genera una alerta crítica únicamente cuando coinciden tres señales: hay peatón, hay un vehículo aproximándose y el riesgo supera un límite.",
    whyItMatters: "La regla es intencionalmente fácil de explicar y auditar. No necesitamos visión artificial para demostrar cómo una detección de riesgo termina convirtiéndose en tráfico prioritario.",
    analogy: "Es una puerta con tres llaves: si falta cualquiera de las tres condiciones, la alerta crítica no se abre.",
    technicalOneLiner: "La clasificación es booleana y usa un umbral de riesgo configurable sobre observaciones generadas por el modelo.",
    equations: [
      {
        expression: "CRÍTICO = peatón ∧ vehículo ∧ (riesgo > umbral)",
        meaning: "Las tres condiciones deben cumplirse al mismo tiempo.",
      },
    ],
    englishTerms: [],
  },
  mmtc: {
    id: "mmtc",
    lead: "Si cientos de sensores hablan aunque no haya ocurrido nada importante, el canal se llena. Nuestra propuesta hace que muchos permanezcan en silencio y transmitan solo cuando existe un cambio relevante.",
    whyItMatters: "Menos transmisiones significan menos competencia, menos colisiones y menor actividad energética estimada dentro de nuestro modelo.",
    analogy: "Imagina un salón donde todos repiten cada segundo 'no hay novedades'. La propuesta pide hablar solo cuando haya algo nuevo; si varios hablan a la vez, esperan tiempos diferentes antes de volver a intentarlo.",
    technicalOneLiner: "BASELINE transmite todas las oportunidades; PROPOSED filtra por excepción y aplica backoff determinista a reintentos ordinarios.",
    equations: [
      {
        expression: "Tx_propuesta ≤ Tx_baseline",
        meaning: "La transmisión por excepción busca reducir la cantidad de mensajes que realmente entran al canal.",
      },
      {
        expression: "E_proxy = N_tx·E_tx + N_idle·E_idle",
        meaning: "Es un indicador adimensional para comparar estrategias, no una medición física de energía.",
      },
    ],
    englishTerms: ["baseline", "workload", "backoff", "energyProxy", "idle"],
  },
  urllc: {
    id: "urllc",
    lead: "Una alerta de riesgo no debería esperar detrás de mensajes normales. La propuesta le da prioridad y envía dos copias; la primera que llegue correctamente es la que se usa.",
    whyItMatters: "Si una ruta falla o tarda demasiado, la segunda puede rescatar la alerta. La mejora tiene un costo: estamos enviando más copias físicas.",
    analogy: "Es como enviar el mismo mensaje urgente con dos mensajeros por caminos distintos y actuar cuando llegue el primero.",
    technicalOneLiner: "PROPOSED evalúa dos rutas simuladas independientes, aplica menor retardo de cola y selecciona la copia válida con menor latencia total.",
    equations: [
      {
        expression: "L_alerta = min(L_A, L_B)",
        meaning: "Entre las copias válidas, la alerta usa la ruta que llega primero.",
      },
      {
        expression: "R = alertas_dentro_umbral / eventos_críticos",
        meaning: "La fiabilidad experimental cuenta únicamente alertas entregadas dentro del límite configurado.",
      },
    ],
    englishTerms: ["baseline", "jitter", "overhead", "tradeoff"],
  },
  comparison: {
    id: "comparison",
    lead: "No queremos decir simplemente que nuestra propuesta es mejor. Queremos mostrar cuánto mejora y qué precio pagamos por esa mejora.",
    whyItMatters: "Una comparación útil muestra simultáneamente beneficios y costos: menos tráfico y colisiones en mMTC, más fiabilidad en URLLC, pero también redundancia adicional.",
    analogy: "Es como comparar dos rutas de viaje: no basta con saber cuál llega antes; también importa cuánto combustible, dinero o esfuerzo extra necesita.",
    technicalOneLiner: "La capa experimental compara métricas derivadas de los mismos workloads y calcula reducciones relativas y cambios absolutos de fiabilidad.",
    equations: [
      {
        expression: "reducción = (baseline - propuesta) / baseline",
        meaning: "Indica qué fracción de una métrica se redujo respecto a la referencia, cuando baseline es distinto de cero.",
      },
    ],
    englishTerms: ["baseline", "workload", "tradeoff", "overhead", "energyProxy"],
  },
};
