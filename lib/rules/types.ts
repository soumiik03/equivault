export type RuleSeverity = "PASS" | "WARNING" | "HARD_FAIL" | "UNVERIFIED";

export type RuleTier = "gate" | "weighted";

export type RuleCategory =
  | "dimension"
  | "performance"
  | "material"
  | "standards";

export interface RuleResult {
  ruleId: string;
  label: string;
  tier: RuleTier;
  category: RuleCategory;
  severity: RuleSeverity;
  reason: string;
  originalValue: unknown;
  replacementValue: unknown;
}