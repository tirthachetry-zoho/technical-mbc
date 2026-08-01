import { db } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toppersnotes.digital";

  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { published: true }, select: { slug: true, createdAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.createdAt,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${baseUrl}/products?category=${c.slug}`,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    ...productUrls,
    ...categoryUrls,
  ];
}