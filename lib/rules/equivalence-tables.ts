export interface ProvenanceEquivalence {
  canonical: string;
  approvedEquivalents: string[];
  category: "material" | "standards" | "dimension" | "performance";
  source: string;
  note?: string;
}

const APPROVED_MATERIALS: ProvenanceEquivalence[] = [];
const APPROVED_STANDARDS: ProvenanceEquivalence[] = [];

export type EquivalenceResult = 
  | { status: "match" }
  | { status: "approved_equivalent"; provenance: ProvenanceEquivalence }
  | { status: "unknown" };

function findEquivalenceGroup(table: ProvenanceEquivalence[], value: string): ProvenanceEquivalence | null {
  const normalized = value.trim().toLowerCase();
  for (const entry of table) {
    const all = [entry.canonical, ...entry.approvedEquivalents].map((s) => s.toLowerCase());
    if (all.includes(normalized)) {
      return entry;
    }
  }
  return null;
}

export function areMaterialsEquivalent(a: string, b: string): EquivalenceResult {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return { status: "match" };
  const entry = findEquivalenceGroup(APPROVED_MATERIALS, a);
  if (entry && [entry.canonical, ...entry.approvedEquivalents].map((s) => s.toLowerCase()).includes(b.trim().toLowerCase())) {
    return { status: "approved_equivalent", provenance: entry };
  }
  return { status: "unknown" };
}

export function areStandardsEquivalent(a: string, b: string): EquivalenceResult {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return { status: "match" };
  const entry = findEquivalenceGroup(APPROVED_STANDARDS, a);
  if (entry && [entry.canonical, ...entry.approvedEquivalents].map((s) => s.toLowerCase()).includes(b.trim().toLowerCase())) {
    return { status: "approved_equivalent", provenance: entry };
  }
  return { status: "unknown" };
}

export function _addTestMaterialEquivalence(entry: ProvenanceEquivalence) {
  APPROVED_MATERIALS.push(entry);
}
export function _addTestStandardEquivalence(entry: ProvenanceEquivalence) {
  APPROVED_STANDARDS.push(entry);
}
export function _clearTestEquivalences() {
  APPROVED_MATERIALS.length = 0;
  APPROVED_STANDARDS.length = 0;
}