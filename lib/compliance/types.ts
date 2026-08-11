import type { Evidence } from "@/lib/evidence/types";

export type ComplianceStatus = "PRESENT" | "MISSING" | "UNVERIFIED" | "NOT_APPLICABLE";

export interface ComplianceCheckResult {
  checkId: string;
  label: string;
  status: ComplianceStatus;
  reason: string;
  evidence: Evidence | null;
}

export interface ComparisonComplianceResult {
  original: ComplianceCheckResult[];
  replacement: ComplianceCheckResult[];
}
