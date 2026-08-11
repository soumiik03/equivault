// PLACEHOLDER — Ch 6 replaces this with a provenance-backed table (6.3: source/reference per entry).
// Keep the function signatures stable so material-rules.ts / standards-rules.ts never need to change.

interface EquivalenceEntry {
  canonical: string;
  approvedEquivalents: string[]; // exact strings considered interchangeable
  source?: string; // Ch 6.3 — where this equivalence claim comes from
}

const APPROVED_MATERIALS: EquivalenceEntry[] = [
  {
    canonical: "Chrome Steel",
    approvedEquivalents: ["AISI 52100", "SUJ2", "100Cr6"],
    source: "TODO: Ch 6 — add real provenance",
  },
  {
    canonical: "Stainless Steel 316",
    approvedEquivalents: ["SS316", "AISI 316", "X5CrNiMo17-12-2"],
    source: "TODO: Ch 6 — add real provenance",
  },
];

const APPROVED_STANDARDS: EquivalenceEntry[] = [
  {
    canonical: "ISO 15",
    approvedEquivalents: ["DIN 625", "ABMA 20"],
    source: "TODO: Ch 6 — add real provenance",
  },
];

function findEquivalenceGroup(table: EquivalenceEntry[], value: string): string[] | null {
  const normalized = value.trim().toLowerCase();
  for (const entry of table) {
    const all = [entry.canonical, ...entry.approvedEquivalents].map((s) => s.toLowerCase());
    if (all.includes(normalized)) {
      return [entry.canonical, ...entry.approvedEquivalents];
    }
  }
  return null; // unknown — rules must treat this as UNVERIFIED, not auto-pass
}

export function areMaterialsEquivalent(a: string, b: string): "match" | "provisional_equivalent" | "unknown" {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return "match";
  const group = findEquivalenceGroup(APPROVED_MATERIALS, a);
  if (group && group.map((s) => s.toLowerCase()).includes(b.trim().toLowerCase())) {
    return "provisional_equivalent";
  }
  return "unknown";
}

export function areStandardsEquivalent(a: string, b: string): "match" | "provisional_equivalent" | "unknown" {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return "match";
  const group = findEquivalenceGroup(APPROVED_STANDARDS, a);
  if (group && group.map((s) => s.toLowerCase()).includes(b.trim().toLowerCase())) {
    return "provisional_equivalent";
  }
  return "unknown";
}