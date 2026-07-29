import { cn } from "@/lib/utils";
import {
  Skeleton,
  DashboardNavbarSkeleton,
  ProductGridSkeleton,
} from "@/components/ui/skeleton";

export default function HubStoreLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <DashboardNavbarSkeleton />

      <main
        className={cn(
          "max-w-7xl mx-auto w-full",
          "px-4 sm:px-6 py-6",
          "space-y-6 flex-1",
        )}
      >
        {/* Header Bar */}
        <div
          className={cn(
            "flex flex-col sm:flex-row",
            "sm:items-center justify-between gap-4",
            "bg-white p-5 rounded-3xl",
            "border border-[#E8E3D2] shadow-xs",
          )}
        >
          <div className="space-y-1">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-11 w-44 rounded-2xl" />
        </div>

        {/* Search & Filter Bar */}
        <div
          className={cn(
            "flex flex-col sm:flex-row",
            "items-center justify-between gap-3",
          )}
        >
          <Skeleton className="h-11 w-full sm:w-80 rounded-2xl" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Product Cards Grid */}
        <ProductGridSkeleton count={8} />
      </main>
    </div>
  );
}
