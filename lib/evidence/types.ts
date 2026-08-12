import type { RuleResult } from "@/lib/rules/types";
import type { ComplianceCheckResult } from "@/lib/compliance/types";

export type Evidence = {
  documentId: string;
  page: number | null;
  text: string;
};

export interface AggregatedResults {
  engineering: RuleResult[];
  compliance: {
    original: ComplianceCheckResult[];
    replacement: ComplianceCheckResult[];
  };
}

export interface CriticalReason {
  source: "engineering"; // compliance never drives the "critical reason" — 7.7 keeps them separate
  ruleId: string;
  label: string;
  severity: "HARD_FAIL" | "UNVERIFIED";
  reason: string;
}

export interface EvidenceDrawerItem {
  id: string;              // ruleId or complianceCheckId, for frontend lookup
  category: "engineering" | "compliance";
  label: string;
  severity: string;
  documentSide: "original" | "replacement" | "both";
  page: number | null;
  supportingText: string | null;
  extractedValue: unknown;
}

export interface EvidenceReport {
  criticalReason: CriticalReason | null;
  explanation: string;          // LLM-generated readable summary
  drawerItems: EvidenceDrawerItem[];
  generatedAt: string;
}
