import { cn } from "@/lib/utils";
import {
  Skeleton,
  NavbarSkeleton,
  CategoryCardsSkeleton,
  ProductGridSkeleton,
} from "@/components/ui/skeleton";

export default function ProductsLoading() {
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
        {/* Search & Header Bar */}
        <div
          className={cn(
            "flex flex-col md:flex-row",
            "items-center justify-between gap-4",
            "bg-white p-4 sm:p-5",
            "rounded-3xl border border-[#E8E3D2]",
            "shadow-xs",
          )}
        >
          <Skeleton className="h-11 w-full md:w-96 rounded-2xl" />
          <div
            className={cn(
              "flex items-center gap-3",
              "w-full md:w-auto justify-between",
              "md:justify-end",
            )}
          >
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-2xl" />
          </div>
        </div>

        {/* Category Pills Bar */}
        <CategoryCardsSkeleton />

        {/* Product Cards Grid */}
        <ProductGridSkeleton count={12} />
      </main>
    </div>
  );
}
