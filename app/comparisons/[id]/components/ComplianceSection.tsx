import React, { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Shield, Wrench } from "lucide-react";
import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";

interface ComplianceSectionProps {
  engineeringRules?: RuleResult[];
  compliance?: ComparisonComplianceResult;
}

export function ComplianceSection({
  engineeringRules = [],
  compliance,
}: ComplianceSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("engineering");

  const origCompliance = compliance?.original ?? [];
  const replCompliance = compliance?.replacement ?? [];

  const totalEngineering = engineeringRules.length;
  const totalRegulatory = origCompliance.length + replCompliance.length;

  const renderStatusBadge = (status: string) => {
    if (status === "PASS" || status === "PRESENT") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-700/60 rounded-sm uppercase">
          <CheckCircle2 className="h-3 w-3 shrink-0" /> PASS / PRESENT
        </span>
      );
    }
    if (status === "HARD_FAIL") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-pink-400 bg-pink-950/80 px-2 py-0.5 border border-pink-700/60 rounded-sm uppercase">
          <XCircle className="h-3 w-3 shrink-0" /> FAIL
        </span>
      );
    }
    if (status === "MISSING") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-pink-400 bg-pink-950/80 px-2 py-0.5 border border-pink-700/60 rounded-sm uppercase">
          <XCircle className="h-3 w-3 shrink-0" /> MISSING
        </span>
      );
    }
    if (status === "WARNING" || status === "REVIEW_REQUIRED") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 border border-amber-700/60 rounded-sm uppercase">
          <AlertTriangle className="h-3 w-3 shrink-0" /> WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-700/60 rounded-sm uppercase">
        <HelpCircle className="h-3 w-3 shrink-0 text-zinc-500" /> UNVERIFIED
      </span>
    );
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-4 sm:p-5 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-900 border border-zinc-700/80 rounded-sm">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Compliance & Audit Findings
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Separated view of Engineering compatibility criteria vs Regulatory & standard certifications
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Separates Engineering vs Regulatory) */}
      <Tabs
        tabs={[
          { id: "engineering", label: "Engineering Findings", count: totalEngineering },
          { id: "regulatory", label: "Regulatory & Quality Findings", count: totalRegulatory },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content 1: Engineering Findings */}
      {activeTab === "engineering" && (
        <div className="space-y-2.5 pt-2">
          {engineeringRules.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono py-4 text-center">
              No engineering rules available.
            </p>
          ) : (
            engineeringRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="text-xs font-bold text-white font-sans uppercase">
                      {rule.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded-sm uppercase">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {rule.reason}
                  </p>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  {renderStatusBadge(rule.severity)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: Regulatory & Quality Findings */}
      {activeTab === "regulatory" && (
        <div className="space-y-4 pt-2">
          {/* Part A Findings */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">
              Part A (Original) Regulatory Checks
            </h3>
            {origCompliance.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-2">No regulatory checks recorded.</p>
            ) : (
              origCompliance.map((check) => (
                <div
                  key={`orig-${check.checkId}`}
                  className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white font-sans uppercase">
                      {check.label}
                    </span>
                    <p className="text-xs text-zinc-400 font-sans">{check.reason}</p>
                  </div>
                  <div className="shrink-0 self-start sm:self-auto">
                    {renderStatusBadge(check.status)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Part B Findings */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">
              Part B (Replacement) Regulatory Checks
            </h3>
            {replCompliance.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono py-2">No regulatory checks recorded.</p>
            ) : (
              replCompliance.map((check) => (
                <div
                  key={`repl-${check.checkId}`}
                  className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white font-sans uppercase">
                      {check.label}
                    </span>
                    <p className="text-xs text-zinc-400 font-sans">{check.reason}</p>
                  </div>
                  <div className="shrink-0 self-start sm:self-auto">
                    {renderStatusBadge(check.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
