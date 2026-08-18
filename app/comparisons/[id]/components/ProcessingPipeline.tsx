import React from "react";
import { UploadCloud, Cpu, Scale, Award, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ProcessingPipelineProps {
  status: "UPLOADED" | "PROCESSING" | "EXTRACTED" | "VALIDATED" | "COMPARED" | "COMPLETED" | "FAILED" | string;
  failureReason?: string | null;
}

interface Step {
  id: string;
  label: string;
  subtext: string;
  Icon: React.ElementType;
}

const PIPELINE_STEPS: Step[] = [
  {
    id: "upload",
    label: "Document Ingestion",
    subtext: "Original & Replacement PDFs attached",
    Icon: UploadCloud,
  },
  {
    id: "extract",
    label: "Gemini Document Extraction",
    subtext: "Multimodal extraction & evidence parsing",
    Icon: Cpu,
  },
  {
    id: "evaluate",
    label: "Rule Engine Evaluation",
    subtext: "Engineering tolerance & gate verification",
    Icon: Scale,
  },
  {
    id: "verdict",
    label: "Final Verdict Synthesis",
    subtext: "Weighted risk scoring & compliance report",
    Icon: Award,
  },
];

export function ProcessingPipeline({ status, failureReason }: ProcessingPipelineProps) {
  // Determine status for each pipeline step
  const getStepState = (stepIndex: number): "done" | "in-progress" | "pending" | "failed" => {
    if (status === "FAILED") {
      return stepIndex === 0 ? "done" : "failed";
    }

    if (status === "COMPLETED") return "done";

    if (status === "UPLOADED") {
      return stepIndex === 0 ? "in-progress" : "pending";
    }
    if (status === "PROCESSING" || status === "EXTRACTED") {
      if (stepIndex < 1) return "done";
      if (stepIndex === 1) return "in-progress";
      return "pending";
    }
    if (status === "VALIDATED") {
      if (stepIndex < 2) return "done";
      if (stepIndex === 2) return "in-progress";
      return "pending";
    }
    if (status === "COMPARED") {
      if (stepIndex < 3) return "done";
      if (stepIndex === 3) return "in-progress";
      return "pending";
    }

    return "pending";
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans">
            Analysis Pipeline Execution
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Real-time pipeline stages executing compatibility analysis and rule evaluation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-400 uppercase bg-amber-950/80 px-2.5 py-1 border border-amber-700/60 rounded-sm">
            Status: {status}
          </span>
        </div>
      </div>

      {failureReason && (
        <div className="p-4 bg-pink-950/40 border border-pink-700/80 rounded-sm flex items-start gap-3">
          <XCircle className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider font-sans">
              Pipeline Process Failed
            </h3>
            <p className="text-xs text-pink-200 font-mono mt-0.5">{failureReason}</p>
          </div>
        </div>
      )}

      {/* Stepper Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {PIPELINE_STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const { Icon } = step;

          const isDone = state === "done";
          const isInProgress = state === "in-progress";
          const isFailed = state === "failed";

          const containerStyle = isDone
            ? "border-emerald-700/60 bg-emerald-950/20"
            : isInProgress
            ? "border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50 animate-pulse"
            : isFailed
            ? "border-pink-700/60 bg-pink-950/20"
            : "border-zinc-800/80 bg-zinc-900/40 opacity-60";

          const iconColor = isDone
            ? "text-emerald-400"
            : isInProgress
            ? "text-amber-400"
            : isFailed
            ? "text-pink-400"
            : "text-zinc-500";

          return (
            <div
              key={step.id}
              className={`p-4 border rounded-sm transition-all space-y-3 flex flex-col justify-between ${containerStyle}`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">STEP 0{idx + 1}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase font-sans tracking-wide">
                  {step.label}
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
                  {step.subtext}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                {isDone ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> DONE
                  </span>
                ) : isInProgress ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> IN PROGRESS
                  </span>
                ) : isFailed ? (
                  <span className="text-pink-400 font-bold flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> FAILED
                  </span>
                ) : (
                  <span className="text-zinc-500">PENDING</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
