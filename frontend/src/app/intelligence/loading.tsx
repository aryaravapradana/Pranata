import { Skeleton, NavbarSkeleton } from "@/components/ui/skeleton";

export default function IntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1 flex flex-col">
        {/* Header Banner */}
        <div className="bg-[#2B4C3B] rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
          <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-80 rounded-lg bg-white/15" />
        </div>

        {/* Chat / Conversation Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E3D2] space-y-4 flex-1 flex flex-col min-h-[400px] shadow-xs justify-between">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <Skeleton className="h-20 w-3/4 rounded-2xl" />
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
