"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createBlendy, type Blendy } from "blendy";
import "../explainability.css";
import "../phase9b.css";
import { explainabilityTopics, getGlossaryEntry } from "../explainability/catalog";
import { pedagogicalTopics } from "../explainability/presentation";
import { githubFileUrl } from "../explainability/github";
import type { KnowledgeKind } from "../explainability/types";
import { HoverTerm } from "./HoverTerm";

const kindLabels: Record<KnowledgeKind, string> = {
  CONCEPTO: "Concepto",
  DATO_EXTERNO: "Dato externo",
  PARAMETRO_EXPERIMENTAL: "Parámetro experimental",
  RESULTADO_SIMULADO: "Resultado simulado",
  SUPUESTO_MODELO: "Supuesto del modelo",
};

export function ExploreTopicButton({
  topicId,
  evidence,
}: {
  topicId: keyof typeof explainabilityTopics;
  evidence?: ReactNode;
}) {
  const topic = explainabilityTopics[topicId];
  const pedagogy = pedagogicalTopics[topicId];
  const reactId = useId().replaceAll(":", "");
  const blendyId = `jiw-explain-${topicId}-${reactId}`;
  const blendy = useRef<Blendy | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    blendy.current = createBlendy({ animation: "dynamic" });
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  const open = () => setShowModal(true);
  const close = useCallback(() => {
    if (reduceMotion || !blendy.current) {
      setShowModal(false);
      return;
    }
    blendy.current.untoggle(blendyId, () => setShowModal(false));
  }, [blendyId, reduceMotion]);

  useEffect(() => {
    if (!showModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    if (!reduceMotion) {
      blendy.current?.update();
      blendy.current?.toggle(blendyId);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showModal, blendyId, reduceMotion, close]);

  return (
    <>
      <button type="button" className="explore-button" data-blendy-from={blendyId} onClick={open}>
        <span>Explorar cómo funciona</span>
      </button>

      {showModal && createPortal(
        <div
          className="explainer-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div className="explainer-modal" data-blendy-to={blendyId}>
            <article
              className="explainer-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${blendyId}-title`}
            >
              <header className="explainer-card__header">
                <div>
                  <p className="section-kicker">{topic.kicker}</p>
                  <h2 id={`${blendyId}-title`}>{topic.title}</h2>
                </div>
                <button ref={closeRef} type="button" className="explainer-close" onClick={close} aria-label="Cerrar explicación">×</button>
              </header>

              <section className="simple-story">
                <span className="explainer-section__label">Primero: la idea sin tecnicismos</span>
                <p className="simple-story__lead">{pedagogy.lead}</p>
                <div className="simple-story__grid">
                  <div className="simple-story__item">
                    <strong>¿Por qué importa?</strong>
                    <p>{pedagogy.whyItMatters}</p>
                  </div>
                  <div className="simple-story__item">
                    <strong>Una forma de imaginarlo</strong>
                    <p>{pedagogy.analogy}</p>
                  </div>
                </div>
              </section>

              {evidence ? (
                <section className="explainer-section explainer-section--evidence">
                  <span className="explainer-section__label">Esta ejecución</span>
                  <h3>¿Qué ocurrió en la simulación que estás viendo?</h3>
                  {evidence}
                </section>
              ) : null}

              <section className="compact-technical" aria-label="Resumen técnico">
                <div className="compact-technical__text">
                  <span className="explainer-section__label">Técnicamente, en una línea</span>
                  <p>{pedagogy.technicalOneLiner}</p>
                </div>
                <div className="equation-list">
                  {pedagogy.equations.map((equation) => (
                    <div className="equation-card" key={equation.expression}>
                      <code>{equation.expression}</code>
                      <span>{equation.meaning}</span>
                    </div>
                  ))}
                </div>
              </section>

              {pedagogy.englishTerms.length > 0 ? (
                <div className="english-terms-strip" aria-label="Términos en inglés">
                  <strong>Términos en inglés · pasa el cursor</strong>
                  {pedagogy.englishTerms.map((id) => <HoverTerm id={id} key={id} />)}
                </div>
              ) : null}

              <section className="explainer-section">
                <span className="explainer-section__label">Flujo del algoritmo</span>
                <h3>Paso a paso</h3>
                <ol className="explainer-steps">
                  {topic.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </section>

              <details className="explainer-code-disclosure">
                <summary>Ver el código real que implementa este comportamiento</summary>
                <section className="explainer-section explainer-section--code">
                  <div className="explainer-code-heading">
                    <div>
                      <span className="explainer-section__label">Código real del proyecto</span>
                      <h3>{topic.code.file}</h3>
                    </div>
                    <a href={githubFileUrl(topic.code.file)} target="_blank" rel="noreferrer">Ver archivo en GitHub ↗</a>
                  </div>
                  <pre className="code-block"><code>{topic.code.snippet}</code></pre>
                </section>
              </details>

              <section className="explainer-section">
                <span className="explainer-section__label">Rigor académico</span>
                <h3>Qué debemos distinguir</h3>
                <div className="knowledge-grid">
                  {topic.notes.map((note) => (
                    <div className="knowledge-note" key={`${note.kind}-${note.title}`}>
                      <span className={`knowledge-badge knowledge-badge--${note.kind.toLowerCase()}`}>{kindLabels[note.kind]}</span>
                      <strong>{note.title}</strong>
                      <p>{note.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="explainer-section">
                <span className="explainer-section__label">Conceptos relacionados</span>
                <div className="glossary-list">
                  {topic.glossaryIds.map((id) => {
                    const entry = getGlossaryEntry(id);
                    return entry ? (
                      <div className="glossary-list__item" key={entry.id}>
                        <strong>{entry.term}</strong>
                        <p>{entry.simple}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              </section>
            </article>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
