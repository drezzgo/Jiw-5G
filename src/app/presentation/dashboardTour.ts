import type { DriveStep } from "driver.js";
import { PRESENTATION_EXPERIMENT_PATH, PRESENTATION_RESUME_KEY } from "./tourState";

const centered = (title: string, description: string): DriveStep => ({
  popover: { title, description, side: "bottom", align: "center" },
});

const interactive = (element: string, title: string, description: string): DriveStep => ({
  element,
  advanceOnClick: true,
  popover: {
    title,
    description,
    showButtons: ["previous", "close"],
  },
});

export function buildFullDashboardTour(): DriveStep[] {
  return [
    centered(
      "01 · PRESENTACIÓN · Jiw 5G",
      `<p class="tour-lead">Sistema inteligente de cruce peatonal escolar basado en la integración de <strong>mMTC</strong> y <strong>URLLC</strong>.</p><p>La pregunta que guía el proyecto es sencilla: <strong>¿cómo permitir que muchos sensores ordinarios convivan con pocas alertas que deben tratarse con prioridad?</strong></p>`,
    ),
    {
      element: '[data-tour="hero"]',
      popover: {
        title: "02 · EL ESCENARIO",
        description: `<p>Jiw 5G representa un cruce escolar instrumentado. Los sensores producen información, un controlador evalúa el riesgo y, si aparece una condición crítica, se genera una alerta.</p><div class="tour-flow">Sensores → mMTC → riesgo → URLLC → actuación</div>`,
      },
    },
    {
      element: '[data-tour="scope"]',
      popover: {
        title: "03 · QUÉ ES Y QUÉ NO ES",
        description: `<p>Este es un <strong>modelo académico reproducible</strong>. No es un emulador completo de 5G NR ni una certificación 3GPP.</p><p class="tour-callout">Las colas, pérdidas, latencias y energía son abstracciones experimentales documentadas.</p>`,
      },
    },
    {
      element: '[data-tour="config"]',
      popover: {
        title: "04 · UN MISMO MOTOR, VARIOS ESCENARIOS",
        description: `<p>Los escenarios son configuraciones del mismo motor. Podemos variar sensores, riesgo, capacidad y umbral sin duplicar la lógica de simulación.</p><p><strong>Baseline</strong> y <strong>Proposed</strong> reciben el mismo workload dentro de una ejecución.</p>`,
      },
    },
    {
      element: '[data-tour="mmtc"]',
      popover: {
        title: "05 · mMTC · MUCHOS SENSORES",
        description: `<p class="tour-lead">Si todos los sensores hablan todo el tiempo, terminan compitiendo por un recurso limitado.</p><p>La propuesta usa <strong>transmisión por excepción</strong>: evita mensajes ordinarios innecesarios y, cuando todavía hay competencia, puede aplicar <strong>backoff</strong>.</p><div class="tour-equation">Tx<sub>propuesta</sub> ≤ Tx<sub>baseline</sub></div>`,
      },
    },
    interactive(
      '[data-tour="explore-mmtc"]',
      "06 · ABRIR LA EXPLICACIÓN mMTC",
      `<p>Haz clic en <strong>Explorar cómo funciona</strong>. Blendy ampliará la tarjeta y Driver.js continuará la exposición dentro de ella.</p><p class="tour-action">Haz clic sobre el botón resaltado para continuar.</p>`,
    ),
    {
      element: '[data-tour="explainer-mmtc-simple"]',
      waitForElement: 5000,
      popover: {
        title: "07 · PRIMERO, LA IDEA SIMPLE",
        description: `<p>La explicación principal está escrita para alguien sin formación en telecomunicaciones. La parte técnica se reduce a una frase y ecuaciones; el código permanece disponible para quien quiera auditarlo.</p><p class="tour-callout">Así la misma página sirve para aprender, exponer y revisar técnicamente.</p>`,
      },
    },
    interactive(
      '[data-tour="explainer-mmtc-close"]',
      "08 · VOLVEMOS AL SISTEMA",
      `<p>El código real y los supuestos quedan dentro de esta tarjeta. Cierra la explicación para continuar con el evento crítico.</p><p class="tour-action">Haz clic en ×.</p>`,
    ),
    centered(
      "09 · DEL TRÁFICO ORDINARIO A LA ALERTA",
      `<p>mMTC resuelve el problema de muchos mensajes. Ahora necesitamos decidir <strong>cuándo un mensaje deja de ser ordinario</strong> y pasa a ser crítico.</p>`,
    ),
    {
      element: '[data-tour="critical-event"]',
      popover: {
        title: "10 · DETECCIÓN DE RIESGO",
        description: `<p>Jiw 5G genera un evento crítico cuando coinciden peatón presente, vehículo aproximándose y riesgo superior al umbral experimental.</p><div class="tour-equation">Crítico = peatón ∧ vehículo ∧ (riesgo &gt; umbral)</div><p>No hay visión artificial: las observaciones pertenecen al modelo.</p>`,
      },
    },
    {
      element: '[data-tour="urllc"]',
      popover: {
        title: "11 · URLLC · PROTEGER LA ALERTA",
        description: `<p class="tour-lead">Una alerta crítica no debería esperar detrás del tráfico ordinario.</p><p>Baseline usa una ruta. Proposed reduce la espera simulada mediante prioridad y envía dos copias por rutas A y B; gana la primera copia válida.</p><div class="tour-equation">L<sub>alerta</sub> = min(L<sub>A</sub>, L<sub>B</sub>)</div>`,
      },
    },
    {
      element: '[data-tour="comparison"]',
      popover: {
        title: "12 · BENEFICIO Y COSTO",
        description: `<p>La propuesta no se presenta como gratuita. Reducir tráfico puede disminuir colisiones y actividad energética estimada; la redundancia URLLC, en cambio, <strong>aumenta las copias físicas</strong>.</p><p class="tour-callout">La exposición debe mostrar siempre el trade-off, no solo la mejora.</p>`,
      },
    },
    {
      element: '[data-tour="scenario-selector"]',
      popover: {
        title: "13 · LOS ESCENARIOS IMPORTANTES",
        description: `<ul class="tour-list"><li><strong>Alta densidad:</strong> presión mMTC.</li><li><strong>Fallo de ruta:</strong> valor de la redundancia.</li><li><strong>Congestión crítica:</strong> integración de ambos problemas.</li></ul><p>En una sustentación puedes ejecutar cualquiera de ellos sin cambiar de motor.</p>`,
      },
    },
    interactive(
      '[data-tour="mode-live"]',
      "14 · LIVE · CONTEXTO REAL",
      `<p>Jiw 5G puede consultar contexto vial externo mediante TomTom. <strong>TomTom no simula 5G</strong>: solo aporta datos de tráfico.</p><p class="tour-action">Haz clic en LIVE para mostrar los puntos de Bogotá.</p>`,
    ),
    {
      element: '[data-tour="live-preset"]',
      waitForElement: 5000,
      popover: {
        title: "15 · TRES PUNTOS DE BOGOTÁ",
        description: `<p>El selector incluye el cruce frente a la <strong>Universidad Distrital · Sede Tecnológica</strong>, Av. 68 × Américas y Caracas × Calle 26, además de una opción personalizada.</p><p>Cambiar el punto <strong>no consulta automáticamente</strong> la API; la llamada solo ocurre al ejecutar la simulación.</p>`,
      },
    },
    {
      element: '[data-tour="live-coordinates"]',
      popover: {
        title: "16 · COORDENADAS WGS84",
        description: `<p>Los presets simplemente rellenan latitud y longitud válidas. Esto mantiene visible y auditable qué punto se está consultando.</p>`,
      },
    },
    {
      element: '[data-tour="traffic-context"]',
      popover: {
        title: "17 · DATO EXTERNO → MODELO",
        description: `<p>Cuando se ejecuta LIVE, velocidad actual y flujo libre provienen de TomTom. Jiw 5G calcula su relación y la transforma en un nivel experimental de tráfico.</p><div class="tour-equation">r = v<sub>actual</sub> / v<sub>libre</sub></div><p class="tour-callout">TomTom termina aquí; mMTC y URLLC siguen siendo simulados por Jiw 5G.</p>`,
      },
    },
    interactive(
      '[data-tour="mode-replay"]',
      "18 · REPLAY · REPRODUCIBILIDAD",
      `<p>LIVE cambia con el tiempo. REPLAY congela una captura y su mapping para poder repetir el contexto más adelante.</p><p class="tour-action">Haz clic en REPLAY para ver la entrada reproducible.</p>`,
    ),
    {
      element: '[data-tour="replay-panel"]',
      waitForElement: 5000,
      popover: {
        title: "19 · MISMA CAPTURA, MISMA SEED",
        description: `<p>Una ejecución reproducible requiere mantener la captura, la seed, la configuración y la versión del simulador.</p><div class="tour-flow">Replay + seed + config + versión → repetición controlada</div>`,
      },
    },
    {
      popover: {
        title: "20 · DE UNA EJECUCIÓN A UN EXPERIMENTO",
        description: `<p>Hasta aquí observamos una ejecución. Para evitar depender de una única realización pseudoaleatoria, Jiw 5G incluye un laboratorio con múltiples seeds y estadísticas descriptivas.</p><p class="tour-callout">El siguiente capítulo abre /experimentos.</p>`,
        nextBtnText: "Ir a experimentos →",
        onNextClick: (_element, _step, { driver }) => {
          driver.destroy();
          window.sessionStorage.setItem(PRESENTATION_RESUME_KEY, "full");
          window.location.assign(PRESENTATION_EXPERIMENT_PATH);
        },
      },
    },
  ];
}

export function buildQuickDashboardTour(): DriveStep[] {
  return [
    centered("Jiw 5G · DEMO RÁPIDA", `<p class="tour-lead">En pocos pasos: problema, mMTC, riesgo, URLLC, LIVE y evidencia experimental.</p>`),
    {
      element: '[data-tour="hero"]',
      popover: { title: "1 · Problema", description: `<p>Muchos sensores ordinarios deben convivir con pocas alertas críticas dentro de un cruce escolar inteligente.</p>` },
    },
    {
      element: '[data-tour="mmtc"]',
      popover: { title: "2 · mMTC", description: `<p>Proposed evita transmisiones ordinarias innecesarias y puede aplicar backoff cuando existe competencia.</p>` },
    },
    {
      element: '[data-tour="critical-event"]',
      popover: { title: "3 · Riesgo", description: `<p>Peatón + vehículo aproximándose + riesgo superior al umbral generan una alerta crítica.</p>` },
    },
    {
      element: '[data-tour="urllc"]',
      popover: { title: "4 · URLLC", description: `<p>La alerta obtiene prioridad y dos rutas simuladas; gana la primera copia válida.</p>` },
    },
    {
      element: '[data-tour="comparison"]',
      popover: { title: "5 · Trade-off", description: `<p>Buscamos eficiencia mMTC y respuesta crítica URLLC, mostrando también el costo de redundancia.</p>` },
    },
    {
      element: '[data-tour="mode-live"]',
      popover: { title: "6 · LIVE", description: `<p>TomTom aporta contexto vial externo. No representa la red mMTC ni URLLC.</p>` },
    },
    {
      element: '[data-tour="scope"]',
      popover: { title: "7 · Alcance", description: `<p>Jiw 5G es un modelo experimental reproducible, no una implementación completa de 5G NR.</p>` },
    },
    centered("Conclusión", `<p class="tour-lead"><strong>mMTC</strong> reduce presión del tráfico ordinario; <strong>URLLC</strong> protege alertas críticas mediante prioridad y redundancia dentro del modelo.</p><p>Para profundizar, abre la exposición completa o el laboratorio experimental.</p>`),
  ];
}
