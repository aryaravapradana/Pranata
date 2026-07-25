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
    <header className="sticky top-0 z-50 w-full bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#E8E3D2]/50 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.05)] text-[#1C241E] py-2.5 px-4 md:py-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Row: Brand Logo & User Profile (Mobile & Desktop) */}
        <div className="flex items-center justify-between md:grid md:grid-cols-3">
          
          {/* Brand Logo - Kiri */}
          <div className="flex items-center justify-start">
            <Link href="/hub" className="h-7 md:h-8 transition-transform hover:scale-105">
              <img src="/logos/hub/hub-black.webp" alt="Pranata" className="h-full object-contain" loading="lazy" decoding="async" />
            </Link>
          </div>

          {/* Navigasi Utama - Desktop Only (Tengah Presisi Layar) */}
          <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-bold text-[#7A8678]">
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

          {/* Akun - Kanan */}
          <div className="flex items-center justify-end">
            <button onClick={() => router.push("/settings")} className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#E8E3D2] border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
                {(profile?.avatarUrl || profile?.avatar) ? (
                  <img src={profile.avatarUrl || profile.avatar} alt="Profile" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full bg-[#3A6B49] flex items-center justify-center text-white font-bold text-sm md:text-lg">
                    {(profile?.fullName || profile?.name || profile?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Segment Bar - Fully unclipped 4-column layout */}
        <nav className="md:hidden grid grid-cols-4 gap-1 mt-2.5 p-1 bg-[#E8E3D2]/50 rounded-2xl border border-[#E8E3D2] text-[11px] font-extrabold text-center text-[#7A8678]">
          <Link 
            href="/hub" 
            className={`py-1.5 rounded-xl transition-all ${isActive('/hub') ? 'bg-white text-[#1C241E] shadow-xs font-black' : 'hover:text-[#2B4C3B]'}`}
          >
            Hub
          </Link>
          <Link 
            href="/hub/calendar" 
            className={`py-1.5 rounded-xl transition-all ${isActive('/hub/calendar') ? 'bg-white text-[#1C241E] shadow-xs font-black' : 'hover:text-[#2B4C3B]'}`}
          >
            Kalender
          </Link>
          <Link 
            href="/hub/store" 
            className={`py-1.5 rounded-xl transition-all ${isActive('/hub/store') ? 'bg-white text-[#1C241E] shadow-xs font-black' : 'hover:text-[#2B4C3B]'}`}
          >
            Toko Saya
          </Link>
          <Link 
            href="/hub/orders" 
            className={`py-1.5 rounded-xl transition-all ${isActive('/hub/orders') ? 'bg-white text-[#1C241E] shadow-xs font-black' : 'hover:text-[#2B4C3B]'}`}
          >
            Pesanan
          </Link>
        </nav>

      </div>
    </header>
  );
}
