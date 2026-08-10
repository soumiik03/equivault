const requiredServerVars = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "GEMINI_API_KEY",
] as const;

type EnvVar = (typeof requiredServerVars)[number];

function getEnvVar(name: EnvVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  for (const name of requiredServerVars) {
    getEnvVar(name);
  }
  validated = true;
}

export const env = {
  get databaseUrl() {
    return getEnvVar("DATABASE_URL");
  },
  get supabaseUrl() {
    return getEnvVar("SUPABASE_URL");
  },
  get supabaseSecretKey() {
    return getEnvVar("SUPABASE_SECRET_KEY");
  },
  get supabaseStorageBucket() {
    return getEnvVar("SUPABASE_STORAGE_BUCKET");
  },
  get geminiApiKey() {
    return getEnvVar("GEMINI_API_KEY");
  },
};
