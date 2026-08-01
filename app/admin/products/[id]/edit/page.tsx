import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { uploadToR2, getPublicUrl } from "@/lib/r2";
import { uploadQueue, shouldQueueFile } from "@/lib/upload-queue";
import { revalidatePath } from "next/cache";
import EditProductForm from "@/components/EditProductForm";
import { invalidateProducts } from "@/lib/cache";

async function updateProduct(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = Math.round(parseFloat(formData.get("price") as string) * 100);
  const discountPct = parseInt((formData.get("discountPct") as string) || "0", 10);
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const thumbnailFile = formData.get("thumbnailFile") as File;
  const extractedThumbnail = formData.get("extractedThumbnail") as string;
  const language = (formData.get("language") as string) || "English";
  const pages = parseInt((formData.get("pages") as string) || "0", 10);
  const fileSizeMb = parseFloat((formData.get("fileSizeMb") as string) || "0");
  const featured = formData.get("featured") === "on";
  const bestSeller = formData.get("bestSeller") === "on";
  const published = formData.get("published") === "on";
  const pdfFile = formData.get("pdf") as File;

  let finalThumbnailUrl = thumbnailUrl || "";
  let pdfKey = formData.get("existingPdfKey") as string;

  // Upload thumbnail file if provided
  if (thumbnailFile && thumbnailFile.size > 0) {
    const thumbnailKey = `products/thumbnails/${slug}-${Date.now()}.${thumbnailFile.name.split('.').pop()}`;
    try {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await uploadToR2(thumbnailKey, buffer, thumbnailFile.type);
      finalThumbnailUrl = getPublicUrl(thumbnailKey);
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
    }
  }
  
  // If no thumbnail provided and new PDF uploaded, use extracted thumbnail from PDF first page
  if (!finalThumbnailUrl && extractedThumbnail && extractedThumbnail.startsWith("data:image")) {
    try {
      const base64Data = extractedThumbnail.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const thumbnailKey = `products/thumbnails/${slug}-${Date.now()}.jpeg`;
      await uploadToR2(thumbnailKey, buffer, "image/jpeg");
      finalThumbnailUrl = getPublicUrl(thumbnailKey);
      console.log("Auto-extracted thumbnail from PDF first page uploaded");
    } catch (error) {
      console.error("Auto-extracted thumbnail upload failed:", error);
    }
  }
  
  // If still no thumbnail, keep existing one
  if (!finalThumbnailUrl) {
    finalThumbnailUrl = (await db.product.findUnique({ where: { id } }))?.thumbnailUrl || "";
  }

  // Upload PDF if provided
  if (pdfFile && pdfFile.size > 0) {
    pdfKey = `products/${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}-${Date.now()}.pdf`;
    try {
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      
      if (shouldQueueFile(pdfFile.size)) {
        // Queue large file upload
        await uploadQueue.addToQueue({
          id: crypto.randomUUID(),
          fileName: pdfFile.name,
          contentType: "application/pdf",
          fileSize: pdfFile.size,
          fileData: buffer,
          key: pdfKey,
        });
        console.log(`Large file queued for upload: ${pdfFile.name} (${(pdfFile.size / 1024 / 1024).toFixed(2)}MB)`);
      } else {
        // Upload small files immediately
        await uploadToR2(pdfKey, buffer, "application/pdf");
      }
    } catch (error) {
      console.error("PDF upload failed:", error);
      throw new Error(`Failed to upload PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  await db.product.update({
    where: { id },
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
      fileSizeMb,
      featured,
      bestSeller,
      published,
    },
  });

  invalidateProducts();
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  redirect("/admin/products");
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    return <div className="text-red-600">Product not found</div>;
  }

  const categories = await db.category.findMany();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-4">Edit Product</h1>
      <EditProductForm 
        product={product} 
        categories={categories} 
        action={updateProduct} 
      />
    </div>
  );
}