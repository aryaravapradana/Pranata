import { cn } from "@/lib/utils";
import {
  Skeleton,
  NavbarSkeleton,
} from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />

      <main
        className={cn(
          "max-w-6xl mx-auto w-full",
          "px-4 sm:px-6 py-6",
          "space-y-6 flex-1 pb-24",
          "sm:pb-12",
        )}
      >
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>

        {/* Product Detail Grid */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-12",
            "gap-6 sm:gap-8 items-start",
          )}
        >
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 lg:col-span-5 space-y-3">
            <Skeleton className="w-full aspect-square rounded-3xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="w-16 h-16 rounded-2xl"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Information & Seller Card */}
          <div className="md:col-span-6 lg:col-span-7 space-y-5">
            {/* Category & Title & Rating */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-8 sm:h-10 w-4/5 rounded-xl" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            </div>

            {/* Price Tag Box */}
            <div
              className={cn(
                "bg-white p-5 rounded-3xl",
                "border border-[#E8E3D2] space-y-2",
                "shadow-xs",
              )}
            >
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-9 w-48 rounded-xl" />
            </div>

            {/* Seller Farm Profile Card */}
            <div
              className={cn(
                "bg-white p-4 rounded-3xl",
                "border border-[#E8E3D2] flex",
                "items-center justify-between gap-4",
                "shadow-xs",
              )}
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36 rounded-md" />
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-2xl shrink-0" />
            </div>

            {/* Description Tab Box */}
            <div
              className={cn(
                "bg-white p-5 rounded-3xl",
                "border border-[#E8E3D2] space-y-3",
                "shadow-xs",
              )}
            >
              <Skeleton className="h-5 w-36 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0",
          "right-0 z-40 bg-white/95",
          "border-t border-[#E8E3D2] px-4",
          "py-3 shadow-2xl",
        )}
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
