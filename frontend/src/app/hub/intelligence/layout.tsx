import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pranata Intelligence",
  description:
    "Asisten AI & Klasifikasi Ternak 24/7",
  icons: {
    icon: "/logomarks/basic-logomark.webp",
    shortcut:
      "/logomarks/basic-logomark.webp",
    apple: "/logomarks/basic-logomark.webp",
  },
};

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
