import type { RuleResult } from "@/lib/rules/types";
import type { ComplianceCheckResult } from "@/lib/compliance/types";
import type { EvidenceDrawerItem } from "./types";
import type { BearingSpec } from "@/lib/bearings/types";

// Maps a rule's field back to its BearingSpec key so we can pull evidence
const RULE_TO_FIELD: Record<string, keyof BearingSpec> = {
  dim_inner_diameter: "innerDiameter",
  dim_outer_diameter: "outerDiameter",
  dim_width: "width",
  perf_dynamic_load: "dynamicLoadRating",
  perf_static_load: "staticLoadRating",
  perf_max_speed: "maximumSpeed",
  perf_temperature: "temperature",
  material_match: "material",
  standards_match: "standards",
};

export function buildEngineeringDrawerItemsWithEvidence(
  engineering: RuleResult[],
  originalSpec: BearingSpec,
  replacementSpec: BearingSpec
): EvidenceDrawerItem[] {
  return engineering.map((r) => {
    const fieldKey = RULE_TO_FIELD[r.ruleId];
    const origField = fieldKey ? (originalSpec[fieldKey] as any) : null;
    const replField = fieldKey ? (replacementSpec[fieldKey] as any) : null;

    return {
      id: r.ruleId,
      category: "engineering" as const,
      label: r.label,
      severity: r.severity,
      documentSide: "both" as const,
      page: origField?.evidence?.page ?? replField?.evidence?.page ?? null,
      supportingText: [
        origField?.evidence?.text ? `Original: ${origField.evidence.text}` : null,
        replField?.evidence?.text ? `Replacement: ${replField.evidence.text}` : null,
      ].filter(Boolean).join(" | ") || null,
      extractedValue: { original: r.originalValue, replacement: r.replacementValue },
    };
  });
}

export function buildComplianceDrawerItems(
  originalChecks: ComplianceCheckResult[],
  replacementChecks: ComplianceCheckResult[]
): EvidenceDrawerItem[] {
  const mapSide = (checks: ComplianceCheckResult[], side: "original" | "replacement") =>
    checks.map((c) => ({
      id: `${side}-${c.checkId}`,
      category: "compliance" as const,
      label: c.label,
      severity: c.status,
      documentSide: side,
      page: c.evidence?.page ?? null,
      supportingText: c.evidence?.text ?? null,
      extractedValue: c.status,
    }));

  return [...mapSide(originalChecks, "original"), ...mapSide(replacementChecks, "replacement")];
}
