import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cacheOrFetch, invalidateProducts, invalidateAdminProducts } from "@/lib/cache";
import type { ProductWithCategory } from "@/lib/cache-types";

// GET /api/products?search=&category=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const cacheKey = `product:api:search=${search ?? ""}:cat=${category ?? ""}`;

  const products = await cacheOrFetch(cacheKey, () =>
    db.product.findMany({
      where: {
        published: true,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(category && { category: { slug: category } }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discountPct: true,
        thumbnailUrl: true,
        featured: true,
        bestSeller: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  );

  return NextResponse.json(products);
}

const ProductSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string(),
  price: z.number().int().positive(),
  discountPct: z.number().int().min(0).max(100).default(0),
  thumbnailUrl: z.string().url(),
  pdfKey: z.string().min(1),
  published: z.boolean().default(false),
});

// POST /api/products (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = ProductSchema.parse(await req.json());
  const product = await db.product.create({ data: body });
  invalidateProducts();
  invalidateAdminProducts();
  return NextResponse.json(product, { status: 201 });
}
