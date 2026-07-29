import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[#E8E3D2]/70",
        className,
      )}
      {...props}
    />
  );
}

// ─── 1. NAVBAR SKELETONS ───────────────────────────────────────────────────

export function NavbarSkeleton() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "w-full flex items-center",
        "justify-between gap-1.5 min-[380px]:gap-3",
        "md:gap-4 bg-white/95 backdrop-blur-md",
        "py-3 min-[380px]:py-3.5 sm:py-3.5",
        "px-2.5 min-[380px]:px-4 md:px-8",
        "border-b border-[#E8E3D2] shadow-sm",
        "text-[#1C241E]",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Skeleton className="h-8 w-28 sm:w-36 rounded-xl" />
      </div>
      <div className="flex-1 max-w-xl mx-1 min-[380px]:mx-2 sm:mx-4">
        <Skeleton
          className={cn(
            "h-9 sm:h-11 w-full",
            "rounded-xl min-[380px]:rounded-2xl",
          )}
        />
      </div>
      <div
        className={cn(
          "flex items-center gap-1",
          "min-[380px]:gap-2.5 sm:gap-4 shrink-0",
        )}
      >
        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
      </div>
    </header>
  );
}

export function DashboardNavbarSkeleton() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "w-full bg-[#F8F6F0]/95 backdrop-blur-md",
        "border-b border-[#E8E3D2]/50 shadow-xs",
        "text-[#1C241E] py-2.5 px-4",
        "md:py-3.5 md:px-8",
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto flex",
          "items-center justify-between md:grid",
          "md:grid-cols-3",
        )}
      >
        <div className="flex items-center justify-start">
          <Skeleton className="h-8 w-28 sm:w-36 rounded-xl" />
        </div>
        <div className="hidden md:flex items-center justify-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-end">
          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
        </div>
      </div>
    </header>
  );
}

// ─── 2. MARKETPLACE HOME SKELETONS ─────────────────────────────────────────

export function MarketHeroSkeleton() {
  return (
    <div className="relative z-10 w-full">
      <div
        className={cn(
          "bg-[#2B4C3B] text-white overflow-hidden",
          "shadow-xl relative -mx-4",
          "sm:mx-0 w-[calc(100%+2rem)] sm:w-full",
          "rounded-b-[2.2rem] sm:rounded-[2.5rem] md:rounded-t-[2.5rem]",
          "md:rounded-b-[4rem] lg:rounded-b-[5rem] p-5",
          "sm:p-8 md:p-12 lg:p-16",
          "flex flex-row items-center",
          "justify-between min-h-[185px] sm:min-h-[260px]",
          "md:min-h-[300px]",
        )}
      >
        <div
          className={cn(
            "relative z-10 flex-1",
            "max-w-[55%] sm:max-w-md lg:max-w-xl",
            "space-y-2.5 sm:space-y-4",
          )}
        >
          <Skeleton
            className={cn(
              "h-6 min-[400px]:h-7 sm:h-12",
              "w-4/5 rounded-xl bg-white/25",
            )}
          />
          <Skeleton
            className={cn(
              "h-5 min-[400px]:h-6 sm:h-10",
              "w-3/5 rounded-xl bg-white/20",
            )}
          />
          <Skeleton
            className={cn(
              "h-3.5 sm:h-5 w-full",
              "rounded-lg bg-white/15 hidden",
              "sm:block",
            )}
          />
        </div>
        <div
          className={cn(
            "relative z-10 w-32",
            "min-[400px]:w-40 sm:w-64 md:w-80",
            "h-28 sm:h-44 md:h-52",
            "rounded-3xl bg-white/15 shrink-0",
            "ml-2",
          )}
        />
      </div>
    </div>
  );
}

export function CategoryCardsSkeleton() {
  return (
    <section
      className={cn(
        "-mt-4 min-[360px]:-mt-5 sm:-mt-8",
        "md:-mt-10 relative z-30",
        "pt-0 w-full px-1",
        "sm:px-0",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-4 gap-1.5",
          "min-[360px]:gap-2 sm:gap-3 md:gap-3.5",
          "w-full max-w-[280px] min-[360px]:max-w-[340px]",
          "sm:max-w-md md:max-w-lg lg:max-w-xl",
          "mx-auto",
        )}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "w-full aspect-[1/0.92] sm:aspect-[1/0.9]",
              "rounded-[0.8rem] min-[360px]:rounded-[1.1rem] sm:rounded-[1.3rem]",
              "lg:rounded-[1.5rem] p-1.5 min-[360px]:p-2.5",
              "sm:p-3 bg-white border-[1.5px]",
              "sm:border-2 border-[#E8E3D2] flex",
              "flex-col justify-between items-start",
              "shadow-xs",
            )}
          >
            <Skeleton className="h-3 sm:h-4 w-3/4 rounded-md" />
            <Skeleton
              className={cn(
                "self-end w-4 h-4",
                "sm:w-7 sm:h-7 rounded-full",
                "mt-auto",
              )}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className={cn(
        "rounded-[2rem] flex flex-col",
        "p-3.5 sm:p-4 bg-white",
        "border border-[#E8E3D2] shadow-xs",
      )}
    >
      <Skeleton
        className={cn(
          "w-full h-34 sm:h-36",
          "rounded-2xl sm:rounded-3xl mb-3",
        )}
      />
      <div className="flex flex-col items-start flex-1 w-full space-y-2">
        <Skeleton className="h-4 sm:h-5 w-4/5 rounded-md" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-12 sm:w-14 rounded-lg bg-[#F8F6F0]" />
          <Skeleton className="h-4 w-16 sm:w-20 rounded-md bg-emerald-50/70" />
        </div>
        <div
          className={cn(
            "mt-auto w-full pt-2",
            "sm:pt-3 border-t border-[#E8E3D2]/50",
            "flex items-end justify-between",
          )}
        >
          <div className="space-y-1">
            <Skeleton className="h-4 sm:h-5 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
      </div>
      <Skeleton
        className={cn(
          "mt-3 sm:mt-5 w-full",
          "h-9 sm:h-11 rounded-xl",
          "bg-[#EEF2E6]",
        )}
      />
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2",
        "md:grid-cols-3 lg:grid-cols-4 gap-4",
        "sm:gap-5 md:gap-6 w-full",
      )}
    >
      {Array.from({ length: count }).map(
        (_, i) => (
          <ProductCardSkeleton key={i} />
        ),
      )}
    </div>
  );
}

export function SellerStoreCardSkeleton() {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl p-4",
        "border border-[#E8E3D2] flex",
        "items-center gap-4 shadow-xs",
      )}
    >
      <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 sm:h-5 w-3/4 rounded-md" />
        <Skeleton className="h-3 sm:h-4 w-1/2 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>
    </div>
  );
}

// ─── 3. HUB DASHBOARD & ORDERS SKELETONS ───────────────────────────────────

export function DashboardHeaderSkeleton() {
  return (
    <div
      className={cn(
        "w-full p-6 sm:p-8",
        "bg-[#2B4C3B] rounded-3xl text-white",
        "space-y-4 shadow-md",
      )}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row",
          "sm:items-center justify-between gap-4",
        )}
      >
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-40 rounded-lg bg-white/15" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div
      className={cn(
        "bg-white border border-[#E8E3D2]",
        "rounded-[1.5rem] p-5 space-y-4",
        "shadow-xs",
      )}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row",
          "justify-between items-start sm:items-center",
          "gap-2 border-b border-[#E8E3D2]",
          "pb-4",
        )}
      >
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3.5 w-48 rounded-md" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 sm:h-5 w-2/3 rounded-md" />
          <Skeleton className="h-3.5 w-1/3 rounded-md" />
        </div>
      </div>
      <div
        className={cn(
          "pt-4 border-t border-[#E8E3D2]",
          "flex flex-col sm:flex-row",
          "justify-between sm:items-center gap-3",
        )}
      >
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <div
          className={cn(
            "flex items-center justify-between",
            "sm:justify-end gap-3 w-full",
            "sm:w-auto",
          )}
        >
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#F8F6F0] text-[#1C241E]",
        "font-sans flex flex-col",
        "justify-between overflow-x-clip w-full",
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50",
          "w-full flex items-center",
          "justify-between gap-1.5 min-[380px]:gap-3",
          "md:gap-4 bg-white/95 backdrop-blur-md",
          "py-3 min-[380px]:py-3.5 sm:py-3.5",
          "px-2.5 min-[380px]:px-4 md:px-8",
          "border-b border-[#E8E3D2] shadow-sm",
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Skeleton className="h-8 w-28 sm:w-36 rounded-xl" />
        </div>

        <div
          className={cn(
            "bg-[#E8E3D2]/80 p-1 rounded-full",
            "flex items-center gap-1",
            "border border-[#E8E3D2] shrink-0",
          )}
        >
          <Skeleton className="h-7 sm:h-8 w-20 sm:w-28 rounded-full bg-white" />
          <Skeleton
            className={cn(
              "h-7 sm:h-8 w-20",
              "sm:w-28 rounded-full bg-transparent",
            )}
          />
        </div>

        <div
          className={cn(
            "flex items-center gap-1",
            "min-[380px]:gap-2.5 sm:gap-4 shrink-0",
          )}
        >
          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
        </div>
      </header>

      <main
        className={cn(
          "max-w-7xl mx-auto pt-6",
          "md:pt-8 px-3.5 sm:px-6",
          "md:px-8 lg:px-12 flex-1",
          "w-full pb-16",
        )}
      >
        <div className="mb-6 hidden sm:block">
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        <Skeleton className="h-9 sm:h-12 w-48 sm:w-64 rounded-2xl mb-4 sm:mb-6" />

        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Skeleton className="h-5 w-24 sm:w-28 rounded-md" />
          <div className="w-8 sm:w-16 h-px bg-[#DDE2D6]" />
          <Skeleton className="h-5 w-24 sm:w-28 rounded-md" />
          <div className="w-8 sm:w-16 h-px bg-[#DDE2D6]" />
          <Skeleton className="h-5 w-24 sm:w-28 rounded-md" />
        </div>

        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-3",
            "gap-8 lg:gap-16 items-start",
          )}
        >
          <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-row gap-3.5",
                  "sm:gap-6 pb-6 sm:pb-8",
                  "border-b border-[#E8E3D2]",
                )}
              >
                <Skeleton
                  className={cn(
                    "w-20 h-20 sm:w-32",
                    "sm:h-32 rounded-xl sm:rounded-[1.5rem]",
                    "shrink-0",
                  )}
                />
                <div className="flex flex-col flex-1 space-y-2 sm:space-y-3">
                  <Skeleton className="h-6 sm:h-7 w-3/4 rounded-xl" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <Skeleton className="h-6 sm:h-7 w-28 rounded-lg" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-24 rounded-xl" />
                      <Skeleton className="w-10 h-10 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "bg-[#F1EBE1] rounded-[2rem] p-6",
              "sm:p-8 space-y-6 shadow-md",
            )}
          >
            <Skeleton className="h-6 sm:h-7 w-44 rounded-xl" />
            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
            <div className="h-px bg-[#DDE2D6]" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-full bg-[#1C241E]/20" />
          </div>
        </div>
      </main>
    </div>
  );
}
