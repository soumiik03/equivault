import React from "react";
import { FileText, ArrowRightLeft, ShieldCheck, Factory, HardDrive } from "lucide-react";
import type { ValidatedBearingSpec } from "@/lib/validation/bearing-spec-schema";

interface DocumentMeta {
  id: string;
  filename: string;
  partRole: string;
  fileSizeBytes: string;
  mimeType: string;
}

interface ComparisonHeaderProps {
  originalDoc?: DocumentMeta;
  replacementDoc?: DocumentMeta;
  originalSpec?: ValidatedBearingSpec;
  replacementSpec?: ValidatedBearingSpec;
}

export function ComparisonHeader({
  originalDoc,
  replacementDoc,
  originalSpec,
  replacementSpec,
}: ComparisonHeaderProps) {
  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return "";
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return bytesStr;
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const origPartNo = originalSpec?.partNumber?.value ? String(originalSpec.partNumber.value) : "Unspecified Part No.";
  const origMfr = originalSpec?.manufacturer?.value ? String(originalSpec.manufacturer.value) : "Unknown Manufacturer";

  const replPartNo = replacementSpec?.partNumber?.value ? String(replacementSpec.partNumber.value) : "Unspecified Part No.";
  const replMfr = replacementSpec?.manufacturer?.value ? String(replacementSpec.manufacturer.value) : "Unknown Manufacturer";

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-4 sm:p-6 shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-sans">
            Component Comparison Overview
          </h2>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
          Part Pair Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4 sm:gap-6">
        {/* Original Part Column */}
        <div className="flex flex-col justify-between p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-800 px-2 py-0.5 border border-zinc-700/60 rounded-sm">
              Part A • Original
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {originalDoc?.fileSizeBytes ? formatFileSize(originalDoc.fileSizeBytes) : ""}
            </span>
          </div>

          <div>
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-zinc-950 border border-zinc-800 shrink-0 mt-0.5">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-white font-mono truncate tracking-tight" title={origPartNo}>
                  {origPartNo}
                </p>
                <p className="text-xs text-zinc-400 font-sans flex items-center gap-1 mt-0.5">
                  <Factory className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{origMfr}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Document metadata badge fallback */}
          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="truncate max-w-[200px]" title={originalDoc?.filename ?? "Original Datasheet"}>
              {originalDoc?.filename ?? "Original Datasheet"}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase">Datasheet</span>
          </div>
        </div>

        {/* Visually Distinct VS Divider */}
        <div className="flex flex-col md:flex-row items-center justify-center py-2 md:py-0">
          <div className="w-full md:w-px h-px md:h-full bg-zinc-800 hidden md:block" />
          <div className="my-auto px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-mono font-bold text-xs rounded-sm shadow-inner flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
            <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-400" />
            <span>VS</span>
          </div>
          <div className="w-full md:w-px h-px md:h-full bg-zinc-800 hidden md:block" />
        </div>

        {/* Replacement Part Column */}
        <div className="flex flex-col justify-between p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-800 px-2 py-0.5 border border-zinc-700/60 rounded-sm">
              Part B • Replacement
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {replacementDoc?.fileSizeBytes ? formatFileSize(replacementDoc.fileSizeBytes) : ""}
            </span>
          </div>

          <div>
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-zinc-950 border border-zinc-800 shrink-0 mt-0.5">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-white font-mono truncate tracking-tight" title={replPartNo}>
                  {replPartNo}
                </p>
                <p className="text-xs text-zinc-400 font-sans flex items-center gap-1 mt-0.5">
                  <Factory className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{replMfr}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Document metadata badge fallback */}
          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="truncate max-w-[200px]" title={replacementDoc?.filename ?? "Replacement Datasheet"}>
              {replacementDoc?.filename ?? "Replacement Datasheet"}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase">Datasheet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
