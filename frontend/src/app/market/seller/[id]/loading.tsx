import { Skeleton, NavbarSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function SellerLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Seller Hero Profile Header */}
        <div className="bg-white rounded-3xl border border-[#E8E3D2] overflow-hidden shadow-xs">
          <Skeleton className="h-32 sm:h-48 w-full rounded-none" />
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative -mt-10 sm:-mt-12">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md shrink-0" />
            <div className="space-y-2 flex-1 pt-2">
              <Skeleton className="h-7 sm:h-8 w-56 rounded-xl" />
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-72 rounded-md" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        {/* Seller Products Grid */}
        <ProductGridSkeleton count={8} />
      </main>
    </div>
  );
}
