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

export const BearingSpecSchema = z.object({
  partNumber: field(z.string()),
  manufacturer: field(z.string()),
  bearingType: field(z.string()),
  innerDiameter: field(z.number()),
  outerDiameter: field(z.number()),
  width: field(z.number()),
  material: field(z.string()),
  dynamicLoadRating: field(z.number()),
  staticLoadRating: field(z.number()),
  maximumSpeed: field(z.number()),
  temperature: field(z.number()),
  clearance: field(z.string()),
  sealType: field(z.string()),
  standards: field(z.array(z.string())),
  certifications: field(z.array(z.string())),
});

export type ValidatedBearingSpec = z.infer<typeof BearingSpecSchema>;
