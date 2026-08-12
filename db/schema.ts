import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { jsonb, integer } from "drizzle-orm/pg-core";
export const partRoleEnum = pgEnum("part_role", ["original", "replacement"]);

export const comparisonStatusEnum = pgEnum("comparison_status", [
  "UPLOADED",
  "PROCESSING",
  "EXTRACTED",
  "VALIDATED",
  "COMPARED",
  "COMPLETED",
  "FAILED",
]);

export const partComparisons = pgTable("part_comparisons", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: comparisonStatusEnum("status").notNull().default("UPLOADED"),
  failureReason: text("failure_reason"),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  comparisonId: uuid("comparison_id")
    .notNull()
    .references(() => partComparisons.id, { onDelete: "cascade" }),
  partRole: partRoleEnum("part_role").notNull(),
  filename: text("filename").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: text("file_size_bytes").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const extractions = pgTable("extractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  rawResponse: text("raw_response").notNull(),
  validatedSpec: jsonb("validated_spec").notNull(),
  attempts: integer("attempts").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
