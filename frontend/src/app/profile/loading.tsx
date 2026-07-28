export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <div className="sticky top-0 z-40 px-3.5 sm:px-4 pt-3.5 sm:pt-4">
        <div className="max-w-7xl mx-auto bg-white border border-[#E8E3D2] rounded-2xl shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-12 sm:h-14 flex items-center justify-between px-3.5 sm:px-6 md:px-8 lg:px-12">
          <div className="w-20 sm:w-28 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-24 sm:w-32 h-4 sm:h-5 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-16 sm:w-28 shrink-0" />
        </div>
      </div>
      <main className="max-w-7xl mx-auto pt-4 sm:pt-6 pb-20 sm:pb-28 space-y-6 px-3.5 sm:px-6 md:px-8 lg:px-12">
        <div className="bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
          <div className="relative h-32 sm:h-40 md:h-52 skeleton-shimmer bg-[#E8E3D2]" />
          <div className="px-4 sm:px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white skeleton-shimmer bg-[#E8E3D2] shrink-0" />
              <div className="w-24 sm:w-32 h-8 sm:h-10 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
            </div>
            <div className="w-40 sm:w-48 h-7 sm:h-8 rounded-xl skeleton-shimmer bg-[#E8E3D2] mb-2" />
            <div className="w-28 sm:w-32 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-4" />
            <div className="flex gap-2">
              <div className="w-20 sm:w-24 h-6 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
              <div className="w-28 sm:w-32 h-6 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
            </div>
          </div>
        </div>
        {[1, 2].map(section => (
          <div key={section} className="bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[2rem] p-4 sm:p-7 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
            <div className="w-40 sm:w-48 h-5 sm:h-6 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-4 sm:mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="w-20 sm:w-24 h-3 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-2" />
                  <div className="w-full h-10 sm:h-12 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
                </div>
              ))}
            </div>
            <div className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl skeleton-shimmer bg-[#E8E3D2] mt-5 sm:mt-6" />
          </div>
        ))}
        <div className="border-2 border-dashed border-[#E8E3D2] rounded-2xl sm:rounded-[2rem] p-4 sm:p-7">
          <div className="w-28 sm:w-32 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-4" />
          <div className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl skeleton-shimmer bg-[#E8E3D2]" />
        </div>
      </main>
    </div>
  );
}
