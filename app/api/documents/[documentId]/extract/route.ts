import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, extractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { downloadDocumentBuffer } from "@/lib/storage/supabase";
import { extractBearingSpec } from "@/lib/ai/extract-document";

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

    const existing = await db
      .select({ id: extractions.id })
      .from(extractions)
      .where(eq(extractions.documentId, documentId));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Extraction already exists for this document" },
        { status: 409 }
      );
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
