import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Activity } from "lucide-react";
import type { RuleResult } from "@/lib/rules/types";

interface VerdictBannerProps {
  verdict: "COMPATIBLE" | "CONDITIONAL" | "UNSAFE" | "UNVERIFIED" | string;
  reason?: string;
  hardFails?: RuleResult[];
  riskScore?: {
    score: number | null;
    earnedWeight: number;
    applicableWeight: number;
  } | null;
}

export function VerdictBanner({
  verdict,
  reason,
  hardFails = [],
  riskScore,
}: VerdictBannerProps) {
  // Normalize verdict label: UNSAFE -> NOT COMPATIBLE as requested in 10.2 spec
  const displayVerdict =
    verdict === "UNSAFE" ? "NOT COMPATIBLE" : verdict;

  const isCompatible = verdict === "COMPATIBLE";
  const isConditional = verdict === "CONDITIONAL";
  const isNotCompatible = verdict === "UNSAFE" || verdict === "NOT COMPATIBLE";

  // Semantic color configurations matching dark engineering design system
  const theme = isNotCompatible
    ? {
        border: "border-pink-700/80",
        bg: "bg-pink-950/20",
        badgeBg: "bg-pink-950/80 text-pink-400 border-pink-700/80",
        text: "text-pink-400",
        barFill: "bg-pink-500",
        Icon: XCircle,
      }
    : isConditional
    ? {
        border: "border-amber-700/80",
        bg: "bg-amber-950/20",
        badgeBg: "bg-amber-950/80 text-amber-400 border-amber-700/80",
        text: "text-amber-400",
        barFill: "bg-amber-500",
        Icon: AlertTriangle,
      }
    : isCompatible
    ? {
        border: "border-emerald-700/80",
        bg: "bg-emerald-950/20",
        badgeBg: "bg-emerald-950/80 text-emerald-400 border-emerald-700/80",
        text: "text-emerald-400",
        barFill: "bg-emerald-500",
        Icon: CheckCircle2,
      }
    : {
        border: "border-zinc-700/80",
        bg: "bg-zinc-900/60",
        badgeBg: "bg-zinc-900 text-zinc-400 border-zinc-700/80",
        text: "text-zinc-400",
        barFill: "bg-zinc-500",
        Icon: HelpCircle,
      };

  const { Icon } = theme;

  // Derive failure summary line if applicable
  const failureSummary =
    hardFails.length > 0
      ? `${hardFails.length} critical constraint${hardFails.length > 1 ? "s" : ""} failed (${hardFails.map((f) => f.label).join(", ")})`
      : reason;

  const scoreVal = riskScore?.score ?? null;

  return (
    <div
      className={`w-full ${theme.bg} ${theme.border} border border-l-4 rounded-sm p-5 sm:p-6 shadow-lg space-y-4`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Hero Verdict Label & Icon */}
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-sm bg-zinc-950 border ${theme.border} shrink-0`}>
            <Icon className={`h-8 w-8 sm:h-9 sm:w-9 ${theme.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                Overall Verdict
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black font-sans tracking-tight uppercase ${theme.text}`}
            >
              {displayVerdict}
            </h1>
          </div>
        </div>

        {/* Secondary Verified Criteria Score Badge & Meter */}
        <div className="flex flex-col sm:items-end bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-sm min-w-[240px]">
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
            <span className="text-[10px] font-mono font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-wider">
              <Activity className="h-3 w-3 text-zinc-500" /> Verified Criteria Score
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {scoreVal !== null ? `${scoreVal}%` : "N/A"}
            </span>
          </div>

          {/* Thin meter bar */}
          <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 rounded-none mt-2 overflow-hidden">
            <div
              className={`h-full ${theme.barFill} transition-all duration-300`}
              style={{ width: `${Math.min(Math.max(scoreVal ?? 0, 0), 100)}%` }}
            />
          </div>

          {riskScore && (
            <div className="flex flex-col items-start sm:items-end mt-1.5 text-[10px] font-mono text-zinc-400">
              <span className="text-zinc-300 font-medium">
                {riskScore.earnedWeight} / {riskScore.applicableWeight} applicable weight
              </span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                UNVERIFIED RULES EXCLUDED • HARD FAILS OVERRIDE SCORE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Direct Failure / Status Reason One-Liner */}
      {(isNotCompatible || isConditional || failureSummary) && (
        <div className="pt-3 border-t border-zinc-800/80 text-xs sm:text-sm font-sans text-zinc-300 flex items-start gap-2">
          <span className={`font-semibold shrink-0 uppercase tracking-wide text-xs ${theme.text}`}>
            Summary:
          </span>
          <span className="text-zinc-300 font-normal leading-relaxed">
            {failureSummary || "Verification completed."}
          </span>
        </div>
      )}
    </div>
  );
}
