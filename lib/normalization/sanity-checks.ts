import type { BearingSpec } from "@/lib/bearings/types";

export function applySanityChecks(spec: BearingSpec): BearingSpec {
  if (spec.innerDiameter.value !== null && spec.innerDiameter.value <= 0) {
    spec.innerDiameter.value = null;
  }

  if (spec.outerDiameter.value !== null && spec.outerDiameter.value <= 0) {
    spec.outerDiameter.value = null;
  }

  if (
    spec.innerDiameter.value !== null &&
    spec.outerDiameter.value !== null &&
    spec.outerDiameter.value <= spec.innerDiameter.value
  ) {
    spec.outerDiameter.value = null;
  }

  if (spec.width.value !== null && spec.width.value <= 0) {
    spec.width.value = null;
  }

  if (spec.dynamicLoadRating.value !== null && spec.dynamicLoadRating.value < 0) {
    spec.dynamicLoadRating.value = null;
  }

  if (spec.staticLoadRating.value !== null && spec.staticLoadRating.value < 0) {
    spec.staticLoadRating.value = null;
  }

  if (spec.maximumSpeed.value !== null && spec.maximumSpeed.value < 0) {
    spec.maximumSpeed.value = null;
  }

  return spec;
}
