export interface EnglishTermEntry {
  id: string;
  term: string;
  translation: string;
  simple: string;
}

export const englishTerms = {
  baseline: {
    id: "baseline",
    term: "baseline",
    translation: "línea base / referencia",
    simple: "La versión inicial contra la que comparamos nuestra propuesta para saber si realmente mejora algo.",
  },
  workload: {
    id: "workload",
    term: "workload",
    translation: "carga de trabajo",
    simple: "El conjunto de mensajes, eventos o tareas que recibe una estrategia durante una prueba. En Jiw 5G usamos el mismo workload para comparar de forma justa.",
  },
  backoff: {
    id: "backoff",
    term: "backoff",
    translation: "espera antes de reintentar",
    simple: "Si varios sensores chocan al transmitir, cada uno espera un tiempo diferente antes de volver a intentarlo para evitar que todos choquen otra vez.",
  },
  energyProxy: {
    id: "energyProxy",
    term: "energy proxy",
    translation: "indicador aproximado de actividad energética",
    simple: "Una medida comparativa simplificada. Sirve para decir qué estrategia requiere más o menos actividad, pero no representa joules ni consumo físico real.",
  },
  overhead: {
    id: "overhead",
    term: "overhead",
    translation: "costo adicional de recursos",
    simple: "Trabajo o recursos extra necesarios para conseguir una mejora. En URLLC, enviar dos copias mejora la posibilidad de entrega, pero aumenta el overhead.",
  },
  seed: {
    id: "seed",
    term: "seed",
    translation: "semilla",
    simple: "Número usado para iniciar la secuencia pseudoaleatoria. Si repetimos la misma seed y los mismos parámetros, obtenemos nuevamente la misma simulación.",
  },
  replay: {
    id: "replay",
    term: "replay",
    translation: "reproducción",
    simple: "Modo que vuelve a usar un contexto guardado en JSON para repetir una demostración sin depender de que los datos externos sigan iguales.",
  },
  live: {
    id: "live",
    term: "live",
    translation: "en vivo / actual",
    simple: "Modo que consulta información actual. En Jiw 5G obtiene contexto vial desde TomTom mediante el backend.",
  },
  provider: {
    id: "provider",
    term: "provider",
    translation: "proveedor de datos",
    simple: "Componente encargado de entregar datos con el mismo formato, sin importar si vienen de DEMO, REPLAY o TomTom LIVE.",
  },
  mapping: {
    id: "mapping",
    term: "mapping",
    translation: "regla de transformación",
    simple: "Conversión entre un dato externo y un parámetro que entiende el simulador. Por ejemplo, convertir velocidades de tráfico en nivel LOW, MEDIUM o HIGH.",
  },
  jitter: {
    id: "jitter",
    term: "jitter",
    translation: "variación del retardo",
    simple: "Pequeñas variaciones en el tiempo que tarda una transmisión. Hace que la latencia no sea exactamente idéntica en todos los envíos.",
  },
  idle: {
    id: "idle",
    term: "idle",
    translation: "inactivo / en espera",
    simple: "Estado en el que un dispositivo no está transmitiendo. El energy proxy usa este estado solo como parte de un modelo simplificado.",
  },
  tradeoff: {
    id: "tradeoff",
    term: "trade-off",
    translation: "compensación entre beneficio y costo",
    simple: "Una mejora suele tener un costo. Por ejemplo, duplicar alertas puede mejorar la fiabilidad, pero consume más recursos de transmisión.",
  },
} satisfies Record<string, EnglishTermEntry>;

export type EnglishTermId = keyof typeof englishTerms;
