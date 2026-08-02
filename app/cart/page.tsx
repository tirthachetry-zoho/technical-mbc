import Link from "next/link";

export default function CartPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          This store uses a direct "Buy Now" flow from each product page. Browse our catalog and
          click "Buy Now" on any product to purchase instantly.
        </p>
        <Link href="/products" className="btn-primary inline-block">
          Browse Notes
        </Link>
      </div>
    </div>
  );
}
