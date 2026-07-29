"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, Zap, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import UserDropdown from "./UserDropdown";

import BrandLogoSwitcher from "./BrandLogoSwitcher";

export default function MarketplaceNavbar({ 
  searchQuery, 
  setSearchQuery,
  leftContent,
  centerContent,
  cartCount
}: { 
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  cartCount?: number;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [localCartCount, setLocalCartCount] = useState(0);

  const displayCartCount = cartCount !== undefined ? cartCount : localCartCount;

  useEffect(() => {
    const sessionStr = localStorage.getItem("pranata_session") || localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      setProfile(parsed);

      if (parsed.id) {
        const API_BASE = getApiBaseUrl();
        fetchApi(`${API_BASE}/api/profile/${parsed.id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.role) {
              const updatedSession = { ...parsed, ...data };
              setProfile(updatedSession);
              localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
              localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
            }
          })
          .catch(() => {});
      }
    }

    const checkCart = async () => {
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      const API_BASE = getApiBaseUrl();
      try {
        const res = await fetchApi(`${API_BASE}/api/cart/${session.id}`);
        if (res.ok) {
          const cartData = await res.json();
          if (Array.isArray(cartData)) setLocalCartCount(cartData.length);
        }
      } catch (e) {
        // network error, ignore polling failure
      }
    };

    checkCart();
    
    const interval = setInterval(checkCart, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-between gap-1.5 min-[380px]:gap-3 md:gap-4 bg-white/95 backdrop-blur-md py-3 min-[380px]:py-3.5 sm:py-3.5 px-2.5 min-[380px]:px-4 md:px-8 border-b border-[#E8E3D2] shadow-sm text-[#1C241E]">
      {/* Left */}
      {leftContent ? (
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">{leftContent}</div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <BrandLogoSwitcher currentApp="market" isProducer={profile?.role === "PRODUCER"} />
        </div>
      )}

      {/* Center: Search Bar or Custom Content (Always responsive & flex centered) */}
      {centerContent ? (
        <div className="flex-1 flex justify-center items-center mx-0.5 sm:mx-4">{centerContent}</div>
      ) : setSearchQuery !== undefined ? (
        <div className="flex-1 max-w-xl mx-1 min-[380px]:mx-2 sm:mx-4 relative">
          <input 
            id="search-input"
            type="text" 
            placeholder="Cari daging, susu, telur..." 
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E8E3D2] text-[#1C241E] font-bold text-[10.5px] min-[360px]:text-xs sm:text-sm rounded-xl min-[380px]:rounded-2xl py-2.5 sm:py-3.5 pl-2.5 sm:pl-5 pr-7 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-[#2B4C3B] transition-all shadow-sm placeholder:text-[9.5px] min-[360px]:placeholder:text-[11px] sm:placeholder:text-sm"
          />
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 text-[#5A635B]" />
        </div>
      ) : null}

      {/* Right: Cart & Profile */}
      <div className="flex items-center gap-1 min-[380px]:gap-2.5 sm:gap-4 shrink-0">
        {/* Cart */}
        <Link href="/market/cart" className="relative p-1 min-[380px]:p-2 text-[#5A635B] hover:text-[#2B4C3B] hover:bg-[#E8E3D2]/50 rounded-xl transition-all">
          <ShoppingCart className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 sm:w-6 sm:h-6" />
          <AnimatePresence>
            {displayCartCount > 0 && (
              <motion.span 
                key={displayCartCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -top-1 -right-1 bg-rust text-white text-[9px] min-[380px]:text-[10px] font-black w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-[#F8F6F0]"
              >
                {displayCartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <UserDropdown profile={profile} />
      </div>
    </header>
  );
}
