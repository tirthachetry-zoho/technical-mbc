import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import SortDropdown from "@/components/SortDropdown";
import { cacheOrFetch } from "@/lib/cache";
import type { ProductWithCategory } from "@/lib/cache-types";
import Link from "next/link";

export const revalidate = 300; // Revalidate products listing every 5 minutes

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { search, category, sort, page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const itemsPerPage = 20;
  const skip = (currentPage - 1) * itemsPerPage;

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

  const cacheKey = `product:list:search=${search ?? ""}:cat=${category ?? ""}:sort=${sort ?? ""}:page=${currentPage}`;

  const [products, totalCount] = await Promise.all([
    cacheOrFetch(cacheKey, () =>
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
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          discountPct: true,
          thumbnailUrl: true,
          featured: true,
          bestSeller: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: orderBy as never,
        take: itemsPerPage,
        skip,
      })
    ),
    cacheOrFetch(`product:count:search=${search ?? ""}:cat=${category ?? ""}`, () =>
      db.product.count({
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
      }),
      10 * 60 * 1000 // 10 minutes TTL for count
    ),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const categories = await cacheOrFetch("category:all", () =>
    db.category.findMany({ orderBy: { name: "asc" } }),
    10 * 60 * 1000 // 10 minutes TTL for categories
  );
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {activeCategory ? activeCategory.name : search ? `Results for "${search}"` : "All Notes"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCount} {totalCount === 1 ? "product" : "products"} found
          </p>
        </div>
        <SortDropdown currentSort={sort || "latest"} />
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" aria-label="Filter by category">
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
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Link
                href={`/products?search=${search || ""}&category=${category || ""}&sort=${sort || ""}&page=${currentPage - 1}`}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
                aria-disabled={currentPage === 1}
              >
                Previous
              </Link>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={`/products?search=${search || ""}&category=${category || ""}&sort=${sort || ""}&page=${currentPage + 1}`}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
                aria-disabled={currentPage === totalPages}
              >
                Next
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}