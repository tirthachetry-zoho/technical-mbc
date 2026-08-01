import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

// GET /api/reviews?productId=xxx  — returns approved reviews for a product
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const reviews = await db.review.findMany({
    where: { productId, approved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return NextResponse.json({ reviews, avgRating: Math.round(avg * 10) / 10, count: reviews.length });
}

// POST /api/reviews — create a review (login required)
export async function POST(req: NextRequest) {
  // Await headers before calling auth() to avoid Next.js 15 warnings
  const headers = await req.headers;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = ReviewSchema.parse(await req.json());

  // Check if user already reviewed this product
  const existing = await db.review.findUnique({
    where: { 
      productId_userId: { 
        productId: body.productId, 
        userId: session.user.id as string 
      } 
    },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
  }

  const review = await db.review.create({
    data: {
      ...body,
      userId: session.user.id as string,
      approved: false, // requires admin approval
    },
  });

  return NextResponse.json(review, { status: 201 });
}