import { Skeleton, DashboardNavbarSkeleton } from "@/components/ui/skeleton";

export default function HubLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <DashboardNavbarSkeleton />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Welcome Header Banner */}
        <div className="bg-[#2B4C3B] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/25" />
              <Skeleton className="h-4 w-40 rounded-lg bg-white/15" />
            </div>
            <Skeleton className="h-10 w-36 rounded-full bg-white/20" />
          </div>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E3D2] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-2xl" />
              </div>
              <Skeleton className="h-7 sm:h-9 w-32 rounded-xl" />
              <Skeleton className="h-3.5 w-20 rounded-md" />
            </div>
          ))}
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-40 shrink-0 rounded-2xl bg-white border border-[#E8E3D2]" />
          ))}
        </div>

        {/* Split Content View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left Column: Recent Orders List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-36 rounded-xl" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-[#E8E3D2] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Weather & Activity */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-xl" />
            <div className="bg-white rounded-3xl p-5 border border-[#E8E3D2] space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
