"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Store, ChevronDown } from "lucide-react";

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

  const isActive = (path: string) => {
    if (path === '/hub' && pathname === '/hub') return true;
    if (path !== '/hub' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="grid grid-cols-2 md:grid-cols-3 items-center sticky top-0 z-50 bg-[#F8F6F0] py-3 md:py-4 px-4 md:px-8 border-b border-[#E8E3D2]/50 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.05)] text-[#1C241E]">
      
      {/* Brand Logo - Kiri (Col 1) */}
      <div className="flex items-center gap-3 justify-start">
        <Link href="/hub" className="h-8 transition-transform hover:scale-105">
          <img src="/logos/hub/hub-black.webp" alt="Pranata" className="h-full object-contain" loading="lazy" decoding="async" />
        </Link>
      </div>

      {/* Navigasi Utama - Presisi 100% Tengah Layar (Col 2) */}
      <nav className="flex items-center justify-center gap-6 md:gap-8 text-sm font-bold text-[#7A8678] col-span-2 md:col-span-1 order-3 md:order-2 mt-2 md:mt-0">
        <Link 
          href="/hub" 
          className={`pb-1 transition-colors ${isActive('/hub') ? 'text-[#1C241E] border-b-2 border-[#1C241E]' : 'hover:text-[#2B4C3B]'}`}
        >
          Hub
        </Link>
        <Link 
          href="/hub/calendar" 
          className={`pb-1 transition-colors ${isActive('/hub/calendar') ? 'text-[#1C241E] border-b-2 border-[#1C241E]' : 'hover:text-[#2B4C3B]'}`}
        >
          Kalender
        </Link>
        <Link 
          href="/hub/store" 
          className={`pb-1 transition-colors ${isActive('/hub/store') ? 'text-[#1C241E] border-b-2 border-[#1C241E]' : 'hover:text-[#2B4C3B]'}`}
        >
          Toko Saya
        </Link>
        <Link 
          href="/hub/orders" 
          className={`pb-1 transition-colors ${isActive('/hub/orders') ? 'text-[#1C241E] border-b-2 border-[#1C241E]' : 'hover:text-[#2B4C3B]'}`}
        >
          Pesanan
        </Link>
      </nav>

      {/* Akun - Kanan (Col 3) */}
      <div className="flex items-center justify-end order-2 md:order-3">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="w-10 h-10 rounded-full bg-[#E8E3D2] border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
            {(profile?.avatarUrl || profile?.avatar) ? (
              <img src={profile.avatarUrl || profile.avatar} alt="Profile" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <div className="w-full h-full bg-[#3A6B49] flex items-center justify-center text-white font-bold text-lg">
                {(profile?.fullName || profile?.name || profile?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </button>
      </div>

    </header>
  );
}
