"use client";

import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8F6F0] relative">
      <DashboardNavbar />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
