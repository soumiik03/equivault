import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { evaluateCompliance, compareCompliance } from "@/lib/compliance/engine";
import type { BearingSpec } from "@/lib/bearings/types";
import type { Evidence } from "@/lib/evidence/types";
import rawFixture6000 from "./fixtures/bearings/6000.json";

const fixture6000 = rawFixture6000 as BearingSpec;

const mockEvidence: Evidence = {
  documentId: "test-doc-id",
  page: 2,
  text: "Meets RoHS and CE standards.",
};

describe("compliance engine", () => {
  it("1. RoHS explicit evidence -> PRESENT", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["RoHS Compliant"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const rohs = results.find((r) => r.checkId === "comp_rohs");
    assert.equal(rohs?.status, "PRESENT");
    assert.deepEqual(rohs?.evidence, mockEvidence);
  });

  it("2. RoHS absent with sufficient context (exempt) -> NOT_APPLICABLE", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["RoHS exempt"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const rohs = results.find((r) => r.checkId === "comp_rohs");
    assert.equal(rohs?.status, "NOT_APPLICABLE");
  });

  it("3. RoHS insufficient information -> UNVERIFIED", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["ISO 9001"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const rohs = results.find((r) => r.checkId === "comp_rohs");
    assert.equal(rohs?.status, "UNVERIFIED");
  });

  it("4. REACH explicit evidence -> PRESENT", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["REACH compliant"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const reach = results.find((r) => r.checkId === "comp_reach");
    assert.equal(reach?.status, "PRESENT");
  });

  it("5. REACH/SVHC evidence detection", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["No SVHC"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const reach = results.find((r) => r.checkId === "comp_reach");
    assert.equal(reach?.status, "PRESENT");
  });

  it("6. REACH insufficient information -> UNVERIFIED", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: [], evidence: null },
    };
    const results = evaluateCompliance(spec);
    const reach = results.find((r) => r.checkId === "comp_reach");
    assert.equal(reach?.status, "UNVERIFIED");
  });

  it("7. CE explicit evidence -> PRESENT", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["CE marked"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const ce = results.find((r) => r.checkId === "comp_ce");
    assert.equal(ce?.status, "PRESENT");
  });

  it("8. CE clearly not applicable -> NOT_APPLICABLE", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["CE exempt"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const ce = results.find((r) => r.checkId === "comp_ce");
    assert.equal(ce?.status, "NOT_APPLICABLE");
  });

  it("9. CE applicability unknown -> UNVERIFIED", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["Some other cert"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const ce = results.find((r) => r.checkId === "comp_ce");
    assert.equal(ce?.status, "UNVERIFIED");
  });

  it("10. absence of CE must never automatically become a compliance failure", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: [], evidence: null },
    };
    const results = evaluateCompliance(spec);
    const ce = results.find((r) => r.checkId === "comp_ce");
    assert.notEqual(ce?.status, "MISSING");
    assert.equal(ce?.status, "UNVERIFIED");
  });

  it("11. evidence is preserved", () => {
    const spec: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["RoHS"], evidence: mockEvidence },
    };
    const results = evaluateCompliance(spec);
    const rohs = results.find((r) => r.checkId === "comp_rohs");
    assert.equal(rohs?.evidence?.text, "Meets RoHS and CE standards.");
  });

  it("12. compliance results remain separate from RuleResult[]", () => {
    // This is essentially asserted by the fact we import evaluateCompliance from compliance/engine, 
    // which returns ComplianceCheckResult[] and NOT RuleResult[].
    const spec: BearingSpec = { ...fixture6000 };
    const results = evaluateCompliance(spec);
    assert.ok(!("tier" in results[0])); // tier exists on RuleResult, not ComplianceCheckResult
  });

  it("13. original and replacement produce separate compliance results", () => {
    const original: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["RoHS"], evidence: mockEvidence },
    };
    const replacement: BearingSpec = {
      ...fixture6000,
      certifications: { value: ["CE"], evidence: mockEvidence },
    };
    const comparison = compareCompliance(original, replacement);
    
    assert.equal(comparison.original.find((r) => r.checkId === "comp_rohs")?.status, "PRESENT");
    assert.equal(comparison.original.find((r) => r.checkId === "comp_ce")?.status, "UNVERIFIED");

    assert.equal(comparison.replacement.find((r) => r.checkId === "comp_rohs")?.status, "UNVERIFIED");
    assert.equal(comparison.replacement.find((r) => r.checkId === "comp_ce")?.status, "PRESENT");
  });
});
