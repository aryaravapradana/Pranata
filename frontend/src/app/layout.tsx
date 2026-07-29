import type { Metadata } from "next";
import {
  Nunito,
  Playfair_Display,
  Geist,
} from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "700",
    "800",
    "900",
  ],
  variable: "--font-nunito",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pranata",
  description:
    "Friendly farm tracking and inventory management",
  icons: {
    icon: "/logomarks/basic-logomark.webp",
    shortcut:
      "/logomarks/basic-logomark.webp",
    apple: "/logomarks/basic-logomark.webp",
  },
};

import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { PageTransition } from "@/components/layout/page-transition";
import { LoadingProvider } from "@/components/shared/loading-context";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        nunito.variable,
        playfair.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <head>
        {/* Above-the-fold critical hero asset preloads */}
        <link
          rel="preload"
          href="/logos/basic/logo black.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/images/hero_section.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body
        className={`${nunito.className} bg-forest text-white selection:bg-vibrant selection:text-white min-h-screen`}
      >
        <SmoothScroll>
          <LoadingProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </LoadingProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
