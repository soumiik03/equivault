import { z } from "zod";

const EvidenceSchema = z.object({
  page: z.number().nullable(),
  text: z.string().nullable(),
});

const field = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema.nullable(),
    evidence: EvidenceSchema.nullable(),
  });

const numericField = field(z.union([z.number(), z.string()]));
const stringField = field(z.union([z.string(), z.number()]).transform(v => String(v)));
const arrayField = field(z.union([z.array(z.string()), z.string()]).transform(v => Array.isArray(v) ? v : [v]));

export const RawBearingSpecSchema = z.object({
  partNumber: stringField,
  manufacturer: stringField,
  bearingType: stringField,
  innerDiameter: numericField,
  outerDiameter: numericField,
  width: numericField,
  material: stringField,
  dynamicLoadRating: numericField,
  staticLoadRating: numericField,
  maximumSpeed: numericField,
  temperature: numericField,
  clearance: stringField,
  sealType: stringField,
  standards: arrayField,
  certifications: arrayField,
});

export type ValidatedBearingSpec = z.infer<typeof RawBearingSpecSchema>;
