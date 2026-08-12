import type { RuleResult } from "@/lib/rules/types";
import type { CriticalReason } from "./types";

const CATEGORY_PRIORITY: Record<string, number> = {
  dimension: 0,
  performance: 1,
  material: 2,
  standards: 3,
};

export function selectCriticalReason(engineering: RuleResult[]): CriticalReason | null {
  const gateResults = engineering.filter((r) => r.tier === "gate");

  const hardFails = gateResults
    .filter((r) => r.severity === "HARD_FAIL")
    .sort((a, b) => CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category]);

  if (hardFails.length > 0) {
    const top = hardFails[0];
    return {
      source: "engineering",
      ruleId: top.ruleId,
      label: top.label,
      severity: "HARD_FAIL",
      reason: top.reason,
    };
  }

  const unverifiedGates = gateResults
    .filter((r) => r.severity === "UNVERIFIED")
    .sort((a, b) => CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category]);

  if (unverifiedGates.length > 0) {
    const top = unverifiedGates[0];
    return {
      source: "engineering",
      ruleId: top.ruleId,
      label: top.label,
      severity: "UNVERIFIED",
      reason: top.reason,
    };
  }

  return null;
}
