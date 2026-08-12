export function parseUnitString(input: string | number | null): { value: number; unit: string } | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return { value: input, unit: "" };
  if (typeof input !== "string") return null;

  const trimmed = input.trim();
  const match = trimmed.match(/^([-+]?[0-9,]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*(.*)$/);
  if (!match) return null;

  const valueString = match[1].replace(/,/g, "");
  const value = parseFloat(valueString);
  if (isNaN(value)) return null;

  return { value, unit: match[2].trim().toLowerCase() };
}

export function normalizeDimension(input: string | number | null): number | null {
  const parsed = parseUnitString(input);
  if (!parsed) return null;

  const { value, unit } = parsed;
  if (!unit || unit === "mm") return value;
  if (unit === "cm") return value * 10;
  if (unit === "m") return value * 1000;
  if (unit === "in" || unit === "inch" || unit === "inches" || unit === '"') return value * 25.4;

  return null; // unsupported unit
}

export function normalizeTemperature(input: string | number | null): number | null {
  const parsed = parseUnitString(input);
  if (!parsed) return null;

  const { value, unit } = parsed;
  // °c, c
  if (!unit || unit === "c" || unit === "°c" || unit === "deg c") return value;
  // °f, f
  if (unit === "f" || unit === "°f" || unit === "deg f") return (value - 32) * (5 / 9);
  // k
  if (unit === "k" || unit === "kelvin") return value - 273.15;

  return null;
}

export function normalizeLoadRating(input: string | number | null): number | null {
  const parsed = parseUnitString(input);
  if (!parsed) return null;

  const { value, unit } = parsed;
  if (!unit || unit === "kn") return value;
  if (unit === "n") return value * 0.001;
  if (unit === "lbf" || unit === "lb") return value * 0.00444822;

  return null;
}

export function normalizeSpeed(input: string | number | null): number | null {
  const parsed = parseUnitString(input);
  if (!parsed) return null;

  const { value, unit } = parsed;
  if (!unit || unit === "rpm" || unit === "r/min" || unit === "rev/min" || unit === "1/min") {
    return value;
  }

  // Do NOT blindly convert generic Hz to RPM
  return null;
}
