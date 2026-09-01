const assert = require("node:assert/strict");
const { SimulationEngine } = require("../.phase1-build/core/engine.js");
const { createScenario } = require("../.phase1-build/scenarios/scenarios.js");
const { evaluateRisk } = require("../.phase1-build/risk/evaluateRisk.js");

const fixedTime = "2026-09-01T00:00:00.000Z";
const engine = new SimulationEngine();
const config = createScenario("SCENARIO_CRITICAL_EVENT", { seed: 12345 });
const first = engine.run(config, { executedAt: fixedTime });
const second = engine.run(config, { executedAt: fixedTime });

assert.deepEqual(second, first, "determinism failed");
assert.ok(first.metrics.criticalEvents > 0, "critical scenario should produce critical events");

const risk = createScenario("SCENARIO_NORMAL").risk;
assert.equal(evaluateRisk({ timestampMs: 0, pedestrianPresent: true, vehicleApproaching: true, estimatedRisk: 0.9 }, risk).critical, true);
assert.equal(evaluateRisk({ timestampMs: 0, pedestrianPresent: false, vehicleApproaching: true, estimatedRisk: 0.9 }, risk).critical, false);

console.log(JSON.stringify({
  ok: true,
  seed: first.metadata.seed,
  scenario: first.metadata.scenarioId,
  steps: first.metrics.steps,
  criticalEvents: first.metrics.criticalEvents,
  logEntries: first.logs.length,
}, null, 2));
