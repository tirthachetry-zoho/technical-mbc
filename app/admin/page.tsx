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
    { label: "Total Revenue", value: `₹${(totalRevenue._sum.amount ?? 0) / 100}`, icon: "💰", color: "text-green-600" },
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
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
              <span className="text-3xl">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-3">Order #</th>
                  <th className="px-3">Customer</th>
                  <th className="px-3">Items</th>
                  <th className="px-3">Amount</th>
                  <th className="px-3">Status</th>
                  <th className="px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-3">{(o.user?.name || o.user?.email || o.guestName || o.guestEmail || "Guest")!}</td>
                    <td className="px-3">{o.items.length}</td>
                    <td className="px-3 font-medium">₹{o.amount / 100}</td>
                    <td className="px-3">
                      <span className={`badge ${o.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : o.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 text-gray-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
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