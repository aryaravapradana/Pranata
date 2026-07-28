"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Home, LogOut, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/components/shared/loading-context";
import Cookies from "js-cookie";

export default function UserDropdown({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { navigateTo } = useGlobalLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth-token");
    localStorage.removeItem("pranata_session");
    localStorage.removeItem("farmpro_session");
    window.location.href = "/";
  };

  const initials = (profile?.fullName || profile?.username || "U").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => router.prefetch("/profile")}
        className="flex items-center gap-2 transition-transform hover:scale-105 pl-1 cursor-pointer focus:outline-none"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#E8E3D2] overflow-hidden shadow-sm flex items-center justify-center border-2 border-white">
          {(profile?.avatarUrl || profile?.avatar) ? (
            <img src={profile.avatarUrl || profile.avatar} alt="Profile" className="w-full h-full object-cover" decoding="async" />
          ) : (
            <div className="w-full h-full bg-[#2B4C3B] flex items-center justify-center text-white font-bold text-xs sm:text-lg">
              {initials}
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-[#E8E3D2] rounded-2xl shadow-xl z-50 overflow-hidden py-2"
          >
            {/* Header User Info */}
            <div className="px-4 py-3 border-b border-[#E8E3D2]/60 bg-[#F8F6F0]/50">
              <p className="font-black text-sm text-[#1C241E] truncate">{profile?.fullName || profile?.username || "Pengguna"}</p>
              {profile?.username && (
                <p className="text-xs font-bold text-[#7A8678] truncate">@{profile.username}</p>
              )}
              {profile?.role && (
                <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#EEF2E6] text-[#2B4C3B]">
                  {profile.role === "PRODUCER" ? "Peternak / Penjual" : "Pembeli"}
                </span>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => { setIsOpen(false); navigateTo("/profile"); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm font-bold text-[#1C241E] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
              >
                <User size={16} className="text-[#2B4C3B]" />
                <span>Profil Saya</span>
              </button>

              <button
                onClick={() => { setIsOpen(false); navigateTo("/"); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm font-bold text-[#1C241E] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
              >
                <Home size={16} className="text-[#2B4C3B]" />
                <span>Halaman Utama</span>
              </button>
            </div>

            <div className="border-t border-[#E8E3D2]/60 pt-1">
              <button
                onClick={() => { setIsOpen(false); setShowLogoutModal(true); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} className="text-red-600" />
                <span>Keluar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal via React Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-[#E8E3D2] shadow-2xl z-10 text-center space-y-4"
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <AlertTriangle size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#1C241E] mb-2">Keluar dari Akun?</h3>
                  <p className="text-xs sm:text-sm font-medium text-[#5A635B] leading-relaxed">
                    Apakah Anda yakin ingin keluar dari akun ini? Sesi Anda di perangkat ini akan diakhiri.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-[#DDE2D6] text-[#1C241E] font-bold text-xs sm:text-sm hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
                  >
                    Ya, Keluar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
