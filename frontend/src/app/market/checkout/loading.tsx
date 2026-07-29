import { Skeleton, NavbarSkeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-8 w-48 rounded-xl" />
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Address & Payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E3D2] space-y-3 shadow-xs">
              <Skeleton className="h-6 w-44 rounded-xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>

            {/* Order Items List */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E3D2] space-y-4 shadow-xs">
              <Skeleton className="h-6 w-40 rounded-xl" />
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-[#E8E3D2]/60 last:border-0">
                  <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <Skeleton className="h-3.5 w-1/4 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E3D2] space-y-4 shadow-xs">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Breakdown & CTA */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#E8E3D2] space-y-4 shadow-xs">
              <Skeleton className="h-6 w-40 rounded-xl" />
              <div className="space-y-2.5 pt-2 border-t border-[#E8E3D2]/60">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E8E3D2]">
                <Skeleton className="h-6 w-28 rounded-md" />
                <Skeleton className="h-7 w-36 rounded-xl" />
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
