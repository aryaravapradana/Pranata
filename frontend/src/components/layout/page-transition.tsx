"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { SplashScreen } from "@/components/ui/splash-screen";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useRef, useEffect, ReactNode } from "react";

// FrozenRouter locks the Next.js router context to its initial value across re-renders.
// This is essential for Next.js App Router so the old page doesn't instantly swap 
// its content to the new page during the exit animation.
function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  // eslint-disable-next-line react-hooks/refs
  const frozen = useRef(context).current;
  
  if (!LayoutRouterContext) {
    return <>{children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  // Check if navigating internally between Hub subroutes (/hub, /hub/calendar, /hub/store, /hub/orders)
  const isPrevHub = prevPathRef.current?.startsWith('/hub');
  const isCurrHub = pathname?.startsWith('/hub');
  const isHubInternalNavigation = isPrevHub && isCurrHub;

  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={pathname} 
        className="min-h-screen flex flex-col"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
      >
        {!isHubInternalNavigation && <SplashScreen />}
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
