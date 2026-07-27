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

  return (
    <div className="min-h-screen bg-[#F8F6F0] relative">
      <DashboardNavbar />
      <main className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8, scale: 0.998 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.998 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
