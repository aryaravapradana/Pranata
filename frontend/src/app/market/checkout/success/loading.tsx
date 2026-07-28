export default function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-10 md:p-14 max-w-lg w-full text-center shadow-[0_20px_60px_-15px_rgba(43,76,59,0.15)] border border-[#E8E3D2]">
        <div className="w-24 h-24 rounded-full skeleton-shimmer bg-[#E8E3D2] mx-auto mb-6" />
        <div className="w-3/4 h-8 rounded-xl skeleton-shimmer bg-[#E8E3D2] mx-auto mb-3" />
        <div className="w-5/6 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2] mx-auto mb-2" />
        <div className="w-2/3 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2] mx-auto mb-8" />
        <div className="flex flex-col gap-3">
          <div className="w-full h-14 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-full h-14 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
        </div>
      </div>
    </div>
  );
}
