"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function DropZone({
  label,
  file,
  onFile,
}: {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <p className="font-medium mb-2">{label}</p>
      {file ? (
        <p className="text-sm text-gray-600">{file.name}</p>
      ) : (
        <p className="text-sm text-gray-400">Drop PDF or image here</p>
      )}
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="mt-3"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
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
      setError("Upload both documents before continuing.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      setStatus("Uploading documents...");
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

      setStatus("Extracting original document...");
      const extractA = await fetch(
        `/api/documents/${documentIds.original}/extract`,
        { method: "POST" }
      );
      if (!extractA.ok) {
        const d = await extractA.json();
        throw new Error(d.error ?? "Extraction failed for original document");
      }

      setStatus("Extracting replacement document...");
      const extractB = await fetch(
        `/api/documents/${documentIds.replacement}/extract`,
        { method: "POST" }
      );
      if (!extractB.ok) {
        const d = await extractB.json();
        throw new Error(
          d.error ?? "Extraction failed for replacement document"
        );
      }

      setStatus("Finalizing comparison...");
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <h1 className="text-2xl font-semibold">Compare Bearing Parts</h1>
      <div className="grid grid-cols-2 gap-4">
        <DropZone
          label="Original Part (A)"
          file={original}
          onFile={setOriginal}
        />
        <DropZone
          label="Replacement Part (B)"
          file={replacement}
          onFile={setReplacement}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white rounded-md py-3 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Analyze Compatibility"}
      </button>
    </div>
  );
}