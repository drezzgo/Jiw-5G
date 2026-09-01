export type KnowledgeKind =
  | "CONCEPTO"
  | "DATO_EXTERNO"
  | "PARAMETRO_EXPERIMENTAL"
  | "RESULTADO_SIMULADO"
  | "SUPUESTO_MODELO";

export interface GlossaryEntry {
  id: string;
  term: string;
  simple: string;
  technical: string;
  kind: KnowledgeKind;
}

export interface ExplainabilityTopic {
  id: "traffic" | "risk" | "mmtc" | "urllc" | "comparison";
  kicker: string;
  title: string;
  simpleSummary: string;
  technicalSummary: string;
  steps: readonly string[];
  code: {
    file: string;
    language: "ts";
    snippet: string;
  };
  notes: readonly {
    kind: KnowledgeKind;
    title: string;
    text: string;
  }[];
  glossaryIds: readonly string[];
}
