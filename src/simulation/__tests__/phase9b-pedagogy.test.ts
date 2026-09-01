import { describe, expect, it } from "vitest";
import { englishTerms } from "../../app/explainability/englishTerms";
import { pedagogicalTopics } from "../../app/explainability/presentation";

const expectedTopics = ["traffic", "risk", "mmtc", "urllc", "comparison"] as const;

describe("FASE 9B · pedagogía de presentación", () => {
  it("mantiene los cinco módulos pedagógicos centrales", () => {
    expect(Object.keys(pedagogicalTopics).sort()).toEqual([...expectedTopics].sort());
  });

  it("prioriza explicación simple y conserva un resumen técnico corto", () => {
    for (const topic of Object.values(pedagogicalTopics)) {
      expect(topic.lead.length).toBeGreaterThan(40);
      expect(topic.whyItMatters.length).toBeGreaterThan(30);
      expect(topic.analogy.length).toBeGreaterThan(30);
      expect(topic.technicalOneLiner.length).toBeGreaterThan(20);
      expect(topic.technicalOneLiner.length).toBeLessThan(260);
      expect(topic.equations.length).toBeGreaterThan(0);
    }
  });

  it("todos los términos ingleses usados por los módulos tienen traducción y explicación", () => {
    const referenced = new Set(Object.values(pedagogicalTopics).flatMap((topic) => topic.englishTerms));
    for (const id of referenced) {
      const entry = englishTerms[id];
      expect(entry).toBeDefined();
      expect(entry.translation.length).toBeGreaterThan(2);
      expect(entry.simple.length).toBeGreaterThan(20);
    }
  });

  it("incluye términos clave de la sustentación", () => {
    expect(englishTerms.workload.translation).toContain("carga");
    expect(englishTerms.backoff.translation).toContain("espera");
    expect(englishTerms.overhead.translation).toContain("costo");
    expect(englishTerms.seed.translation).toContain("semilla");
  });
});
