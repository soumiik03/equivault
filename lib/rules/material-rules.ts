import type { BearingSpec } from "@/lib/bearings/types";
import type { RuleResult } from "./types";
import { areMaterialsEquivalent } from "./equivalence-tables";

export function evaluateMaterialRules(
  original: BearingSpec,
  replacement: BearingSpec
): RuleResult[] {
  const base = {
    ruleId: "material_match",
    label: "Material",
    tier: "weighted" as const,
    category: "material" as const,
  };

  const origVal = original.material.value;
  const replVal = replacement.material.value;

  if (origVal == null || replVal == null) {
    return [{
      ...base,
      severity: "UNVERIFIED",
      reason: `Material missing on ${origVal == null ? "original" : "replacement"} document.`,
      originalValue: origVal,
      replacementValue: replVal,
    }];
  }

  const result = areMaterialsEquivalent(origVal, replVal);

  if (result === "match") {
    return [{ ...base, severity: "PASS", reason: `Material matches exactly: ${origVal}.`, originalValue: origVal, replacementValue: replVal }];
  }
  if (result === "provisional_equivalent") {
    return [{ ...base, severity: "WARNING", reason: `Materials have a provisional equivalence: ${origVal} ↔ ${replVal}. Awaiting authoritative provenance (Ch 6).`, originalValue: origVal, replacementValue: replVal }];
  }
  return [{
    ...base,
    severity: "WARNING",
    reason: `Materials differ and no approved equivalence is on record: ${origVal} → ${replVal}. Needs engineer review.`,
    originalValue: origVal,
    replacementValue: replVal,
  }];
}