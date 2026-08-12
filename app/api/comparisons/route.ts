import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partComparisons, documents } from "@/db/schema";
import { uploadDocument } from "@/lib/storage/supabase";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const original = formData.get("original") as File | null;
    const replacement = formData.get("replacement") as File | null;

    if (!original || !replacement) {
      return NextResponse.json(
        { error: "Both 'original' and 'replacement' files are required." },
        { status: 400 }
      );
    }

    for (const [label, file] of [
      ["original", original],
      ["replacement", replacement],
    ] as const) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `${label}: unsupported file type '${file.type}'.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${label}: file exceeds 10 MB limit.` },
          { status: 400 }
        );
      }
    }

    const [comparison] = await db
      .insert(partComparisons)
      .values({})
      .returning({ id: partComparisons.id });

    const comparisonId = comparison.id;

    const documentIds: Record<string, string> = {};

    for (const [role, file] of [
      ["original", original],
      ["replacement", replacement],
    ] as const) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const storagePath = `${comparisonId}/${role}/${file.name}`;

      await uploadDocument(buffer, storagePath, file.type);

      const [doc] = await db
        .insert(documents)
        .values({
          comparisonId,
          partRole: role,
          filename: file.name,
          storagePath,
          mimeType: file.type,
          fileSizeBytes: String(file.size),
        })
        .returning({ id: documents.id });

      documentIds[role] = doc.id;
    }

    return NextResponse.json({ comparisonId, documentIds }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}