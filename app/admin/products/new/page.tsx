import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { uploadToR2, getPublicUrl } from "@/lib/r2";
import { uploadQueue, shouldQueueFile } from "@/lib/upload-queue";
import PriceCalculator from "@/components/PriceCalculator";
import { auth } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";
import { invalidateProducts, invalidateAdminProducts } from "@/lib/cache";

async function createProduct(formData: FormData) {
  "use server";

  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const title = formData.get("title") as string;
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const discountPct = parseInt((formData.get("discountPct") as string) || "0", 10);
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const thumbnailFile = formData.get("thumbnailFile") as File;
  const extractedThumbnail = formData.get("extractedThumbnail") as string;
  const language = (formData.get("language") as string) || "English";
  const pages = parseInt((formData.get("pages") as string) || "0", 10);
  const featured = formData.get("featured") === "on";
  const bestSeller = formData.get("bestSeller") === "on";
  const razorpayAccountId = (formData.get("razorpayAccountId") as string)?.trim();
  
  if (!razorpayAccountId) {
    throw new Error("Razorpay account is required");
  }
  
  const pdfFile = formData.get("pdf") as File;

  let pdfKey = pdfFile && pdfFile.size > 0
    ? `products/${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}-${Date.now()}.pdf`
    : `products/${slug}-${Date.now()}.pdf`;
  let finalThumbnailUrl = thumbnailUrl || "";

  // Upload thumbnail file if provided
  if (thumbnailFile && thumbnailFile.size > 0) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(thumbnailFile.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
    }
    // Validate file size (max 5MB)
    if (thumbnailFile.size > 5 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 5MB.");
    }
    const thumbnailKey = `products/thumbnails/${slug}-${Date.now()}.${thumbnailFile.name.split(".").pop()}`;
    try {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await uploadToR2(thumbnailKey, buffer, thumbnailFile.type);
      finalThumbnailUrl = getPublicUrl(thumbnailKey);
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
      throw new Error("Failed to upload thumbnail");
    }
  }

  // If no thumbnail provided, use extracted thumbnail from PDF first page
  if (!finalThumbnailUrl && extractedThumbnail && extractedThumbnail.startsWith("data:image")) {
    try {
      const base64Data = extractedThumbnail.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const thumbnailKey = `products/thumbnails/${slug}-${Date.now()}.jpeg`;
      await uploadToR2(thumbnailKey, buffer, "image/jpeg");
      finalThumbnailUrl = getPublicUrl(thumbnailKey);
    } catch (error) {
      console.error("Auto-extracted thumbnail upload failed:", error);
    }
  }

  // Try uploading PDF to R2; use queue for large files
  if (pdfFile && pdfFile.size > 0) {
    // Validate file type
    if (pdfFile.type !== "application/pdf") {
      throw new Error("Invalid file type. Only PDF files are allowed.");
    }
    // Validate file size (max 50MB)
    if (pdfFile.size > 50 * 1024 * 1024) {
      throw new Error("PDF file too large. Maximum size is 50MB.");
    }
    try {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());

      if (shouldQueueFile(pdfFile.size)) {
        await uploadQueue.addToQueue({
          id: crypto.randomUUID(),
          fileName: pdfFile.name,
          contentType: "application/pdf",
          fileSize: pdfFile.size,
          fileData: buffer,
          key: pdfKey,
        });
      } else {
        await uploadToR2(pdfKey, buffer, "application/pdf");
      }
    } catch (error) {
      console.error("PDF upload failed:", error);
      throw new Error("Failed to upload PDF");
    }
  }

  // Validate required fields before creating
  if (!finalThumbnailUrl) {
    throw new Error("Thumbnail is required. Please provide a thumbnail image URL or upload a thumbnail file.");
  }

  await db.product.create({
    data: {
      title,
      slug,
      description,
      categoryId,
      price,
      discountPct,
      thumbnailUrl: finalThumbnailUrl,
      pdfKey,
      language,
      pages,
      featured,
      bestSeller,
      razorpayAccountId,
      published: true,
    },
  });

  invalidateProducts();
  invalidateAdminProducts();
  redirect("/admin/products");
}

export default async function NewProductPage() {
  const categories = await db.category.findMany();
  const razorpayAccounts = await db.razorpayAccount.findMany({
    where: { isActive: true },
    select: { id: true, name: true, isActive: true, isDefault: true }
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Product</h1>
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-brand-500">
          ← Back to Products
        </Link>
      </div>
      <ProductForm categories={categories} razorpayAccounts={razorpayAccounts} action={createProduct} />
    </div>
  );
}
