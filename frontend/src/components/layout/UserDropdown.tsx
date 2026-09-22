"use client";
import { cn } from "@/lib/utils";
import React, {
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  User,
  Home,
  LogOut,
  AlertTriangle,
  X,
  Store,
  Wallet,
  Sparkles,
  Crown,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useAppRouter as useRouter, useGlobalLoading } from "@/components/shared/loading-context";
import Cookies from "js-cookie";
import { SellerOnboardingModal } from "@/components/modals/SellerOnboardingModal";
import { PranataPayModal } from "@/components/modals/PranataPayModal";
import { UpgradePlusModal } from "@/components/modals/UpgradePlusModal";
import { PlusBadge } from "@/components/ui/plus-badge";
import { AvatarHalo } from "@/components/ui/avatar-halo";

export default function UserDropdown({
  profile,
}: {
  profile: any;
}) {
  const [isOpen, setIsOpen] =
    useState(false);
  const [
    showLogoutModal,
    setShowLogoutModal,
  ] = useState(false);
  const [
    showOnboardingModal,
    setShowOnboardingModal,
  ] = useState(false);
  const [showPayModal, setShowPayModal] =
    useState(false);
  const [showUpgradeModal, setShowUpgradeModal] =
    useState(false);
  const [mounted, setMounted] =
    useState(false);
  const dropdownRef =
    useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { navigateTo } = useGlobalLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent,
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth-token");
    localStorage.removeItem(
      "pranata_session",
    );
    localStorage.removeItem(
      "farmpro_session",
    );
    window.location.href = "/";
  };

  const isPlus = Boolean(profile?.subscriptionTier && profile.subscriptionTier !== "FREE");

  const initials = (
    profile?.fullName ||
    profile?.username ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() =>
          router.prefetch("/profile")
        }
        className={cn(
          "flex items-center gap-2",
          "transition-transform hover:scale-105 pl-1",
          "cursor-pointer focus:outline-none",
        )}
      >
        <AvatarHalo
          isPlus={isPlus}
          avatarUrl={profile?.avatarUrl || profile?.avatar}
          initials={initials}
          size="sm"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.95,
            }}
            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
            className={cn(
              "absolute right-0 mt-2",
              "w-64 bg-white/95 backdrop-blur-md",
              "border border-[#E8E3D2] rounded-2xl",
              "shadow-xl z-50 overflow-hidden",
              "py-2",
            )}
          >
            {/* Header User Info */}
            <div
              className={cn(
                "px-4 py-3 border-b",
                "border-[#E8E3D2]/60 bg-[#F8F6F0]/50",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-black text-sm text-[#1C241E] truncate">
                  {profile?.fullName ||
                    profile?.username ||
                    "Pengguna"}
                </p>
                {isPlus ? (
                  <PlusBadge
                    variant="white"
                    size="sm"
                    wrapper="pill"
                  />
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#7A8678] text-[9px] font-bold uppercase">
                    FREE
                  </span>
                )}
              </div>
              {profile?.username && (
                <p className="text-xs font-bold text-[#7A8678] truncate">
                  @{profile.username}
                </p>
              )}
              {profile?.role && (
                <span
                  className={cn(
                    "inline-block mt-1 text-[10px]",
                    "font-black uppercase px-2",
                    "py-0.5 rounded-full bg-[#EEF2E6]",
                    "text-[#2B4C3B]",
                  )}
                >
                  {profile.role ===
                  "PRODUCER"
                    ? "Peternak / Penjual"
                    : "Pembeli"}
                </span>
              )}
            </div>

            {/* Pranata Pay Wallet Item */}
            <div className="p-2 border-b border-[#E8E3D2]/60">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowPayModal(true);
                }}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EEF2E6] border border-[#E8E3D2] transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logos/pay/pay-black.webp"
                    alt="Pranata Pay"
                    className="h-6 w-auto object-contain"
                  />
                  <div className="border-l border-[#E8E3D2] pl-2.5">
                    <span className="text-xs sm:text-sm font-black text-[#1C241E] block leading-tight">
                      Rp {(profile?.walletBalance || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2B4C3B] bg-white px-2 py-1 rounded-md shadow-xs border border-[#E8E3D2]">
                  Buka
                </span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {!isPlus && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowUpgradeModal(true);
                  }}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-black text-[#856608] hover:bg-amber-50/70 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    Upgrade ke <img src="/logos/plus/plus-black.webp" alt="Pranata Plus" className="h-5 w-auto object-contain inline" />
                  </span>
                  <span className="text-[10px] font-bold text-[#856608] bg-amber-100/80 px-2 py-0.5 rounded-md">
                    Rp 79rb
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigateTo("/profile");
                }}
                className={cn(
                  "w-full px-4 py-2.5",
                  "flex items-center gap-3",
                  "text-xs sm:text-sm font-bold",
                  "text-[#1C241E] hover:bg-[#F8F6F0] transition-colors",
                  "cursor-pointer",
                )}
              >
                <User
                  size={16}
                  className="text-[#2B4C3B]"
                />
                <span>Profil Saya</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigateTo("/");
                }}
                className={cn(
                  "w-full px-4 py-2.5",
                  "flex items-center gap-3",
                  "text-xs sm:text-sm font-bold",
                  "text-[#1C241E] hover:bg-[#F8F6F0] transition-colors",
                  "cursor-pointer",
                )}
              >
                <Home
                  size={16}
                  className="text-[#2B4C3B]"
                />
                <span>Halaman Utama</span>
              </button>
            </div>

            <div className="border-t border-[#E8E3D2]/60 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutModal(true);
                }}
                className={cn(
                  "w-full px-4 py-2.5",
                  "flex items-center gap-3",
                  "text-xs sm:text-sm font-bold",
                  "text-red-600 hover:bg-red-50 transition-colors",
                  "cursor-pointer",
                )}
              >
                <LogOut
                  size={16}
                  className="text-red-600"
                />
                <span>Keluar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Pranata Pay Modal */}
      <PranataPayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSuccess={() => {
          // Keep state smooth without hard server re-renders
        }}
      />

      {/* Upgrade Plus Modal */}
      <UpgradePlusModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        initialPlan={profile?.role === "PRODUCER" ? "seller" : "customer"}
        onSuccess={() => {
          // Keep state smooth without hard server re-renders
        }}
      />


      {/* Logout Confirmation Modal via React Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showLogoutModal && (
              <div
                className={cn(
                  "fixed inset-0 z-99999",
                  "flex items-center justify-center",
                  "p-4",
                )}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() =>
                    setShowLogoutModal(false)
                  }
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                  }}
                  className={cn(
                    "relative w-full max-w-sm",
                    "bg-white rounded-2xl sm:rounded-[2rem]",
                    "p-6 sm:p-8 border",
                    "border-[#E8E3D2] shadow-2xl z-10",
                    "text-center space-y-4",
                  )}
                >
                  <button
                    onClick={() =>
                      setShowLogoutModal(
                        false,
                      )
                    }
                    className={cn(
                      "absolute top-4 right-4",
                      "p-2 rounded-full text-[#7A8678]",
                      "hover:text-[#1C241E] hover:bg-[#F8F6F0] transition-colors",
                      "cursor-pointer",
                    )}
                  >
                    <X size={18} />
                  </button>

                  <div
                    className={cn(
                      "w-14 h-14 bg-red-100",
                      "text-red-600 rounded-full flex",
                      "items-center justify-center mx-auto",
                      "shadow-inner",
                    )}
                  >
                    <AlertTriangle
                      size={28}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#1C241E] mb-2">
                      Keluar dari Akun?
                    </h3>
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-medium",
                        "text-[#5A635B] leading-relaxed",
                      )}
                    >
                      Apakah Anda yakin ingin
                      keluar dari akun ini?
                      Sesi Anda di perangkat
                      ini akan diakhiri.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowLogoutModal(
                          false,
                        )
                      }
                      className={cn(
                        "flex-1 py-3 px-4",
                        "rounded-full border border-[#D5D0C5] bg-white/70 hover:bg-white",
                        "text-[#3F4841] hover:text-[#1C241E] font-bold text-xs",
                        "sm:text-sm transition-all duration-200 transform-gpu hover:scale-[1.02] active:scale-[0.98]",
                        "cursor-pointer shadow-xs",
                      )}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={cn(
                        "flex-1 py-3 px-4",
                        "rounded-full bg-red-600 hover:bg-red-700",
                        "text-white font-bold text-xs",
                        "sm:text-sm transition-all duration-200 transform-gpu shadow-[0_10px_20px_-8px_rgba(220,38,38,0.4)]",
                        "cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-red-400/20",
                      )}
                    >
                      Ya, Keluar
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <SellerOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() =>
          setShowOnboardingModal(false)
        }
      />
    </div>
  );
}
