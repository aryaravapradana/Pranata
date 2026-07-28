export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E8E3D2] shadow-lg space-y-6">
        <div className="w-32 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2] mx-auto mb-4" />
        <div className="space-y-4">
          <div className="w-full h-12 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-full h-12 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-full h-12 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
        </div>
        <div className="w-full h-14 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
      </div>
    </div>
  );
}
