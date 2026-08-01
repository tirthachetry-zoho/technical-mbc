"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: string;
  price: number;
  product: { title: string; slug: string };
};

type Order = {
  id: string;
  orderNumber: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  user: { name: string | null; email: string } | null;
  coupon: { code: string } | null;
  items: OrderItem[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  async function fetchOrders(page: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(1);
  }, []);

  function getCustomerName(order: Order) {
    if (order.user?.name) return order.user.name;
    if (order.guestName) return order.guestName;
    return "—";
  }

  function getCustomerEmail(order: Order) {
    if (order.user?.email) return order.user.email;
    if (order.guestEmail) return order.guestEmail;
    return "—";
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <span className="text-sm text-gray-500">
          {pagination.total} total orders
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No orders yet.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium">Order #</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Products</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 font-mono text-xs">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{getCustomerName(order)}</div>
                      <div className="text-xs text-gray-500">{getCustomerEmail(order)}</div>
                      {order.guestPhone && (
                        <div className="text-xs text-gray-500">{order.guestPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-xs truncate max-w-[200px]">
                            {item.product.title}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">₹{(order.amount / 100).toFixed(0)}</td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/download/${order.id}`}
                        className="text-brand-600 hover:underline text-xs"
                        target="_blank"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  ← Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchOrders(p)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      p === pagination.page
                        ? "bg-brand-500 text-white"
                        : "border hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}