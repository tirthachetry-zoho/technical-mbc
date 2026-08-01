import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/wishlist — returns the current user's wishlist
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const wishlist = await db.wishlist.findMany({
    where: { userId: session.user.id as string },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist);
}

// POST /api/wishlist — add a product to wishlist
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id as string, productId } },
  });
  if (existing) return NextResponse.json({ message: "Already in wishlist" });

  await db.wishlist.create({
    data: { userId: session.user.id as string, productId },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/wishlist?productId=xxx — remove a product from wishlist
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await db.wishlist.deleteMany({
    where: { userId: session.user.id as string, productId },
  });

  return NextResponse.json({ success: true });
}