import React, { useState } from "react";
import { HelpCircle, Copy, Check, Send, AlertTriangle } from "lucide-react";
import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";

interface MissingDataSectionProps {
  unverifiedRules?: RuleResult[];
  weightedIssues?: RuleResult[];
  compliance?: ComparisonComplianceResult;
}

export function MissingDataSection({
  unverifiedRules = [],
  weightedIssues = [],
  compliance,
}: MissingDataSectionProps) {
  const [copied, setCopied] = useState(false);

  // Collect all missing/unverified items
  const missingItems: { label: string; reason: string; source: string }[] = [];

  unverifiedRules.forEach((rule) => {
    missingItems.push({
      label: rule.label,
      reason: rule.reason || "Mandatory engineering constraint verification requires supplier datasheet data.",
      source: "Engineering Gate Requirement",
    });
  });

  weightedIssues.forEach((rule) => {
    missingItems.push({
      label: rule.label,
      reason: rule.reason || "Weighted risk evaluation score component unverified.",
      source: "Engineering Weighted Metric",
    });
  });

  if (compliance) {
    [...compliance.original, ...compliance.replacement].forEach((check) => {
      if (check.status === "MISSING" || check.status === "UNVERIFIED") {
        missingItems.push({
          label: check.label,
          reason: check.reason || "Compliance documentation / certificate missing from supplier datasheet.",
          source: "Regulatory / Quality Compliance",
        });
      }
    });
  }

  // Deduplicate by label
  const uniqueMissing = Array.from(
    new Map(missingItems.map((item) => [item.label, item])).values()
  );

  // Hidden entirely if no missing items exist
  if (uniqueMissing.length === 0) {
    return null;
  }

  const handleCopyRequest = () => {
    const text = [
      "EQUIVAULT SUPPLIER DATA REQUEST",
      "----------------------------------------",
      "The following technical specifications and compliance documents are required to complete compatibility verification:\n",
      ...uniqueMissing.map(
        (item, i) => `${i + 1}. ${item.label} (${item.source}):\n   Reason: ${item.reason}`
      ),
      "\nPlease provide updated datasheets or technical certificates.",
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-4 sm:p-5 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-900 border border-zinc-700/80 rounded-sm">
            <HelpCircle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Missing Data — Needed From Supplier
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Unverified attributes requiring official supplier clarification or datasheet update
            </p>
          </div>
        </div>

        {/* Actionable Copy Request Affordance */}
        <button
          type="button"
          onClick={handleCopyRequest}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-sans bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-sm transition-colors shadow-sm shrink-0 self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Request Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-amber-400" />
              <span>Copy Supplier Request</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {uniqueMissing.map((item) => (
          <div
            key={item.label}
            className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-sans uppercase">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.2 rounded-sm border border-zinc-700/60">
                  {item.source}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">{item.reason}</p>
            </div>

            <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-950/80 px-2.5 py-1 border border-amber-700/60 rounded-sm shrink-0 self-start sm:self-auto uppercase">
              Action Required
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
