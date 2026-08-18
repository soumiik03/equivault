import React from "react";
import { Sheet } from "@/components/ui/sheet";
import { FileText, Bookmark } from "lucide-react";

export interface EvidenceRecord {
  sideLabel: string; // e.g. "PART A · ORIGINAL" or "PART B · REPLACEMENT"
  documentName: string;
  page: number | null;
  extractedValue: string;
  supportingText: string | null;
}

export interface SpecEvidenceDetail {
  attributeLabel: string;
  records: EvidenceRecord[];
}

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceDetail?: SpecEvidenceDetail | null;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  evidenceDetail,
}: EvidenceDrawerProps) {
  const attributeTitle = evidenceDetail?.attributeLabel
    ? evidenceDetail.attributeLabel.toUpperCase()
    : "ATTRIBUTE EVIDENCE";

  const records = evidenceDetail?.records ?? [];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`EVIDENCE: ${attributeTitle}`}
      description="Extracted document page references, extracted values, and supporting text"
    >
      {records.length === 0 ? (
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-sm text-center space-y-2">
          <FileText className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300 font-sans">
            No evidence records available for this item
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((rec, idx) => {
            const hasText = rec.supportingText && rec.supportingText.trim().length > 0;
            const pageDisplay =
              rec.page !== null && rec.page !== undefined ? String(rec.page) : "Not specified";

            return (
              <div
                key={`${rec.sideLabel}-${idx}`}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-sm space-y-4 shadow-sm"
              >
                {/* Record Side Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    {rec.sideLabel}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 border border-zinc-800 rounded-sm uppercase">
                    Document Citation
                  </span>
                </div>

                {/* Technical Evidence Fields */}
                <div className="space-y-3 text-xs font-mono">
                  {/* Document Name */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold tracking-wider block mb-0.5">
                      DOCUMENT
                    </span>
                    <span className="text-zinc-100 font-semibold break-all">
                      {rec.documentName}
                    </span>
                  </div>

                  {/* Page Number */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold tracking-wider block mb-0.5">
                      PAGE
                    </span>
                    <span className="text-zinc-100 font-semibold flex items-center gap-1.5">
                      <Bookmark className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      {pageDisplay}
                    </span>
                  </div>

                  {/* Extracted Value */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold tracking-wider block mb-0.5">
                      EXTRACTED VALUE
                    </span>
                    <span className="text-zinc-100 font-bold bg-zinc-950 px-2 py-1 rounded-sm border border-zinc-800 inline-block">
                      {rec.extractedValue}
                    </span>
                  </div>

                  {/* Supporting Text */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold tracking-wider block mb-0.5">
                      SUPPORTING TEXT
                    </span>
                    {hasText ? (
                      <p className="text-zinc-300 font-sans italic leading-relaxed bg-zinc-950 p-3 rounded-sm border border-zinc-800/80 text-xs">
                        "{rec.supportingText}"
                      </p>
                    ) : (
                      <p className="text-zinc-500 font-sans text-xs italic bg-zinc-950 p-2.5 rounded-sm border border-zinc-800/80">
                        No evidence available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
