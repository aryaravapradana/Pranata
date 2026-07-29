import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 sm:p-12 max-w-lg w-full text-center border border-[#E8E3D2] shadow-lg space-y-6">
        <Skeleton className="w-24 h-24 rounded-full mx-auto" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-5/6 rounded-md mx-auto" />
          <Skeleton className="h-4 w-2/3 rounded-md mx-auto" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-13 w-full rounded-full" />
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
