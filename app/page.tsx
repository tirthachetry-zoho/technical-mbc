import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { cacheOrFetch } from "@/lib/cache";

export default async function HomePage() {
  const [products, featured, bestSellers, categories] = await Promise.all([
    cacheOrFetch("product:home:latest", () =>
      db.product.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { category: true },
      })
    ),
    cacheOrFetch("product:home:featured", () =>
      db.product.findMany({
        where: { published: true, featured: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { category: true },
      })
    ),
    cacheOrFetch("product:home:bestsellers", () =>
      db.product.findMany({
        where: { published: true, bestSeller: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { category: true },
      })
    ),
    cacheOrFetch("product:home:categories", () =>
      db.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: { where: { published: true } } } } },
      })
    ),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative px-6 py-16 md:py-24 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Ace your exam with premium notes
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-8">
            Curated PDF study material for RRB, SSC, Banking, UPSC, State PSC & more.
            Instant download after payment.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/products" className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition">
              Browse All Notes
            </Link>
            <Link href="/products?sort=bestseller" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-600 transition">
              Bestsellers
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="card p-4 text-center hover:border-brand-500 transition"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c._count.products} notes</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">⭐ Featured Notes</h2>
            <Link href="/products?sort=featured" className="text-sm text-brand-500 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((p) => (
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
        </section>
      )}

      {/* Bestsellers */}
      {bestSellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🔥 Bestsellers</h2>
            <Link href="/products?sort=bestseller" className="text-sm text-brand-500 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bestSellers.map((p) => (
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
        </section>
      )}

      {/* Latest */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📚 Latest Notes</h2>
          <Link href="/products" className="text-sm text-brand-500 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No products yet.</p>
            <p className="text-sm mt-1">Run the seed script or add one in /admin/products.</p>
          </div>
        )}
      </section>

      {/* Trust badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "⚡", title: "Instant Download", desc: "Get your PDFs immediately after payment" },
          { icon: "🔒", title: "Secure Payment", desc: "Razorpay-protected transactions" },
          { icon: "📱", title: "Access Anywhere", desc: "Download on any device, anytime" },
          { icon: "✅", title: "Quality Content", desc: "Curated by exam toppers & experts" },
        ].map((b) => (
          <div key={b.title} className="card p-4 text-center">
            <p className="text-3xl mb-2">{b.icon}</p>
            <p className="font-semibold text-sm">{b.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{b.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}