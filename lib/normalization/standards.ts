export function normalizeStandards(input: string[] | string | null): string[] | null {
  if (!input) return null;

  const rawArray = Array.isArray(input) ? input : [input];
  const results: string[] = [];

  for (const raw of rawArray) {
    if (!raw || typeof raw !== "string") continue;

    // Clean whitespace
    let cleaned = raw.replace(/\s+/g, " ").trim();

    // Standardize prefixes
    cleaned = cleaned.replace(/^ISO\s*(.*)/i, "ISO $1");
    cleaned = cleaned.replace(/^DIN\s*(.*)/i, "DIN $1");
    cleaned = cleaned.replace(/^ANSI\s*(.*)/i, "ANSI $1");
    cleaned = cleaned.replace(/^ABMA\s*(.*)/i, "ABMA $1");
    cleaned = cleaned.replace(/^ANSI\/ABMA\s*(.*)/i, "ANSI/ABMA $1");
    cleaned = cleaned.replace(/^JIS\s*(.*)/i, "JIS $1");
    cleaned = cleaned.replace(/^GB\/T\s*(.*)/i, "GB/T $1");
    cleaned = cleaned.replace(/^GB\s*(.*)/i, "GB $1");

    results.push(cleaned);
  }

  return results.length > 0 ? results : null;
}
