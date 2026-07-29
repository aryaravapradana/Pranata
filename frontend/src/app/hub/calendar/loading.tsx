import { Skeleton, DashboardNavbarSkeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <DashboardNavbarSkeleton />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E8E3D2] shadow-xs">
          <div className="space-y-1">
            <Skeleton className="h-7 w-56 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-11 w-44 rounded-2xl" />
        </div>

        {/* Month Navigator Bar */}
        <div className="bg-white rounded-2xl p-3 border border-[#E8E3D2] flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E3D2] space-y-3 shadow-xs">
          <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-[#E8E3D2]/60">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-4 w-full rounded-md" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-16 sm:h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
