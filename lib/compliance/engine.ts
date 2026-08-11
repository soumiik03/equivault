import type { BearingSpec } from "@/lib/bearings/types";
import type { ComplianceCheckResult, ComparisonComplianceResult } from "./types";

function checkRoHS(spec: BearingSpec): ComplianceCheckResult {
  const base = { checkId: "comp_rohs", label: "RoHS Compliance" };
  const certs = spec.certifications.value || [];
  const normalized = certs.map((c) => c.trim().toLowerCase());
  const evidence = spec.certifications.evidence;

  if (normalized.some((c) => c.includes("rohs exempt") || c.includes("rohs not applicable") || c.includes("non-rohs"))) {
    return {
      ...base,
      status: "NOT_APPLICABLE",
      reason: "Document explicitly states RoHS is not applicable.",
      evidence,
    };
  }

  if (normalized.some((c) => c.includes("rohs"))) {
    return {
      ...base,
      status: "PRESENT",
      reason: "Document explicitly contains RoHS compliance evidence.",
      evidence,
    };
  }

  return {
    ...base,
    status: "UNVERIFIED",
    reason: "Insufficient information to determine RoHS applicability or compliance status.",
    evidence: null,
  };
}

function checkREACH(spec: BearingSpec): ComplianceCheckResult {
  const base = { checkId: "comp_reach", label: "REACH/SVHC" };
  const certs = spec.certifications.value || [];
  const normalized = certs.map((c) => c.trim().toLowerCase());
  const evidence = spec.certifications.evidence;

  if (normalized.some((c) => c.includes("reach") || c.includes("svhc"))) {
    return {
      ...base,
      status: "PRESENT",
      reason: "Document explicitly contains REACH/SVHC compliance evidence.",
      evidence,
    };
  }

  return {
    ...base,
    status: "UNVERIFIED",
    reason: "Absence of REACH statement does not prove non-compliance. Status unverified.",
    evidence: null,
  };
}

function checkCE(spec: BearingSpec): ComplianceCheckResult {
  const base = { checkId: "comp_ce", label: "CE Marking" };
  const certs = spec.certifications.value || [];
  const normalized = certs.map((c) => c.trim().toLowerCase());
  const evidence = spec.certifications.evidence;

  if (normalized.some((c) => c === "ce" || c.includes("ce marked") || c.includes("ce certified"))) {
    return {
      ...base,
      status: "PRESENT",
      reason: "Document explicitly contains CE compliance evidence.",
      evidence,
    };
  }

  if (normalized.some((c) => c.includes("ce exempt") || c.includes("ce not applicable") || c.includes("non-ce"))) {
    return {
      ...base,
      status: "NOT_APPLICABLE",
      reason: "Product is explicitly stated to be outside relevant CE scope.",
      evidence,
    };
  }

  return {
    ...base,
    status: "UNVERIFIED",
    reason: "Applicability of CE cannot be established from the available information.",
    evidence: null,
  };
}

export function evaluateCompliance(spec: BearingSpec): ComplianceCheckResult[] {
  return [
    checkRoHS(spec),
    checkREACH(spec),
    checkCE(spec),
  ];
}

export function compareCompliance(
  original: BearingSpec,
  replacement: BearingSpec
): ComparisonComplianceResult {
  return {
    original: evaluateCompliance(original),
    replacement: evaluateCompliance(replacement),
  };
}
