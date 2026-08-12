import { getGeminiClient, GEMINI_PRIMARY_MODEL } from "@/lib/gemini";
import type { AggregatedResults, CriticalReason } from "./types";

const EXPLANATION_SYSTEM_PROMPT = `You are writing a short, plain-English explanation of an engineering compatibility result for a procurement/engineering audience.

STRICT RULES:
1. You may ONLY use facts, numbers, and reasons given to you in the JSON input below. Do not introduce any specification, number, standard, or fact that is not present in that JSON.
2. Do not perform any new engineering judgment — the verdict and every rule result is already final. Your only job is to phrase the existing results as clear prose.
3. Do not soften, hedge, or contradict a HARD_FAIL or UNVERIFIED result. State it plainly.
4. Keep it to 2-4 sentences. Lead with the most critical issue if one exists.
5. Return plain text only. No markdown, no JSON, no commentary about these instructions.`;

function extractNumbers(text: string): string[] {
  return text.match(/-?\d+(\.\d+)?/g) ?? [];
}

function factsAsText(aggregated: AggregatedResults, criticalReason: CriticalReason | null): string {
  return JSON.stringify(
    {
      criticalReason,
      engineeringResults: aggregated.engineering.map((r) => ({
        label: r.label,
        severity: r.severity,
        reason: r.reason,
        original: r.originalValue,
        replacement: r.replacementValue,
      })),
      // Compliance intentionally omitted from the narrative explanation — 7.7 keeps it
      // a separate section in the UI, so it shouldn't blend into the engineering summary.
    },
    null,
    2
  );
}

export async function generateExplanation(
  aggregated: AggregatedResults,
  criticalReason: CriticalReason | null
): Promise<string> {
  const facts = factsAsText(aggregated, criticalReason);
  const allowedNumbers = new Set(extractNumbers(facts));

  const MAX_ATTEMPTS = 2;
  const client = getGeminiClient();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const prompt =
      attempt === 1
        ? `${EXPLANATION_SYSTEM_PROMPT}\n\nInput facts:\n${facts}`
        : `${EXPLANATION_SYSTEM_PROMPT}\n\nInput facts:\n${facts}\n\nYour previous response included a number not present in the input facts. Rewrite using ONLY numbers that appear in the input JSON above.`;

    const response = await client.models.generateContent({
      model: GEMINI_PRIMARY_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0 },
    });

    const text = (response.text ?? "").trim();

    const usedNumbers = extractNumbers(text);
    const hasInventedNumber = usedNumbers.some((n) => !allowedNumbers.has(n));

    if (!hasInventedNumber) {
      return text;
    }
    // else retry with correction prompt
  }

  // Fallback: if the model still can't stay grounded, don't ship a possibly-hallucinated
  // sentence — fall back to a deterministic, template-built explanation instead.
  return buildFallbackExplanation(criticalReason);
}

function buildFallbackExplanation(criticalReason: CriticalReason | null): string {
  if (!criticalReason) {
    return "No critical engineering issues were identified. Review the full rule breakdown below.";
  }
  return `${criticalReason.label}: ${criticalReason.reason}`;
}
