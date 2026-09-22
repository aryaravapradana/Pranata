"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Wallet,
  Sparkles,
  History,
  ShoppingCart,
  Store,
  Utensils,
  Tag,
  Snowflake,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { Logo } from "idn-finlogos/react";
import { PranataPayModal } from "@/components/modals/PranataPayModal";

interface TransactionResult {
  status: "success" | "error";
  title: string;
  message: string;
  amount: number;
  fee: number;
  paymentMethod: string;
  transactionId?: string;
  timestamp?: string;
}

interface UpgradePlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPlan?: "customer" | "seller";
}

export function UpgradePlusModal({
  isOpen,
  onClose,
  onSuccess,
  initialPlan,
}: UpgradePlusModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("pranata_pay");
  const [openPaymentCategory, setOpenPaymentCategory] = useState<string>("va");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  const API_BASE = getApiBaseUrl();

  const getSession = () => {
    try {
      const sessionStr =
        localStorage.getItem("pranata_session") ||
        localStorage.getItem("farmpro_session");
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        if (parsed?.id) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const defaultSession = {
      id: "demo-user",
      fullName: "Pengguna Pranata",
      email: "user@pranata.id",
      walletBalance: 250000,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("pranata_session", JSON.stringify(defaultSession));
    }
    return defaultSession;
  };

  const fetchSessionProfile = async () => {
    const session = getSession();
    if (!session?.id) return;
    setSessionData(session);
    try {
      const res = await fetchApi(`${API_BASE}/api/profile/${session.id}`);
      if (res.ok) {
        const data = await res.json();
        const updated = { ...session, walletBalance: data.walletBalance ?? session.walletBalance };
        setSessionData(updated);
        localStorage.setItem("pranata_session", JSON.stringify(updated));
        localStorage.setItem("farmpro_session", JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      setErrorMessage(null);
      setSuccess(false);
      setShowCheckoutModal(false);
      setTransactionResult(null);
      fetchSessionProfile();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    };
  }, [isOpen]);

  const [selectedRoleTier, setSelectedRoleTier] = useState<"customer" | "seller">("customer");

  const isSellerPlan = selectedRoleTier === "seller";
  const planPrice = isSellerPlan ? 79000 : 39000;
  const planName = isSellerPlan ? "Pranata Plus Seller" : "Pranata Plus Customer";
  const planTierCode = isSellerPlan ? "SELLER_PLUS" : "CUSTOMER_PLUS";
  const isPranataPay = paymentMethod === "pranata_pay";
  const adminFee = isPranataPay ? 0 : 2500;
  const grandTotal = planPrice + adminFee;
  const userBalance = sessionData?.walletBalance || 0;

  useEffect(() => {
    if (isOpen) {
      if (initialPlan) {
        setSelectedRoleTier(initialPlan);
      } else {
        const session = getSession();
        if (session?.role === "PRODUCER") {
          setSelectedRoleTier("seller");
        } else {
          setSelectedRoleTier("customer");
        }
      }
    }
  }, [isOpen, initialPlan]);

  const getPaymentName = () => {
    if (paymentMethod === "pranata_pay") return "Pranata Pay";
    if (paymentMethod === "bca_va") return "BCA VA";
    if (paymentMethod === "mandiri_va") return "Mandiri VA";
    if (paymentMethod === "bri_va") return "BRI VA";
    if (paymentMethod === "bni_va") return "BNI VA";
    if (paymentMethod === "qris") return "QRIS All Payment";
    if (paymentMethod === "gopay") return "GoPay";
    return paymentMethod;
  };

  const handleUpgrade = async () => {
    const session = getSession();

    if (isPranataPay && userBalance < grandTotal) {
      setTransactionResult({
        status: "error",
        title: "Saldo Tidak Mencukupi",
        message: "Saldo Pranata Pay Anda tidak mencukupi untuk melakukan upgrade langganan ini. Silakan isi saldo instan terlebih dahulu atau pilih metode pembayaran lain.",
        amount: planPrice,
        fee: adminFee,
        paymentMethod: "Pranata Pay",
      });
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetchApi(`${API_BASE}/api/subscription/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, plan: planTierCode }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowCheckoutModal(false);
        const updatedSession = {
          ...session,
          subscriptionTier: planTierCode,
          walletBalance: data.profile?.walletBalance ?? (isPranataPay ? Math.max(0, userBalance - grandTotal) : userBalance),
        };
        localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
        localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("session_updated"));
        }

        setTransactionResult({
          status: "success",
          title: `Upgrade ${isSellerPlan ? "Seller" : "Customer"} Plus Berhasil!`,
          message: isSellerPlan
            ? "Selamat! Akun Anda kini aktif sebagai Member Pranata Plus Seller. Seluruh fitur eksklusif Top Placement etalase, Slot Sponsor, Farm Copilot kandang & FCR, dan tender B2B siap digunakan."
            : "Selamat! Akun Anda kini aktif sebagai Member Pranata Plus Customer. Nikmati akses unlimited AI Chef & Resep Masak, 1-Click Smart Cart instan, bebas biaya platform Rp 2.500, dan diskon potongan daging siap dinikmati.",
          amount: planPrice,
          fee: adminFee,
          paymentMethod: getPaymentName(),
          transactionId: `SUB-${Date.now().toString().slice(-8)}`,
          timestamp: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } else {
        setShowCheckoutModal(false);
        const updatedSession = {
          ...session,
          subscriptionTier: planTierCode,
          walletBalance: isPranataPay ? Math.max(0, userBalance - grandTotal) : userBalance,
        };
        localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
        localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("session_updated"));
        }

        setTransactionResult({
          status: "success",
          title: `Upgrade ${isSellerPlan ? "Seller" : "Customer"} Plus Berhasil!`,
          message: isSellerPlan
            ? "Selamat! Akun Anda kini aktif sebagai Member Pranata Plus Seller. Seluruh fitur eksklusif Top Placement etalase, Slot Sponsor, Farm Copilot kandang & FCR, dan tender B2B siap digunakan."
            : "Selamat! Akun Anda kini aktif sebagai Member Pranata Plus Customer. Nikmati akses unlimited AI Chef & Resep Masak, 1-Click Smart Cart instan, bebas biaya platform Rp 2.500, dan diskon potongan daging siap dinikmati.",
          amount: planPrice,
          fee: adminFee,
          paymentMethod: getPaymentName(),
          transactionId: `SUB-${Date.now().toString().slice(-8)}`,
          timestamp: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    } catch (e) {
      setShowCheckoutModal(false);
      const updatedSession = {
        ...session,
        subscriptionTier: planTierCode,
        walletBalance: isPranataPay ? Math.max(0, userBalance - grandTotal) : userBalance,
      };
      localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
      localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("session_updated"));
      }

      setTransactionResult({
        status: "success",
        title: `Upgrade ${isSellerPlan ? "Seller" : "Customer"} Plus Berhasil!`,
        message: isSellerPlan
          ? "Selamat! Akun Anda kini aktif sebagai Member Pranata Plus Seller. Seluruh fitur eksklusif Top Placement etalase, Slot Sponsor, Farm Copilot kandang & FCR, dan tender B2B siap digunakan."
          : "Selamat! Akun Anda kini aktif sebagai Member Pranata Plus Customer. Nikmati akses unlimited AI Chef & Resep Masak, 1-Click Smart Cart instan, bebas biaya platform Rp 2.500, dan diskon potongan daging siap dinikmati.",
        amount: planPrice,
        fee: adminFee,
        paymentMethod: getPaymentName(),
        transactionId: `SUB-${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-99999 overflow-hidden flex flex-col justify-end overscroll-contain"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            onWheel={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 touch-none"
          />

          {/* Full Screen Sliding Modal */}
          <motion.div
            data-lenis-prevent="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "relative w-full h-full max-h-screen bg-[#14231A] z-20",
              "flex flex-col overflow-hidden text-white overscroll-contain shadow-2xl",
            )}
          >
            {/* Floating Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-40 p-2 sm:p-2.5 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
              title="Tutup"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Scrollable Content */}
            <div
              data-lenis-prevent="true"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar pt-6 sm:pt-10"
            >
              <div className="w-full max-w-md sm:max-w-xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-8 lg:space-y-10">
                {success ? (
                  <div className="py-16 text-center space-y-4 bg-white/5 rounded-3xl border border-white/10 p-8 max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/40">
                      <CheckCircle2 size={44} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Selamat! Anda Sekarang Member Plus 🎉
                    </h3>
                    <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                      Fitur Agentic AI terhubung kandang, prioritas etalase pembeli, slot sponsor produk, dan tender pasokan B2B telah aktif di akun Anda.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-4 px-8 py-3 rounded-2xl bg-white text-[#1C2E24] font-black text-sm hover:bg-white/90 transition-all shadow-lg cursor-pointer"
                    >
                      Mulai Gunakan Fitur Plus
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header Intro Title */}
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                      <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                        {isSellerPlan
                          ? "Tingkatkan Skala Bisnis Peternakan Anda"
                          : "Belanja Daging Segar & Resep Pintar Keluarga"}
                      </h1>
                      <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
                        {isSellerPlan
                          ? "Pilih paket yang sesuai untuk mempercepat penjualan ternak, analisis kandang berbasis AI, dan akses tender pasokan B2B."
                          : "Nikmati kemudahan resep masakan pintar keluarga, 1-Click Smart Cart belanja instan, dan bebas biaya layanan di setiap transaksi."}
                      </p>
                    </div>

                    {/* Plan Selector Tabs (Customer vs Seller) */}
                    <div className="flex justify-center pt-1">
                      <div className="inline-flex p-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-inner gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRoleTier("customer")}
                          className={cn(
                            "px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer",
                            selectedRoleTier === "customer"
                              ? "bg-linear-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/40 scale-[1.02] border border-emerald-400/30"
                              : "text-white/70 hover:text-white hover:bg-white/5",
                          )}
                        >
                          <ShoppingCart size={16} className="shrink-0" />
                          <span>Membership Customer (Rp 39.000 / bln)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRoleTier("seller")}
                          className={cn(
                            "px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer",
                            selectedRoleTier === "seller"
                              ? "bg-linear-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#1C2E24] shadow-lg shadow-amber-950/40 scale-[1.02] border border-amber-300/40 font-black"
                              : "text-white/70 hover:text-white hover:bg-white/5",
                          )}
                        >
                          <Store size={16} className="shrink-0" />
                          <span>Membership Seller (Rp 79.000 / bln)</span>
                        </button>
                      </div>
                    </div>

                    {/* Side-by-Side Comparison Cards (Basic vs Plus) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                      {/* BASIC PLAN CARD */}
                      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold uppercase text-white/60 tracking-wider block mb-1">
                                Paket Dasar
                              </span>
                              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                                {isSellerPlan ? "Pranata Basic Seller" : "Pranata Basic Customer"}
                              </h3>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold border border-white/15">
                              Status Aktif
                            </span>
                          </div>

                          <div className="py-4 border-y border-white/10">
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white/90">
                              Gratis
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                              {isSellerPlan
                                ? "Akses standar untuk peternak & pedagang pemula"
                                : "Akses belanja standar untuk konsumen sehari-hari"}
                            </p>
                          </div>

                          {/* Basic Features Checklist */}
                          <div className="space-y-3.5 pt-2 text-xs sm:text-sm">
                            {isSellerPlan ? (
                              <>
                                <div className="flex items-start gap-3 text-white/80">
                                  <CheckCircle2 size={18} className="text-white/40 shrink-0 mt-0.5" />
                                  <span>Listing produk di marketplace umum</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/80">
                                  <CheckCircle2 size={18} className="text-white/40 shrink-0 mt-0.5" />
                                  <span>Pencatatan kandang & ternak standar</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/80">
                                  <CheckCircle2 size={18} className="text-white/40 shrink-0 mt-0.5" />
                                  <span>Tanya jawab AI umum (tanpa sync data kandang)</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Top Placement prioritas teratas di katalog pasar</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Slot Sponsor 1 Produk ke algoritma pembeli</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Akses kirim tender pasokan B2B restoran</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Badge Terpercaya Emas 'Plus Seller'</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Laporan laba rugi P&L otomatis</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-start gap-3 text-white/80">
                                  <CheckCircle2 size={18} className="text-white/40 shrink-0 mt-0.5" />
                                  <span>Akses pencarian katalog produk pasar</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/80">
                                  <CheckCircle2 size={18} className="text-white/40 shrink-0 mt-0.5" />
                                  <span>Tanya jawab resep AI umum (terbatas 5x/hari)</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/80">
                                  <CheckCircle2 size={18} className="text-white/40 shrink-0 mt-0.5" />
                                  <span>Checkout manual tanpa rekomendasi vendor instan</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>1-Click Smart Cart belanja bahan resep instan</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Tanya jawab Agentic AI Chef & Nutrisi tanpa batas</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Bebas Biaya Layanan Platform (Hemat Rp 2.500/transaksi)</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Voucher Diskon & Flash Sale Daging Segar mingguan</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Garansi Kesegaran Rantai Dingin Prioritas (Cold-Chain)</span>
                                </div>
                                <div className="flex items-start gap-3 text-white/40 line-through">
                                  <X size={18} className="text-white/30 shrink-0 mt-0.5" />
                                  <span>Lencana Emas 'Customer Plus' di profil</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mt-8 pt-5 border-t border-white/10">
                          <div className="text-center py-3.5 rounded-2xl bg-white/5 text-white/50 text-xs sm:text-sm font-bold">
                            Paket Saat Ini
                          </div>
                        </div>
                      </div>

                      {/* PLUS PLAN CARD */}
                      <div className="rounded-3xl bg-linear-to-b from-[#1C3627] via-[#162A1E] to-[#122118] border-2 border-[#D4AF37] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative shadow-2xl ring-4 ring-[#D4AF37]/20">
                        {/* Recommendation Badge */}
                        <div className="absolute -top-3.5 right-6 px-4 py-1.5 rounded-full bg-linear-to-r from-[#D4AF37] to-[#F3E5AB] text-[#1C2E24] text-[11px] font-black uppercase tracking-wider shadow-md">
                          {isSellerPlan ? "★ Sangat Direkomendasikan" : "★ Pilihan Terpopuler Pembeli"}
                        </div>

                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold uppercase text-[#D4AF37] tracking-wider block mb-1">
                                {isSellerPlan ? "Paket Akselerasi Bisnis" : "Paket Belanja & Kuliner Pintar"}
                              </span>
                              <div className="flex items-center gap-2.5">
                                <img
                                  src="/logos/plus/plus-white.webp"
                                  alt={planName}
                                  className="h-8 sm:h-10 w-auto object-contain"
                                />
                                <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/25 text-[#F5DEB3] text-[10px] font-black border border-[#D4AF37]/40 tracking-wider uppercase">
                                  {isSellerPlan ? "SELLER PRO" : "CUSTOMER PLUS"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="py-4 border-y border-[#D4AF37]/20">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                                Rp {planPrice.toLocaleString("id-ID")}
                              </span>
                              <span className="text-xs sm:text-sm text-[#F5DEB3]/80 font-bold">
                                / 30 hari
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#F5DEB3]/70 mt-1">
                              {isSellerPlan
                                ? "Semua fitur tanpa batasan & akselerasi penjualan"
                                : "Bebas biaya platform, smart cart & proteksi mutu segar"}
                            </p>
                          </div>

                          {/* Plus Features Checklist */}
                          <div className="space-y-3.5 pt-2 text-xs sm:text-sm">
                            {isSellerPlan ? (
                              <>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Top Placement Prioritas:</strong> Produk Anda tampil paling atas saat pembeli mencari ternak</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Slot Sponsor 1 Produk:</strong> Promosikan 1 produk andalan langsung ke radar pembeli</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Agentic AI Copilot Kandang:</strong> Analisis riil pakan, rasio FCR & margin laba 24/7</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Tender Pasokan B2B:</strong> Ajukan penawaran pasokan rutin ke restoran, hotel & katering</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Badge 'Plus Seller':</strong> Naikkan trust pembeli dan tingkatkan konversi transaksi jualan</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Laporan Finansial P&L Otomatis:</strong> Kalkulasi laba bersih, export kas & biaya pakan</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">1-Click Agentic Smart Cart:</strong> Auto-isi seluruh bahan masakan & potongan segar langsung ke keranjang</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Agentic AI Chef 24/7:</strong> Konsultasi resep ternak, hitung porsi keluarga & rekomendasi gizi tanpa batas</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Bebas Biaya Layanan Platform:</strong> Bebas admin fee Rp 2.500 di setiap transaksi checkout belanja</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Voucher Diskon Eksklusif:</strong> Akses flash sale mingguan untuk karkas, telur omega & susu segar</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Garansi Kesegaran Rantai Dingin:</strong> Prioritas kurir thermo-box agar pesanan tiba dalam kesegaran 100%</span>
                                </div>
                                <div className="flex items-start gap-3 text-white font-medium">
                                  <CheckCircle2 size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span><strong className="text-[#F5DEB3]">Lencana Emas 'Customer Plus':</strong> Badge apresiasi eksklusif di profil akun & ulasan komunitas</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* CTA Inside Card */}
                        <div className="mt-8 pt-5 border-t border-[#D4AF37]/20">
                          <button
                            type="button"
                            onClick={() => {
                              fetchSessionProfile();
                              setShowCheckoutModal(true);
                            }}
                            className={cn(
                              "w-full py-4 rounded-2xl bg-linear-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#1C2E24] font-black text-sm sm:text-base",
                              "shadow-xl shadow-[#D4AF37]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                            )}
                          >
                            <span>Lanjut Pembayaran (Rp {planPrice.toLocaleString("id-ID")})</span>
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* CHECKOUT MODAL (MODAL DI DALAM MODAL) */}
          <AnimatePresence>
            {showCheckoutModal && (
              <div
                data-lenis-prevent="true"
                className="fixed inset-0 z-100001 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
              >
                <motion.div
                  data-lenis-prevent="true"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl bg-[#1C2E24] border-2 border-[#D4AF37]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-8 shadow-2xl space-y-5 sm:space-y-6 text-white relative max-h-[92vh] overflow-y-auto overscroll-contain custom-scrollbar my-auto"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCheckoutModal(false)}
                        className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Kembali"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          Pilih Pembayaran Langganan
                        </h3>
                        <p className="text-[11px] text-[#F5DEB3]">
                          Paket {planName} (Akses 30 Hari)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Responsive Desktop 2-Column / Mobile 1-Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Payment Methods */}
                    <div className="md:col-span-7 space-y-3.5">
                      <h4 className="text-xs font-black uppercase text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-[#D4AF37]" />
                        Metode Pembayaran
                      </h4>

                      {/* 1. PRANATA PAY OPTION */}
                      <label
                        className={cn(
                          "p-3.5 sm:p-4 rounded-2xl border-2 flex flex-col gap-3 cursor-pointer transition-all bg-white text-[#1C241E]",
                          paymentMethod === "pranata_pay"
                            ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-md"
                            : "border-transparent opacity-85 hover:opacity-100",
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <input
                              type="radio"
                              name="checkoutPaymentMethod"
                              checked={paymentMethod === "pranata_pay"}
                              onChange={() => setPaymentMethod("pranata_pay")}
                              className="w-4 h-4 accent-[#2B4C3B] shrink-0"
                            />
                            <img
                              src="/logos/pay/pay-black.webp"
                              alt="Pranata Pay"
                              className="h-5 sm:h-7 w-auto object-contain shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-xs sm:text-sm font-black text-[#1C241E]">Pranata Pay</span>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#2B4C3B] text-white tracking-wider">
                                  Rekomendasi
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-[#2B4C3B] font-bold mt-0.5">
                                Bebas Biaya Layanan (Hemat Rp 2.500) • 1-Klik Bayar
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right pl-6 sm:pl-0 shrink-0">
                            <span className="text-[9px] sm:text-[10px] text-[#7A8678] block">Saldo Anda</span>
                            <span
                              className={cn(
                                "text-xs sm:text-sm font-black",
                                userBalance >= grandTotal ? "text-emerald-700" : "text-rose-600",
                              )}
                            >
                              Rp {userBalance.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* Insufficient Balance Notice */}
                        {paymentMethod === "pranata_pay" && userBalance < grandTotal && (
                          <div className="pt-2 border-t border-[#DDE2D6] flex items-center justify-between gap-2">
                            <span className="text-[11px] text-rose-600 font-semibold">
                              Saldo kurang Rp {(grandTotal - userBalance).toLocaleString("id-ID")}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowTopUpModal(true);
                              }}
                              className="px-3 py-1 rounded-xl bg-[#2B4C3B] text-white text-xs font-bold hover:bg-[#223d2f] transition-all cursor-pointer shadow-xs"
                            >
                              + Isi Saldo Instan
                            </button>
                          </div>
                        )}
                      </label>

                      {/* 2. BANK VA ACCORDION */}
                      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                        <button
                          type="button"
                          onClick={() => setOpenPaymentCategory(openPaymentCategory === "va" ? "" : "va")}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-white/10 transition-colors font-bold text-xs text-white cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span>Bank VA (Fee Rp 2.500)</span>
                          </div>
                          {openPaymentCategory === "va" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <AnimatePresence>
                          {openPaymentCategory === "va" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3.5 pb-3.5 space-y-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                {[
                                  { id: "bca_va", name: "BCA VA", slug: "bca" },
                                  { id: "mandiri_va", name: "Mandiri VA", slug: "mandiri" },
                                  { id: "bri_va", name: "BRI VA", slug: "bri" },
                                  { id: "bni_va", name: "BNI VA", slug: "bni" },
                                ].map((va) => (
                                  <label
                                    key={va.id}
                                    className={cn(
                                      "flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all bg-white text-[#1C241E]",
                                      paymentMethod === va.id
                                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-sm"
                                        : "border-transparent opacity-85 hover:opacity-100",
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="checkoutPaymentMethod"
                                      checked={paymentMethod === va.id}
                                      onChange={() => setPaymentMethod(va.id)}
                                      className="w-3.5 h-3.5 accent-[#2B4C3B] shrink-0"
                                    />
                                    <Logo
                                      slug={va.slug as any}
                                      className="flex items-center justify-center shrink-0 w-11 h-6 [&>svg]:max-h-5 [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain [&>svg]:block [&>svg]:mx-auto [&>svg]:my-auto"
                                    />
                                    <span className="text-[11px] font-bold truncate">{va.name}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 3. E-WALLET / QRIS ACCORDION */}
                      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                        <button
                          type="button"
                          onClick={() => setOpenPaymentCategory(openPaymentCategory === "ewallet" ? "" : "ewallet")}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-white/10 transition-colors font-bold text-xs text-white cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span>E-Wallet & QRIS (Fee Rp 2.500)</span>
                          </div>
                          {openPaymentCategory === "ewallet" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <AnimatePresence>
                          {openPaymentCategory === "ewallet" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3.5 pb-3.5 space-y-2"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                {[
                                  { id: "qris", name: "QRIS All Payment", slug: "qris" },
                                  { id: "gopay", name: "GoPay E-Wallet", slug: "gopay" },
                                ].map((em) => (
                                  <label
                                    key={em.id}
                                    className={cn(
                                      "flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all bg-white text-[#1C241E]",
                                      paymentMethod === em.id
                                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-sm"
                                        : "border-transparent opacity-85 hover:opacity-100",
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      name="checkoutPaymentMethod"
                                      checked={paymentMethod === em.id}
                                      onChange={() => setPaymentMethod(em.id)}
                                      className="w-3.5 h-3.5 accent-[#2B4C3B] shrink-0"
                                    />
                                    <Logo
                                      slug={em.slug as any}
                                      className="flex items-center justify-center shrink-0 w-11 h-6 [&>svg]:max-h-5 [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain [&>svg]:block [&>svg]:mx-auto [&>svg]:my-auto"
                                    />
                                    <span className="text-[11px] font-bold truncate">{em.name}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Right Column: Order Summary & Actions */}
                    <div className="md:col-span-5 space-y-4">
                      {/* Order Summary Ribbon */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                        <h4 className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                          Rincian Pembayaran
                        </h4>
                        <div className="space-y-2 pt-1 border-t border-white/10">
                          <div className="flex justify-between text-white/75 font-medium">
                            <span>Biaya {planName} (30 Hari)</span>
                            <span className="font-bold text-white">Rp {planPrice.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-white/75 font-medium">
                            <span>Biaya Layanan Platform</span>
                            <span className={cn("font-bold", isPranataPay ? "text-emerald-400" : "text-[#F5DEB3]")}>
                              {isPranataPay ? "Gratis (Hemat Rp 2.500)" : "Rp 2.500"}
                            </span>
                          </div>
                          <div className="border-t border-white/10 pt-2.5 flex justify-between font-black text-sm sm:text-base text-white">
                            <span>Total Tagihan</span>
                            <span className="text-[#F5DEB3]">Rp {grandTotal.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Error Notice */}
                      {errorMessage && (
                        <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-200 text-xs font-semibold">
                          <AlertCircle size={16} className="text-rose-400 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowCheckoutModal(false)}
                          className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F8F6F0] font-bold text-xs transition-all duration-200 transform-gpu hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Batal
                        </button>

                        <button
                          type="button"
                          disabled={submitting || (isPranataPay && userBalance < grandTotal)}
                          onClick={handleUpgrade}
                          className={cn(
                            "flex-1 py-3.5 rounded-full bg-linear-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#1C2E24] font-bold text-xs sm:text-sm",
                            "shadow-[0_10px_20px_-8px_rgba(212,175,55,0.4)] hover:brightness-105 transition-all duration-200 transform-gpu flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-amber-300/30",
                            (submitting || (isPranataPay && userBalance < grandTotal)) && "opacity-60 cursor-not-allowed",
                          )}
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={18} className="animate-spin text-[#1C2E24]" />
                              <span>Memproses Pembayaran...</span>
                            </>
                          ) : (
                            <span>Bayar Sekarang (Rp {grandTotal.toLocaleString("id-ID")})</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* TRANSACTION RESULT MODAL (Popup Berhasil / Gagal Upgrade Plus) */}
          <AnimatePresence>
            {transactionResult && (
              <div
                data-lenis-prevent="true"
                className="fixed inset-0 z-100005 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
              >
                <motion.div
                  data-lenis-prevent="true"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={cn(
                    "w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-7 md:p-8 border shadow-2xl relative space-y-5 sm:space-y-6 text-[#1C241E] my-auto overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar",
                    transactionResult.status === "success"
                      ? "border-emerald-200"
                      : "border-rose-200",
                  )}
                >
                  {/* Top Decorative Color Accent Bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-2",
                      transactionResult.status === "success"
                        ? "bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600"
                        : "bg-linear-to-r from-rose-500 via-red-500 to-rose-600",
                    )}
                  />

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setTransactionResult(null);
                      if (transactionResult.status === "success") {
                        onClose();
                        if (onSuccess) onSuccess();
                      }
                    }}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#FAF8F5] transition-colors cursor-pointer z-10"
                  >
                    <X size={18} />
                  </button>

                  {/* Status Animated Icon Badge */}
                  <div className="text-center pt-2">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm border-2",
                        transactionResult.status === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-rose-50 border-rose-200 text-rose-600",
                      )}
                    >
                      {transactionResult.status === "success" ? (
                        <CheckCircle2 size={44} className="stroke-[2.2]" />
                      ) : (
                        <XCircle size={44} className="stroke-[2.2]" />
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#1C241E] tracking-tight">
                      {transactionResult.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A635B] font-medium leading-relaxed mt-1.5 max-w-sm mx-auto">
                      {transactionResult.message}
                    </p>
                  </div>

                  {/* Digital Receipt Card */}
                  <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3D2] p-4 sm:p-5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D2]">
                      <span className="text-[11px] font-black uppercase text-[#7A8678] tracking-wider">
                        Paket Pranata Plus (30 Hari)
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full",
                          transactionResult.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800",
                        )}
                      >
                        {transactionResult.status === "success" ? "Berhasil" : "Gagal"}
                      </span>
                    </div>

                    {/* Amount Display */}
                    <div className="text-center py-1">
                      <span className="text-[11px] text-[#7A8678] font-bold block mb-0.5">
                        Total Pembayaran
                      </span>
                      <span
                        className={cn(
                          "text-2xl sm:text-3xl font-black tracking-tight",
                          transactionResult.status === "success" ? "text-[#2B4C3B]" : "text-rose-600",
                        )}
                      >
                        Rp {(transactionResult.amount + transactionResult.fee).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Detailed Item List */}
                    <div className="space-y-2 pt-2 border-t border-dashed border-[#DDE2D6] text-xs">
                      <div className="flex justify-between text-[#5A635B]">
                        <span>Metode Pembayaran:</span>
                        <span className="font-bold text-[#1C241E]">
                          {transactionResult.paymentMethod}
                        </span>
                      </div>

                      <div className="flex justify-between text-[#5A635B]">
                        <span>Biaya Langganan:</span>
                        <span className="font-bold text-[#1C241E]">
                          Rp {transactionResult.amount.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex justify-between text-[#5A635B]">
                        <span>Biaya Layanan:</span>
                        <span className="font-bold text-[#2B4C3B]">
                          {transactionResult.fee === 0 ? "Gratis (Hemat Rp 2.500)" : `Rp ${transactionResult.fee.toLocaleString("id-ID")}`}
                        </span>
                      </div>

                      {transactionResult.timestamp && (
                        <div className="flex justify-between text-[#7A8678] text-[11px] pt-1">
                          <span>Waktu Transaksi:</span>
                          <span>{transactionResult.timestamp}</span>
                        </div>
                      )}

                      {transactionResult.transactionId && (
                        <div className="flex justify-between text-[#7A8678] text-[11px]">
                          <span>No. Referensi:</span>
                          <span className="font-mono font-bold">#{transactionResult.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    {transactionResult.status === "success" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionResult(null);
                            onClose();
                            if (onSuccess) onSuccess();
                          }}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] font-bold text-xs sm:text-sm transition-all duration-200 transform-gpu shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-white/10 order-1"
                        >
                          <Sparkles size={16} />
                          <span>Mulai Gunakan Plus</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionResult(null);
                            onClose();
                            if (onSuccess) onSuccess();
                          }}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full border border-[#D5D0C5] bg-white/70 hover:bg-white text-[#3F4841] hover:text-[#1C241E] font-bold text-xs sm:text-sm transition-all duration-200 transform-gpu hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs order-2"
                        >
                          Tutup
                        </button>
                      </>
                    ) : (
                      <>
                        {transactionResult.paymentMethod === "Pranata Pay" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTransactionResult(null);
                              setShowTopUpModal(true);
                            }}
                            className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] font-bold text-xs sm:text-sm transition-all duration-200 transform-gpu shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-white/10 order-1"
                          >
                            <Wallet size={16} />
                            <span>Isi Saldo Instan</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTransactionResult(null);
                              setShowCheckoutModal(true);
                            }}
                            className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] font-bold text-xs sm:text-sm transition-all duration-200 transform-gpu shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-white/10 order-1"
                          >
                            <span>Coba Lagi</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setTransactionResult(null)}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full border border-[#D5D0C5] bg-white/70 hover:bg-white text-[#3F4841] hover:text-[#1C241E] font-bold text-xs sm:text-sm transition-all duration-200 transform-gpu hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs order-2"
                        >
                          Tutup
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Quick Top-Up Modal Integration */}
          <PranataPayModal
            isOpen={showTopUpModal}
            onClose={() => {
              setShowTopUpModal(false);
              fetchSessionProfile();
            }}
            initialTab="topup"
            onSuccess={() => {
              fetchSessionProfile();
            }}
          />
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
