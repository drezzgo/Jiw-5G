"use client";

import Link from "next/link";
import { driver, type DriveStep } from "driver.js";
import { buildFullDashboardTour, buildQuickDashboardTour } from "./dashboardTour";

export type PresentationKind = "full" | "quick";

function startTour(steps: DriveStep[]) {
  const root = document.documentElement;
  root.classList.add("guided-tour-active");

  const tour = driver({
    steps,
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
    progressText: "Paso {{current}} de {{total}}",
    nextBtnText: "Siguiente →",
    prevBtnText: "← Atrás",
    doneBtnText: "Finalizar",
    skipMissingElement: false,
    onDestroyed: () => root.classList.remove("guided-tour-active"),
  });

  tour.drive();
}

export function PresentationLauncher() {
  const start = (kind: PresentationKind) => {
    startTour(kind === "full" ? buildFullDashboardTour() : buildQuickDashboardTour());
  };

  return (
    <section className="presentation-launcher" aria-label="Modos de exposición">
      <div className="presentation-launcher__copy">
        <span className="presentation-launcher__eyebrow">Sustentación interactiva</span>
        <strong>¿Quieres que Jiw 5G explique el proyecto?</strong>
        <p>Driver.js guía la narrativa; Blendy profundiza en el código y los popovers resuelven vocabulario.</p>
      </div>
      <div className="presentation-launcher__actions">
        <button type="button" className="button button--primary presentation-start" onClick={() => start("full")}>🎓 Exposición completa</button>
        <button type="button" className="button button--secondary" onClick={() => start("quick")}>⚡ Demo rápida</button>
        <Link href="/experimentos" className="button button--secondary presentation-link">Laboratorio experimental ↗</Link>
      </div>
    </section>
  );
}
