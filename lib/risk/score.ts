import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";
import { WEIGHTS, WARNING_PENALTY } from "./config";
import type { RiskScore, ScoreBreakdown } from "./types";

type WeightedStatus = "PASS" | "WARNING" | "UNVERIFIED";

function scoreRule(
   category: "material" | "standards" | "compliance",
  status: WeightedStatus
): ScoreBreakdown {
  const weight = WEIGHTS[category];

  if (status === "UNVERIFIED") {
    return {
      category,
      weight,
      status,
      contribution: 0,
      excludedFromDenominator: true,
    };
  }

  return {
    category,
    weight,
    status,
    contribution:
      status === "WARNING"
        ? weight - WARNING_PENALTY
        : weight,
    excludedFromDenominator: false,
  };
}

export function calculateRiskScore(
  engineering: RuleResult[],
  compliance: ComparisonComplianceResult
): RiskScore {
  const breakdown: ScoreBreakdown[] = [];

  const material = engineering.find(
    (rule) => rule.category === "material"
  );

  const standards = engineering.find(
    (rule) => rule.category === "standards"
  );

  if (material) {
    breakdown.push(
      scoreRule(
        "material",
        material.severity === "PASS"
          ? "PASS"
          : material.severity === "WARNING"
            ? "WARNING"
            : "UNVERIFIED"
      )
    );
  }

  if (standards) {
    breakdown.push(
      scoreRule(
        "standards",
        standards.severity === "PASS"
          ? "PASS"
          : standards.severity === "WARNING"
            ? "WARNING"
            : "UNVERIFIED"
      )
    );
  }

  const replacementCompliance = compliance.replacement;

  const complianceStatuses = replacementCompliance.map((check) => {
    if (check.status === "PRESENT" || check.status === "NOT_APPLICABLE") {
      return "PASS" as const;
    }

    if (check.status === "MISSING") {
      return "WARNING" as const;
    }

    return "UNVERIFIED" as const;
  });

  const complianceStatus: WeightedStatus =
    complianceStatuses.length === 0
      ? "UNVERIFIED"
      : complianceStatuses.includes("UNVERIFIED")
        ? "UNVERIFIED"
        : complianceStatuses.includes("WARNING")
          ? "WARNING"
          : "PASS";

  breakdown.push(scoreRule("compliance", complianceStatus));

  const applicableWeight = breakdown
    .filter((item) => !item.excludedFromDenominator)
    .reduce((sum, item) => sum + item.weight, 0);

  const earnedWeight = breakdown.reduce(
    (sum, item) => sum + item.contribution,
    0
  );

  const score =
    applicableWeight === 0
      ? null
      : Math.round((earnedWeight / applicableWeight) * 100);

  return {
    score,
    earnedWeight,
    applicableWeight,
    breakdown,
  };
}