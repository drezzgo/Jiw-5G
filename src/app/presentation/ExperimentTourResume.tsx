"use client";

import { useEffect } from "react";
import { driver, type DriveStep } from "driver.js";
import { PRESENTATION_RESUME_KEY } from "./tourState";

function experimentSteps(): DriveStep[] {
  return [
    {
      element: '[data-tour="experiment-hero"]',
      popover: {
        title: "21 · LABORATORIO EXPERIMENTAL",
        description: `<p>Una sola seed demuestra reproducibilidad, pero puede representar una realización particular. Aquí repetimos el experimento con varias seeds deterministas.</p>`,
      },
    },
    {
      element: '[data-tour="experiment-notice"]',
      popover: {
        title: "22 · QUÉ PODEMOS AFIRMAR",
        description: `<p>Las salidas son <strong>estadísticas descriptivas del modelo</strong>. No afirmamos significancia estadística ni rendimiento de una red 5G comercial.</p>`,
      },
    },
    {
      element: '[data-tour="experiment-controls"]',
      popover: {
        title: "23 · DOS PREGUNTAS EXPERIMENTALES",
        description: `<ul class="tour-list"><li><strong>Matriz principal:</strong> compara los cinco escenarios.</li><li><strong>Escalabilidad:</strong> cambia la cantidad de sensores para observar la respuesta del modelo.</li></ul>`,
      },
    },
    {
      element: '[data-tour="experiment-replications"]',
      popover: {
        title: "24 · SEEDS Y RÉPLICAS",
        description: `<p>La seed inicia el PRNG determinista. Seeds diferentes producen réplicas distintas; dentro de cada réplica Baseline y Proposed comparten el mismo workload.</p>`,
      },
    },
    {
      element: '[data-tour="experiment-run"]',
      advanceOnClick: true,
      popover: {
        title: "25 · EJECUTEMOS UNA DEMOSTRACIÓN",
        description: `<p>La exposición usa las réplicas que estén configuradas en pantalla. Para clase, 5 es suficiente para demostrar el procedimiento rápidamente.</p><p class="tour-action">Haz clic en Ejecutar experimento.</p>`,
        showButtons: ["previous", "close"],
      },
    },
    {
      element: '[data-tour="experiment-summary"]',
      waitForElement: 15000,
      popover: {
        title: "26 · RESULTADO REPLICADO",
        description: `<p>Aquí vemos cuántas réplicas y ejecuciones se realizaron, junto con el rango de seeds utilizado.</p>`,
      },
    },
    {
      element: '[data-tour="experiment-results"]',
      waitForElement: 15000,
      popover: {
        title: "27 · BASELINE VS PROPOSED",
        description: `<p>La tabla resume transmisiones, colisiones, energy proxy, reliability, latencia y overhead. Las cifras pertenecen al modelo y deben interpretarse junto con sus supuestos.</p>`,
      },
    },
    {
      element: '[data-tour="experiment-exports"]',
      waitForElement: 15000,
      popover: {
        title: "28 · EVIDENCIA AUDITABLE",
        description: `<p>CSV crudo conserva cada seed; CSV agregado resume los grupos; el JSON auditable guarda configuración y métricas sin millones de logs por mensaje.</p>`,
      },
    },
    {
      popover: {
        title: "CIERRE · Jiw 5G",
        description: `<p class="tour-lead">La propuesta integrada busca dos cosas complementarias: <strong>reducir presión del tráfico ordinario con mMTC</strong> y <strong>proteger las alertas críticas con URLLC</strong>.</p><p>El resultado es una herramienta académica reproducible, explicable y auditable; no una reproducción completa de una red 5G.</p><div class="tour-flow">eficiencia mMTC ↔ Jiw 5G ↔ respuesta crítica URLLC</div>`,
        doneBtnText: "Finalizar exposición",
      },
    },
  ];
}

export function ExperimentTourResume() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("tour") === "full" || window.sessionStorage.getItem(PRESENTATION_RESUME_KEY) === "full";
    if (!requested) return;

    window.sessionStorage.removeItem(PRESENTATION_RESUME_KEY);
    window.history.replaceState({}, "", "/experimentos");

    const timer = window.setTimeout(() => {
      document.documentElement.classList.add("guided-tour-active");
      const tour = driver({
        steps: experimentSteps(),
        animate: true,
        duration: 360,
        smoothScroll: true,
        allowClose: true,
        allowScroll: true,
        allowKeyboardControl: true,
        overlayColor: "#071c17",
        overlayOpacity: 0.72,
        stagePadding: 10,
        stageRadius: 14,
        popoverOffset: 14,
        popoverClass: "jiw-driver-popover",
        showProgress: true,
        progressText: "Paso {{current}} de {{total}} · capítulo Experimentos",
        nextBtnText: "Siguiente →",
        prevBtnText: "← Atrás",
        doneBtnText: "Finalizar exposición",
        onDestroyed: () => document.documentElement.classList.remove("guided-tour-active"),
      });
      tour.drive();
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
