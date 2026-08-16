import type {
  ComplianceCheckResult,
  ComparisonComplianceResult,
} from "@/lib/compliance/types";

import type {
  ComplianceRiskResult,
  OverallComplianceRisk,
  RiskLevel,
  RiskConsequence,
} from "./types";

function evaluateComplianceCheck(
  check: ComplianceCheckResult
): ComplianceRiskResult {
  let risk: RiskLevel;
  let consequence: RiskConsequence;
  let recommendedAction: string;

  switch (check.status) {
    case "PRESENT":
      risk = "LOW";
      consequence = "NO_ACTION";
      recommendedAction =
        "No additional compliance action is required based on this document.";
      break;

    case "NOT_APPLICABLE":
      risk = "LOW";
      consequence = "NO_ACTION";
      recommendedAction =
        "No action is required because the document indicates this requirement is not applicable.";
      break;

    case "UNVERIFIED":
      risk = "MEDIUM";
      consequence = "REVIEW_REQUIRED";
      recommendedAction =
        "Obtain supporting documentation or perform human verification before final approval.";
      break;

    case "MISSING":
      risk = "HIGH";
      consequence = "DOCUMENTATION_REQUIRED";
      recommendedAction =
        "Obtain the missing compliance documentation before treating the part as compliant.";
      break;
  }

  return {
    checkId: check.checkId,
    label: check.label,
    status: check.status,
    risk,
    consequence,
    reason: check.reason,
    recommendedAction,
  };
}

function getOverallRisk(
  checks: ComplianceRiskResult[]
): OverallComplianceRisk {
  if (checks.some((check) => check.risk === "HIGH")) {
    return {
      risk: "HIGH",
      verdict: "BLOCKED",
      reason:
        "Required compliance information is missing. The replacement should not be treated as compliance-verified until the missing documentation is obtained.",
      checks,
    };
  }

  if (checks.some((check) => check.risk === "MEDIUM")) {
    return {
      risk: "MEDIUM",
      verdict: "REVIEW_REQUIRED",
      reason:
        "One or more compliance requirements could not be verified from the supplied documentation.",
      checks,
    };
  }

  return {
    risk: "LOW",
    verdict: "ACCEPTABLE",
    reason:
      "All evaluated compliance requirements are either supported by evidence or explicitly not applicable.",
    checks,
  };
}

export function evaluateComplianceRisk(
  result: ComparisonComplianceResult
) {
  const original = result.original.map(evaluateComplianceCheck);
  const replacement = result.replacement.map(evaluateComplianceCheck);

  return {
    original: getOverallRisk(original),
    replacement: getOverallRisk(replacement),
  };
}