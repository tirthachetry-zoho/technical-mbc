import type { Prisma } from "@prisma/client";

// Product with category included
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

// Category with product count
export type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

// Product with category and reviews
export type ProductWithReviews = Prisma.ProductGetPayload<{
  include: {
    category: true;
    reviews: {
      where: { approved: true };
      include: { user: { select: { name: true } } };
    };
  };
}>;