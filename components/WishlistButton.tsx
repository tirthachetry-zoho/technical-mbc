"use client";

import { useState } from "react";

export default function WishlistButton({ productId }: { productId: string }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (inWishlist) {
        await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        setInWishlist(false);
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) setInWishlist(true);
        else if (res.status === 401) {
          window.location.href = "/login";
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label="Toggle wishlist"
      className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-red-400 hover:text-red-500 transition disabled:opacity-50"
    >
      <svg
        className="w-5 h-5"
        fill={inWishlist ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        style={{ color: inWishlist ? "#ef4444" : undefined }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}