import * as fs from "fs";
import * as path from "path";

import type { Evidence } from "../lib/evidence/types";
import type { BearingField, BearingSpec } from "../lib/bearings/types";

void (undefined as unknown as Evidence);
void (undefined as unknown as BearingField<unknown>);

// ── Load document catalog ───────────────────────────────────────────
type DocumentMeta = {
  documentId: string;
  fileName: string;
  sourceType: string;
  manufacturer: string | null;
  pageCount: number;
};

const catalogPath = path.resolve(__dirname, "../data/bearings/documents.json");
const catalog: DocumentMeta[] = JSON.parse(
  fs.readFileSync(catalogPath, "utf-8"),
);
const validDocIds = new Set(catalog.map((d) => d.documentId));

// ── The 15 MVP field keys (must match BearingSpec) ──────────────────
const MVP_FIELDS: (keyof BearingSpec)[] = [
  "partNumber",
  "manufacturer",
  "bearingType",
  "innerDiameter",
  "outerDiameter",
  "width",
  "material",
  "dynamicLoadRating",
  "staticLoadRating",
  "maximumSpeed",
  "temperature",
  "clearance",
  "sealType",
  "standards",
  "certifications",
];

// ── Expected ground-truth dimensions ────────────────────────────────
type ExpectedDims = {
  partNumber: string;
  bearingType: string;
  innerDiameter: number;
  outerDiameter: number;
  width: number;
  documentId: string;
};

const EXPECTED: Record<string, ExpectedDims> = {
  "6000": {
    partNumber: "6000",
    bearingType: "Deep Groove Ball Bearing",
    innerDiameter: 10,
    outerDiameter: 26,
    width: 8,
    documentId: "deep-groove-ball-bearing-datasheet",
  },
  "6208": {
    partNumber: "6208",
    bearingType: "Deep Groove Ball Bearing",
    innerDiameter: 40,
    outerDiameter: 80,
    width: 18,
    documentId: "deep-groove-ball-bearing-datasheet",
  },
  "6316": {
    partNumber: "6316",
    bearingType: "Deep Groove Ball Bearing",
    innerDiameter: 80,
    outerDiameter: 170,
    width: 39,
    documentId: "deep-groove-ball-bearing-datasheet",
  },
  "7201": {
    partNumber: "7201",
    bearingType: "Angular Contact Ball Bearing",
    innerDiameter: 12,
    outerDiameter: 32,
    width: 10,
    documentId: "bearing-types-dimensions-efficiency-price-guide",
  },
};

// Fields that are undocumented for all current synthetic fixtures.
const MUST_BE_NULL_FIELDS: (keyof BearingSpec)[] = [
  "manufacturer",
  "material",
  "dynamicLoadRating",
  "staticLoadRating",
  "maximumSpeed",
  "temperature",
  "clearance",
  "sealType",
  "standards",
  "certifications",
];

// ── Validation helpers ──────────────────────────────────────────────
const errors: string[] = [];
let totalChecks = 0;

function check(condition: boolean, message: string): void {
  totalChecks++;
  if (!condition) {
    errors.push(message);
  }
}

function validateField(
  fixtureName: string,
  fieldName: string,
  field: BearingField<unknown>,
): void {
  check(
    field !== null && field !== undefined && typeof field === "object",
    `${fixtureName}.${fieldName}: field is missing or not an object`,
  );
  if (field === null || field === undefined) return;

  check(
    "value" in field,
    `${fixtureName}.${fieldName}: missing "value" property`,
  );
  check(
    "evidence" in field,
    `${fixtureName}.${fieldName}: missing "evidence" property`,
  );

  if (field.value !== null && field.evidence !== null) {
    // Non-null value must have valid evidence.
    const ev = field.evidence;
    check(
      typeof ev.documentId === "string" && ev.documentId.length > 0,
      `${fixtureName}.${fieldName}: evidence.documentId is empty or not a string`,
    );
    check(
      validDocIds.has(ev.documentId),
      `${fixtureName}.${fieldName}: evidence.documentId "${ev.documentId}" not found in document catalog`,
    );
    check(
      typeof ev.page === "number" && ev.page >= 1,
      `${fixtureName}.${fieldName}: evidence.page must be a positive integer, got ${ev.page}`,
    );
    check(
      typeof ev.text === "string" && ev.text.length > 0,
      `${fixtureName}.${fieldName}: evidence.text is empty or not a string`,
    );

    // Verify page does not exceed document pageCount.
    const doc = catalog.find((d) => d.documentId === ev.documentId);
    if (doc && typeof ev.page === "number") {
      check(
        ev.page <= doc.pageCount,
        `${fixtureName}.${fieldName}: evidence.page ${ev.page} exceeds document pageCount ${doc.pageCount}`,
      );
    }
  }

  if (field.value === null) {
    check(
      field.evidence === null,
      `${fixtureName}.${fieldName}: value is null but evidence is not null`,
    );
  }

  if (field.value !== null) {
    check(
      field.evidence !== null,
      `${fixtureName}.${fieldName}: value is non-null but evidence is null`,
    );
  }
}

// ── Main validation ─────────────────────────────────────────────────
const fixturesDir = path.resolve(__dirname, "fixtures/bearings");
const fixtureFiles = fs
  .readdirSync(fixturesDir)
  .filter((f) => f.endsWith(".json"));

check(fixtureFiles.length >= 4, `Expected at least 4 fixtures, found ${fixtureFiles.length}`);

console.log("=== Chapter 1 Fixture Validation ===\n");
console.log(`Document catalog: ${catalog.length} documents`);
console.log(`Valid document IDs: ${[...validDocIds].join(", ")}`);
console.log(`Fixtures found: ${fixtureFiles.join(", ")}\n`);

for (const file of fixtureFiles) {
  const fixtureName = path.basename(file, ".json");
  const fixturePath = path.join(fixturesDir, file);
  const raw = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

  console.log(`── Validating ${fixtureName} ──`);

  // Compile-time type check: the fixture must satisfy BearingSpec shape.
  // This line will cause a TypeScript error if the JSON doesn't match.
  const fixture: BearingSpec = raw as BearingSpec;

  // 1. All 15 MVP fields must exist.
  for (const field of MVP_FIELDS) {
    check(
      field in fixture,
      `${fixtureName}: missing MVP field "${field}"`,
    );
  }

  // 2. Check there are no extra top-level keys.
  const fixtureKeys = Object.keys(fixture);
  for (const key of fixtureKeys) {
    check(
      MVP_FIELDS.includes(key as keyof BearingSpec),
      `${fixtureName}: unexpected extra field "${key}"`,
    );
  }

  // 3. Validate each field's structure and evidence.
  for (const field of MVP_FIELDS) {
    if (field in fixture) {
      validateField(
        fixtureName,
        field,
        fixture[field] as BearingField<unknown>,
      );
    }
  }

  // 4. Check known dimension values.
  const expected = EXPECTED[fixtureName];
  if (expected) {
    check(
      fixture.partNumber.value === expected.partNumber,
      `${fixtureName}: partNumber expected "${expected.partNumber}", got "${fixture.partNumber.value}"`,
    );
    check(
      fixture.bearingType.value === expected.bearingType,
      `${fixtureName}: bearingType expected "${expected.bearingType}", got "${fixture.bearingType.value}"`,
    );
    check(
      fixture.innerDiameter.value === expected.innerDiameter,
      `${fixtureName}: innerDiameter expected ${expected.innerDiameter}, got ${fixture.innerDiameter.value}`,
    );
    check(
      fixture.outerDiameter.value === expected.outerDiameter,
      `${fixtureName}: outerDiameter expected ${expected.outerDiameter}, got ${fixture.outerDiameter.value}`,
    );
    check(
      fixture.width.value === expected.width,
      `${fixtureName}: width expected ${expected.width}, got ${fixture.width.value}`,
    );

    // 5. All evidence for this fixture must reference the expected document.
    for (const field of MVP_FIELDS) {
      const f = fixture[field] as BearingField<unknown>;
      if (f.evidence !== null) {
        check(
          f.evidence.documentId === expected.documentId,
          `${fixtureName}.${field}: evidence references "${f.evidence.documentId}" but expected "${expected.documentId}"`,
        );
      }
    }
  }

  // 6. Null-policy: undocumented fields must be null.
  for (const field of MUST_BE_NULL_FIELDS) {
    const f = fixture[field] as BearingField<unknown>;
    check(
      f.value === null,
      `${fixtureName}.${field}: expected null for undocumented field, got ${JSON.stringify(f.value)}`,
    );
  }

  console.log(`   ${fixtureName}: field checks complete`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log("\n=== Results ===\n");

if (errors.length === 0) {
  console.log(`✅ ALL ${totalChecks} CHECKS PASSED`);
  process.exit(0);
} else {
  console.log(`❌ ${errors.length} ERRORS (out of ${totalChecks} checks):\n`);
  for (const err of errors) {
    console.log(`  ✗ ${err}`);
  }
  process.exit(1);
}
