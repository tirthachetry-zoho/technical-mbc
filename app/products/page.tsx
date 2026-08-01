import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import SortDropdown from "@/components/SortDropdown";
import { cacheOrFetch } from "@/lib/cache";
import type { ProductWithCategory } from "@/lib/cache-types";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
  const { search, category, sort } = await searchParams;

  const orderBy: Record<string, string> =
    sort === "bestseller"
      ? { bestSeller: "desc" }
      : sort === "featured"
      ? { featured: "desc" }
      : sort === "price-low"
      ? { price: "asc" }
      : sort === "price-high"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const cacheKey = `product:list:search=${search ?? ""}:cat=${category ?? ""}:sort=${sort ?? ""}`;

  const products = await cacheOrFetch<ProductWithCategory[]>(cacheKey, () =>
    db.product.findMany({
      where: {
        published: true,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(category && { category: { slug: category } }),
      },
      include: { category: true },
      orderBy: orderBy as never,
    })
  );

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {activeCategory ? activeCategory.name : search ? `Results for "${search}"` : "All Notes"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        </div>
        <SortDropdown currentSort={sort || "latest"} />
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <a
          href="/products"
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
            !category
              ? "bg-brand-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-brand-100 dark:hover:bg-brand-900"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/products?category=${c.slug}${search ? `&search=${search}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
              category === c.slug
                ? "bg-brand-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-brand-100 dark:hover:bg-brand-900"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* Products grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              price={p.price}
              discountPct={p.discountPct}
              thumbnailUrl={p.thumbnailUrl}
              category={p.category.name}
              featured={p.featured}
              bestSeller={p.bestSeller}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}