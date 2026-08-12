import type { BearingSpec } from "@/lib/bearings/types";
import type { RuleResult } from "./types";
import { areStandardsEquivalent } from "./equivalence-tables";

export function evaluateStandardsRules(
  original: BearingSpec,
  replacement: BearingSpec
): RuleResult[] {
  const base = {
    ruleId: "standards_match",
    label: "Standards",
    tier: "weighted" as const,
    category: "standards" as const,
  };

  const origList = original.standards.value;
  const replList = replacement.standards.value;

  if (!origList || !replList || origList.length === 0 || replList.length === 0) {
    return [{
      ...base,
      severity: "UNVERIFIED",
      reason: "Standards not documented on one or both parts.",
      originalValue: origList,
      replacementValue: replList,
    }];
  }

  let matchFound = false;
  let approvedEquivalenceFound = false;
  let matchReason = "";

  for (const o of origList) {
    for (const r of replList) {
      const result = areStandardsEquivalent(o, r);
      if (result.status === "match") {
        matchFound = true;
        matchReason = `At least one standard matches exactly: ${o}.`;
        break;
      } else if (result.status === "approved_equivalent") {
        approvedEquivalenceFound = true;
        const prov = result.provenance;
        matchReason = `Approved equivalence: ${o} ↔ ${r}. Source: ${prov.source}.`;
        if (prov.note) {
          matchReason += ` Note: ${prov.note}`;
        }
        break;
      }
    }
    if (matchFound || approvedEquivalenceFound) break;
  }

  if (matchFound || approvedEquivalenceFound) {
    return [{
      ...base,
      severity: "PASS",
      reason: matchReason,
      originalValue: origList,
      replacementValue: replList,
    }];
  }

  return [{
    ...base,
    severity: "UNVERIFIED",
    reason: `Equivalence has not been established and requires engineering verification: ${origList.join(", ")} vs ${replList.join(", ")}.`,
    originalValue: origList,
    replacementValue: replList,
  }];
}