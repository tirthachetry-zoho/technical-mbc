import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const [totalRevenue, orderCount, customerCount, productCount, pendingReviews, coupons] = await Promise.all([
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.count({ where: { status: "PAID" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count(),
    db.review.count({ where: { approved: false } }),
    db.coupon.count(),
  ]);

  const cards = [
    { label: "Total Revenue", value: `₹${(totalRevenue._sum.amount ?? 0).toFixed(2)}`, icon: "💰", color: "text-green-600" },
    { label: "Orders", value: orderCount, icon: "📦", color: "text-brand-500" },
    { label: "Customers", value: customerCount, icon: "👥", color: "text-purple-600" },
    { label: "Products", value: productCount, icon: "📚", color: "text-amber-600" },
    { label: "Pending Reviews", value: pendingReviews, icon: "⭐", color: "text-orange-600" },
    { label: "Coupons", value: coupons, icon: "🏷️", color: "text-pink-600" },
  ];

  // Recent orders
  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{c.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
              <span className="text-2xl sm:text-3xl shrink-0">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-500 hover:underline">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-1">No orders yet.</p>
            <p className="text-sm">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Order #</th>
                  <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Customer</th>
                  <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Items</th>
                  <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Amount</th>
                  <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-4 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-3">
                      <div className="font-medium">{o.user?.name || o.guestName || "Guest"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {o.user?.email || o.guestEmail || "—"}
                      </div>
                    </td>
                    <td className="px-3">{o.items.length}</td>
                    <td className="px-3 font-medium">₹{o.amount.toFixed(2)}</td>
                    <td className="px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.status === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : o.status === "FAILED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}