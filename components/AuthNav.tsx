"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthNav() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <>
        {session.user.role === "ADMIN" && (
          <Link href="/admin" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Admin
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <Link href="/login" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      Login
    </Link>
  );
}
