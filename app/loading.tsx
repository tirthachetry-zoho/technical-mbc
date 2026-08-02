import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-12">
      {/* Hero skeleton */}
      <Skeleton className="h-64 md:h-80 w-full rounded-2xl" />

      {/* Categories */}
      <section>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <Skeleton className="h-6 w-40 mb-4" />
        <ProductGridSkeleton count={4} />
      </section>

      {/* Bestsellers */}
      <section>
        <Skeleton className="h-6 w-40 mb-4" />
        <ProductGridSkeleton count={4} />
      </section>

      {/* Latest */}
      <section>
        <Skeleton className="h-6 w-40 mb-4" />
        <ProductGridSkeleton count={8} />
      </section>
    </div>
  );
}