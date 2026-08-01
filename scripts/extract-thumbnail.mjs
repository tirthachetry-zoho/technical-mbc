import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sharp from "sharp";
import { createCanvas, Image } from "canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const s3 = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || "005bb4c95662d310000000002",
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || "K0057x/QZpTSdW3766WzJaY3DVkd5wY",
  },
});

const BUCKET = "technical-mbc";

async function extractFirstPageAsImage(pdfPath, outputPath) {
  const pdfData = readFileSync(pdfPath);
  // Convert Buffer to Uint8Array for pdfjs-dist
  const uint8Array = new Uint8Array(pdfData);
  
  const pdf = await getDocument({ data: uint8Array }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  // Save as PNG first
  const pngBuffer = canvas.toBuffer("image/png");
  
  // Use sharp to convert to JPEG and resize
  const jpegBuffer = await sharp(pngBuffer)
    .resize(800, 1132, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
  
  writeFileSync(outputPath, jpegBuffer);
  
  return { path: outputPath, size: jpegBuffer.length };
}

async function uploadToB2(key, buffer, contentType) {
  console.log(`Uploading to B2: ${key}`);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  const url = `https://technical-mbc.s3.us-east-005.backblazeb2.com/${key}`;
  console.log(`✅ Uploaded: ${url}`);
  return url;
}

async function main() {
  const pdfPath = join(rootDir, "files/TechnicalMBC - IIBF Bank BC - BF Study Material 90+ marks Confirm..pdf");
  const outputPath = join(rootDir, "files/iibf-thumbnail-extracted.jpeg");

  console.log("Extracting first page from PDF...");
  const result = await extractFirstPageAsImage(pdfPath, outputPath);
  console.log(`Image size: ${(result.size / 1024).toFixed(2)} KB`);

  const imageBuffer = readFileSync(outputPath);
  const publicUrl = await uploadToB2(
    "products/thumbnails/iibf-thumbnail-extracted.jpeg",
    imageBuffer,
    "image/jpeg"
  );

  console.log("\n✅ Thumbnail extracted and uploaded!");
  console.log(`Public URL: ${publicUrl}`);
}

main().catch(console.error);