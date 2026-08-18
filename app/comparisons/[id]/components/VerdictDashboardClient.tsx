"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComparisonHeader } from "./ComparisonHeader";
import { VerdictBanner } from "./VerdictBanner";
import { CriticalIssueSection } from "./CriticalIssueSection";
import { SideBySideSpecs } from "./SideBySideSpecs";
import { RuleCards } from "./RuleCards";
import { AnalysisConclusion } from "./AnalysisConclusion";
import { EvidenceDrawer, type SpecEvidenceDetail } from "./EvidenceDrawer";
import { MissingDataSection } from "./MissingDataSection";
import { ComplianceSection } from "./ComplianceSection";
import { ProcessingPipeline } from "./ProcessingPipeline";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ValidatedBearingSpec } from "@/lib/validation/bearing-spec-schema";
import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";
import type { EvidenceReport } from "@/lib/evidence/types";

interface DocumentMeta {
  id: string;
  filename: string;
  partRole: string;
  fileSizeBytes: string;
  mimeType: string;
}

interface AnalysisData {
  engineering: RuleResult[];
  compliance: ComparisonComplianceResult;
  riskScore: {
    score: number | null;
    earnedWeight: number;
    applicableWeight: number;
    breakdown: {
      category: string;
      weight: number;
      status: "PASS" | "WARNING" | "UNVERIFIED";
      contribution: number;
      excludedFromDenominator: boolean;
    }[];
  };
  finalVerdict: {
    verdict: "COMPATIBLE" | "CONDITIONAL" | "UNSAFE" | "UNVERIFIED";
    reason: string;
    hardFails: RuleResult[];
    unverifiedRules: RuleResult[];
    weightedIssues: RuleResult[];
    complianceRisk: "LOW" | "MEDIUM" | "HIGH";
    consequences: {
      type: string;
      reason: string;
      requiredAction: string;
    }[];
  };
  evidence: EvidenceReport;
}

interface VerdictDashboardClientProps {
  comparisonId: string;
  initialStatus: string;
  initialFailureReason?: string | null;
  originalDoc?: DocumentMeta;
  replacementDoc?: DocumentMeta;
  originalSpec?: ValidatedBearingSpec;
  replacementSpec?: ValidatedBearingSpec;
  initialAnalysis?: AnalysisData | null;
}

export function VerdictDashboardClient({
  comparisonId,
  initialStatus,
  initialFailureReason,
  originalDoc,
  replacementDoc,
  originalSpec,
  replacementSpec,
  initialAnalysis,
}: VerdictDashboardClientProps) {
  const router = useRouter();

  const [status, setStatus] = useState<string>(initialStatus);
  const [failureReason, setFailureReason] = useState<string | null>(initialFailureReason ?? null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(initialAnalysis ?? null);
  const [origDoc, setOrigDoc] = useState<DocumentMeta | undefined>(originalDoc);
  const [replDoc, setReplDoc] = useState<DocumentMeta | undefined>(replacementDoc);
  const [origSpec, setOrigSpec] = useState<ValidatedBearingSpec | undefined>(originalSpec);
  const [replSpec, setReplSpec] = useState<ValidatedBearingSpec | undefined>(replacementSpec);

  // Sync state with server props when they change (after router.refresh() re-renders the server component)
  useEffect(() => { setStatus(initialStatus); }, [initialStatus]);
  useEffect(() => { setFailureReason(initialFailureReason ?? null); }, [initialFailureReason]);
  useEffect(() => { setAnalysis(initialAnalysis ?? null); }, [initialAnalysis]);
  useEffect(() => { setOrigDoc(originalDoc); }, [originalDoc]);
  useEffect(() => { setReplDoc(replacementDoc); }, [replacementDoc]);
  useEffect(() => { setOrigSpec(originalSpec); }, [originalSpec]);
  useEffect(() => { setReplSpec(replacementSpec); }, [replacementSpec]);

  // Evidence Drawer State
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [, setActiveEvidenceLabel] = useState<string | null>(null);
  const [selectedEvidenceDetail, setSelectedEvidenceDetail] = useState<SpecEvidenceDetail | null>(null);

  // Auto-polling when status is not done or failed
  useEffect(() => {
    if (status === "COMPLETED" || status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/comparisons/${comparisonId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status) setStatus(data.status);
          if (data.failureReason) setFailureReason(data.failureReason);
          if (data.analysis) setAnalysis(data.analysis);
          if (data.documents && Array.isArray(data.documents)) {
            const od = data.documents.find((d: DocumentMeta) => d.partRole === "original");
            const rd = data.documents.find((d: DocumentMeta) => d.partRole === "replacement");
            if (od) setOrigDoc(od);
            if (rd) setReplDoc(rd);
          }
          if (data.specs) {
            if (data.specs.original) setOrigSpec(data.specs.original);
            if (data.specs.replacement) setReplSpec(data.specs.replacement);
          }
          if (data.status === "COMPLETED" || data.status === "FAILED") {
            router.refresh();
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, comparisonId, router]);

  const RULE_TO_FIELD: Record<string, keyof ValidatedBearingSpec> = {
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

  const FIELD_UNITS: Record<string, string> = {
    innerDiameter: "mm",
    outerDiameter: "mm",
    width: "mm",
    dynamicLoadRating: "kN",
    staticLoadRating: "kN",
    maximumSpeed: "RPM",
    temperature: "°C",
  };

  const handleOpenSpecEvidence = (key: keyof ValidatedBearingSpec, label: string, unit?: string) => {
    const origObj = origSpec ? origSpec[key] : null;
    const replObj = replSpec ? replSpec[key] : null;

    const items = [];

    const origValStr = origObj?.value !== null && origObj?.value !== undefined ? String(origObj.value) : "Not specified";
    const replValStr = replObj?.value !== null && replObj?.value !== undefined ? String(replObj.value) : "Not specified";

    items.push({
      sideLabel: "PART A · ORIGINAL",
      documentName: origDoc?.filename ?? "Original Datasheet.pdf",
      page: origObj?.evidence?.page ?? null,
      extractedValue: origValStr !== "Not specified" && unit ? `${origValStr} ${unit}` : origValStr,
      supportingText: origObj?.evidence?.text ?? null,
    });

    items.push({
      sideLabel: "PART B · REPLACEMENT",
      documentName: replDoc?.filename ?? "Replacement Datasheet.pdf",
      page: replObj?.evidence?.page ?? null,
      extractedValue: replValStr !== "Not specified" && unit ? `${replValStr} ${unit}` : replValStr,
      supportingText: replObj?.evidence?.text ?? null,
    });

    setSelectedEvidenceDetail({
      attributeLabel: label,
      records: items,
    });
    setActiveEvidenceLabel(label);
    setIsEvidenceOpen(true);
  };

  const handleOpenRuleEvidence = (ruleLabel: string) => {
    // Check if there is an engineering rule matching ruleLabel
    const rule = analysis?.engineering.find(
      (r) => r.label.toLowerCase() === ruleLabel.toLowerCase() || r.ruleId.toLowerCase() === ruleLabel.toLowerCase()
    );

    if (rule && RULE_TO_FIELD[rule.ruleId]) {
      const fieldKey = RULE_TO_FIELD[rule.ruleId];
      handleOpenSpecEvidence(fieldKey, rule.label, FIELD_UNITS[fieldKey]);
      return;
    }

    // Otherwise format matching drawerItems into Part A and Part B records
    const matchingItems = analysis?.evidence?.drawerItems.filter(
      (item) => item.label.toLowerCase() === ruleLabel.toLowerCase()
    ) ?? [];

    const origItem = matchingItems.find((m) => m.documentSide === "original" || m.documentSide === "both");
    const replItem = matchingItems.find((m) => m.documentSide === "replacement" || m.documentSide === "both");

    const parseExtractedVal = (val: unknown, side: "original" | "replacement"): string => {
      if (val === null || val === undefined) return "Not specified";
      if (typeof val === "object" && val !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = val as any;
        if (obj[side] !== undefined && obj[side] !== null) return String(obj[side]);
      }
      return String(val);
    };

    const items = [
      {
        sideLabel: "PART A · ORIGINAL",
        documentName: origDoc?.filename ?? "Original Datasheet.pdf",
        page: origItem?.page ?? null,
        extractedValue: origItem ? parseExtractedVal(origItem.extractedValue, "original") : "Not specified",
        supportingText: origItem?.supportingText ?? null,
      },
      {
        sideLabel: "PART B · REPLACEMENT",
        documentName: replDoc?.filename ?? "Replacement Datasheet.pdf",
        page: replItem?.page ?? null,
        extractedValue: replItem ? parseExtractedVal(replItem.extractedValue, "replacement") : "Not specified",
        supportingText: replItem?.supportingText ?? null,
      },
    ];

    setSelectedEvidenceDetail({
      attributeLabel: ruleLabel,
      records: items,
    });
    setActiveEvidenceLabel(ruleLabel);
    setIsEvidenceOpen(true);
  };

  const isProcessing = status !== "COMPLETED" && status !== "FAILED";

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Dashboard Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/upload")}
              className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-sm transition-colors"
              title="Back to Upload"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  EquiVault Engine • Verdict Dashboard
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
                Bearing Compatibility Analysis
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-sm">
              ID: {comparisonId.slice(0, 8)}...
            </span>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-sm transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* 10.9 Processing Pipeline Visualization (Shown during active processing state) */}
        {isProcessing && (
          <ProcessingPipeline status={status} failureReason={failureReason} />
        )}

        {/* 10.1 Comparison Header */}
        <ComparisonHeader
          originalDoc={origDoc}
          replacementDoc={replDoc}
          originalSpec={origSpec}
          replacementSpec={replSpec}
        />

        {/* 10.2 Overall Verdict Banner */}
        {analysis?.finalVerdict && (
          <VerdictBanner
            verdict={analysis.finalVerdict.verdict}
            reason={analysis.finalVerdict.reason}
            hardFails={analysis.finalVerdict.hardFails}
            riskScore={analysis.riskScore}
          />
        )}

        {/* 10.5 Critical Issue Section (Placed immediately below Verdict Banner) */}
        {analysis && (
          <CriticalIssueSection
            hardFails={analysis.finalVerdict?.hardFails ?? []}
            criticalReason={analysis.evidence?.criticalReason}
            onOpenEvidence={(label) => handleOpenRuleEvidence(label)}
          />
        )}

        {/* 10.3 Side-by-Side Specifications */}
        <SideBySideSpecs
          originalSpec={origSpec}
          replacementSpec={replSpec}
          engineeringRules={analysis?.engineering ?? []}
          onOpenEvidence={(key, label, unit) => handleOpenSpecEvidence(key, label, unit)}
        />

        {/* 10.4 Rule Cards */}
        {analysis?.engineering && (
          <RuleCards
            rules={analysis.engineering}
            onOpenEvidence={(label) => handleOpenRuleEvidence(label)}
          />
        )}

        {/* 10.7 Missing Data Section */}
        <MissingDataSection
          unverifiedRules={analysis?.finalVerdict?.unverifiedRules ?? []}
          weightedIssues={analysis?.finalVerdict?.weightedIssues ?? []}
          compliance={analysis?.compliance}
        />

        {/* 10.8 Compliance Section */}
        <ComplianceSection
          engineeringRules={analysis?.engineering ?? []}
          compliance={analysis?.compliance}
        />

        {/* Analysis Conclusion (Compact deterministic verdict summary at bottom of report) */}
        {analysis?.finalVerdict && (
          <AnalysisConclusion
            verdict={analysis.finalVerdict.verdict}
            reason={analysis.finalVerdict.reason}
            hardFails={analysis.finalVerdict.hardFails}
            unverifiedRules={analysis.finalVerdict.unverifiedRules}
            weightedIssues={analysis.finalVerdict.weightedIssues}
            consequences={analysis.finalVerdict.consequences}
            compliance={analysis.compliance}
          />
        )}

        {/* 10.6 Evidence Drawer Side Sheet */}
        <EvidenceDrawer
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          evidenceDetail={selectedEvidenceDetail}
        />
      </div>
    </div>
  );
}
