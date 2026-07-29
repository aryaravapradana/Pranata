import { cn } from "@/lib/utils";
import {
  Skeleton,
  DashboardNavbarSkeleton,
} from "@/components/ui/skeleton";

export default function IntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <DashboardNavbarSkeleton />

      <main
        className={cn(
          "max-w-6xl mx-auto w-full",
          "px-4 sm:px-6 py-6",
          "space-y-6 flex-1 flex",
          "flex-col",
        )}
      >
        {/* Header Banner */}
        <div
          className={cn(
            "bg-[#2B4C3B] rounded-3xl p-6",
            "sm:p-8 text-white space-y-3",
            "shadow-md",
          )}
        >
          <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-80 rounded-lg bg-white/15" />
        </div>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-white rounded-3xl p-5",
                "border border-[#E8E3D2] space-y-3",
                "shadow-xs",
              )}
            >
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          ))}
        </div>

        {/* Chat / Conversation Container */}
        <div
          className={cn(
            "bg-white rounded-3xl p-5",
            "sm:p-6 border border-[#E8E3D2]",
            "space-y-4 flex-1 flex",
            "flex-col min-h-[350px] shadow-xs",
            "justify-between",
          )}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <Skeleton className="h-16 w-3/4 rounded-2xl" />
            </div>
            <div className="flex items-start gap-3 justify-end">
              <Skeleton className="h-12 w-1/2 rounded-2xl" />
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            </div>
          </div>

          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
