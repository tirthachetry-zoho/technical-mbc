"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPct: number;
  thumbnailUrl: string;
  published: boolean;
  category: { name: string };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function togglePublish(id: string, published: boolean) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) fetchProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">
          + New Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-sm">No products yet. Create one or use CSV import.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-3">Product</th>
                <th className="px-3">Category</th>
                <th className="px-3">Price</th>
                <th className="px-3">Status</th>
                <th className="px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-gray-100 dark:bg-gray-700 rounded shrink-0 overflow-hidden">
                        {p.thumbnailUrl ? (
                          <Image
                            src={p.thumbnailUrl}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized={p.thumbnailUrl.includes(".svg") || p.thumbnailUrl.includes("placehold.co")}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">{p.category.name}</td>
                  <td className="px-3">
                    <span className="font-medium">₹{p.price / 100}</span>
                    {p.discountPct > 0 && (
                      <span className="text-xs text-red-500 ml-1">({p.discountPct}% off)</span>
                    )}
                  </td>
                  <td className="px-3">
                    <span className={`badge ${p.published ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-brand-500 hover:underline text-xs">
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublish(p.id, p.published)}
                        className="text-brand-500 hover:underline text-xs"
                      >
                        {p.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}