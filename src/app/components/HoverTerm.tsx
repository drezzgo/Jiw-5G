"use client";

import { useId, type ReactNode } from "react";
import { englishTerms, type EnglishTermId } from "../explainability/englishTerms";
import "../phase9b.css";

export function HoverTerm({ id, children, focusable = true }: { id: EnglishTermId; children?: ReactNode; focusable?: boolean }) {
  const entry = englishTerms[id];
  const reactId = useId().replaceAll(":", "");
  const tooltipId = `hover-term-${id}-${reactId}`;

  return (
    <span className="hover-term" tabIndex={focusable ? 0 : undefined} aria-describedby={tooltipId}>
      <span className="hover-term__label">{children ?? entry.term}</span>
      <span className="hover-term__tooltip" id={tooltipId} role="tooltip">
        <strong>{entry.term}</strong>
        <span className="hover-term__translation">{entry.translation}</span>
        <span>{entry.simple}</span>
      </span>
    </span>
  );
}
