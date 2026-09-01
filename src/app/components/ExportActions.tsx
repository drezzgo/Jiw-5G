import { serializeExperimentCsv, serializeExperimentJson } from "../../simulation/experiments/export";
import type { ScenarioExperimentResult } from "../../simulation/experiments/types";
import { toSingleScenarioMatrix } from "../dashboard/presentation";

function downloadText(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ExportActions({ result }: { result: ScenarioExperimentResult }) {
  const baseName = `jiw-5g_${result.metadata.scenarioId.toLowerCase()}_seed-${result.metadata.seed}`;
  const matrix = toSingleScenarioMatrix(result);

  return (
    <div className="export-actions">
      <button type="button" className="button button--secondary" onClick={() => downloadText(`${baseName}.json`, serializeExperimentJson(matrix), "application/json;charset=utf-8")}>Exportar JSON</button>
      <button type="button" className="button button--secondary" onClick={() => downloadText(`${baseName}.csv`, serializeExperimentCsv(matrix), "text/csv;charset=utf-8")}>Exportar CSV</button>
    </div>
  );
}
