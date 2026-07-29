"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Home, Package } from "lucide-react";
import { useGlobalLoading } from "@/components/shared/loading-context";

export default function CheckoutSuccessPage() {
  const { navigateTo } = useGlobalLoading();

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.5 }}
        className="bg-white rounded-[2rem] p-10 md:p-14 max-w-lg w-full text-center shadow-[0_20px_60px_-15px_rgba(43,76,59,0.15)] border border-[#E8E3D2] relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-[#EEF2E6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
        >
          <CheckCircle className="text-[#2B4C3B]" size={48} strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-3xl font-black text-[#1C241E] mb-3">Yey! Pembayaran Berhasil</h1>
        <p className="text-[#5A635B] font-medium text-sm mb-8 leading-relaxed">
          Pesanan kamu telah kami terima dan sedang diteruskan ke pihak pedagang. Siap-siap menunggu kedatangan hasil tani terbaik ya!
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigateTo("/market/cart?tab=orders")}
            className="w-full bg-[#1C241E] hover:bg-pranata text-white py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Package size={18} /> Lacak Pesanan Saya
          </button>
          
          <button 
            onClick={() => navigateTo("/market")}
            className="w-full bg-white hover:bg-[#F8F6F0] text-[#1C241E] py-4 rounded-full font-bold border-2 border-[#E8E3D2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={18} /> Kembali ke Beranda
          </button>
        </div>
      </motion.div>
    </div>
  );
}
