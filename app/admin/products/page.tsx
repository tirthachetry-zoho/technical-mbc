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
  razorpayAccount?: {
    id: string;
    name: string;
    isDefault: boolean;
  };
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
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">
          + New Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-1">No products yet.</p>
          <p className="text-sm">Create one or use CSV import.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Product</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Category</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Price</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Razorpay Account</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Status</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">{p.slug}</p>
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
                    {p.razorpayAccount ? (
                      <span className="text-xs">
                        {p.razorpayAccount.name}
                        {p.razorpayAccount.isDefault && (
                          <span className="ml-1 text-blue-500">(Default)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Default</span>
                    )}
                  </td>
                  <td className="px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-brand-500 hover:text-brand-600 text-xs font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublish(p.id, p.published)}
                        className="text-brand-500 hover:text-brand-600 text-xs font-medium"
                      >
                        {p.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
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
