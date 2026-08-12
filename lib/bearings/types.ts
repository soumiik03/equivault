import type { Evidence } from "@/lib/evidence/types";

export type BearingField<T> = {
  value: T | null;
  evidence: Evidence | null;
};

export type BearingSpec = {
  partNumber: BearingField<string>;
  manufacturer: BearingField<string>;
  bearingType: BearingField<string>;

  innerDiameter: BearingField<number>;
  outerDiameter: BearingField<number>;
  width: BearingField<number>;

  material: BearingField<string>;

  dynamicLoadRating: BearingField<number>;
  staticLoadRating: BearingField<number>;

  maximumSpeed: BearingField<number>;
  temperature: BearingField<number>;

  clearance: BearingField<string>;
  sealType: BearingField<string>;

  standards: BearingField<string[]>;
  certifications: BearingField<string[]>;
};