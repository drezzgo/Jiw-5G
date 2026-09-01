"use client";

import type { ReactNode } from "react";
import { getGlossaryEntry, type GlossaryId } from "../explainability/catalog";
import "../phase9b.css";

export function TechnicalTerm({ id, children }: { id: GlossaryId; children?: ReactNode }) {
  const entry = getGlossaryEntry(id);
  if (!entry) return <>{children ?? id}</>;

  return (
    <details className="term-popover">
      <summary>
        <span className="term-popover__label">{children ?? entry.term}</span>
        <span className="term-popover__icon" aria-hidden="true">?</span>
      </summary>
      <div className="term-popover__content" role="note">
        <div className="term-popover__header">
          <strong>{entry.term}</strong>
          <span className={`knowledge-badge knowledge-badge--${entry.kind.toLowerCase()}`}>{entry.kind.replaceAll("_", " ")}</span>
        </div>
        <p className="term-popover__simple">{entry.simple}</p>
        <details className="term-popover__technical">
          <summary>Detalle técnico breve</summary>
          <p>{entry.technical}</p>
        </details>
      </div>
    </details>
  );
}
