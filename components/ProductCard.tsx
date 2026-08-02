import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPct: number;
  thumbnailUrl: string;
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
};

export default function ProductCard({
  title,
  slug,
  price,
  discountPct,
  thumbnailUrl,
  category,
  featured,
  bestSeller,
}: ProductCardProps) {
  const finalPrice = Math.round(price * (1 - discountPct / 100)) / 100;

  return (
    <Link href={`/products/${slug}`} className="card group">
      <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {bestSeller && <span className="badge badge-bestseller">Bestseller</span>}
          {featured && <span className="badge badge-featured">Featured</span>}
          {discountPct > 0 && <span className="badge badge-discount">{discountPct}% OFF</span>}
        </div>
      </div>
      <div className="p-3">
        {category && <p className="text-xs text-brand-500 font-medium mb-0.5">{category}</p>}
        <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{title}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-base">₹{finalPrice}</span>
          {discountPct > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{price / 100}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
