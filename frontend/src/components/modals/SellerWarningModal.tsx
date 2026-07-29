"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Store, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, X } from "lucide-react";

interface SellerWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpgrade: () => void;
}

export function SellerWarningModal({ isOpen, onClose, onConfirmUpgrade }: SellerWarningModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm touch-none"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-[#E8E3D2] shadow-2xl z-10 text-center my-auto overflow-hidden"
          >
            {/* Close Icon */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#F8F6F0] transition-colors cursor-pointer z-20"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center text-amber-600 mb-5 shadow-sm relative">
              <Store size={32} className="text-[#2B4C3B]" />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-md">
                <ShieldAlert size={14} />
              </div>
            </div>

            {/* Content Header */}
            <h3 className="text-xl sm:text-2xl font-black text-[#1C241E] tracking-tight leading-snug mb-2.5">
              Kamu Belum Terdaftar Sebagai Penjual!
            </h3>
            <p className="text-xs sm:text-sm text-[#5A635B] font-medium leading-relaxed mb-6">
              Akses fitur eksklusif <span className="font-extrabold text-[#2B4C3B]">Pranata Hub</span> & <span className="font-extrabold text-[#2B4C3B]">Intelligence</span> memerlukan akun penjual terverifikasi. Daftarkan toko peternakanmu untuk mulai berjualan dan mengelola produk.
            </p>

            {/* Quick Benefits List */}
            <div className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#E8E3D2]/80 space-y-2.5 mb-6 text-left">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1C241E]">
                <CheckCircle2 size={16} className="text-[#2B4C3B] shrink-0" />
                <span>Manajemen Produk & Pesanan Real-time</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1C241E]">
                <CheckCircle2 size={16} className="text-[#2B4C3B] shrink-0" />
                <span>Analitik Bisnis & Prediksi Cerdas (AI)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1C241E]">
                <CheckCircle2 size={16} className="text-[#2B4C3B] shrink-0" />
                <span>Pendaftaran Gratis (Kurang dari 1 menit)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-1/2 py-3 px-5 rounded-full border border-[#E8E3D2] bg-white hover:bg-[#F8F6F0] text-[#5A635B] font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer order-2 sm:order-1"
              >
                Nanti Saja
              </button>
              <button
                onClick={() => {
                  onClose();
                  onConfirmUpgrade();
                }}
                className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#2B4C3B] hover:bg-[#1E362A] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
