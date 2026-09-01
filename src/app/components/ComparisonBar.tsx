interface ComparisonBarProps {
  label: string;
  baseline: number;
  proposed: number;
  format?: (value: number) => string;
}

export function ComparisonBar({
  label,
  baseline,
  proposed,
  format = (value) => String(value),
}: ComparisonBarProps) {
  const maximum = Math.max(baseline, proposed, 0);
  const width = (value: number) => (maximum === 0 ? 0 : (Math.max(value, 0) / maximum) * 100);

  return (
    <div className="comparison-bar">
      <div className="comparison-bar__header">
        <span>{label}</span>
      </div>
      <div className="comparison-bar__row">
        <span className="comparison-bar__strategy">Baseline</span>
        <div className="comparison-bar__track" aria-hidden="true">
          <span className="comparison-bar__fill comparison-bar__fill--baseline" style={{ width: `${width(baseline)}%` }} />
        </div>
        <strong>{format(baseline)}</strong>
      </div>
      <div className="comparison-bar__row">
        <span className="comparison-bar__strategy">Propuesta</span>
        <div className="comparison-bar__track" aria-hidden="true">
          <span className="comparison-bar__fill comparison-bar__fill--proposed" style={{ width: `${width(proposed)}%` }} />
        </div>
        <strong>{format(proposed)}</strong>
      </div>
    </div>
  );
}
