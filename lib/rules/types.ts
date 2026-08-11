export type RuleSeverity = "PASS" | "WARNING" | "HARD_FAIL" | "UNVERIFIED";

// Gate rules can force UNSAFE outright (Ch 9). Weighted rules feed the score.
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
  reason: string; // 5.7 — human-readable, always present
  originalValue: unknown;
  replacementValue: unknown;
}