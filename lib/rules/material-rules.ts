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

  if (result.status === "match") {
    return [{ ...base, severity: "PASS", reason: `Material matches exactly: ${origVal}.`, originalValue: origVal, replacementValue: replVal }];
  }
  if (result.status === "approved_equivalent") {
    const prov = result.provenance;
    let reason = `Approved equivalence: ${origVal} ↔ ${replVal}. Source: ${prov.source}.`;
    if (prov.note) {
      reason += ` Note: ${prov.note}`;
    }
    return [{ ...base, severity: "PASS", reason, originalValue: origVal, replacementValue: replVal }];
  }
  return [{
    ...base,
    severity: "UNVERIFIED",
    reason: `Equivalence has not been established and requires engineering verification: ${origVal} → ${replVal}.`,
    originalValue: origVal,
    replacementValue: replVal,
  }];
}