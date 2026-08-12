import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partComparisons, documents, extractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { BearingSpec } from "@/lib/bearings/types";
import { evaluateCompatibility } from "@/lib/rules/engine";
import { compareCompliance } from "@/lib/compliance/engine";
import { buildEvidenceReport } from "@/lib/evidence/engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: comparisonId } = await params;

  try {
    const [comparison] = await db
      .select()
      .from(partComparisons)
      .where(eq(partComparisons.id, comparisonId));

    if (!comparison) {
      return NextResponse.json(
        { error: "Comparison not found" },
        { status: 404 }
      );
    }

    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.comparisonId, comparisonId));

    if (docs.length !== 2) {
      return NextResponse.json(
        { error: `Expected 2 documents, found ${docs.length}` },
        { status: 400 }
      );
    }

    const results: { partRole: "original" | "replacement"; spec: BearingSpec }[] = [];

    for (const doc of docs) {
      const [extraction] = await db
        .select()
        .from(extractions)
        .where(eq(extractions.documentId, doc.id));

      if (!extraction) {
        return NextResponse.json(
          {
            error: `Document "${doc.filename}" (${doc.partRole}) has not been extracted yet. Call POST /api/documents/${doc.id}/extract first.`,
          },
          { status: 400 }
        );
      }

      results.push({
        partRole: doc.partRole,
        spec: extraction.validatedSpec as BearingSpec,
      });
    }

    const original = results.find((result) => result.partRole === "original")?.spec;
    const replacement = results.find((result) => result.partRole === "replacement")?.spec;
    if (!original || !replacement) {
      throw new Error("Both original and replacement specifications are required.");
    }

    // Compatibility is deterministic. Gemini is only used inside Chapter 8's
    // grounded explanation generator, after these results have been finalized.
    const engineering = evaluateCompatibility(original, replacement);
    const compliance = compareCompliance(original, replacement);
    const evidence = await buildEvidenceReport(engineering, compliance, original, replacement);
    const analysis = { engineering, compliance, evidence };

    await db
      .update(partComparisons)
      .set({ status: "COMPLETED", analysis, updatedAt: new Date(), failureReason: null })
      .where(eq(partComparisons.id, comparisonId));

    return NextResponse.json({
      comparisonId,
      status: "COMPLETED",
      results,
      analysis,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";

    await db
      .update(partComparisons)
      .set({
        status: "FAILED",
        failureReason: message,
        updatedAt: new Date(),
      })
      .where(eq(partComparisons.id, comparisonId));

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
