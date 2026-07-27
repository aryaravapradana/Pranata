"use client";

import { usePathname } from "next/navigation";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hub subroutes (/hub/*) are splash-screen-free for instant animated tab switching.
  // Navigation to standalone /profile (or market, auth) WILL trigger SplashScreen cleanly.
  const isHubRoute = pathname?.startsWith('/hub');

  return (
    <div className="min-h-screen flex flex-col">
      {!isHubRoute && <SplashScreen />}
      {children}
    </div>
  );
}
