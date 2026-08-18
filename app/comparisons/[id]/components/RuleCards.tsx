import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileText, ChevronDown } from "lucide-react";
import type { RuleResult } from "@/lib/rules/types";
import { WEIGHTS, WARNING_PENALTY } from "@/lib/risk/config";

interface RuleCardsProps {
  rules: RuleResult[];
  onOpenEvidence?: (ruleLabel: string) => void;
}

export function RuleCards({ rules, onOpenEvidence }: RuleCardsProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (ruleId: string) => {
    setExpandedIds((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  // Sort failed and warning rules to the top; passed and unverified below
  const sortedRules = [...rules].sort((a, b) => {
    const priority = { HARD_FAIL: 0, WARNING: 1, UNVERIFIED: 2, PASS: 3 };
    return priority[a.severity] - priority[b.severity];
  });

  const formatVal = (v: unknown) => {
    if (v === null || v === undefined) return "Not specified";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
  };

  // UI presentation wording adjustment for rule reasoning without modifying rule engine
  const formatPresentationReason = (rule: RuleResult): string => {
    const origStr = rule.originalValue !== null && rule.originalValue !== undefined ? String(rule.originalValue) : "";
    const replStr = rule.replacementValue !== null && rule.replacementValue !== undefined ? String(rule.replacementValue) : "";

    // If reason uses "matches:" but values are non-identical numbers (e.g. 26mm vs 26.0096mm), clarify tolerance wording
    if (
      rule.reason.includes("matches:") &&
      origStr &&
      replStr &&
      origStr.trim().toLowerCase() !== replStr.trim().toLowerCase()
    ) {
      return rule.reason.replace("matches:", "is within permitted tolerance:");
    }

    return rule.reason;
  };

  // Derive point weight / score contribution visualization text from exact WEIGHTS config
  const getContributionText = (rule: RuleResult) => {
    if (rule.tier === "gate") {
      return rule.severity === "HARD_FAIL" ? "0 / Gate (Rejection)" : "Gate Requirement";
    }

    const categoryWeight = (WEIGHTS as Record<string, number>)[rule.category];
    if (categoryWeight !== undefined) {
      if (rule.severity === "PASS") {
        return `+${categoryWeight} pts`;
      }
      if (rule.severity === "WARNING") {
        const earned = Math.max(categoryWeight - WARNING_PENALTY, 0);
        return `+${earned} pts (-${WARNING_PENALTY} penalty)`;
      }
      return `0 pts (Excluded)`;
    }

    return rule.severity === "PASS" ? `+25 pts` : "0 pts";
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-4 sm:p-5 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
            Engineering Rule Evaluation Cards
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Automated verification rules ordered by severity (failed and warning gates prioritized)
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-sm">
          {rules.length} Rules Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {sortedRules.map((rule) => {
          const isHardFail = rule.severity === "HARD_FAIL";
          const isWarning = rule.severity === "WARNING";
          const isPass = rule.severity === "PASS";
          const isUnverified = rule.severity === "UNVERIFIED";

          const isExpanded = !!expandedIds[rule.ruleId];

          const cardTheme = isHardFail
            ? "border-pink-800/80 bg-pink-950/20 text-pink-300"
            : isWarning
            ? "border-amber-800/80 bg-amber-950/20 text-amber-300"
            : isUnverified
            ? "border-zinc-800/80 bg-zinc-900/40 text-zinc-400"
            : "border-zinc-800/70 bg-zinc-950 text-zinc-300 opacity-90 hover:opacity-100";

          const StatusIcon = isHardFail
            ? XCircle
            : isWarning
            ? AlertTriangle
            : isUnverified
            ? HelpCircle
            : CheckCircle2;

          const iconColor = isHardFail
            ? "text-pink-400"
            : isWarning
            ? "text-amber-400"
            : isUnverified
            ? "text-zinc-400"
            : "text-emerald-400";

          const badgeClass = isHardFail
            ? "bg-pink-950 text-pink-400 border-pink-700/80"
            : isWarning
            ? "bg-amber-950 text-amber-400 border-amber-700/80"
            : isUnverified
            ? "bg-zinc-900 text-zinc-400 border-zinc-700/80"
            : "bg-emerald-950 text-emerald-400 border-emerald-700/80";

          return (
            <div
              key={rule.ruleId}
              className={`border rounded-sm transition-all ${cardTheme}`}
            >
              {/* Compact Collapsed Card Header Row */}
              <div
                onClick={() => toggleExpand(rule.ruleId)}
                className="p-3.5 cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusIcon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-xs font-bold text-white font-sans uppercase tracking-wide truncate">
                      {rule.label}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
                      • {rule.category} • {rule.tier}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Score Contribution Badge */}
                  <span className="text-[11px] font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm hidden sm:inline-block">
                    {getContributionText(rule)}
                  </span>

                  {/* Severity Badge */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-sm uppercase ${badgeClass}`}
                  >
                    {rule.severity}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform ${
                      isExpanded ? "rotate-180 text-white" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-zinc-800/80 text-xs space-y-3 bg-zinc-950/90">
                  <div className="mt-3">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wider block mb-1">
                      Engine Evaluation Reasoning:
                    </span>
                    <p className="text-zinc-200 font-sans leading-relaxed">
                      {formatPresentationReason(rule)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-900 font-mono">
                    <div className="bg-zinc-900 p-2.5 rounded-sm border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block mb-0.5 font-sans">
                        Part A (Original)
                      </span>
                      <span className="text-zinc-100 font-semibold">
                        {formatVal(rule.originalValue)}
                      </span>
                    </div>

                    <div className="bg-zinc-900 p-2.5 rounded-sm border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block mb-0.5 font-sans">
                        Part B (Replacement)
                      </span>
                      <span className="text-zinc-100 font-semibold">
                        {formatVal(rule.replacementValue)}
                      </span>
                    </div>
                  </div>

                  {onOpenEvidence && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEvidence(rule.label);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-sans underline underline-offset-4 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-400" /> View Citation Evidence
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
