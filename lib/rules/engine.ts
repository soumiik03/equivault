import type { BearingSpec } from "@/lib/bearings/types";
import { evaluateDimensionRules } from "./dimension-rules";
import { evaluatePerformanceRules } from "./performance-rules";
import { evaluateMaterialRules } from "./material-rules";
import { evaluateStandardsRules } from "./standards-rules";
import type { RuleResult } from "./types";

export function evaluateCompatibility(
  original: BearingSpec,
  replacement: BearingSpec
): RuleResult[] {
  return [
    ...evaluateDimensionRules(original, replacement),
    ...evaluatePerformanceRules(original, replacement),
    ...evaluateMaterialRules(original, replacement),
    ...evaluateStandardsRules(original, replacement),
  ];
}

export type { RuleResult, RuleSeverity, RuleTier, RuleCategory } from "./types";