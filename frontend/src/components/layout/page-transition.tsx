"use client";

import { usePathname } from "next/navigation";
import { SplashScreen } from "@/components/ui/splash-screen";
import { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SplashScreen />
      {children}
    </div>
  );
}
