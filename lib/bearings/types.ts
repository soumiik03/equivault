import type { Evidence } from "@/lib/evidence/types";

export type BearingField<T> = {
  value: T | null;
  evidence: Evidence | null;
};

/**
 * Canonical bearing specification shared by all manufacturers.
 *
 * Canonical unit conventions (all numeric fields store plain numbers):
 *  - innerDiameter:     millimetres (mm)
 *  - outerDiameter:     millimetres (mm)
 *  - width:             millimetres (mm)
 *  - dynamicLoadRating: kilonewtons (kN)
 *  - staticLoadRating:  kilonewtons (kN)
 *  - maximumSpeed:      revolutions per minute (RPM)
 *  - temperature:       degrees Celsius (°C)
 *
 * Missing-data policy:
 *  - If an attribute is not explicitly documented in the source,
 *    its value MUST be null. Never guess, infer, or fill defaults.
 */
export type BearingSpec = {
  partNumber: BearingField<string>;
  manufacturer: BearingField<string>;
  bearingType: BearingField<string>;

  /** Inner diameter in mm */
  innerDiameter: BearingField<number>;
  /** Outer diameter in mm */
  outerDiameter: BearingField<number>;
  /** Width (axial height) in mm */
  width: BearingField<number>;

  material: BearingField<string>;

  /** Dynamic load rating in kN */
  dynamicLoadRating: BearingField<number>;
  /** Static load rating in kN */
  staticLoadRating: BearingField<number>;

  /** Maximum speed in RPM */
  maximumSpeed: BearingField<number>;
  /** Operating temperature in °C */
  temperature: BearingField<number>;

  clearance: BearingField<string>;
  sealType: BearingField<string>;

  standards: BearingField<string[]>;
  certifications: BearingField<string[]>;
};