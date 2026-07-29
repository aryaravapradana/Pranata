"use client";
import { FooterCommunityWave } from "@/components/ui/footer-community-wave";

export function Footer({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  return (
    <FooterCommunityWave variant={variant} />
  );
}
