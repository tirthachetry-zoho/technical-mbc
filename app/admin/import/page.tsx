import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// CSV format: title,description,categorySlug,price,discountPct,thumbnailUrl,language,pages,fileSizeMb,featured,bestSeller
async function importCSV(formData: FormData) {
  "use server";
  const file = formData.get("csv") as File;
  const text = await file.text();
  const lines = text.trim().split("\n");

  // Skip header row
  const dataLines = lines[0].toLowerCase().includes("title") ? lines.slice(1) : lines;

  let imported = 0;
  let errors: string[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const cols = parseCSVLine(dataLines[i]);
    if (cols.length < 6) {
      errors.push(`Row ${i + 2}: insufficient columns`);
      continue;
    }

    const [title, description, categorySlug, priceStr, discountStr, thumbnailUrl, language, pagesStr, fileSizeStr, featuredStr, bestSellerStr] = cols;

    const category = await db.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      errors.push(`Row ${i + 2}: category "${categorySlug}" not found`);
      continue;
    }

    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const price = Math.round(parseFloat(priceStr) * 100);
    const discountPct = parseInt(discountStr || "0", 10);

    try {
      await db.product.upsert({
        where: { slug },
        update: {
          description,
          categoryId: category.id,
          price,
          discountPct,
          thumbnailUrl,
          language: language || "English",
          pages: parseInt(pagesStr || "0", 10),
          fileSizeMb: parseFloat(fileSizeStr || "0"),
          featured: featuredStr?.toLowerCase() === "true",
          bestSeller: bestSellerStr?.toLowerCase() === "true",
          published: true,
        },
        create: {
          title,
          slug,
          description,
          categoryId: category.id,
          price,
          discountPct,
          thumbnailUrl,
          pdfKey: `products/${slug}.pdf`,
          language: language || "English",
          pages: parseInt(pagesStr || "0", 10),
          fileSizeMb: parseFloat(fileSizeStr || "0"),
          featured: featuredStr?.toLowerCase() === "true",
          bestSeller: bestSellerStr?.toLowerCase() === "true",
          published: true,
        },
      });
      imported++;
    } catch {
      errors.push(`Row ${i + 2}: failed to import "${title}"`);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/import");

  const result = `Imported ${imported} products.${errors.length > 0 ? " Errors: " + errors.join("; ") : ""}`;
  redirect(`/admin/import?result=${encodeURIComponent(result)}`);
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export default async function AdminImportPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const { result } = await searchParams;
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">CSV Import</h1>

      {result && (
        <div className="card p-4 bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800">
          <p className="text-sm">{result}</p>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Instructions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Upload a CSV file with the following columns (header row optional):
          </p>
          <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
            title,description,categorySlug,price,discountPct,thumbnailUrl,language,pages,fileSizeMb,featured,bestSeller
          </code>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Available category slugs:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                {c.slug}
              </span>
            ))}
          </div>
        </div>

        <form action={importCSV} className="space-y-3">
          <input name="csv" type="file" accept=".csv" required className="w-full" />
          <button className="btn-primary">Import Products</button>
        </form>

        <div>
          <p className="text-sm font-medium mb-1">Example CSV:</p>
          <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
            title,description,categorySlug,price,discountPct,thumbnailUrl,language,pages,fileSizeMb,featured,bestSeller{"\n"}
            SSC CGL Complete Notes,Complete study material for SSC CGL,ssc,299,20,https://placehold.co/400x560,English,200,12.5,true,true
          </code>
        </div>
      </div>
    </div>
  );
}