import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const user = req.auth?.user as { role?: string } | undefined;
  
  // Only allow ADMIN role for admin routes
  if (user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
