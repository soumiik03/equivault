import React from "react";
import { FileText, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import type { ValidatedBearingSpec } from "@/lib/validation/bearing-spec-schema";
import type { RuleResult } from "@/lib/rules/types";

interface SideBySideSpecsProps {
  originalSpec?: ValidatedBearingSpec;
  replacementSpec?: ValidatedBearingSpec;
  engineeringRules?: RuleResult[];
  onOpenEvidence?: (key: keyof ValidatedBearingSpec, label: string, unit?: string) => void;
}

interface SpecGroup {
  categoryName: string;
  fields: {
    key: keyof ValidatedBearingSpec;
    label: string;
    unit?: string;
  }[];
}

const SPEC_GROUPS: SpecGroup[] = [
  {
    categoryName: "Identification & General",
    fields: [
      { key: "partNumber", label: "Part Number" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "bearingType", label: "Bearing Type" },
    ],
  },
  {
    categoryName: "Mechanical & Dimensions",
    fields: [
      { key: "innerDiameter", label: "Inner Diameter", unit: "mm" },
      { key: "outerDiameter", label: "Outer Diameter", unit: "mm" },
      { key: "width", label: "Width", unit: "mm" },
      { key: "clearance", label: "Clearance" },
      { key: "sealType", label: "Seal Type" },
    ],
  },
  {
    categoryName: "Performance & Thermal Ratings",
    fields: [
      { key: "dynamicLoadRating", label: "Dynamic Load Rating", unit: "kN" },
      { key: "staticLoadRating", label: "Static Load Rating", unit: "kN" },
      { key: "maximumSpeed", label: "Maximum Speed", unit: "RPM" },
      { key: "temperature", label: "Operating Temp Range", unit: "°C" },
    ],
  },
  {
    categoryName: "Materials & Certifications",
    fields: [
      { key: "material", label: "Material" },
      { key: "standards", label: "Standards" },
      { key: "certifications", label: "Certifications" },
    ],
  },
];

export function SideBySideSpecs({
  originalSpec,
  replacementSpec,
  engineeringRules = [],
  onOpenEvidence,
}: SideBySideSpecsProps) {
  // Helper to stringify value
  const renderVal = (val: unknown) => {
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) return val.length ? val.join(", ") : null;
    return String(val);
  };

  // Helper to match rule status from rule engine results
  const getFieldRule = (fieldKey: string, fieldLabel: string): RuleResult | undefined => {
    return engineeringRules.find(
      (r) =>
        r.ruleId.toLowerCase().includes(fieldKey.toLowerCase()) ||
        r.label.toLowerCase().includes(fieldLabel.toLowerCase())
    );
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm shadow-md overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
            Side-by-Side Specifications Matrix
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Extracted specification attributes compared between Original (Part A) and Replacement (Part B)
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-sm border border-zinc-700/60">
          Strict Rule Evaluation
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
            <tr>
              <th className="px-4 py-3 font-semibold w-1/3">Attribute</th>
              <th className="px-4 py-3 font-semibold w-1/4">Part A (Original)</th>
              <th className="px-4 py-3 font-semibold w-1/4">Part B (Replacement)</th>
              <th className="px-4 py-3 font-semibold w-1/6 text-right">Rule Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60">
            {SPEC_GROUPS.map((group) => (
              <React.Fragment key={group.categoryName}>
                {/* Category Header Row */}
                <tr className="bg-zinc-900/80 border-y border-zinc-800">
                  <td
                    colSpan={4}
                    className="px-4 py-2 font-sans font-bold text-zinc-300 text-xs uppercase tracking-wider"
                  >
                    {group.categoryName}
                  </td>
                </tr>

                {group.fields.map(({ key, label, unit }) => {
                  const origObj = originalSpec ? originalSpec[key] : null;
                  const replObj = replacementSpec ? replacementSpec[key] : null;

                  const origVal = renderVal(origObj?.value);
                  const replVal = renderVal(replObj?.value);

                  const rule = getFieldRule(key, label);
                  const severity = rule?.severity;

                  const isMismatch =
                    origVal !== null &&
                    replVal !== null &&
                    origVal.toLowerCase() !== replVal.toLowerCase();

                  // Rule Status Badge styling based on rule engine output
                  const statusBadge =
                    severity === "HARD_FAIL" ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-pink-400 bg-pink-950/80 px-2 py-0.5 border border-pink-700/60 rounded-sm">
                        <XCircle className="h-3 w-3 shrink-0" /> HARD FAIL
                      </span>
                    ) : severity === "WARNING" ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 bg-amber-950/80 px-2 py-0.5 border border-amber-700/60 rounded-sm">
                        <AlertTriangle className="h-3 w-3 shrink-0" /> WARNING
                      </span>
                    ) : severity === "UNVERIFIED" || (origVal === null && replVal === null) ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-700/60 rounded-sm">
                        <HelpCircle className="h-3 w-3 shrink-0 text-zinc-500" /> UNVERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-700/60 rounded-sm">
                        <CheckCircle2 className="h-3 w-3 shrink-0" /> PASS
                      </span>
                    );

                  return (
                    <tr
                      key={key}
                      className="hover:bg-zinc-900/40 transition-colors font-sans"
                    >
                      {/* Attribute Name & Evidence Button */}
                      <td className="px-4 py-3 font-medium text-zinc-200">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            {label}
                            {unit && <span className="text-zinc-500 font-mono text-[10px]">({unit})</span>}
                          </span>
                          {onOpenEvidence && (origObj?.evidence || replObj?.evidence) && (
                            <button
                              type="button"
                              onClick={() => onOpenEvidence(key, label, unit)}
                              className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                              title={`View Evidence for ${label}`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Original Part Value */}
                      <td className="px-4 py-3 font-mono">
                        {origVal !== null ? (
                          <span className="text-zinc-100">{origVal} {unit && origVal !== "Not specified" ? unit : ""}</span>
                        ) : (
                          <span className="text-zinc-500 italic text-[11px]">Unspecified</span>
                        )}
                      </td>

                      {/* Replacement Part Value (Inline Diff Styling for Mismatch) */}
                      <td className="px-4 py-3 font-mono">
                        {replVal !== null ? (
                          <span
                            className={
                              isMismatch
                                ? severity === "HARD_FAIL"
                                  ? "text-pink-400 font-bold bg-pink-950/40 px-1 py-0.5 rounded-sm"
                                  : "text-amber-400 font-bold bg-amber-950/40 px-1 py-0.5 rounded-sm"
                                : "text-zinc-100"
                            }
                          >
                            {replVal} {unit && replVal !== "Not specified" ? unit : ""}
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic text-[11px]">Unspecified</span>
                        )}
                      </td>

                      {/* Rule Engine Status Indicator */}
                      <td className="px-4 py-3 text-right">{statusBadge}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
