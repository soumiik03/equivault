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

  const hasMatch = origList.some((o) =>
    replList.some((r) => areStandardsEquivalent(o, r) === "match")
  );

  if (hasMatch) {
    return [{
      ...base,
      severity: "PASS",
      reason: `At least one standard matches exactly.`,
      originalValue: origList,
      replacementValue: replList,
    }];
  }

  const hasProvisional = origList.some((o) =>
    replList.some((r) => areStandardsEquivalent(o, r) === "provisional_equivalent")
  );

  if (hasProvisional) {
    return [{
      ...base,
      severity: "WARNING",
      reason: `Standards have a provisional equivalence. Awaiting authoritative provenance (Ch 6).`,
      originalValue: origList,
      replacementValue: replList,
    }];
  }

  return [{
    ...base,
    severity: "WARNING",
    reason: `No matching or approved-equivalent standards found: ${origList.join(", ")} vs ${replList.join(", ")}.`,
    originalValue: origList,
    replacementValue: replList,
  }];
}