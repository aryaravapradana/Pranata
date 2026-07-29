import { cn } from "@/lib/utils";
import {
  Skeleton,
  NavbarSkeleton,
  MarketHeroSkeleton,
  CategoryCardsSkeleton,
  ProductGridSkeleton,
} from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />
      <main
        className={cn(
          "max-w-7xl mx-auto w-full",
          "px-4 sm:px-6 py-6",
          "space-y-6 flex-1",
        )}
      >
        <MarketHeroSkeleton />
        <CategoryCardsSkeleton />
        <ProductGridSkeleton count={8} />
      </main>
    </div>
  );
}
