"use client";
import { cn } from "@/lib/utils";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  X,
} from "lucide-react";

interface SellerWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpgrade: () => void;
}

export function SellerWarningModal({
  isOpen,
  onClose,
  onConfirmUpgrade,
}: SellerWarningModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow =
        "hidden";
      document.documentElement.style.overflow =
        "hidden";
      document.body.style.touchAction =
        "none";
      if (
        typeof window !== "undefined" &&
        (window as any).__lenis
      ) {
        (window as any).__lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
      document.body.style.touchAction = "";
      if (
        typeof window !== "undefined" &&
        (window as any).__lenis
      ) {
        (window as any).__lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
      document.body.style.touchAction = "";
      if (
        typeof window !== "undefined" &&
        (window as any).__lenis
      ) {
        (window as any).__lenis.start();
      }
    };
  }, [isOpen]);

  if (typeof window === "undefined")
    return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-99999",
            "flex items-center justify-center",
            "p-4 sm:p-6 overflow-y-auto",
          )}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn(
              "fixed inset-0 bg-black/60",
              "backdrop-blur-sm touch-none",
            )}
          />

          {/* Modal Container */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={cn(
              "relative w-full max-w-sm sm:max-w-md md:max-w-lg",
              "bg-white rounded-[1.75rem] sm:rounded-[2rem]",
              "p-5 sm:p-7 md:p-8 border",
              "border-[#E8E3D2] shadow-2xl z-10",
              "text-center my-auto overflow-hidden",
              "max-h-[90vh] overflow-y-auto custom-scrollbar",
            )}
          >
            {/* Close Icon */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-3.5 right-3.5",
                "sm:top-5 sm:right-5 p-2",
                "rounded-full text-[#7A8678] hover:text-[#1C241E]",
                "hover:bg-[#F8F6F0] transition-colors cursor-pointer",
                "z-20",
              )}
            >
              <X size={18} />
            </button>

            {/* Triangle Warning Icon Badge */}
            <div
              className={cn(
                "mx-auto w-14 h-14",
                "sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl",
                "bg-[#FFF3E0] text-[#C25939]",
                "flex items-center justify-center mb-3.5 sm:mb-4",
                "border border-[#FFE0B2] shadow-inner",
              )}
            >
              <AlertTriangle
                size={28}
                className="stroke-[2.2] sm:w-8 sm:h-8"
              />
            </div>

            {/* Headline */}
            <h3
              className={cn(
                "text-lg sm:text-xl md:text-2xl font-black",
                "text-[#1C241E] mb-2 tracking-tight",
                "leading-snug",
              )}
            >
              Akses Penjual Dibutuhkan
            </h3>

            {/* Explanatory Body */}
            <p
              className={cn(
                "text-xs sm:text-sm text-[#5A635B] leading-relaxed",
                "mb-5 sm:mb-6 max-w-sm mx-auto font-medium",
              )}
            >
              Akun Anda saat ini terdaftar sebagai{" "}
              <strong className="text-[#1C241E] font-extrabold">
                Pembeli
              </strong>
              . Buka toko dan daftarkan peternakan
              Anda untuk mengelola produk, menerima
              pesanan, dan mengakses fitur Pranata
              Hub.
            </p>

            {/* Buttons Row - fluid on mobile, comfortable on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={onClose}
                className={cn(
                  "w-full sm:flex-1 py-3 px-4 rounded-full",
                  "border border-[#D5D0C5] text-[#3F4841] bg-white/70",
                  "hover:bg-white hover:text-[#1C241E]",
                  "text-xs sm:text-sm font-bold transition-all duration-200 transform-gpu",
                  "hover:scale-[1.02] active:scale-[0.98] shadow-xs",
                  "order-2 sm:order-1 cursor-pointer",
                )}
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  onClose();
                  onConfirmUpgrade();
                }}
                className={cn(
                  "w-full sm:flex-1 py-3 px-4 rounded-full",
                  "bg-pranata hover:bg-[#1E362A] text-[#F8F6F0]",
                  "text-xs sm:text-sm font-bold shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)]",
                  "hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)] transition-all duration-200 transform-gpu flex",
                  "items-center justify-center gap-2 group",
                  "order-1 sm:order-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-white/10",
                )}
              >
                <span>Buka Toko Sekarang</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
