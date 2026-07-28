"use client";

import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isIntelligence = pathname?.includes("/intelligence");

  return (
    <div className="min-h-screen bg-[#F8F6F0] relative">
      {!isIntelligence && <DashboardNavbar />}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
