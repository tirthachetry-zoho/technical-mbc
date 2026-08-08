import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as { role?: string } | undefined;
  
  // Only allow ADMIN role for admin routes
  if (!isLoggedIn || user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
