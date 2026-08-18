import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileCheck2 } from "lucide-react";
import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";

interface AnalysisConclusionProps {
  verdict: "COMPATIBLE" | "CONDITIONAL" | "UNSAFE" | "UNVERIFIED" | string;
  reason?: string;
  hardFails?: RuleResult[];
  unverifiedRules?: RuleResult[];
  weightedIssues?: RuleResult[];
  consequences?: {
    type: string;
    reason: string;
    requiredAction: string;
  }[];
  compliance?: ComparisonComplianceResult;
}

export function AnalysisConclusion({
  verdict,
  reason,
  hardFails = [],
  unverifiedRules = [],
  weightedIssues = [],
  consequences = [],
  compliance,
}: AnalysisConclusionProps) {
  const displayVerdict = verdict === "UNSAFE" ? "NOT COMPATIBLE" : verdict;
  const isNotCompatible = verdict === "UNSAFE" || verdict === "NOT COMPATIBLE";
  const isConditional = verdict === "CONDITIONAL";
  const isCompatible = verdict === "COMPATIBLE";
  const isUnverified = verdict === "UNVERIFIED";

  // Collect unverified/pending items dynamically from engine output
  const pendingItems: string[] = [];

  [...unverifiedRules, ...weightedIssues].forEach((r) => {
    if (!pendingItems.includes(r.label)) {
      pendingItems.push(r.label);
    }
  });

  if (compliance) {
    [...compliance.original, ...compliance.replacement].forEach((c) => {
      if ((c.status === "MISSING" || c.status === "UNVERIFIED") && !pendingItems.includes(c.label)) {
        pendingItems.push(c.label);
      }
    });
  }

  // Theme styling (compact, dark charcoal, visually subordinate to top verdict banner)
  const theme = isNotCompatible
    ? {
        border: "border-pink-800/80",
        bg: "bg-zinc-950",
        badge: "bg-pink-950/80 text-pink-400 border-pink-700/60",
        Icon: XCircle,
        iconColor: "text-pink-400",
      }
    : isConditional
    ? {
        border: "border-amber-800/80",
        bg: "bg-zinc-950",
        badge: "bg-amber-950/80 text-amber-400 border-amber-700/60",
        Icon: AlertTriangle,
        iconColor: "text-amber-400",
      }
    : isCompatible
    ? {
        border: "border-emerald-800/80",
        bg: "bg-zinc-950",
        badge: "bg-emerald-950/80 text-emerald-400 border-emerald-700/60",
        Icon: CheckCircle2,
        iconColor: "text-emerald-400",
      }
    : {
        border: "border-zinc-800",
        bg: "bg-zinc-950",
        badge: "bg-zinc-900 text-zinc-400 border-zinc-700/60",
        Icon: HelpCircle,
        iconColor: "text-zinc-400",
      };

  const { Icon } = theme;

  // Build conclusion text dynamically based on deterministic verdict engine output
  const getConclusionSummary = () => {
    if (isNotCompatible) {
      const failLabels = hardFails.map((f) => f.label).join(", ");
      return `${displayVerdict} — Critical engineering requirement${hardFails.length > 1 ? "s" : ""} failed (${failLabels}). ${reason ?? ""}`;
    }

    if (isConditional) {
      const pendingStr =
        pendingItems.length > 0
          ? ` Outstanding verification items (${pendingItems.join(", ")}) require engineering/compliance confirmation before approval.`
          : "";
      return `CONDITIONAL — Engineering compatibility has no identified hard failure.${pendingStr}`;
    }

    if (isCompatible) {
      return `COMPATIBLE — All evaluated engineering compatibility requirements passed and no unresolved compliance risk was identified. Replacement is cleared for engineering approval.`;
    }

    return `UNVERIFIED — Required technical information is missing or cannot be established. Detailed engineering review and supplier verification are required.`;
  };

  const actionItem = consequences.find((c) => c.requiredAction && c.requiredAction !== "No additional action is required.");

  return (
    <div className={`w-full ${theme.bg} ${theme.border} border rounded-sm p-4 sm:p-5 shadow-md space-y-3`}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-zinc-400" />
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
            Analysis Conclusion
          </h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-sm uppercase ${theme.badge}`}>
          {displayVerdict}
        </span>
      </div>

      <div className="flex items-start gap-3 pt-1">
        <Icon className={`h-5 w-5 ${theme.iconColor} shrink-0 mt-0.5`} />
        <div className="space-y-2 text-xs font-sans">
          <p className="text-zinc-200 leading-relaxed font-medium">
            {getConclusionSummary()}
          </p>

          {actionItem && (
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-sm font-mono text-[11px] text-zinc-300">
              <strong className="text-zinc-400 uppercase text-[10px] block mb-0.5 font-sans">
                Required Action:
              </strong>
              {actionItem.requiredAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
