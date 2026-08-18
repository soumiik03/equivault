import { notFound } from "next/navigation";
import { db } from "@/db";
import { partComparisons, documents, extractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ValidatedBearingSpec } from "@/lib/validation/bearing-spec-schema";
import { VerdictDashboardClient } from "./components/VerdictDashboardClient";

export const dynamic = "force-dynamic";

export default async function ComparisonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return notFound();

  const [comparison] = await db.select().from(partComparisons).where(eq(partComparisons.id, id));
  if (!comparison) return notFound();

  const docs = await db.select().from(documents).where(eq(documents.comparisonId, id));

  const originalDoc = docs.find((d) => d.partRole === "original");
  const replacementDoc = docs.find((d) => d.partRole === "replacement");

  let originalExt, replacementExt;

  if (originalDoc) {
    [originalExt] = await db.select().from(extractions).where(eq(extractions.documentId, originalDoc.id));
  }
  if (replacementDoc) {
    [replacementExt] = await db.select().from(extractions).where(eq(extractions.documentId, replacementDoc.id));
  }

  const originalSpec = originalExt?.validatedSpec as ValidatedBearingSpec | undefined;
  const replacementSpec = replacementExt?.validatedSpec as ValidatedBearingSpec | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis = comparison.analysis as any;

  return (
    <VerdictDashboardClient
      comparisonId={comparison.id}
      initialStatus={comparison.status}
      initialFailureReason={comparison.failureReason}
      originalDoc={originalDoc}
      replacementDoc={replacementDoc}
      originalSpec={originalSpec}
      replacementSpec={replacementSpec}
      initialAnalysis={analysis}
    />
  );
}
