"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type WishlistItem = {
  id: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discountPct: number;
    thumbnailUrl: string;
    category: { name: string };
  };
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/wishlist")
      .then(async (res) => {
        if (res.status === 401) {
          setError("Please login to view your wishlist.");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setItems(data);
      })
      .catch(() => setError("Failed to load wishlist"))
      .finally(() => setLoading(false));
  }, []);

  async function removeItem(productId: string) {
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
    setItems(items.filter((i) => i.product.id !== productId));
  }

  if (loading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading your wishlist…</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <Link href="/login" className="btn-primary inline-block">
          Login
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="text-brand-500 hover:underline inline-flex items-center gap-1"
          >
            Browse notes →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const p = item.product;
            const finalPrice = Math.round(p.price * (1 - p.discountPct / 100)) / 100;
            return (
              <div key={item.id} className="card group">
                <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <Link href={`/products/${p.slug}`}>
                    <Image
                      src={p.thumbnailUrl}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="300px"
                    />
                  </Link>
                  <button
                    onClick={() => removeItem(p.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow hover:bg-red-50 dark:hover:bg-red-900 transition"
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-brand-500 font-medium">{p.category.name}</p>
                  <Link href={`/products/${p.slug}`}>
                    <p className="font-medium text-sm line-clamp-2 hover:text-brand-500 transition">{p.title}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold">₹{finalPrice}</span>
                    {p.discountPct > 0 && (
                      <span className="text-xs text-gray-400 line-through">₹{p.price / 100}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
