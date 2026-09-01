import { describe, expect, it } from "vitest";
import { explainabilityTopics, glossaryEntries, getGlossaryEntry } from "../../app/explainability/catalog";

const expectedTopics = ["traffic", "risk", "mmtc", "urllc", "comparison"] as const;

describe("FASE 9A - explainability catalog", () => {
  it("contains the five pedagogical dashboard topics", () => {
    expect(Object.keys(explainabilityTopics).sort()).toEqual([...expectedTopics].sort());
  });

  it("every topic has an auditable code reference and academic notes", () => {
    for (const topic of Object.values(explainabilityTopics)) {
      expect(topic.simpleSummary.length).toBeGreaterThan(20);
      expect(topic.technicalSummary.length).toBeGreaterThan(20);
      expect(topic.steps.length).toBeGreaterThanOrEqual(3);
      expect(topic.code.file.startsWith("src/")).toBe(true);
      expect(topic.code.snippet.trim().length).toBeGreaterThan(20);
      expect(topic.notes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all glossary references used by topics exist", () => {
    for (const topic of Object.values(explainabilityTopics)) {
      for (const glossaryId of topic.glossaryIds) {
        expect(getGlossaryEntry(glossaryId), `${topic.id} -> ${glossaryId}`).toBeDefined();
      }
    }
  });

  it("glossary ids are unique and each definition has simple and technical layers", () => {
    const entries = Object.values(glossaryEntries);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.simple.length).toBeGreaterThan(15);
      expect(entry.technical.length).toBeGreaterThan(20);
    }
  });
});
