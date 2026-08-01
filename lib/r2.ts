import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Use S3 SDK for both R2 and B2 (both are S3-compatible)
const useB2 = !!process.env.B2_ACCESS_KEY_ID;

const s3Client = new S3Client({
  region: useB2 ? process.env.B2_REGION || "us-east-005" : "auto",
  endpoint: useB2 ? process.env.B2_ENDPOINT : process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: useB2 ? process.env.B2_ACCESS_KEY_ID! : process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: useB2 ? process.env.B2_SECRET_ACCESS_KEY! : process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.B2_BUCKET || process.env.R2_BUCKET!;
const STORAGE_PUBLIC_URL = process.env.B2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "";

// Admin upload (PDF, thumbnail, preview images)
export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  await s3Client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return key;
}

// Short-lived signed URL, only ever generated server-side after payment is verified
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

// Get signed URL for thumbnails (longer expiry for display purposes)
export async function getSignedThumbnailUrl(key: string, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

// Fetch the raw object body as a Buffer (for watermarking before serving)
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];
  // @ts-expect-error - Body is a Readable stream in Node
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Export public URL for constructing direct links
export function getPublicUrl(key: string): string {
  return `${STORAGE_PUBLIC_URL}/${key}`;
}