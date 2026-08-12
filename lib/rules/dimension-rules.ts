import type { BearingSpec } from "@/lib/bearings/types";
import type { RuleResult } from "./types";

const FLOAT_EPSILON = 0.01;

function compareExactDimension(
  ruleId: string,
  label: string,
  original: { value: number | null },
  replacement: { value: number | null }
): RuleResult {
  const base = { ruleId, label, tier: "gate" as const, category: "dimension" as const };

  if (original.value == null || replacement.value == null) {
    return {
      ...base,
      severity: "UNVERIFIED",
      reason: `${label} missing on ${original.value == null ? "original" : "replacement"} — cannot confirm physical fit.`,
      originalValue: original.value,
      replacementValue: replacement.value,
    };
  }

  const diff = Math.abs(original.value - replacement.value);
  if (diff <= FLOAT_EPSILON) {
    return {
      ...base,
      severity: "PASS",
      reason: `${label} matches: ${original.value}mm → ${replacement.value}mm.`,
      originalValue: original.value,
      replacementValue: replacement.value,
    };
  }

  return {
    ...base,
    severity: "HARD_FAIL",
    reason: `${label} mismatch: ${original.value}mm → ${replacement.value}mm. Physical dimensions must match for a bearing swap.`,
    originalValue: original.value,
    replacementValue: replacement.value,
  };
}

export function evaluateDimensionRules(
  original: BearingSpec,
  replacement: BearingSpec
): RuleResult[] {
  return [
    compareExactDimension("dim_inner_diameter", "Inner Diameter", original.innerDiameter, replacement.innerDiameter),
    compareExactDimension("dim_outer_diameter", "Outer Diameter", original.outerDiameter, replacement.outerDiameter),
    compareExactDimension("dim_width", "Width", original.width, replacement.width),
  ];
}