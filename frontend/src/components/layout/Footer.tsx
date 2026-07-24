"use client";

import Link from "next/link";
import { ArrowUp, Heart, Globe, ShieldCheck, Cpu, Store, LayoutDashboard } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#32452C] text-[#E8E3D2] relative z-20 overflow-hidden">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 relative z-10">
        
        {/* Grid Layout: 1 col on Mobile, 2 cols on Tablet, 4 cols on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-12 sm:pb-16 border-b border-white/10">
          
          {/* Brand Info & Mission Statement (4 cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95 mb-4 sm:mb-5">
              <img 
                src="/logos/basic/logo-white.webp" 
                alt="Pranata Logo" 
                className="h-9 sm:h-11 w-auto object-contain" 
                loading="lazy"
                decoding="async"
              />
            </Link>

            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium leading-relaxed mb-5 max-w-md">
              Pranata adalah inisiatif digitalisasi sektor peternakan berbasis AI dan integrasi rantai pasok pasar transparan untuk memberdayakan peternak lokal di seluruh Nusantara.
            </p>

            {/* Non-Profit & Status Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#2B4C3B]/60 text-[#B4C179] border border-[#8FA76B]/30">
                <ShieldCheck size={13} />
                <span>Nirlaba & Gratis</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sistem Normal</span>
              </span>
            </div>
          </div>

          {/* Column 2: Ekosistem Pranata (3 cols on Desktop) */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Cpu size={15} className="text-[#B4C179]" />
              <span>Ekosistem Modul</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-emerald-100/80">
              <li>
                <Link href="/hub/intelligence" className="hover:text-[#B4C179] transition-colors flex items-center gap-2">
                  <span>Pranata Intelligence</span>
                  <span className="text-[10px] bg-[#2B4C3B] text-[#B4C179] px-2 py-0.5 rounded-md border border-[#8FA76B]/30">AI Assistant</span>
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-[#B4C179] transition-colors flex items-center gap-2">
                  <span>Pranata Market</span>
                  <span className="text-[10px] bg-[#C25939]/40 text-[#F5990D] px-2 py-0.5 rounded-md border border-[#C25939]/40">Pasar Ternak</span>
                </Link>
              </li>
              <li>
                <Link href="/hub" className="hover:text-[#B4C179] transition-colors flex items-center gap-2">
                  <span>Pranata Hub</span>
                  <span className="text-[10px] bg-[#2B4C3B] text-slate-200 px-2 py-0.5 rounded-md border border-white/10">Dasbor Operasional</span>
                </Link>
              </li>
              <li>
                <Link href="/hub/calendar" className="hover:text-[#B4C179] transition-colors">
                  Kalender Pakan & Operasional
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigasi Cepat (2 cols on Desktop) */}
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Store size={15} className="text-[#F5990D]" />
              <span>Navigasi Utama</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-emerald-100/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link href="/market/products" className="hover:text-white transition-colors">
                  Katalog Komoditas
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/login?mode=register" className="hover:text-white transition-colors">
                  Daftar Peternak
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Dukungan & Bantuan (2 cols on Desktop) */}
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Globe size={15} className="text-[#8FA76B]" />
              <span>Dukungan</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-emerald-100/80">
              <li>
                <a href="#testimonies" className="hover:text-white transition-colors">
                  Kisah Peternak
                </a>
              </li>
              <li>
                <a href="mailto:support@pranata.org" className="hover:text-white transition-colors">
                  Kontak Bantuan
                </a>
              </li>
              <li>
                <span className="text-emerald-100/40 cursor-not-allowed">
                  Dokumentasi API
                </span>
              </li>
              <li>
                <span className="text-emerald-100/40 cursor-not-allowed">
                  Kebijakan Privasi
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back-to-top */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-emerald-100/70">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© 2026 Pranata Org. Dipersembahkan dengan</span>
            <Heart size={13} className="text-[#C25939] fill-[#C25939] inline" />
            <span>untuk Peternak Indonesia.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 bg-[#2B4C3B] hover:bg-[#405D46] active:scale-95 text-[#E8E3D2] px-4 py-2 rounded-full border border-white/20 transition-all cursor-pointer shadow-md text-xs font-extrabold"
            aria-label="Kembali ke atas"
          >
            <span>Ke Atas</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
}
