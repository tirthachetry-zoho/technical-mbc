import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import AuthNav from "@/components/AuthNav";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import MobileNav from "@/components/MobileNav";
import BackToTop from "@/components/BackToTop";
import { db } from "@/lib/db";
import { cacheOrFetch } from "@/lib/cache";
import Providers from "@/components/providers";
import { Suspense } from "react";

export const metadata = {
  title: "TechnicalMBC — Premium PDF Notes for Competitive Exams",
  description:
    "Buy high-quality PDF study material for RRB, SSC, Banking, UPSC, State PSC & more. Instant download after payment.",
  keywords: ["PDF notes", "competitive exams", "RRB", "SSC", "UPSC", "banking", "study material"],
};

export const revalidate = 3600; // Cache layout categories for 1 hour

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await cacheOrFetch("layout:categories", () =>
    db.category.findMany({ orderBy: { name: "asc" }, take: 8 })
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 md:gap-4 py-3">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg text-brand-500 shrink-0" aria-label="TechnicalMBC home">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 2h9a2 2 0 012 2v1h1a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm9 4H6v14h12V7a1 1 0 00-1-1h-2v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V6z" />
                </svg>
                <span className="hidden sm:inline">TechnicalMBC</span>
              </Link>
              <div className="flex-1 min-w-0">
                <Suspense fallback={<div className="h-9 max-w-md w-full bg-gray-100 dark:bg-gray-800 rounded-full" />}>
                  <SearchBar />
                </Suspense>
              </div>
              <nav className="flex items-center gap-1 text-sm shrink-0">
                <MobileNav />
                <Link href="/" className="hidden md:block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">Home</Link>
                <Link href="/products" className="hidden md:block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">All Notes</Link>
                <Link href="/dashboard/downloads" className="hidden md:block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">My Downloads</Link>
                <AuthNav />
                <ThemeToggle />
              </nav>
            </div>
            {/* Category bar */}
            {categories.length > 0 && (
              <nav className="flex items-center gap-1 pb-2 overflow-x-auto text-sm scrollbar-hide" aria-label="Categories">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-brand-100 dark:hover:bg-brand-900 hover:text-brand-600 dark:hover:text-brand-300 whitespace-nowrap transition"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="font-bold text-brand-500 mb-2">TechnicalMBC</p>
              <p className="text-gray-500 dark:text-gray-400">Premium PDF study material for competitive exams in India.</p>
              <div className="mt-2 space-y-1">
                <a href="https://newsindia4.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline block">
                  📰 News India 4
                </a>
                <a href="https://www.youtube.com/@TechnicalMBC" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline block">
                  📺 YouTube Channel
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-2">Shop</p>
              <ul className="space-y-1 text-gray-500 dark:text-gray-400">
                {categories.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link href={`/products?category=${c.slug}`} className="hover:text-brand-500">{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Account</p>
              <ul className="space-y-1 text-gray-500 dark:text-gray-400">
                <li><Link href="/login" className="hover:text-brand-500">Login</Link></li>
                <li><Link href="/dashboard/downloads" className="hover:text-brand-500">My Downloads</Link></li>
                <li><Link href="/wishlist" className="hover:text-brand-500">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Support</p>
              <ul className="space-y-1 text-gray-500 dark:text-gray-400">
                <li>
                  <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="hover:text-brand-500">
                    {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500">
                    WhatsApp Support
                  </a>
                </li>
                <li>Instant PDF download</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Developer</p>
              <ul className="space-y-1 text-gray-500 dark:text-gray-400">
                <li>
                  <a href="mailto:tirthachetri12@gmail.com" className="hover:text-brand-500">
                    tirthachetri12@gmail.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/917086831426?text=Hi%2C%20I%20need%20help%20with%20my%20order%20on%20PDF%20Store." target="_blank" rel="noopener noreferrer" className="hover:text-brand-500">
                    +91 70868 31426
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} TechnicalMBC. All rights reserved.
          </div>
        </footer>
        <WhatsAppFloat />
        <BackToTop />
        </Providers>
      </body>
    </html>
  );
}