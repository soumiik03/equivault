import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { evaluateCompatibility } from "@/lib/rules/engine";
import type { BearingSpec } from "@/lib/bearings/types";
import rawFixture6000 from "./fixtures/bearings/6000.json";
import rawFixture6208 from "./fixtures/bearings/6208.json";

// We know the fixtures conform to BearingSpec based on validate-fixtures
const fixture6000 = rawFixture6000 as BearingSpec;
const fixture6208 = rawFixture6208 as BearingSpec;

describe("compatibility rule engine", () => {
  it("1. identical bearing -> PASS", () => {
    const fullBearing: BearingSpec = {
      ...fixture6000,
      dynamicLoadRating: { value: 10, evidence: null },
      staticLoadRating: { value: 5, evidence: null },
      maximumSpeed: { value: 10000, evidence: null },
      temperature: { value: 120, evidence: null },
      material: { value: "Chrome Steel", evidence: null },
      standards: { value: ["ISO 15"], evidence: null }
    };
    const results = evaluateCompatibility(fullBearing, fullBearing);
    const gateResults = results.filter((r) => r.tier === "gate");
    assert.ok(gateResults.every((r) => r.severity === "PASS"), "All gate rules should pass");
  });

  it("2. inner diameter mismatch -> HARD_FAIL", () => {
    const results = evaluateCompatibility(fixture6000, fixture6208);
    const result = results.find((r) => r.ruleId === "dim_inner_diameter");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("3. outer diameter mismatch -> HARD_FAIL", () => {
    const results = evaluateCompatibility(fixture6000, fixture6208);
    const result = results.find((r) => r.ruleId === "dim_outer_diameter");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("4. width mismatch -> HARD_FAIL", () => {
    const results = evaluateCompatibility(fixture6000, fixture6208);
    const result = results.find((r) => r.ruleId === "dim_width");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("5. missing critical dimension -> UNVERIFIED", () => {
    const replacement: BearingSpec = { ...fixture6000, innerDiameter: { value: null, evidence: null } };
    const results = evaluateCompatibility(fixture6000, replacement);
    const result = results.find((r) => r.ruleId === "dim_inner_diameter");
    assert.equal(result?.severity, "UNVERIFIED");
  });

  it("6. lower dynamic load -> HARD_FAIL", () => {
    const original: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 10, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 9, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_dynamic_load");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("7. lower static load -> HARD_FAIL", () => {
    const original: BearingSpec = { ...fixture6000, staticLoadRating: { value: 10, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, staticLoadRating: { value: 9, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_static_load");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("8. lower maximum speed -> HARD_FAIL", () => {
    const original: BearingSpec = { ...fixture6000, maximumSpeed: { value: 10000, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, maximumSpeed: { value: 9000, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_max_speed");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("9. lower temperature -> HARD_FAIL", () => {
    const original: BearingSpec = { ...fixture6000, temperature: { value: 120, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, temperature: { value: 90, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_temperature");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("10. missing performance data -> UNVERIFIED", () => {
    const original: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 10, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: null, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_dynamic_load");
    assert.equal(result?.severity, "UNVERIFIED");
  });

  it("11. identical material -> PASS", () => {
    const original: BearingSpec = { ...fixture6000, material: { value: "Chrome Steel", evidence: null } };
    const results = evaluateCompatibility(original, original);
    const result = results.find((r) => r.ruleId === "material_match");
    assert.equal(result?.severity, "PASS");
  });

  it("12. approved/known material equivalence -> according to authoritative status (WARNING for provisional)", () => {
    const original: BearingSpec = { ...fixture6000, material: { value: "Chrome Steel", evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, material: { value: "AISI 52100", evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "material_match");
    assert.equal(result?.severity, "WARNING");
  });

  it("13. different material -> WARNING", () => {
    const original: BearingSpec = { ...fixture6000, material: { value: "Chrome Steel", evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, material: { value: "Ceramic", evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "material_match");
    assert.equal(result?.severity, "WARNING");
  });

  it("14. missing material -> UNVERIFIED", () => {
    const original: BearingSpec = { ...fixture6000, material: { value: "Chrome Steel", evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, material: { value: null, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "material_match");
    assert.equal(result?.severity, "UNVERIFIED");
  });

  it("15. matching standards -> PASS", () => {
    const original: BearingSpec = { ...fixture6000, standards: { value: ["ISO 15"], evidence: null } };
    const results = evaluateCompatibility(original, original);
    const result = results.find((r) => r.ruleId === "standards_match");
    assert.equal(result?.severity, "PASS");
  });

  it("16. known standards equivalence -> according to authoritative status (WARNING for provisional)", () => {
    const original: BearingSpec = { ...fixture6000, standards: { value: ["ISO 15"], evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, standards: { value: ["DIN 625"], evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "standards_match");
    assert.equal(result?.severity, "WARNING");
  });

  it("17. different standards -> WARNING", () => {
    const original: BearingSpec = { ...fixture6000, standards: { value: ["ISO 15"], evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, standards: { value: ["ANSI"], evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "standards_match");
    assert.equal(result?.severity, "WARNING");
  });

  it("18. missing standards -> UNVERIFIED", () => {
    const original: BearingSpec = { ...fixture6000, standards: { value: ["ISO 15"], evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, standards: { value: [], evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "standards_match");
    assert.equal(result?.severity, "UNVERIFIED");
  });

  it("19. RuleResult contains a useful explanation", () => {
    const original: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 10, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 9, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_dynamic_load");
    assert.ok(result?.reason.includes("below original requirement"));
  });

  it("20. correct severity", () => {
    const original: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 10, evidence: null } };
    const replacement: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 9, evidence: null } };
    const results = evaluateCompatibility(original, replacement);
    const result = results.find((r) => r.ruleId === "perf_dynamic_load");
    assert.equal(result?.severity, "HARD_FAIL");
  });

  it("21. correct gate/weighted tier", () => {
    const original: BearingSpec = { ...fixture6000, dynamicLoadRating: { value: 10, evidence: null } };
    const results = evaluateCompatibility(original, original);
    const perfResult = results.find((r) => r.ruleId === "perf_dynamic_load");
    const matResult = results.find((r) => r.ruleId === "material_match");
    assert.equal(perfResult?.tier, "gate");
    assert.equal(matResult?.tier, "weighted");
  });

  it("22. engine aggregates all rule categories", () => {
    const results = evaluateCompatibility(fixture6000, fixture6000);
    const categories = new Set(results.map(r => r.category));
    assert.ok(categories.has("dimension"));
    assert.ok(categories.has("performance"));
    assert.ok(categories.has("material"));
    assert.ok(categories.has("standards"));
  });
});