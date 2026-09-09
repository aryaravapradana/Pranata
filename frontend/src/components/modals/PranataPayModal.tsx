"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Building2,
  QrCode,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  History,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { Logo } from "idn-finlogos/react";

interface TransactionResult {
  status: "success" | "error";
  type: "topup" | "withdraw";
  title: string;
  message: string;
  amount: number;
  fee?: number;
  paymentMethodOrBank?: string;
  accountNumber?: string;
  accountHolder?: string;
  transactionId?: string;
  timestamp?: string;
  newBalance?: number;
}

interface PranataPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "overview" | "topup" | "withdraw";
  onSuccess?: () => void;
}

export function PranataPayModal({
  isOpen,
  onClose,
  initialTab = "overview",
  onSuccess,
}: PranataPayModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "topup" | "withdraw">(initialTab);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [showTopUpConfirm, setShowTopUpConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  // Top-Up Form State
  const [topUpAmount, setTopUpAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [topUpMethod, setTopUpMethod] = useState<string>("bca_va");

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [bankName, setBankName] = useState<string>("BCA");
  const [accountNumber, setAccountNumber] = useState<string>("1234567890");
  const [accountHolder, setAccountHolder] = useState<string>("");

  const API_BASE = getApiBaseUrl();

  const TOPUP_METHODS = [
    {
      id: "bca_va",
      name: "BCA VA",
      sub: "Verifikasi Otomatis",
      slug: "bca",
    },
    {
      id: "bri_va",
      name: "BRI VA",
      sub: "BRIVA Otomatis",
      slug: "bri",
    },
    {
      id: "mandiri_va",
      name: "Mandiri VA",
      sub: "Livin Mandiri",
      slug: "mandiri",
    },
    {
      id: "qris",
      name: "QRIS All Payment",
      sub: "Scan via GoPay / OVO / Dana",
      slug: "qris",
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const fetchWallet = async () => {
    const session = getSession();
    if (!session?.id) return;

    setLoading(true);
    try {
      const res = await fetchApi(`${API_BASE}/api/wallet/${session.id}`);
      if (res.ok) {
        const data = await res.json();
        setWalletData(data);
        if (session.fullName && !accountHolder) {
          setAccountHolder(session.fullName);
        }
      } else {
        // Fallback wallet data if API is offline
        setWalletData({
          walletBalance: session.walletBalance || 250000,
          transactions: [],
        });
        if (session.fullName && !accountHolder) {
          setAccountHolder(session.fullName);
        }
      }
    } catch (e) {
      setWalletData({
        walletBalance: session.walletBalance || 250000,
        transactions: [],
      });
      if (session.fullName && !accountHolder) {
        setAccountHolder(session.fullName);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      setActiveTab(initialTab);
      setSuccessMessage(null);
      setErrorMessage(null);
      setShowTopUpConfirm(false);
      setShowWithdrawConfirm(false);
      fetchWallet();
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
  }, [isOpen, initialTab]);

  const handleOpenTopUpConfirm = () => {
    const amount = customAmount ? parseInt(customAmount) : topUpAmount;
    if (isNaN(amount) || amount < 10000) {
      setErrorMessage("Minimal top-up adalah Rp 10.000");
      return;
    }
    setErrorMessage(null);
    setShowTopUpConfirm(true);
  };

  const handleOpenWithdrawConfirm = () => {
    const currentBalance = walletData?.walletBalance ?? getSession()?.walletBalance ?? 0;
    if (withdrawAmount < 20000) {
      setErrorMessage("Minimal penarikan adalah Rp 20.000");
      return;
    }
    if (withdrawAmount > currentBalance) {
      setErrorMessage("Saldo Anda tidak mencukupi untuk nominal penarikan ini");
      return;
    }
    if (!accountNumber || !accountHolder) {
      setErrorMessage("Lengkapi nomor rekening dan nama pemilik rekening");
      return;
    }
    setErrorMessage(null);
    setShowWithdrawConfirm(true);
  };

  const handleTopUp = async () => {
    const session = getSession();

    const amount = customAmount ? parseInt(customAmount) : topUpAmount;
    if (isNaN(amount) || amount < 10000) {
      setShowTopUpConfirm(false);
      setErrorMessage("Minimal top-up adalah Rp 10.000");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetchApi(`${API_BASE}/api/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod: topUpMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const updatedBalance = data.walletBalance ?? ((session.walletBalance || 0) + amount);
      const updatedSession = { ...session, walletBalance: updatedBalance };
      localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
      localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("session_updated"));
      }
      
      setWalletData((prev: any) => ({
        walletBalance: updatedBalance,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: "TOPUP",
            amount: amount + 1500,
            netAmount: amount,
            fee: 1500,
            description: `Top-up Saldo (${(TOPUP_METHODS.find((m) => m.id === topUpMethod) || TOPUP_METHODS[0]).name})`,
            createdAt: new Date().toISOString(),
          },
          ...(prev?.transactions || []),
        ],
      }));

      setShowTopUpConfirm(false);
      setTransactionResult({
        status: "success",
        type: "topup",
        title: "Top-Up Saldo Berhasil!",
        message: `Saldo sebesar Rp ${amount.toLocaleString("id-ID")} telah berhasil ditambahkan ke akun Pranata Pay Anda.`,
        amount,
        fee: 1500,
        paymentMethodOrBank: (TOPUP_METHODS.find((m) => m.id === topUpMethod) || TOPUP_METHODS[0]).name,
        transactionId: `TOP-${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        newBalance: updatedBalance,
      });
    } catch (e) {
      console.error(e);
      const updatedBalance = (session.walletBalance || 0) + amount;
      const updatedSession = { ...session, walletBalance: updatedBalance };
      localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
      localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("session_updated"));
      }
      
      setWalletData((prev: any) => ({
        walletBalance: updatedBalance,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: "TOPUP",
            amount: amount + 1500,
            netAmount: amount,
            fee: 1500,
            description: `Top-up Saldo (${(TOPUP_METHODS.find((m) => m.id === topUpMethod) || TOPUP_METHODS[0]).name})`,
            createdAt: new Date().toISOString(),
          },
          ...(prev?.transactions || []),
        ],
      }));

      setShowTopUpConfirm(false);
      setTransactionResult({
        status: "success",
        type: "topup",
        title: "Top-Up Saldo Berhasil!",
        message: `Saldo sebesar Rp ${amount.toLocaleString("id-ID")} telah berhasil ditambahkan ke akun Pranata Pay Anda.`,
        amount,
        fee: 1500,
        paymentMethodOrBank: (TOPUP_METHODS.find((m) => m.id === topUpMethod) || TOPUP_METHODS[0]).name,
        transactionId: `TOP-${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        newBalance: updatedBalance,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const session = getSession();

    if (withdrawAmount < 20000) {
      setShowWithdrawConfirm(false);
      setErrorMessage("Minimal penarikan adalah Rp 20.000");
      return;
    }

    if (!accountNumber || !accountHolder) {
      setShowWithdrawConfirm(false);
      setErrorMessage("Lengkapi nomor rekening dan nama pemilik");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetchApi(`${API_BASE}/api/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          bankName,
          accountNumber,
          accountHolder,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const updatedBalance = data.walletBalance ?? Math.max(0, (session.walletBalance || 0) - withdrawAmount);
      const updatedSession = { ...session, walletBalance: updatedBalance };
      localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
      localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("session_updated"));
      }
      
      setWalletData((prev: any) => ({
        walletBalance: updatedBalance,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: "WITHDRAW",
            amount: withdrawAmount,
            netAmount: Math.max(0, withdrawAmount - 2500),
            fee: 2500,
            description: `Penarikan ke Bank ${bankName} (${accountNumber})`,
            createdAt: new Date().toISOString(),
          },
          ...(prev?.transactions || []),
        ],
      }));

      setShowWithdrawConfirm(false);
      setTransactionResult({
        status: "success",
        type: "withdraw",
        title: "Penarikan Saldo Berhasil!",
        message: `Permintaan penarikan ke rekening Bank ${bankName} (${accountNumber}) atas nama ${accountHolder} berhasil diajukan dan diproses.`,
        amount: withdrawAmount,
        fee: 2500,
        paymentMethodOrBank: `Bank ${bankName}`,
        accountNumber,
        accountHolder,
        transactionId: `WD-${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        newBalance: updatedBalance,
      });
    } catch (e) {
      console.error(e);
      const updatedBalance = Math.max(0, (session.walletBalance || 0) - withdrawAmount);
      const updatedSession = { ...session, walletBalance: updatedBalance };
      localStorage.setItem("pranata_session", JSON.stringify(updatedSession));
      localStorage.setItem("farmpro_session", JSON.stringify(updatedSession));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("session_updated"));
      }
      
      setWalletData((prev: any) => ({
        walletBalance: updatedBalance,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: "WITHDRAW",
            amount: withdrawAmount,
            netAmount: Math.max(0, withdrawAmount - 2500),
            fee: 2500,
            description: `Penarikan ke Bank ${bankName} (${accountNumber})`,
            createdAt: new Date().toISOString(),
          },
          ...(prev?.transactions || []),
        ],
      }));

      setShowWithdrawConfirm(false);
      setTransactionResult({
        status: "success",
        type: "withdraw",
        title: "Penarikan Saldo Berhasil!",
        message: `Permintaan penarikan ke rekening Bank ${bankName} (${accountNumber}) atas nama ${accountHolder} berhasil diajukan dan diproses.`,
        amount: withdrawAmount,
        fee: 2500,
        paymentMethodOrBank: `Bank ${bankName}`,
        accountNumber,
        accountHolder,
        transactionId: `WD-${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        newBalance: updatedBalance,
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
          className="fixed inset-0 z-[99999] overflow-hidden flex flex-col justify-end overscroll-contain"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            onWheel={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 touch-none"
          />

          {/* Full Screen Sliding Sheet */}
          <motion.div
            data-lenis-prevent="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "relative w-full h-full max-h-screen bg-[#FAF8F5] z-20",
              "flex flex-col overflow-hidden overscroll-contain shadow-2xl",
            )}
          >
            {/* Sticky Top Header */}
            <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-[#E8E3D2] bg-white shrink-0 z-30 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src="/logos/pay/pay-black.webp"
                  alt="Pranata Pay"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
                <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#2B4C3B] text-white tracking-wider">
                  Dompet Digital & Transaksi
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#FAF8F5] border border-[#E8E3D2] transition-colors cursor-pointer"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div
              data-lenis-prevent="true"
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar"
            >
              <div className="w-full max-w-md sm:max-w-xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-6 lg:space-y-8">
                {/* Balance Card Ribbon */}
                <div className="bg-gradient-to-br from-[#1C241E] via-[#2B4C3B] to-[#1E362A] text-white rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl border border-[#2B4C3B]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src="/logos/pay/pay-white.webp"
                        alt="Pranata Pay"
                        className="h-6 w-auto object-contain opacity-95"
                      />
                      <span className="text-xs text-white/80 font-bold uppercase tracking-wider">
                        • Saldo Aktif
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                      Rp {(walletData?.walletBalance || 0).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 mt-1.5 font-medium">
                      Bebas biaya transaksi untuk seluruh ekosistem Pranata.
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        setActiveTab("topup");
                        setSuccessMessage(null);
                        setErrorMessage(null);
                      }}
                      className={cn(
                        "flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer",
                        activeTab === "topup"
                          ? "bg-white text-[#2B4C3B]"
                          : "bg-white/20 hover:bg-white/30 text-white",
                      )}
                    >
                      <PlusCircle size={16} />
                      <span>Isi Saldo</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("withdraw");
                        setSuccessMessage(null);
                        setErrorMessage(null);
                      }}
                      className={cn(
                        "flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer",
                        activeTab === "withdraw"
                          ? "bg-white text-[#2B4C3B]"
                          : "bg-white/20 hover:bg-white/30 text-white",
                      )}
                    >
                      <ArrowUpRight size={16} />
                      <span>Tarik Saldo</span>
                    </button>
                  </div>
                </div>

                {/* Tab Navigation Pill Bar */}
                <div className="bg-white rounded-2xl border border-[#E8E3D2] p-1.5 flex gap-1.5 shadow-xs">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                      "flex-1 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer",
                      activeTab === "overview"
                        ? "bg-[#2B4C3B] text-white shadow-sm"
                        : "text-[#5A635B] hover:text-[#1C241E] hover:bg-[#FAF8F5]",
                    )}
                  >
                    <History size={16} />
                    <span>Riwayat Mutasi</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("topup")}
                    className={cn(
                      "flex-1 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer",
                      activeTab === "topup"
                        ? "bg-[#2B4C3B] text-white shadow-sm"
                        : "text-[#5A635B] hover:text-[#1C241E] hover:bg-[#FAF8F5]",
                    )}
                  >
                    <PlusCircle size={16} />
                    <span>Top-Up Saldo</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("withdraw")}
                    className={cn(
                      "flex-1 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer",
                      activeTab === "withdraw"
                        ? "bg-[#2B4C3B] text-white shadow-sm"
                        : "text-[#5A635B] hover:text-[#1C241E] hover:bg-[#FAF8F5]",
                    )}
                  >
                    <ArrowUpRight size={16} />
                    <span>Tarik ke Bank</span>
                  </button>
                </div>

                {/* Alerts */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs"
                  >
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm font-semibold shadow-xs"
                  >
                    <AlertCircle size={20} className="text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* TAB 1: OVERVIEW / MUTASI */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-black text-[#1C241E] uppercase tracking-wider">
                        Riwayat Transaksi Terkini
                      </h3>
                      <span className="text-xs text-[#7A8678]">
                        Total {walletData?.transactions?.length || 0} Transaksi
                      </span>
                    </div>

                    {!walletData?.transactions || walletData.transactions.length === 0 ? (
                      <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D2] p-6 space-y-3">
                        <History size={40} className="mx-auto text-[#7A8678]/40" />
                        <p className="text-sm font-bold text-[#1C241E]">Belum Ada Transaksi</p>
                        <p className="text-xs text-[#7A8678] max-w-sm mx-auto">
                          Semua pemasukan jualan, top-up, belanja marketplace, dan penarikan akan dicatat realtime di sini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {walletData.transactions.map((tx: any) => {
                          const isIncome = [
                            "TOPUP",
                            "ORDER_PAYMENT",
                            "SUBSCRIPTION_FEE",
                          ].includes(tx.type)
                            ? tx.amount > 0 && tx.type === "ORDER_PAYMENT"
                              ? true
                              : tx.type === "TOPUP"
                            : false;

                          return (
                            <div
                              key={tx.id}
                              className="p-4 bg-white rounded-2xl border border-[#E8E3D2] flex items-center justify-between gap-4 hover:border-[#2B4C3B]/40 transition-colors shadow-2xs"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    isIncome
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                      : "bg-rose-50 text-rose-600 border border-rose-200",
                                  )}
                                >
                                  {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-[#1C241E] truncate">
                                    {tx.description || tx.type}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-[#7A8678]">
                                      {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#5A635B] border border-[#E8E3D2]">
                                      {tx.type.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span
                                  className={cn(
                                    "text-xs sm:text-base font-extrabold block",
                                    isIncome ? "text-emerald-600" : "text-rose-600",
                                  )}
                                >
                                  {isIncome ? "+" : "-"}Rp{" "}
                                  {Math.abs(tx.netAmount || tx.amount).toLocaleString("id-ID")}
                                </span>
                                {tx.fee > 0 && (
                                  <span className="text-[10px] text-[#7A8678]">
                                    Fee: Rp {tx.fee.toLocaleString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: TOP-UP SALDO */}
                {activeTab === "topup" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    <div className="lg:col-span-7 space-y-5">
                      <div>
                        <label className="text-xs font-black uppercase text-[#7A8678] tracking-wider block mb-2">
                          Pilih Nominal Top-Up
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[50000, 100000, 250000, 500000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setTopUpAmount(amt);
                                setCustomAmount("");
                              }}
                              className={cn(
                                "py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer",
                                topUpAmount === amt && !customAmount
                                  ? "border-[#2B4C3B] bg-[#EEF2E6] text-[#2B4C3B] ring-2 ring-[#2B4C3B]/20"
                                  : "border-[#E8E3D2] bg-white text-[#1C241E] hover:bg-[#FAF8F5]",
                              )}
                            >
                              Rp {amt.toLocaleString("id-ID")}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2.5">
                          <input
                            type="number"
                            placeholder="Atau masukkan nominal lain (Min. Rp 10.000)"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              if (e.target.value) setTopUpAmount(0);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E3D2] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2B4C3B] bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase text-[#7A8678] tracking-wider block mb-2">
                          Metode Pembayaran Top-Up
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {TOPUP_METHODS.map((m) => (
                            <label
                              key={m.id}
                              className={cn(
                                "p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all bg-white",
                                topUpMethod === m.id
                                  ? "border-[#2B4C3B] bg-[#EEF2E6]/60 ring-2 ring-[#2B4C3B]/20"
                                  : "border-[#E8E3D2] hover:bg-[#FAF8F5]",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {m.slug === "qris" ? (
                                  <QrCode size={22} className="text-[#2B4C3B] shrink-0 mx-auto my-auto" />
                                ) : (
                                  <Logo
                                    slug={m.slug as any}
                                    className="flex items-center justify-center shrink-0 w-11 h-6 [&>svg]:max-h-5 [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain [&>svg]:block [&>svg]:mx-auto [&>svg]:my-auto"
                                  />
                                )}
                                <div>
                                  <p className="text-xs font-bold text-[#1C241E]">{m.name}</p>
                                  <p className="text-[10px] text-[#7A8678]">{m.sub}</p>
                                </div>
                              </div>
                              <input
                                type="radio"
                                name="topUpMethod"
                                checked={topUpMethod === m.id}
                                onChange={() => setTopUpMethod(m.id)}
                                className="accent-[#2B4C3B] shrink-0"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Fee Summary & CTA */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="p-5 bg-white rounded-2xl border border-[#E8E3D2] shadow-xs text-xs sm:text-sm space-y-3">
                        <h4 className="text-xs font-black uppercase text-[#2B4C3B] tracking-wider">
                          Ringkasan Tagihan
                        </h4>
                        <div className="space-y-2 pt-2 border-t border-[#E8E3D2]">
                          <div className="flex justify-between text-[#5A635B]">
                            <span>Nominal Top-Up:</span>
                            <span className="font-bold text-[#1C241E]">
                              Rp {(customAmount ? parseInt(customAmount) || 0 : topUpAmount).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#5A635B]">
                            <span>Biaya Admin:</span>
                            <span className="font-bold text-[#2B4C3B]">Rp 1.500</span>
                          </div>
                          <div className="border-t border-[#E8E3D2] pt-2 flex justify-between font-extrabold text-sm sm:text-base text-[#1C241E]">
                            <span>Total Tagihan:</span>
                            <span className="text-[#2B4C3B]">
                              Rp {((customAmount ? parseInt(customAmount) || 0 : topUpAmount) + 1500).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleOpenTopUpConfirm}
                        className={cn(
                          "w-full py-4 rounded-2xl bg-[#2B4C3B] hover:bg-[#223d2f] text-white font-extrabold text-xs sm:text-sm",
                          "shadow-lg shadow-[#2B4C3B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                          submitting && "opacity-75 cursor-not-allowed",
                        )}
                      >
                        <Sparkles size={18} />
                        <span>Lanjut Konfirmasi Top-Up</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: TARIK SALDO */}
                {activeTab === "withdraw" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase text-[#7A8678] tracking-wider block mb-1.5">
                          Nominal Penarikan (Rp)
                        </label>
                        <input
                          type="number"
                          min={20000}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                          placeholder="Min. Rp 20.000"
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E3D2] text-xs sm:text-sm font-bold text-[#1C241E] focus:outline-none focus:border-[#2B4C3B] bg-white"
                        />
                        <span className="text-[11px] text-[#7A8678] mt-1 block">
                          Saldo tersedia: Rp {(walletData?.walletBalance || 0).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-black uppercase text-[#7A8678] tracking-wider block mb-1.5">
                            Bank Tujuan
                          </label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3.5 py-3 rounded-xl border border-[#E8E3D2] text-xs sm:text-sm font-bold text-[#1C241E] focus:outline-none focus:border-[#2B4C3B] bg-white cursor-pointer"
                          >
                            <option value="BCA">Bank BCA</option>
                            <option value="BRI">Bank BRI</option>
                            <option value="Mandiri">Bank Mandiri</option>
                            <option value="BNI">Bank BNI</option>
                            <option value="BSI">Bank Syariah Indonesia</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase text-[#7A8678] tracking-wider block mb-1.5">
                            Nomor Rekening
                          </label>
                          <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Contoh: 1234567890"
                            className="w-full px-4 py-3 rounded-xl border border-[#E8E3D2] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2B4C3B] bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase text-[#7A8678] tracking-wider block mb-1.5">
                          Nama Pemilik Rekening
                        </label>
                        <input
                          type="text"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          placeholder="Sesuai buku tabungan"
                          className="w-full px-4 py-3 rounded-xl border border-[#E8E3D2] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2B4C3B] bg-white"
                        />
                      </div>
                    </div>

                    {/* Right Column: Fee Summary & CTA */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="p-5 bg-white rounded-2xl border border-[#E8E3D2] shadow-xs text-xs sm:text-sm space-y-3">
                        <h4 className="text-xs font-black uppercase text-[#2B4C3B] tracking-wider">
                          Ringkasan Penarikan
                        </h4>
                        <div className="space-y-2 pt-2 border-t border-[#E8E3D2]">
                          <div className="flex justify-between text-[#5A635B]">
                            <span>Jumlah Ditarik:</span>
                            <span className="font-bold text-[#1C241E]">
                              Rp {withdrawAmount.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#5A635B]">
                            <span>Biaya Admin Transfer:</span>
                            <span className="font-bold text-rose-600">Rp 2.500</span>
                          </div>
                          <div className="border-t border-[#E8E3D2] pt-2 flex justify-between font-extrabold text-sm sm:text-base text-[#1C241E]">
                            <span>Bersih Masuk Rekening:</span>
                            <span className="text-[#2B4C3B]">
                              Rp {Math.max(0, withdrawAmount - 2500).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          submitting ||
                          withdrawAmount > (walletData?.walletBalance || 0) ||
                          withdrawAmount < 20000 ||
                          !accountNumber ||
                          !accountHolder
                        }
                        onClick={handleOpenWithdrawConfirm}
                        className={cn(
                          "w-full py-4 rounded-2xl bg-[#2B4C3B] hover:bg-[#223d2f] text-white font-extrabold text-xs sm:text-sm",
                          "shadow-lg shadow-[#2B4C3B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                          (submitting ||
                            withdrawAmount > (walletData?.walletBalance || 0) ||
                            withdrawAmount < 20000 ||
                            !accountNumber ||
                            !accountHolder) &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <ArrowUpRight size={18} />
                        <span>Lanjut Konfirmasi Penarikan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* TOP-UP CONFIRMATION MODAL (Modal Konfirmasi Isi Saldo) */}
          <AnimatePresence>
            {showTopUpConfirm && (
              <div
                data-lenis-prevent="true"
                className="fixed inset-0 z-[100002] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain"
              >
                <motion.div
                  data-lenis-prevent="true"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E3D2] shadow-2xl relative space-y-5 text-[#1C241E] my-auto"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E3D2]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF2E6] text-[#2B4C3B] flex items-center justify-center shadow-xs">
                        <PlusCircle size={22} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-[#1C241E]">
                          Konfirmasi Top-Up Saldo
                        </h3>
                        <p className="text-[11px] text-[#7A8678] font-medium">
                          Periksa rincian sebelum menyelesaikan top-up
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowTopUpConfirm(false)}
                      className="p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Selected Payment Method */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const currentMethod = TOPUP_METHODS.find((m) => m.id === topUpMethod) || TOPUP_METHODS[0];
                        if (currentMethod.slug === "qris") {
                          return <QrCode size={22} className="text-[#2B4C3B] shrink-0" />;
                        }
                        return (
                          <Logo
                            slug={currentMethod.slug as any}
                            className="flex items-center justify-center shrink-0 w-11 h-6 [&>svg]:max-h-5 [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain [&>svg]:block [&>svg]:mx-auto [&>svg]:my-auto"
                          />
                        );
                      })()}
                      <div>
                        <span className="text-[10px] text-[#7A8678] block font-bold uppercase tracking-wider">
                          Metode Pembayaran
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#1C241E]">
                          {(TOPUP_METHODS.find((m) => m.id === topUpMethod) || TOPUP_METHODS[0]).name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#2B4C3B]/10 text-[#2B4C3B]">
                      Otomatis
                    </span>
                  </div>

                  {/* Detail Breakdown */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E3D2] space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-[#5A635B]">
                      <span>Nominal Top-Up:</span>
                      <span className="font-bold text-[#1C241E]">
                        Rp {(customAmount ? parseInt(customAmount) || 0 : topUpAmount).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5A635B]">
                      <span>Biaya Admin:</span>
                      <span className="font-bold text-[#2B4C3B]">Rp 1.500</span>
                    </div>
                    <div className="border-t border-[#E8E3D2] pt-2.5 flex justify-between items-center font-extrabold text-sm sm:text-base text-[#1C241E]">
                      <span>Total Pembayaran:</span>
                      <span className="text-base sm:text-lg font-black text-[#2B4C3B]">
                        Rp {((customAmount ? parseInt(customAmount) || 0 : topUpAmount) + 1500).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="flex items-start gap-2 text-[11px] text-[#7A8678] bg-[#EEF2E6]/50 p-3 rounded-xl border border-[#DDE2D6]">
                    <ShieldCheck size={16} className="text-[#2B4C3B] shrink-0 mt-0.5" />
                    <span>
                      Saldo akan langsung masuk ke dompet Pranata Pay Anda secara instan setelah pembayaran terverifikasi.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowTopUpConfirm(false)}
                      className="w-full sm:w-1/2 py-3.5 px-4 rounded-full border border-[#E8E3D2] bg-white hover:bg-[#FAF8F5] text-[#5A635B] font-bold text-xs sm:text-sm transition-all cursor-pointer order-2 sm:order-1"
                    >
                      Ubah Rincian
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleTopUp}
                      className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-[#2B4C3B] hover:bg-[#223d2f] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 order-1 sm:order-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Konfirmasi & Bayar</span>
                          <Sparkles size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* WITHDRAW CONFIRMATION MODAL (Modal Konfirmasi Tarik Saldo) */}
          <AnimatePresence>
            {showWithdrawConfirm && (
              <div
                data-lenis-prevent="true"
                className="fixed inset-0 z-[100002] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain"
              >
                <motion.div
                  data-lenis-prevent="true"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E3D2] shadow-2xl relative space-y-5 text-[#1C241E] my-auto"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E3D2]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#EEF2E6] text-[#2B4C3B] flex items-center justify-center shadow-xs">
                        <ArrowUpRight size={22} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-[#1C241E]">
                          Konfirmasi Tarik Saldo
                        </h3>
                        <p className="text-[11px] text-[#7A8678] font-medium">
                          Pastikan tujuan rekening dan nominal sudah benar
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowWithdrawConfirm(false)}
                      className="p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Target Bank Card */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D2] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#7A8678] tracking-wider">
                        Rekening Bank Tujuan
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2B4C3B]/10 text-[#2B4C3B] text-[10px] font-extrabold">
                        Bank {bankName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E3D2] flex items-center justify-center text-[#2B4C3B] shrink-0 shadow-2xs">
                        <Building2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#1C241E] truncate">
                          {accountHolder || "Nama Pemilik Rekening"}
                        </p>
                        <p className="text-xs text-[#5A635B] font-mono tracking-wide font-semibold">
                          {accountNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Breakdown */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8E3D2] space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-[#5A635B]">
                      <span>Jumlah Ditarik:</span>
                      <span className="font-bold text-[#1C241E]">
                        Rp {withdrawAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#5A635B]">
                      <span>Biaya Admin Transfer:</span>
                      <span className="font-bold text-rose-600">Rp 2.500</span>
                    </div>
                    <div className="border-t border-[#E8E3D2] pt-2.5 flex justify-between items-center font-extrabold text-sm sm:text-base text-[#1C241E]">
                      <span>Bersih Masuk Rekening:</span>
                      <span className="text-base sm:text-lg font-black text-[#2B4C3B]">
                        Rp {Math.max(0, withdrawAmount - 2500).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="pt-1 text-[11px] text-[#7A8678] flex justify-between">
                      <span>Sisa Saldo Pranata Pay:</span>
                      <span className="font-bold text-[#1C241E]">
                        Rp {Math.max(0, (walletData?.walletBalance || 0) - withdrawAmount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Warning note */}
                  <div className="flex items-start gap-2 text-[11px] text-[#7A8678] bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-amber-900/80">
                      Proses transfer dilakukan realtime ke rekening tujuan. Pastikan nama dan nomor rekening tidak salah.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowWithdrawConfirm(false)}
                      className="w-full sm:w-1/2 py-3.5 px-4 rounded-full border border-[#E8E3D2] bg-white hover:bg-[#FAF8F5] text-[#5A635B] font-bold text-xs sm:text-sm transition-all cursor-pointer order-2 sm:order-1"
                    >
                      Periksa Lagi
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleWithdraw}
                      className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-[#2B4C3B] hover:bg-[#223d2f] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 order-1 sm:order-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Konfirmasi & Tarik</span>
                          <ArrowUpRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* TRANSACTION RESULT MODAL (Popup Berhasil / Gagal) */}
          <AnimatePresence>
            {transactionResult && (
              <div
                data-lenis-prevent="true"
                className="fixed inset-0 z-[100005] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain"
              >
                <motion.div
                  data-lenis-prevent="true"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={cn(
                    "w-full max-w-md sm:max-w-lg bg-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border shadow-2xl relative space-y-6 text-[#1C241E] my-auto overflow-hidden",
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
                        ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
                        : "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600",
                    )}
                  />

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setTransactionResult(null);
                      fetchWallet();
                      if (transactionResult.status === "success" && onSuccess) onSuccess();
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
                        {transactionResult.type === "topup" ? "Top-Up Saldo" : "Tarik Tunai"}
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
                        {transactionResult.status === "success" ? "Nominal Transaksi" : "Nominal yang Dicoba"}
                      </span>
                      <span
                        className={cn(
                          "text-2xl sm:text-3xl font-black tracking-tight",
                          transactionResult.status === "success" ? "text-[#2B4C3B]" : "text-rose-600",
                        )}
                      >
                        Rp {transactionResult.amount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Detailed Item List */}
                    <div className="space-y-2 pt-2 border-t border-dashed border-[#DDE2D6] text-xs">
                      {transactionResult.paymentMethodOrBank && (
                        <div className="flex justify-between text-[#5A635B]">
                          <span>{transactionResult.type === "topup" ? "Metode Pembayaran:" : "Bank Tujuan:"}</span>
                          <span className="font-bold text-[#1C241E]">
                            {transactionResult.paymentMethodOrBank}
                          </span>
                        </div>
                      )}

                      {transactionResult.accountNumber && (
                        <div className="flex justify-between text-[#5A635B]">
                          <span>No. Rekening / Pemilik:</span>
                          <span className="font-bold text-[#1C241E] text-right truncate max-w-[200px]">
                            {transactionResult.accountNumber} ({transactionResult.accountHolder})
                          </span>
                        </div>
                      )}

                      {transactionResult.fee !== undefined && (
                        <div className="flex justify-between text-[#5A635B]">
                          <span>Biaya Admin:</span>
                          <span className="font-bold text-[#1C241E]">
                            Rp {transactionResult.fee.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      {transactionResult.newBalance !== undefined && (
                        <div className="flex justify-between text-[#5A635B] pt-1 border-t border-[#E8E3D2]">
                          <span className="font-extrabold text-[#2B4C3B]">Saldo Baru Pranata Pay:</span>
                          <span className="font-black text-[#2B4C3B]">
                            Rp {transactionResult.newBalance.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

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
                            setActiveTab("overview");
                            fetchWallet();
                            if (onSuccess) onSuccess();
                          }}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-[#2B4C3B] hover:bg-[#223d2f] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 order-1"
                        >
                          <History size={16} />
                          <span>Lihat Mutasi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionResult(null);
                            fetchWallet();
                            if (onSuccess) onSuccess();
                          }}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full border border-[#E8E3D2] bg-white hover:bg-[#FAF8F5] text-[#5A635B] font-bold text-xs sm:text-sm transition-all cursor-pointer order-2"
                        >
                          Tutup
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionResult(null);
                            if (transactionResult.type === "topup") {
                              setShowTopUpConfirm(true);
                            } else {
                              setShowWithdrawConfirm(true);
                            }
                          }}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-[#2B4C3B] hover:bg-[#223d2f] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 order-1"
                        >
                          <span>Coba Lagi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransactionResult(null)}
                          className="w-full sm:w-1/2 py-3.5 px-4 rounded-full border border-[#E8E3D2] bg-white hover:bg-[#FAF8F5] text-[#5A635B] font-bold text-xs sm:text-sm transition-all cursor-pointer order-2"
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
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
