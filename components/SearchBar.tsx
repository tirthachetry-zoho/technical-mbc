"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced navigation: search 500ms after typing stops
  useEffect(() => {
    const q = query.trim();
    if (q === (params.get("search") || "")) return;
    const t = setTimeout(() => {
      if (q) {
        router.push(`/products?search=${encodeURIComponent(q)}`);
      } else if (params.get("search")) {
        router.push("/products");
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Keep input in sync if URL changes elsewhere
  useEffect(() => {
    setQuery(params.get("search") || "");
  }, [params]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/products?search=${encodeURIComponent(q)}`);
      inputRef.current?.blur();
    }
  }

  function clear() {
    setQuery("");
    if (params.get("search")) router.push("/products");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md w-full" role="search">
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes..."
        aria-label="Search notes"
        className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-9 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {query && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
}