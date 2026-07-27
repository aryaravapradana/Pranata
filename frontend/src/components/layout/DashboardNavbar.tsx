"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { name: "Hub", href: "/hub" },
  { name: "Kalender", href: "/hub/calendar" },
  { name: "Toko Saya", href: "/hub/store" },
  { name: "Pesanan", href: "/hub/orders" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (sessionStr) {
      setProfile(JSON.parse(sessionStr));
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/hub') return pathname === '/hub';
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#E8E3D2]/50 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.05)] text-[#1C241E] py-2.5 px-4 md:py-3.5 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Row: Brand Logo & User Profile (Mobile & Desktop) */}
        <div className="flex items-center justify-between md:grid md:grid-cols-3">
          
          {/* Brand Logo - Kiri */}
          <div className="flex items-center justify-start">
            <Link href="/hub" className="h-7 md:h-8 transition-transform hover:scale-105">
              <img src="/logos/hub/hub-black.webp" alt="Pranata" className="h-full object-contain" loading="lazy" decoding="async" />
            </Link>
          </div>

          {/* Navigasi Utama - Desktop Only (Tengah Presisi Layar dengan Animated Pill) */}
          <nav className="hidden md:flex items-center justify-center gap-1.5 text-sm font-bold text-[#7A8678]">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onMouseEnter={() => router.prefetch(item.href)}
                  className={`relative px-4 py-1.5 rounded-full transition-colors ${
                    active ? 'text-[#1C241E] font-extrabold' : 'hover:text-[#1C241E]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="desktopNavPill"
                      className="absolute inset-0 bg-[#E8E3D2]/65 rounded-full -z-10 border border-[#D8D2C0]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Akun - Kanan */}
          <div className="flex items-center justify-end">
            <Link 
              href="/profile" 
              onMouseEnter={() => router.prefetch("/profile")}
              className="flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E8E3D2] border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
                {(profile?.avatarUrl || profile?.avatar) ? (
                  <img src={profile.avatarUrl || profile.avatar} alt="Profile" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full bg-[#3A6B49] flex items-center justify-center text-white font-bold text-sm md:text-lg">
                    {(profile?.fullName || profile?.name || profile?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          </div>

        </div>

        {/* Mobile Navigation Segment Bar - Fully Animated Pill */}
        <nav className="md:hidden grid grid-cols-4 gap-1 mt-2.5 p-1 bg-[#E8E3D2]/50 rounded-2xl border border-[#E8E3D2] text-[11px] font-extrabold text-center text-[#7A8678]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onTouchStart={() => router.prefetch(item.href)}
                className={`relative py-1.5 rounded-xl transition-all ${
                  active ? 'text-[#1C241E] font-black' : 'hover:text-[#2B4C3B]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10 border border-[#E8E3D2]/50"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
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
