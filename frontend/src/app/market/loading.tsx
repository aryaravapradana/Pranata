import { cn } from "@/lib/utils";
import {
  Skeleton,
  NavbarSkeleton,
  MarketHeroSkeleton,
  CategoryCardsSkeleton,
  ProductGridSkeleton,
  SellerStoreCardSkeleton,
} from "@/components/ui/skeleton";

export default function MarketLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />

      <main
        className={cn(
          "max-w-7xl mx-auto w-full",
          "px-4 sm:px-6 py-6",
          "space-y-8 flex-1",
        )}
      >
        {/* Banner Hero */}
        <MarketHeroSkeleton />

        {/* Category Pills */}
        <CategoryCardsSkeleton />

        {/* Section 1: Featured Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-56 rounded-xl" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>

        {/* Section 2: Top Sellers Row */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-60 rounded-xl" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2",
              "lg:grid-cols-3 gap-4",
            )}
          >
            {[1, 2, 3].map((i) => (
              <SellerStoreCardSkeleton
                key={i}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
