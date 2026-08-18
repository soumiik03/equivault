import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partComparisons, documents, extractions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

    const specs: Record<string, unknown> = {};

    for (const doc of docs) {
      const [extraction] = await db
        .select()
        .from(extractions)
        .where(eq(extractions.documentId, doc.id));

      if (extraction) {
        specs[doc.partRole] = extraction.validatedSpec;
      }
    }

    return NextResponse.json({
      id: comparison.id,
      status: comparison.status,
      failureReason: comparison.failureReason,
      analysis: comparison.analysis,
      documents: docs.map((d) => ({
        id: d.id,
        partRole: d.partRole,
        filename: d.filename,
        storagePath: d.storagePath,
        mimeType: d.mimeType,
        fileSizeBytes: d.fileSizeBytes,
      })),
      specs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch comparison";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
