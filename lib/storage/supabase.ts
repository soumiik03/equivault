import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export async function uploadDocument(
  file: Buffer,
  storagePath: string,
  contentType: string
): Promise<void> {
  const { error } = await getClient()
    .storage.from(env.supabaseStorageBucket)
    .upload(storagePath, file, { contentType, upsert: false });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
}

export async function downloadDocumentBuffer(
  storagePath: string
): Promise<Buffer> {
  const { data, error } = await getClient()
    .storage.from(env.supabaseStorageBucket)
    .download(storagePath);

  if (error) {
    throw new Error(`Storage download failed: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
