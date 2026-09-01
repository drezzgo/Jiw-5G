export function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function energyProxy(
  transmittedMessages: number,
  idleUnits: number,
  energyTxUnits: number,
  energyIdleUnits: number,
): number {
  return transmittedMessages * energyTxUnits + idleUnits * energyIdleUnits;
}

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  if (p < 0 || p > 1) throw new Error("p must be between 0 and 1");
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
