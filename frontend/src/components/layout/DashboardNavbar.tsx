"use client";
import { cn } from "@/lib/utils";

import React, {
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { motion } from "framer-motion";

import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";
import UserDropdown from "./UserDropdown";

import BrandLogoSwitcher from "./BrandLogoSwitcher";

const NAV_ITEMS = [
  { name: "Hub", href: "/hub" },
  {
    name: "Kalender",
    href: "/hub/calendar",
  },
  { name: "Toko Saya", href: "/hub/store" },
  { name: "Pesanan", href: "/hub/orders" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] =
    useState<any>(null);

  useEffect(() => {
    const sessionStr =
      localStorage.getItem(
        "pranata_session",
      ) ||
      localStorage.getItem(
        "farmpro_session",
      );
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      setProfile(parsed);

      if (parsed.id) {
        const API_BASE = getApiBaseUrl();
        fetchApi(
          `${API_BASE}/api/profile/${parsed.id}`,
        )
          .then((res) =>
            res.ok ? res.json() : null,
          )
          .then((data) => {
            if (data && data.role) {
              const updatedSession = {
                ...parsed,
                ...data,
              };
              setProfile(updatedSession);
              localStorage.setItem(
                "pranata_session",
                JSON.stringify(
                  updatedSession,
                ),
              );
              localStorage.setItem(
                "farmpro_session",
                JSON.stringify(
                  updatedSession,
                ),
              );
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const isActive = (href: string) => {
    if (href === "/hub")
      return pathname === "/hub";
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "w-full bg-[#F8F6F0]/95 backdrop-blur-md",
        "border-b border-[#E8E3D2]/50 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.05)]",
        "text-[#1C241E] py-2.5 px-4",
        "md:py-3.5 md:px-8",
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Brand Logo & User Profile (Mobile & Desktop) */}
        <div
          className={cn(
            "flex items-center justify-between",
            "md:grid md:grid-cols-3",
          )}
        >
          {/* Brand Logo - Kiri */}
          <div className="flex items-center justify-start">
            <BrandLogoSwitcher
              currentApp="hub"
              isProducer={
                profile?.role === "PRODUCER"
              }
            />
          </div>

          {/* Navigasi Utama - Desktop Only (Tengah Presisi Layar dengan Animated Pill) */}
          <nav
            className={cn(
              "hidden md:flex items-center",
              "justify-center gap-1.5 text-sm",
              "font-bold text-[#7A8678]",
            )}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(
                item.href,
              );
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() =>
                    router.prefetch(
                      item.href,
                    )
                  }
                  className={`relative px-4 py-1.5 rounded-full transition-colors ${
                    active
                      ? "text-[#1C241E] font-extrabold"
                      : "hover:text-[#1C241E]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="desktopNavPill"
                      className={cn(
                        "absolute inset-0 bg-[#E8E3D2]/65",
                        "rounded-full -z-10 border",
                        "border-[#D8D2C0]",
                      )}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Akun - Kanan */}
          <div className="flex items-center justify-end">
            <UserDropdown
              profile={profile}
            />
          </div>
        </div>

        {/* Mobile Navigation Segment Bar - Fully Animated Pill */}
        <nav
          className={cn(
            "md:hidden grid grid-cols-4",
            "gap-1 mt-2.5 p-1",
            "bg-[#E8E3D2]/50 rounded-2xl border",
            "border-[#E8E3D2] text-[11px] font-extrabold",
            "text-center text-[#7A8678]",
          )}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(
              item.href,
            );
            return (
              <Link
                key={item.href}
                href={item.href}
                onTouchStart={() =>
                  router.prefetch(item.href)
                }
                className={`relative py-1.5 rounded-xl transition-all ${
                  active
                    ? "text-[#1C241E] font-black"
                    : "hover:text-[#2B4C3B]"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className={cn(
                      "absolute inset-0 bg-white",
                      "rounded-xl shadow-xs -z-10",
                      "border border-[#E8E3D2]/50",
                    )}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 32,
                    }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
