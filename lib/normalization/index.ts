import type { BearingSpec } from "@/lib/bearings/types";
import { normalizeDimension, normalizeTemperature, normalizeLoadRating, normalizeSpeed } from "./units";
import { normalizeMaterial } from "./materials";
import { normalizeStandards } from "./standards";
import { applySanityChecks } from "./sanity-checks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeBearingSpec(raw: any): BearingSpec {
  const norm: BearingSpec = {
    partNumber: { value: raw.partNumber?.value ?? null, evidence: raw.partNumber?.evidence ?? null },
    manufacturer: { value: raw.manufacturer?.value ?? null, evidence: raw.manufacturer?.evidence ?? null },
    bearingType: { value: raw.bearingType?.value ?? null, evidence: raw.bearingType?.evidence ?? null },
    innerDiameter: { value: normalizeDimension(raw.innerDiameter?.value), evidence: raw.innerDiameter?.evidence ?? null },
    outerDiameter: { value: normalizeDimension(raw.outerDiameter?.value), evidence: raw.outerDiameter?.evidence ?? null },
    width: { value: normalizeDimension(raw.width?.value), evidence: raw.width?.evidence ?? null },
    material: { value: normalizeMaterial(raw.material?.value), evidence: raw.material?.evidence ?? null },
    dynamicLoadRating: { value: normalizeLoadRating(raw.dynamicLoadRating?.value), evidence: raw.dynamicLoadRating?.evidence ?? null },
    staticLoadRating: { value: normalizeLoadRating(raw.staticLoadRating?.value), evidence: raw.staticLoadRating?.evidence ?? null },
    maximumSpeed: { value: normalizeSpeed(raw.maximumSpeed?.value), evidence: raw.maximumSpeed?.evidence ?? null },
    temperature: { value: normalizeTemperature(raw.temperature?.value), evidence: raw.temperature?.evidence ?? null },
    clearance: { value: raw.clearance?.value ?? null, evidence: raw.clearance?.evidence ?? null },
    sealType: { value: raw.sealType?.value ?? null, evidence: raw.sealType?.evidence ?? null },
    standards: { value: normalizeStandards(raw.standards?.value) ?? null, evidence: raw.standards?.evidence ?? null },
    certifications: { value: raw.certifications?.value ?? null, evidence: raw.certifications?.evidence ?? null },
  };

  return applySanityChecks(norm);
}
