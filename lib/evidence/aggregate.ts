import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";
import type { AggregatedResults } from "./types";

export function aggregateResults(
  engineering: RuleResult[],
  compliance: ComparisonComplianceResult
): AggregatedResults {
  return {
    engineering,
    compliance: {
      original: compliance.original,
      replacement: compliance.replacement,
    },
  };
}
