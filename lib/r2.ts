import { createClient } from "@supabase/supabase-js";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Supabase Storage client (for uploads and public URLs)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "technical-mbc";

// Fallback S3 client for signed download URLs (Supabase Storage also supports S3 protocol)
// Supabase S3 endpoint: https://<project-ref>.supabase.co/storage/v1/s3
const s3Client = new S3Client({
  region: "local",
  endpoint: `${supabaseUrl}/storage/v1/s3`,
  credentials: {
    accessKeyId: supabaseServiceKey ? "service_role" : "",
    secretAccessKey: supabaseServiceKey,
  },
  forcePathStyle: true,
});

/**
 * Upload a file to Supabase Storage.
 * Returns the storage key (path within the bucket).
 */
export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, body, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed for ${key}: ${error.message}`);
  }

  return key;
}

/**
 * Get the public URL for a file in Supabase Storage.
 */
export function getPublicUrl(key: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Short-lived signed URL for downloads (only generated server-side after payment is verified).
 * Uses Supabase Storage's signed URL feature.
 */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Failed to create signed URL for ${key}: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Signed URL for thumbnails (longer expiry for display purposes).
 */
export async function getSignedThumbnailUrl(key: string, expiresInSeconds = 3600) {
  return getSignedDownloadUrl(key, expiresInSeconds);
}

/**
 * Fetch the raw object body as a Buffer (for watermarking before serving).
 */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(key);

  if (error || !data) {
    throw new Error(`Failed to download ${key} from Supabase Storage: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}