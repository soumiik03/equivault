export function normalizeMaterial(input: string | null): string | null {
  if (!input) return null;

  const raw = input.trim();
  const lower = raw.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (
    lower.includes("52100") ||
    lower.includes("100cr6") ||
    lower.includes("suj2") ||
    lower.includes("gcr15") ||
    lower.includes("chromesteel") ||
    lower.includes("bearingsteel")
  ) {
    return "52100 Chrome Steel";
  }

  if (
    lower.includes("stainless") ||
    lower.includes("sus") ||
    lower.includes("440c") ||
    lower.includes("316") ||
    lower.includes("304")
  ) {
    return "Stainless Steel";
  }

  if (
    lower.includes("ceramic") ||
    lower.includes("si3n4") ||
    lower.includes("siliconnitride")
  ) {
    return "Silicon Nitride";
  }

  return raw;
}
