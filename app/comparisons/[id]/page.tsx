import { notFound } from "next/navigation";
import { db } from "@/db";
import { partComparisons, documents, extractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ValidatedBearingSpec } from "@/lib/validation/bearing-spec-schema";

export default async function ComparisonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  // UUID validation to prevent DB crashes if a malformed ID is passed
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

  const specFields = [
    { key: "partNumber", label: "Part Number" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "bearingType", label: "Bearing Type" },
    { key: "innerDiameter", label: "Inner Diameter (mm)" },
    { key: "outerDiameter", label: "Outer Diameter (mm)" },
    { key: "width", label: "Width (mm)" },
    { key: "material", label: "Material" },
    { key: "dynamicLoadRating", label: "Dynamic Load Rating (kN)" },
    { key: "staticLoadRating", label: "Static Load Rating (kN)" },
    { key: "maximumSpeed", label: "Maximum Speed (RPM)" },
    { key: "temperature", label: "Temperature (°C)" },
    { key: "clearance", label: "Clearance" },
    { key: "sealType", label: "Seal Type" },
    { key: "standards", label: "Standards" },
    { key: "certifications", label: "Certifications" },
  ] as const;

  const originalSpec = originalExt?.validatedSpec as ValidatedBearingSpec | undefined;
  const replacementSpec = replacementExt?.validatedSpec as ValidatedBearingSpec | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValue = (val: any) => {
    if (val === null || val === undefined) return "Not specified";
    if (Array.isArray(val)) return val.length ? val.join(", ") : "Not specified";
    return String(val);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Comparison Results</h1>
        <p className="text-sm text-gray-500">Status: {comparison.status}</p>
        {comparison.failureReason && (
          <p className="text-sm text-red-500">Failed: {comparison.failureReason}</p>
        )}
      </header>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Specification</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Part A (Original)</th>
              <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Part B (Replacement)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {specFields.map(({ key, label }) => {
              const origField = originalSpec ? originalSpec[key as keyof ValidatedBearingSpec] : null;
              const replField = replacementSpec ? replacementSpec[key as keyof ValidatedBearingSpec] : null;

              return (
                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-900 dark:text-white">
                        {renderValue(origField?.value)}
                      </span>
                      {origField?.evidence?.text && (
                        <span className="text-xs text-gray-500 line-clamp-2" title={origField.evidence.text}>
                          Evidence: {origField.evidence.text} {origField.evidence.page ? `(pg. ${origField.evidence.page})` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-900 dark:text-white">
                        {renderValue(replField?.value)}
                      </span>
                      {replField?.evidence?.text && (
                        <span className="text-xs text-gray-500 line-clamp-2" title={replField.evidence.text}>
                          Evidence: {replField.evidence.text} {replField.evidence.page ? `(pg. ${replField.evidence.page})` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
