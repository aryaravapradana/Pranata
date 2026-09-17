"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Loader2,
  Sparkles,
  Crown,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

interface CancelPlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelPlusModal({
  isOpen,
  onClose,
  onSuccess,
}: CancelPlusModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCancelSubscription = async () => {
    setLoading(true);
    setError(null);
    const API_BASE = getApiBaseUrl();

    try {
      const res = await fetchApi(`${API_BASE}/api/subscription/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membatalkan langganan.");
      }

      // Update local storage session
      const rawSession = localStorage.getItem("farmpro_session");
      if (rawSession) {
        const session = JSON.parse(rawSession);
        session.subscriptionTier = "FREE";
        session.subscriptionExpiresAt = null;
        localStorage.setItem("farmpro_session", JSON.stringify(session));
        localStorage.setItem("pranata_session", JSON.stringify(session));
        window.dispatchEvent(new Event("session_updated"));
        window.dispatchEvent(new Event("storage"));
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat membatalkan langganan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8E3D2] z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Header Icon */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1C241E] tracking-tight">
                Batalkan Pranata Plus?
              </h3>
              <p className="text-xs text-[#7A8678] font-bold">
                Akun akan langsung kembali ke Pranata Gratis (FREE)
              </p>
            </div>
          </div>

          {/* Perks that will be lost */}
          <div className="bg-[#FAF8F5] border border-[#E8E3D2] rounded-2xl p-4 my-4">
            <p className="text-xs font-black text-[#1C241E] mb-2.5 uppercase tracking-wider">
              Akses yang akan dihentikan:
            </p>
            <ul className="space-y-2 text-xs text-[#5A635B] font-medium">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-black">•</span>
                <span>
                  <strong>Pranata Intelligence Copilot:</strong> Rekomendasi resep masakan & simulasi bisnis otomatis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-black">•</span>
                <span>
                  <strong>1-Click Agentic Cart:</strong> Otomatis cari & masukkan bahan resep ke keranjang belanja.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-black">•</span>
                <span>
                  <strong>Prioritas Produk & Lencana Plus:</strong> Akses fitur sponsor dan visibilitas eksklusif.
                </span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-5 rounded-full bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] font-black text-xs shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 transform-gpu cursor-pointer text-center order-2 sm:order-1"
            >
              Pertahankan Plus
            </button>
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={loading}
              className="flex-1 py-3 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 transform-gpu disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Ya, Batalkan Plus</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
