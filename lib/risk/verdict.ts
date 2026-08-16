import type { RuleResult } from "@/lib/rules/types";
import type { OverallComplianceRisk } from "./types";
import type { RiskScore } from "./types";
export type FinalVerdict =
  | "COMPATIBLE"
  | "CONDITIONAL"
  | "UNSAFE"
  | "UNVERIFIED";

export type ConsequenceType =
  | "NONE"
  | "ENGINEERING_REVIEW"
  | "COMPLIANCE_REVIEW"
  | "DOCUMENTATION_REQUIRED"
  | "DO_NOT_USE";

export interface Consequence {
  type: ConsequenceType;
  reason: string;
  requiredAction: string;
}

export interface FinalVerdictResult {
  verdict: FinalVerdict;
  reason: string;
  hardFails: RuleResult[];
  unverifiedRules: RuleResult[];
  complianceRisk: "LOW" | "MEDIUM" | "HIGH";
  consequences: Consequence[];
  weightedIssues: RuleResult[];
}

export function evaluateFinalVerdict(
  engineering: RuleResult[],
  complianceRisk: {
    original: OverallComplianceRisk;
    replacement: OverallComplianceRisk;
  },
  riskScore: RiskScore
): FinalVerdictResult {
  const hardFails = engineering.filter(
    (rule) =>
      rule.tier === "gate" &&
      rule.severity === "HARD_FAIL"
  );

  const unverifiedRules = engineering.filter(
  (rule) =>
    rule.tier === "gate" &&
    rule.severity === "UNVERIFIED"
);
    const weightedIssues = engineering.filter(
  (rule) =>
    rule.tier === "weighted" &&
    rule.severity === "UNVERIFIED"
);
  const replacementRisk = complianceRisk.replacement.risk;

  if (hardFails.length > 0) {
    return {
      verdict: "UNSAFE",
      reason:
        "One or more mandatory engineering compatibility requirements failed.",
      hardFails,
      unverifiedRules,
        weightedIssues,
        complianceRisk: replacementRisk,
       consequences: [
        {
          type: "DO_NOT_USE",
          reason: hardFails.map((rule) => rule.reason).join(" "),
          requiredAction:
            "Do not approve or use the replacement until the engineering incompatibility is resolved.",
        },
      ],
    };
  }

  if (unverifiedRules.length > 0) {
    return {
      verdict: "UNVERIFIED",
      reason:
        "One or more required engineering compatibility checks could not be verified.",
      hardFails,
      unverifiedRules,
        weightedIssues,
      complianceRisk: replacementRisk,
        consequences: [
        {
          type: "ENGINEERING_REVIEW",
          reason: unverifiedRules.map((rule) => rule.reason).join(" "),
          requiredAction:
            "Obtain the missing information or perform engineering verification before approval.",
        },
      ],
      
    };
  }

  if (replacementRisk === "HIGH" || replacementRisk === "MEDIUM") {
    return {
      verdict: "CONDITIONAL",
      reason:
        "Engineering compatibility has no identified hard failure, but compliance verification requires further review.",
      hardFails,
      unverifiedRules,
        weightedIssues,
      complianceRisk: replacementRisk,
         consequences: [
        {
          type: "COMPLIANCE_REVIEW",
          reason: complianceRisk.replacement.reason,
          requiredAction:
            "Verify the relevant compliance requirements before final approval.",
        },
      ],
    };
  }

  return {
    verdict: "COMPATIBLE",
    reason:
      "All evaluated engineering compatibility requirements passed and no unresolved compliance risk was identified.",
    hardFails,
    unverifiedRules,
      weightedIssues,
    complianceRisk: replacementRisk,
     consequences: [
      {
        type: "NONE",
        reason: "No blocking or unresolved issue was identified.",
        requiredAction:
          "No additional action is required.",
      },
    ],
  };
}