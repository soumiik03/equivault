"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  FileImage,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface SingleDropZoneProps {
  slotTitle: string;
  slotSubtitle: string;
  slotBadge: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

function SingleDropZone({
  slotTitle,
  slotSubtitle,
  slotBadge,
  file,
  onFileSelect,
  onFileRemove,
}: SingleDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image/"))
      return <FileImage className="h-5 w-5 text-zinc-300" />;
    return <FileText className="h-5 w-5 text-zinc-300" />;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Card Header Label */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
          {slotTitle}
        </span>
        <span className="text-[11px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded-md">
          {slotBadge}
        </span>
      </div>

      {file ? (
        /* Attached File Card State */
        <div className="group relative flex flex-col justify-between min-h-[220px] w-full rounded-2xl bg-zinc-900/90 border border-zinc-700/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-zinc-600">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-zinc-800 p-2.5 border border-zinc-700/50 shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white tracking-tight truncate max-w-[180px] sm:max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs font-normal text-zinc-400 mt-0.5">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onFileRemove}
              className="text-zinc-400 hover:bg-zinc-800 hover:text-red-400 rounded-lg p-2 transition-colors shrink-0"
              title="Remove file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#84cc16] bg-[#84cc16]/15 border border-[#84cc16]/30 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> File Ready
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              Change file
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        /* Empty Drop Card State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            isDragging
              ? "border-[#84cc16] bg-[#84cc16]/10 scale-[1.01]"
              : "border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-950/90"
          }`}
        >
          {/* Subtle diagonal stripe texture */}
          <div className="bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_10px)] pointer-events-none absolute inset-0 rounded-2xl" />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          />

          {/* Green Glowing Cloud Icon Circle */}
          <div className="relative z-10 mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-[#84cc16]/15 text-[#84cc16] shadow-[0_0_16px_rgba(132,204,22,0.15)] group-hover:scale-105 group-hover:bg-[#84cc16]/25 transition-all">
            <UploadCloud className="h-7 w-7 stroke-[2.2]" />
          </div>

          <p className="relative z-10 text-base font-bold text-white mb-1 tracking-tight">
            Click to upload{" "}
            <span className="text-zinc-400 font-normal">or drag and drop</span>
          </p>

          <p className="relative z-10 text-xs font-normal text-zinc-400 mb-4">
            {slotSubtitle}
          </p>

          <button
            type="button"
            className="relative z-10 pointer-events-none rounded-lg bg-zinc-800/90 px-4 py-2 text-xs font-semibold text-zinc-100 border border-zinc-700/60 shadow-sm transition-colors group-hover:bg-zinc-700"
          >
            Browse Document
          </button>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [original, setOriginal] = useState<File | null>(null);
  const [replacement, setReplacement] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    if (!original || !replacement) {
      setError("Please attach both Original (Part A) and Replacement (Part B) documents before proceeding.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      setStatus("Uploading bearing documents...");
      const formData = new FormData();
      formData.append("original", original);
      formData.append("replacement", replacement);

      const uploadRes = await fetch("/api/comparisons", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error ?? "Upload failed");
      }

      const { comparisonId, documentIds } = uploadData;

      setStatus("Extracting Original Bearing (A) specifications...");
      const extractA = await fetch(
        `/api/documents/${documentIds.original}/extract`,
        { method: "POST" }
      );
      if (!extractA.ok) {
        const d = await extractA.json();
        throw new Error(d.error ?? "Extraction failed for Original Bearing");
      }

      setStatus("Extracting Replacement Bearing (B) specifications...");
      const extractB = await fetch(
        `/api/documents/${documentIds.replacement}/extract`,
        { method: "POST" }
      );
      if (!extractB.ok) {
        const d = await extractB.json();
        throw new Error(
          d.error ?? "Extraction failed for Replacement Bearing"
        );
      }

      setStatus("Finalizing compatibility analysis...");
      const analyzeRes = await fetch(
        `/api/comparisons/${comparisonId}/analyze`,
        { method: "POST" }
      );
      if (!analyzeRes.ok) {
        const d = await analyzeRes.json();
        throw new Error(d.error ?? "Analysis failed");
      }

      router.push(`/comparisons/${comparisonId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during analysis");
    } finally {
      setLoading(false);
    }
  }

  const isReady = original !== null && replacement !== null;

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-zinc-800 selection:text-white">
      <main className="w-full max-w-2xl flex flex-col items-center my-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-center mb-2">
          Upload Bearing Datasheets
        </h1>

        {/* Supporting text */}
        <p className="text-zinc-400 text-xs sm:text-sm text-center max-w-md mb-8 leading-relaxed font-normal">
          Upload the original and replacement bearing documents to begin the analysis.
        </p>

        {/* Two Separate Upload Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full mb-6">
          <SingleDropZone
            slotTitle="Original Bearing (A)"
            slotSubtitle="PDF, PNG or JPG (max. 50MB)"
            slotBadge="Part A"
            file={original}
            onFileSelect={(f) => {
              setError(null);
              setOriginal(f);
            }}
            onFileRemove={() => {
              setError(null);
              setOriginal(null);
            }}
          />

          <SingleDropZone
            slotTitle="Replacement Bearing (B)"
            slotSubtitle="PDF, PNG or JPG (max. 50MB)"
            slotBadge="Part B"
            file={replacement}
            onFileSelect={(f) => {
              setError(null);
              setReplacement(f);
            }}
            onFileRemove={() => {
              setError(null);
              setReplacement(null);
            }}
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="w-full mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Status Progress Bar */}
        {status && (
          <div className="w-full mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" />
            <span>{status}</span>
          </div>
        )}

        {/* Analyze Action Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !isReady}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
              <span>Processing Analysis...</span>
            </>
          ) : (
            <>
              <span>Analyze Compatibility</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </main>
    </div>
  );
}