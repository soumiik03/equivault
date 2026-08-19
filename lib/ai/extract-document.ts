import {
  getGeminiClient,
  GEMINI_PRIMARY_MODEL,
  GEMINI_FALLBACK_MODEL,
} from "@/lib/gemini";
import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/ai/extraction-prompt";
import { RawBearingSpecSchema } from "@/lib/validation/bearing-spec-schema";
import type { BearingSpec } from "@/lib/bearings/types";
import { normalizeBearingSpec } from "@/lib/normalization";

export type ExtractionResult = {
  spec: BearingSpec;
  rawResponse: string;
  attempts: number;
};

async function callGemini(
  model: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const client = getGeminiClient();
  const base64 = fileBuffer.toString("base64");

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: "Extract the bearing specification from this document." },
        ],
      },
    ],
    config: {
      systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }
  return text;
}

function parseAndValidate(raw: string): BearingSpec {
  const parsed = JSON.parse(raw);
  
  const fields = [
    "partNumber", "manufacturer", "bearingType", "innerDiameter", 
    "outerDiameter", "width", "material", "dynamicLoadRating", 
    "staticLoadRating", "maximumSpeed", "temperature", "clearance", 
    "sealType", "standards", "certifications"
  ];

  for (const field of fields) {
    if (parsed[field] === null || parsed[field] === undefined) {
      parsed[field] = { value: null, evidence: null };
    }
  }

  const result = RawBearingSpecSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  
  return normalizeBearingSpec(result.data);
}

export async function extractBearingSpec(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  let attempts = 0;

  // Attempt 1: Primary model — catch both API errors and validation failures
  attempts++;
  try {
    const primaryRaw = await callGemini(
      GEMINI_PRIMARY_MODEL,
      fileBuffer,
      mimeType
    );
    const spec = parseAndValidate(primaryRaw);
    return { spec, rawResponse: primaryRaw, attempts };
  } catch {
    // Primary model failed (API error or validation error) — fall through to fallback
  }

  // Attempt 2: Fallback model — errors here propagate to caller
  attempts++;
  const fallbackRaw = await callGemini(
    GEMINI_FALLBACK_MODEL,
    fileBuffer,
    mimeType
  );

  const spec = parseAndValidate(fallbackRaw);
  return { spec, rawResponse: fallbackRaw, attempts };
}
