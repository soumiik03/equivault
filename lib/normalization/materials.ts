export function normalizeMaterial(input: string | null): string | null {
  if (!input) return null;

  const raw = input.trim();
  const lower = raw.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 52100 / 100Cr6 / Chrome Steel
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

  // Stainless
  if (
    lower.includes("stainless") ||
    lower.includes("sus") ||
    lower.includes("440c") ||
    lower.includes("316") ||
    lower.includes("304")
  ) {
    return "Stainless Steel";
  }

  // Ceramic / Silicon Nitride
  if (
    lower.includes("ceramic") ||
    lower.includes("si3n4") ||
    lower.includes("siliconnitride")
  ) {
    return "Silicon Nitride";
  }

  // If we can't map it to an explicitly supported material, we return null as per:
  // "Do not over-normalize or guess."
  // Wait, if it's unrelated or unsupported, should it be null?
  // User: "Do not incorrectly map unrelated materials such as: Stainless 316, Ceramic, Silicon Nitride" to 52100.
  // User: "malformed or unsupported unit -> null"
  // For material: "Implement deterministic alias mapping only for explicitly supported materials. Do not over-normalize or guess."
  // If it's a completely unknown string, we can return null, but wait, returning null means we erase it. The user said: "missing information tracking: maintain fields that could not be extracted". But if a field is extracted but fails normalization, we must set value to null (as with malformed numeric values).
  // Let's just return the raw material if it is reasonably short, but wait... "Implement deterministic alias mapping only for explicitly supported materials". Let's assume these 3 are the only supported for now, or just return raw if no mapping found?
  // Wait, the instructions say "Implement deterministic alias mapping only for explicitly supported materials. Do not over-normalize or guess."
  // I will just return the raw value if it doesn't match an alias? No, the requirement says "normalize recognized standard representations". For materials it says "Implement deterministic alias mapping only for explicitly supported materials."
  
  // Actually, if we just return raw for unmatched, we aren't "over-normalizing".
  return raw;
}
