import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E3D2] w-full max-w-md space-y-6 shadow-md">
        <div className="flex flex-col items-center space-y-3">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="h-7 w-40 rounded-xl" />
          <Skeleton className="h-4 w-56 rounded-lg" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-13 w-full rounded-2xl" />
        </div>
        <div className="flex justify-center pt-2">
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
}
