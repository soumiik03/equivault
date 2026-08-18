import type { BearingSpec } from "@/lib/bearings/types";
import type { RuleResult } from "./types";

function compareMinimumRequirement(
  ruleId: string,
  label: string,
  unit: string,
  original: { value: number | null },
  replacement: { value: number | null }
): RuleResult {
  const base = { ruleId, label, tier: "gate" as const, category: "performance" as const };

  if (original.value == null || replacement.value == null) {
    return {
      ...base,
      severity: "UNVERIFIED",
      reason: `${label} missing on ${original.value == null ? "original" : "replacement"} — cannot verify replacement meets requirement.`,
      originalValue: original.value,
      replacementValue: replacement.value,
    };
  }

  if (replacement.value >= original.value) {
    return {
      ...base,
      severity: "PASS",
      reason: `${label} meets or exceeds original: ${original.value}${unit} → ${replacement.value}${unit}.`,
      originalValue: original.value,
      replacementValue: replacement.value,
    };
  }

  return {
    ...base,
    severity: "HARD_FAIL",
    reason: `${label} below original requirement: ${original.value}${unit} → ${replacement.value}${unit}. Replacement cannot safely handle the original's demands.`,
    originalValue: original.value,
    replacementValue: replacement.value,
  };
}

function compareTemperatureRange(
  original: { value: number | null },
  replacement: { value: number | null }
): RuleResult {
  const base = {
    ruleId: "perf_temperature",
    label: "Temperature",
    tier: "gate" as const,
    category: "performance" as const,
  };

  const origTemp = original.value;
  const replTemp = replacement.value;

  if (origTemp == null || replTemp == null) {
    return {
      ...base,
      severity: "UNVERIFIED",
      reason: "Max operating temperature missing on one part — cannot verify thermal safety.",
      originalValue: origTemp,
      replacementValue: replTemp,
    };
  }

  if (replTemp < origTemp) {
    return {
      ...base,
      severity: "HARD_FAIL",
      reason: `Max temperature below original: ${origTemp}°C → ${replTemp}°C. Replacement will fail under the original's thermal conditions.`,
      originalValue: origTemp,
      replacementValue: replTemp,
    };
  }

  return {
    ...base,
    severity: "PASS",
    reason: `Temperature capability meets or exceeds original requirements: ${origTemp}°C → ${replTemp}°C.`,
    originalValue: origTemp,
    replacementValue: replTemp,
  };
}

export function evaluatePerformanceRules(
  original: BearingSpec,
  replacement: BearingSpec
): RuleResult[] {
  return [
    compareMinimumRequirement("perf_dynamic_load", "Dynamic Load Rating", "kN", original.dynamicLoadRating, replacement.dynamicLoadRating),
    compareMinimumRequirement("perf_static_load", "Static Load Rating", "kN", original.staticLoadRating, replacement.staticLoadRating),
    compareMinimumRequirement("perf_max_speed", "Maximum Speed", "RPM", original.maximumSpeed, replacement.maximumSpeed),
    compareTemperatureRange(original.temperature, replacement.temperature),
  ];
}
