import React from "react";
import { AlertOctagon, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import type { RuleResult } from "@/lib/rules/types";

interface CriticalIssueSectionProps {
  hardFails?: RuleResult[];
  criticalReason?: {
    label: string;
    reason: string;
    severity: string;
  } | null;
  onOpenEvidence?: (label: string) => void;
}

export function CriticalIssueSection({
  hardFails = [],
  criticalReason,
  onOpenEvidence,
}: CriticalIssueSectionProps) {
  const hasHardFails = hardFails.length > 0;

  const formatVal = (v: unknown) => {
    if (v === null || v === undefined) return "N/A";
    return String(v);
  };

  // Render explicit compact state when there are NO critical rejection issues
  if (!hasHardFails) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-200 uppercase font-sans tracking-wide">
            No Critical Engineering Rejections
          </span>
          <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
            — Mandatory engineering compatibility gate requirements passed
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 border border-emerald-700/60 rounded-sm uppercase shrink-0">
          ENGINEERING GATES PASSED
        </span>
      </div>
    );
  }

  // Render prominent warning state when HARD_FAIL exists
  return (
    <div className="w-full bg-pink-950/20 border-2 border-pink-700/80 rounded-sm p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-pink-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-pink-950 border border-pink-700/80 rounded-sm">
            <AlertOctagon className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-pink-300 uppercase tracking-widest font-sans">
              Critical Rejection Issues
            </h2>
            <p className="text-xs text-pink-400/80 font-sans">
              Immediate dealbreakers identified by engineering compatibility verification rules
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/90 border border-pink-700/60 px-2.5 py-1 rounded-sm uppercase">
          {hardFails.length} Dealbreaker{hardFails.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {hardFails.map((fail) => (
          <div
            key={fail.ruleId}
            className="p-4 bg-zinc-950 border border-pink-900/80 rounded-sm space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-white font-sans uppercase tracking-wide">
                {fail.label}
              </span>
              <span className="text-[11px] font-mono font-bold text-pink-400 bg-pink-950 border border-pink-700/80 px-2 py-0.5 rounded-sm uppercase">
                HARD FAIL
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {fail.reason}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-900 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-400">
                <span>Orig: <strong className="text-zinc-200">{formatVal(fail.originalValue)}</strong></span>
                <ArrowRight className="h-3 w-3 text-pink-500" />
                <span>Repl: <strong className="text-pink-400">{formatVal(fail.replacementValue)}</strong></span>
              </div>

              {onOpenEvidence && (
                <button
                  type="button"
                  onClick={() => onOpenEvidence(fail.label)}
                  className="inline-flex items-center gap-1 text-[11px] font-sans text-pink-400 hover:text-pink-300 hover:underline transition-colors"
                >
                  <FileText className="h-3 w-3" /> View Citation Evidence
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {criticalReason && (
        <div className="p-3 bg-zinc-950/90 border border-pink-900/60 rounded-sm text-xs font-sans text-pink-300/90">
          <strong className="text-pink-400 uppercase tracking-wider text-[11px] block mb-0.5">
            Engine Analysis Note:
          </strong>
          {criticalReason.reason}
        </div>
      )}
    </div>
  );
}
