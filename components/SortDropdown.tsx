"use client";

import { useRouter } from "next/navigation";

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();

  function handleChange(value: string) {
    const url = new URL(window.location.href);
    if (value === "latest") url.searchParams.delete("sort");
    else url.searchParams.set("sort", value);
    router.push(url.toString());
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Sort:</span>
      <select
        defaultValue={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Sort products"
        className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition cursor-pointer"
      >
        <option value="latest">Latest</option>
        <option value="bestseller">Bestsellers</option>
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
}