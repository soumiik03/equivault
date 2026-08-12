import { notFound } from "next/navigation";
import { db } from "@/db";
import { partComparisons, documents, extractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ValidatedBearingSpec } from "@/lib/validation/bearing-spec-schema";
import type { RuleResult } from "@/lib/rules/types";
import type { ComparisonComplianceResult } from "@/lib/compliance/types";
import type { EvidenceReport, EvidenceDrawerItem } from "@/lib/evidence/types";

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
  const analysis = comparison.analysis as {
    engineering: RuleResult[];
    compliance: ComparisonComplianceResult;
    evidence: EvidenceReport;
  } | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValue = (val: any) => {
    if (val === null || val === undefined) return "Not specified";
    if (Array.isArray(val)) return val.length ? val.join(", ") : "Not specified";
    return String(val);
  };

  const statusClass = (status: string) => {
    if (status === "PASS" || status === "PRESENT") return "text-green-700";
    if (status === "HARD_FAIL") return "text-red-700";
    return "text-amber-700";
  };

  const documentName = (item: EvidenceDrawerItem) => {
    if (item.documentSide === "original") return originalDoc?.filename ?? "Original document";
    if (item.documentSide === "replacement") return replacementDoc?.filename ?? "Replacement document";
    return `${originalDoc?.filename ?? "Original"} / ${replacementDoc?.filename ?? "Replacement"}`;
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

      {analysis && (
        <>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Engineering Compatibility</h2>
            <p className={`mt-2 text-lg font-bold ${analysis.engineering.some((r) => r.severity === "HARD_FAIL") ? "text-red-700" : analysis.engineering.some((r) => r.severity === "UNVERIFIED") ? "text-amber-700" : "text-green-700"}`}>
              {analysis.engineering.some((r) => r.severity === "HARD_FAIL") ? "NOT COMPATIBLE" : analysis.engineering.some((r) => r.severity === "UNVERIFIED") ? "UNVERIFIED" : "COMPATIBLE"}
            </p>
            <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
              {analysis.engineering.map((rule) => (
                <div key={rule.ruleId} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto]">
                  <div><p className="font-medium">{rule.label}</p><p className="text-sm text-gray-600 dark:text-gray-400">{rule.reason}</p></div>
                  <span className={`font-semibold ${statusClass(rule.severity)}`}>{rule.severity}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p className="font-semibold">Critical reason</p>
              <p className="mt-1 text-sm">{analysis.evidence.criticalReason?.reason ?? "No critical gate issue identified."}</p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compliance Status</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {(["original", "replacement"] as const).map((side) => (
                <div key={side}>
                  <h3 className="font-semibold capitalize">{side}</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    {analysis.compliance[side].map((check) => <div key={check.checkId} className="flex justify-between gap-3"><span>{check.label}</span><span className={`font-semibold ${statusClass(check.status)}`}>{check.status}</span></div>)}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-gray-500">{analysis.compliance[side].map((check) => <p key={`${check.checkId}-reason`}>{check.label}: {check.reason}</p>)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Evidence</h2>
            <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
              {analysis.evidence.drawerItems.map((item) => <div key={`${item.category}-${item.id}-${item.documentSide}`} className="py-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{item.label} <span className="text-gray-500">({item.category})</span></span><span className={statusClass(item.severity)}>{item.severity}</span></div><p className="text-xs text-gray-500">Source: {documentName(item)}{item.page ? `, page ${item.page}` : ""}</p><p className="mt-1 text-gray-700 dark:text-gray-300">{item.supportingText ?? "No supporting text extracted."}</p></div>)}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Explanation</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{analysis.evidence.explanation}</p>
          </section>
        </>
      )}
    </div>
  );
}
