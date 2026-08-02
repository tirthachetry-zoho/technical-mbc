import { ProductDetailSkeleton, Skeleton } from "@/components/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-64" />
      <ProductDetailSkeleton />
    </div>
  );
}