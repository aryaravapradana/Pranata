import type { Metadata } from "next";
import DashboardNavbar from "@/components/layout/DashboardNavbar";

export const metadata: Metadata = {
  title: "Pranata Hub",
  description: "Dasbor Manajemen & Inventaris Peternakan",
  icons: {
    icon: "/logomarks/basic-logomark.webp",
    shortcut: "/logomarks/basic-logomark.webp",
    apple: "/logomarks/basic-logomark.webp",
  },
};

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
