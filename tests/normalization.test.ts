import assert from "assert";
import {
  normalizeDimension,
  normalizeTemperature,
  normalizeLoadRating,
  normalizeSpeed,
} from "@/lib/normalization/units";
import { normalizeMaterial } from "@/lib/normalization/materials";
import { normalizeStandards } from "@/lib/normalization/standards";
import { applySanityChecks } from "@/lib/normalization/sanity-checks";
import type { BearingSpec } from "@/lib/bearings/types";

function runTests() {
  let passed = 0;
  let failed = 0;

  function run(name: string, fn: () => void) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err: unknown) {
      console.error(`❌ ${name}`);
      console.error(`   ${(err as Error).message}`);
      failed++;
    }
  }

  run("Dimensions: 0.5 in -> 12.7 mm", () => {
    assert.strictEqual(normalizeDimension("0.5 in"), 12.7);
  });
  run("Dimensions: 25.4 mm -> 25.4 mm", () => {
    assert.strictEqual(normalizeDimension("25.4 mm"), 25.4);
  });
  run("Dimensions: 2.54 cm -> 25.4 mm", () => {
    assert.strictEqual(normalizeDimension("2.54 cm"), 25.4);
  });

  run("Temperature: 212 °F -> 100 °C", () => {
    assert.strictEqual(normalizeTemperature("212 °F"), 100);
  });
  run("Temperature: 248 °F -> 120 °C", () => {
    assert.strictEqual(normalizeTemperature("248 °F"), 120);
  });
  run("Temperature: 373.15 K -> 100 °C", () => {
    const res = normalizeTemperature("373.15 K");
    assert(res !== null && Math.abs(res - 100) < 0.0001, `Got ${res}`);
  });

  run("Loads: 12.5 kN -> 12.5 kN", () => {
    assert.strictEqual(normalizeLoadRating("12.5 kN"), 12.5);
  });
  run("Loads: 12500 N -> 12.5 kN", () => {
    assert.strictEqual(normalizeLoadRating("12500 N"), 12.5);
  });
  run("Loads: 5,050 N -> 5.05 kN", () => {
    assert.strictEqual(normalizeLoadRating("5,050 N"), 5.05);
  });
  run("Loads: 1,970 N -> 1.97 kN", () => {
    assert.strictEqual(normalizeLoadRating("1,970 N"), 1.97);
  });

  run("Speed: 18000 rpm -> 18000 RPM", () => {
    assert.strictEqual(normalizeSpeed("18000 rpm"), 18000);
  });
  run("Speed: 18000 r/min -> 18000 RPM", () => {
    assert.strictEqual(normalizeSpeed("18000 r/min"), 18000);
  });
  run("Speed: 30,000 r/min -> 30000 RPM", () => {
    assert.strictEqual(normalizeSpeed("30,000 r/min"), 30000);
  });

  run("Malformed input -> null", () => {
    assert.strictEqual(normalizeDimension("not a number"), null);
  });
  run("Unsupported unit -> null", () => {
    assert.strictEqual(normalizeDimension("100 lightyears"), null);
  });

  run("Material: 52100 mapping", () => {
    assert.strictEqual(normalizeMaterial("52100"), "52100 Chrome Steel");
  });
  run("Material: 100Cr6 mapping", () => {
    assert.strictEqual(normalizeMaterial("100Cr6"), "52100 Chrome Steel");
  });
  run("Material: SUJ2 mapping", () => {
    assert.strictEqual(normalizeMaterial("SUJ2"), "52100 Chrome Steel");
  });
  run("Material: unrelated material not incorrectly mapped", () => {
    assert.strictEqual(normalizeMaterial("Titanium Alloy Ti-6Al-4V"), "Titanium Alloy Ti-6Al-4V");
  });

  run("Standards: formatting normalization", () => {
    assert.deepStrictEqual(normalizeStandards(["iso    15", "din625"]), ["ISO 15", "DIN 625"]);
  });

  // --- Sanity Checks & Evidence Tests ---
  const makeSpec = (values: Partial<{
    innerDiameter: number | null;
    outerDiameter: number | null;
    width: number | null;
    dynamicLoadRating: number | null;
    staticLoadRating: number | null;
    maximumSpeed: number | null;
  }>): BearingSpec => {
    const defaultField = { value: null, evidence: { documentId: "doc", page: 1, text: "ev" } };
    return {
      partNumber: { ...defaultField },
      manufacturer: { ...defaultField },
      bearingType: { ...defaultField },
      innerDiameter: { value: values.innerDiameter ?? null, evidence: { documentId: "doc", page: 1, text: "ev" } },
      outerDiameter: { value: values.outerDiameter ?? null, evidence: { documentId: "doc", page: 1, text: "ev" } },
      width: { value: values.width ?? null, evidence: { documentId: "doc", page: 1, text: "ev" } },
      material: { ...defaultField },
      dynamicLoadRating: { value: values.dynamicLoadRating ?? null, evidence: { documentId: "doc", page: 1, text: "ev" } },
      staticLoadRating: { value: values.staticLoadRating ?? null, evidence: { documentId: "doc", page: 1, text: "ev" } },
      maximumSpeed: { value: values.maximumSpeed ?? null, evidence: { documentId: "doc", page: 1, text: "ev" } },
      temperature: { ...defaultField },
      clearance: { ...defaultField },
      sealType: { ...defaultField },
      standards: { ...defaultField },
      certifications: { ...defaultField },
    };
  };

  run("Sanity: innerDiameter <= 0 rejected", () => {
    const spec = makeSpec({ innerDiameter: 0 });
    const res = applySanityChecks(spec);
    assert.strictEqual(res.innerDiameter.value, null);
    assert.strictEqual(res.innerDiameter.evidence?.text, "ev");
  });

  run("Sanity: outerDiameter <= innerDiameter detected", () => {
    const spec = makeSpec({ innerDiameter: 50, outerDiameter: 40 });
    const res = applySanityChecks(spec);
    assert.strictEqual(res.outerDiameter.value, null);
    assert.strictEqual(res.outerDiameter.evidence?.text, "ev");
  });

  run("Sanity: width <= 0 rejected", () => {
    const spec = makeSpec({ width: -5 });
    const res = applySanityChecks(spec);
    assert.strictEqual(res.width.value, null);
  });

  run("Sanity: negative load rejected", () => {
    const spec = makeSpec({ dynamicLoadRating: -100 });
    const res = applySanityChecks(spec);
    assert.strictEqual(res.dynamicLoadRating.value, null);
  });

  run("Sanity: negative speed rejected", () => {
    const spec = makeSpec({ maximumSpeed: -10 });
    const res = applySanityChecks(spec);
    assert.strictEqual(res.maximumSpeed.value, null);
  });

  run("Sanity: null remains null", () => {
    const spec = makeSpec({ maximumSpeed: null });
    const res = applySanityChecks(spec);
    assert.strictEqual(res.maximumSpeed.value, null);
    assert.strictEqual(res.maximumSpeed.evidence?.text, "ev");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
