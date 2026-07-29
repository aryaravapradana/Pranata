import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pranata Market",
  description:
    "Pasar Ternak & Hasil Tani Terverifikasi Direct",
  icons: {
    icon: "/logomarks/basic-logomark.webp",
    shortcut:
      "/logomarks/basic-logomark.webp",
    apple: "/logomarks/basic-logomark.webp",
  },
};

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
