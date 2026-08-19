import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, extractions, partComparisons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { downloadDocumentBuffer } from "@/lib/storage/supabase";
import { extractBearingSpec } from "@/lib/ai/extract-document";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;

  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Idempotency: return existing extraction instead of rejecting with 409
    const [existing] = await db
      .select()
      .from(extractions)
      .where(eq(extractions.documentId, documentId));

    if (existing) {
      return NextResponse.json({
        extractionId: existing.id,
        documentId,
        partRole: doc.partRole,
        spec: existing.validatedSpec,
        attempts: existing.attempts,
      });
    }

    const buffer = await downloadDocumentBuffer(doc.storagePath);
    const { spec, rawResponse, attempts } = await extractBearingSpec(
      buffer,
      doc.mimeType
    );

    const [extraction] = await db
      .insert(extractions)
      .values({
        documentId,
        rawResponse,
        validatedSpec: spec,
        attempts,
      })
      .returning({ id: extractions.id });

    return NextResponse.json({
      extractionId: extraction.id,
      documentId,
      partRole: doc.partRole,
      spec,
      attempts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";

    // Mark the parent comparison as FAILED so it doesn't stay stuck at UPLOADED
    try {
      const [doc] = await db
        .select({ comparisonId: documents.comparisonId })
        .from(documents)
        .where(eq(documents.id, documentId));

      if (doc) {
        await db
          .update(partComparisons)
          .set({
            status: "FAILED",
            failureReason: `Extraction failed: ${message}`,
            updatedAt: new Date(),
          })
          .where(eq(partComparisons.id, doc.comparisonId));
      }
    } catch {
      // Best-effort status update; don't mask the original error
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
