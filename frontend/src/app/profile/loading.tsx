import { Skeleton, NavbarSkeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col">
      <NavbarSkeleton />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Profile Banner & Avatar Card */}
        <div className="bg-white border border-[#E8E3D2] rounded-3xl overflow-hidden shadow-xs">
          <Skeleton className="h-36 sm:h-48 w-full rounded-none" />
          <div className="px-6 pb-6 relative">
            <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-4">
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md shrink-0" />
              <Skeleton className="h-10 w-32 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-xl" />
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-full pt-1" />
            </div>
          </div>
        </div>

        {/* Form Sections */}
        {[1, 2].map((section) => (
          <div key={section} className="bg-white border border-[#E8E3D2] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <Skeleton className="h-6 w-48 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
