import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { selectCriticalReason } from "@/lib/evidence/critical-reason";
import type { RuleResult, RuleTier, RuleCategory, RuleSeverity } from "@/lib/rules/types";

function rule(overrides: Partial<RuleResult>): RuleResult {
  return {
    ruleId: "test", 
    label: "Test", 
    tier: "gate" as RuleTier, 
    category: "dimension" as RuleCategory,
    severity: "PASS" as RuleSeverity, 
    reason: "ok", 
    originalValue: 1, 
    replacementValue: 1,
    ...overrides,
  };
}

describe("critical reason selection (Ch 8.3)", () => {
  it("prioritizes dimension HARD_FAIL over performance HARD_FAIL", () => {
    const results = [
      rule({ ruleId: "perf_temperature", category: "performance", severity: "HARD_FAIL" }),
      rule({ ruleId: "dim_inner_diameter", category: "dimension", severity: "HARD_FAIL" }),
    ];
    assert.equal(selectCriticalReason(results)?.ruleId, "dim_inner_diameter");
  });

  it("falls back to UNVERIFIED gate rule when no HARD_FAIL exists", () => {
    const results = [
      rule({ ruleId: "material_match", tier: "weighted", severity: "UNVERIFIED" }),
      rule({ ruleId: "perf_max_speed", tier: "gate", severity: "UNVERIFIED" }),
    ];
    assert.equal(selectCriticalReason(results)?.ruleId, "perf_max_speed");
  });

  it("returns null when everything passes", () => {
    const results = [rule({}), rule({ ruleId: "b" })];
    assert.equal(selectCriticalReason(results), null);
  });

  it("never selects a weighted-tier rule as the critical reason", () => {
    const results = [
      rule({ ruleId: "material_match", tier: "weighted", severity: "UNVERIFIED" }),
    ];
    assert.equal(selectCriticalReason(results), null);
  });
});
