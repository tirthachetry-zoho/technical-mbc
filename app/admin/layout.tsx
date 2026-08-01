import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "📁" },
  { href: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/import", label: "CSV Import", icon: "📥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-6">
      <aside className="border-r border-gray-200 dark:border-gray-700 pr-4">
        <p className="font-bold mb-3 text-brand-500">Admin Panel</p>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-sm text-gray-500 hover:text-brand-500">
            ← Back to store
          </Link>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}