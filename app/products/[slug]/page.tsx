import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BuyButton from "@/components/BuyButton";
import WishlistButton from "@/components/WishlistButton";
import ReviewsSection from "@/components/ReviewsSection";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { cacheOrFetch } from "@/lib/cache";
import type { ProductWithReviews, ProductWithCategory } from "@/lib/cache-types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug, published: true },
  });
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle || `${product.title} — ToppersNotes`,
    description: product.seoDescription || product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const cacheKey = `product:detail:${slug}`;

  const product = await cacheOrFetch<ProductWithReviews | null>(cacheKey, () =>
    db.product.findUnique({
      where: { slug, published: true },
      include: {
        category: true,
        reviews: { where: { approved: true }, include: { user: { select: { name: true } } } },
      },
    })
  );

  if (!product) notFound();

  const finalPrice = Math.round(product.price * (1 - product.discountPct / 100)) / 100;
  const savings = (product.price / 100) - finalPrice;

  // Related products from same category
  const relatedCacheKey = `product:related:${product.categoryId}:${product.id}`;

  const related = await cacheOrFetch<ProductWithCategory[]>(relatedCacheKey, () =>
    db.product.findMany({
      where: { published: true, categoryId: product.categoryId, id: { not: product.id } },
      take: 4,
      include: { category: true },
    })
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.thumbnailUrl,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: finalPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-500">Home</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-500">{product.category.name}</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
            {product.thumbnailUrl ? (
              <Image
                src={product.thumbnailUrl}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.bestSeller && <span className="badge badge-bestseller">Bestseller</span>}
              {product.featured && <span className="badge badge-featured">Featured</span>}
              {product.discountPct > 0 && <span className="badge badge-discount">{product.discountPct}% OFF</span>}
            </div>
          </div>
          {product.previewImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.previewImages.slice(0, 4).map((img, i) => (
                <div key={i} className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image src={img} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="100px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <Link href={`/products?category=${product.category.slug}`} className="text-sm text-brand-500 font-medium">
              {product.category.name}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">₹{finalPrice}</span>
            {product.discountPct > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price / 100}</span>
                <span className="text-green-600 font-medium">Save ₹{savings.toFixed(0)}</span>
              </>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.description}</p>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Language</p>
              <p className="font-medium text-sm">{product.language}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
              <p className="font-medium text-sm">{product.pages}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">File Size</p>
              <p className="font-medium text-sm">{product.fileSizeMb} MB</p>
            </div>
          </div>

          {/* Buy + Wishlist */}
          <div className="flex gap-3">
            <BuyButton productId={product.id} price={finalPrice} title={product.title} />
            <WishlistButton productId={product.id} />
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-2">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instant Download
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Payment
            </span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection productId={product.id} />

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Related Notes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => (
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
    </div>
  );
}