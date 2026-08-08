import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cacheOrFetch } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const products = await cacheOrFetch(
      "admin:products:all",
      async () => {
        return db.product.findMany({
          orderBy: { createdAt: "desc" },
          include: { 
            category: true,
            razorpayAccount: {
              select: {
                id: true,
                name: true,
                isDefault: true,
              }
            }
          },
        });
      },
      2 * 60 * 1000 // 2 min TTL
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}