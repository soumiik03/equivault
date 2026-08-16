export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type RiskConsequence =
  | "NO_ACTION"
  | "REVIEW_REQUIRED"
  | "DOCUMENTATION_REQUIRED";

export interface ComplianceRiskResult {
  checkId: string;
  label: string;

  status:
    | "PRESENT"
    | "MISSING"
    | "UNVERIFIED"
    | "NOT_APPLICABLE";

  risk: RiskLevel;
  consequence: RiskConsequence;
  reason: string;
  recommendedAction: string;
}

export interface OverallComplianceRisk {
  risk: RiskLevel;
  verdict: "ACCEPTABLE" | "REVIEW_REQUIRED" | "BLOCKED";
  reason: string;
  checks: ComplianceRiskResult[];
}
export interface ScoreBreakdown {
  category: "material" | "standards" | "compliance" | "secondary";
  weight: number;
  status: "PASS" | "WARNING" | "UNVERIFIED";
  contribution: number;
  excludedFromDenominator: boolean;
}

export interface RiskScore {
  score: number | null;
  earnedWeight: number;
  applicableWeight: number;
  breakdown: ScoreBreakdown[];
}