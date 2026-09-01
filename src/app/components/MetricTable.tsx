import type { ReactNode } from "react";

export interface MetricRow {
  label: string;
  baseline: ReactNode;
  proposed: ReactNode;
  note?: string;
}

export function MetricTable({ rows }: { rows: readonly MetricRow[] }) {
  return (
    <div className="metric-table" role="table" aria-label="Comparación baseline y propuesta">
      <div className="metric-table__row metric-table__head" role="row">
        <span role="columnheader">Métrica</span>
        <span role="columnheader">Baseline</span>
        <span role="columnheader">Propuesta</span>
      </div>
      {rows.map((row) => (
        <div className="metric-table__row" role="row" key={row.label}>
          <span role="cell">
            {row.label}
            {row.note ? <small>{row.note}</small> : null}
          </span>
          <strong role="cell">{row.baseline}</strong>
          <strong role="cell">{row.proposed}</strong>
        </div>
      ))}
    </div>
  );
}
