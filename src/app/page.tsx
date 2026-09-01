"use client";

import { useMemo } from "react";
import { SimulationEngine } from "@/simulation/core/engine";
import { createScenario } from "@/simulation/scenarios/scenarios";

export default function Home() {
  const run = useMemo(() => {
    const config = createScenario("SCENARIO_CRITICAL_EVENT", { seed: 12345 });
    return new SimulationEngine().run(config, { executedAt: "DEMO_PREVIEW" });
  }, []);

  return (
    <main className="page">
      <p className="eyebrow">FASE 1 · motor determinista</p>
      <h1>Jiw 5G</h1>
      <p>
        Esta pantalla solo demuestra que el Simulation de la chimbada Engine TypeScript corre en el navegador y está desacoplado de React.
        El dashboard experimental completo corresponde a la FASE 5, osea despuesito, no soy mago.
      </p>

      <section className="grid">
        <article><strong>Escenario</strong><span>{run.metadata.scenarioId}</span></article>
        <article><strong>Seed</strong><span>{run.metadata.seed}</span></article>
        <article><strong>Pasos</strong><span>{run.metrics.steps}</span></article>
        <article><strong>Eventos críticos</strong><span>{run.metrics.criticalEvents}</span></article>
      </section>

      <h2>Últimos logs</h2>
      <pre>{JSON.stringify(run.logs.slice(-8), null, 2)}</pre>
    </main>
  );
}
