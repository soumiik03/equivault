import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";
import type { BearingSpec } from "@/lib/bearings/types";
import { aggregateResults } from "./aggregate";
import { selectCriticalReason } from "./critical-reason";
import { buildEngineeringDrawerItemsWithEvidence, buildComplianceDrawerItems } from "./drawer";
import { generateExplanation } from "./explain";
import type { EvidenceReport } from "./types";

export async function buildEvidenceReport(
  engineering: RuleResult[],
  compliance: ComparisonComplianceResult,
  originalSpec: BearingSpec,
  replacementSpec: BearingSpec
): Promise<EvidenceReport> {
  const aggregated = aggregateResults(engineering, compliance);
  const criticalReason = selectCriticalReason(engineering);
  const explanation = await generateExplanation(aggregated, criticalReason);

  const drawerItems = [
    ...buildEngineeringDrawerItemsWithEvidence(engineering, originalSpec, replacementSpec),
    ...buildComplianceDrawerItems(compliance.original, compliance.replacement),
  ];

  return {
    criticalReason,
    explanation,
    drawerItems,
    generatedAt: new Date().toISOString(),
  };
}
 