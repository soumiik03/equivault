import { db } from "@/db";
import { partComparisons, documents, extractions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function main() {
  const comparisons = await db
    .select({
      id: partComparisons.id,
      status: partComparisons.status,
      createdAt: partComparisons.createdAt,
    })
    .from(partComparisons)
    .orderBy(desc(partComparisons.createdAt))
    .limit(5);

  console.log("=== RECENT COMPARISONS ===");
  for (const c of comparisons) {
    console.log(JSON.stringify(c));
  }

  if (comparisons.length === 0) {
    console.log("No comparisons found in database.");
    return;
  }

  const completed = comparisons.find((c) => c.status === "COMPLETED");
  const target = completed ?? comparisons[0];
  console.log(`\n=== INSPECTING COMPARISON: ${target.id} (${target.status}) ===`);

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.comparisonId, target.id));

  console.log(`\n--- DOCUMENTS (${docs.length}) ---`);
  for (const d of docs) {
    console.log(
      JSON.stringify({
        id: d.id,
        partRole: d.partRole,
        filename: d.filename,
        storagePath: d.storagePath,
        mimeType: d.mimeType,
        fileSizeBytes: d.fileSizeBytes,
      })
    );
  }

  for (const d of docs) {
    const [ext] = await db
      .select()
      .from(extractions)
      .where(eq(extractions.documentId, d.id));

    if (!ext) {
      console.log(`\n--- EXTRACTION for ${d.partRole} (${d.filename}): NOT FOUND ---`);
      continue;
    }

    console.log(`\n--- EXTRACTION for ${d.partRole} (${d.filename}) ---`);
    console.log(`Extraction ID: ${ext.id}`);
    console.log(`Attempts: ${ext.attempts}`);

    const spec = ext.validatedSpec as Record<string, unknown>;
    for (const [key, val] of Object.entries(spec)) {
      if (val && typeof val === "object" && "value" in (val as Record<string, unknown>)) {
        const fieldObj = val as { value: unknown; evidence?: { page?: number; text?: string } };
        console.log(
          `  ${key}: value=${JSON.stringify(fieldObj.value)}, evidence.page=${fieldObj.evidence?.page ?? "null"}`
        );
      } else {
        console.log(`  ${key}: ${JSON.stringify(val)}`);
      }
    }
  }

  const [full] = await db
    .select()
    .from(partComparisons)
    .where(eq(partComparisons.id, target.id));

  if (full?.analysis) {
    const a = full.analysis as Record<string, unknown>;
    console.log("\n--- ANALYSIS KEYS ---");
    console.log(Object.keys(a));

    if (a.riskScore) {
      console.log("\n--- RISK SCORE ---");
      console.log(JSON.stringify(a.riskScore));
    }
    if (a.finalVerdict) {
      console.log("\n--- FINAL VERDICT ---");
      console.log(JSON.stringify(a.finalVerdict, null, 2));
    }
    if (a.engineering && Array.isArray(a.engineering)) {
      console.log("\n--- ENGINEERING RULES ---");
      for (const r of a.engineering as Array<Record<string, unknown>>) {
        console.log(
          `  ${r.ruleId}: severity=${r.severity}, orig=${JSON.stringify(r.originalValue)}, repl=${JSON.stringify(r.replacementValue)}`
        );
      }
    }
  } else {
    console.log("\n--- ANALYSIS: null (not yet computed) ---");
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
