import { cn } from "@/lib/utils";
import {
  Skeleton,
  DashboardNavbarSkeleton,
  OrderCardSkeleton,
} from "@/components/ui/skeleton";

export default function HubOrdersLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <DashboardNavbarSkeleton />

      <main
        className={cn(
          "max-w-5xl mx-auto w-full",
          "px-4 sm:px-6 py-6",
          "space-y-6 flex-1",
        )}
      >
        {/* Header Bar */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>

        {/* Tab Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              className="h-10 w-28 shrink-0 rounded-2xl"
            />
          ))}
        </div>

        {/* Search Bar */}
        <Skeleton className="h-12 w-full rounded-2xl" />

        {/* Orders List */}
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
