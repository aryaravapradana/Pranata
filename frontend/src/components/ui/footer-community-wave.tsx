import React from "react";
import Link from "next/link";

export function FooterCommunityWave() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full font-sans overflow-hidden">
      {/* ── Top Community Section (Forest Green Background) ── */}
      <section className="bg-[#32452C] text-[#E8E3D2] pt-14 sm:pt-20 md:pt-24 pb-20 sm:pb-28 px-4 text-center relative z-10 flex flex-col items-center justify-center">
        {/* Script Accent Sub-heading (Rustic Delight) */}
        <span 
          className="text-2xl sm:text-3xl md:text-4xl text-[#B4C179] tracking-wide mb-1 select-none"
          style={{ fontFamily: "'Rustic Delight', serif" }}
        >
          Bangun Masa Depan Peternakan Indonesia
        </span>

        {/* Main Hashtag Title (Rustic Delight) */}
        <h2 
          className="text-3xl min-[400px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-3 sm:mb-4"
          style={{ fontFamily: "'Rustic Delight', serif" }}
        >
          #PeternakBerdaya
        </h2>

        {/* Subtitle Paragraph (SFUIDisplay) */}
        <p 
          className="text-xs sm:text-base md:text-lg text-[#B4C179]/80 font-medium max-w-lg leading-relaxed px-4"
          style={{ fontFamily: "'SFUIDisplay', system-ui, sans-serif" }}
        >
          Jual tanpa perantara. Berkembang bersama Pranata
        </p>
      </section>

      {/* ── Curved Wave Divider (Forest Green #32452C to Cream #F8F6F0) — white/cream SVG like hero ── */}
      <div className="w-full bg-[#32452C] relative z-20 overflow-hidden leading-none select-none pointer-events-none -mb-1">
        <svg
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-28 sm:h-40 md:h-52 block"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 180 L 0 45 C 120 45 250 110 420 110 C 580 110 650 15 720 15 C 790 15 860 110 1020 110 C 1190 110 1320 45 1440 45 L 1440 180 Z"
            fill="#F8F6F0"
          />
        </svg>
      </div>

      {/* ── Main Footer Body (Cream/White Background) ── */}
      <footer className="relative bg-[#F8F6F0] text-[#1C241E] pt-0 sm:pt-0 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-12 z-20 -mt-8 sm:-mt-12 md:-mt-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4">
          
          {/* 1. TENGAH ATAS: Logo Pranata */}
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img
              src="/logos/basic/logo black.webp"
              alt="Pranata Logo"
              className="h-9 sm:h-11 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
              loading="lazy"
              decoding="async"
            />
          </Link>

          {/* 2. TENGAH BAWAH: Made by UCCD-ArgentinaJuara for Veternity Beraksi 2026 (Full SF UI, No Arrow) */}
          <p 
            className="text-xs sm:text-sm font-medium text-[#5A635B] tracking-wide"
            style={{ fontFamily: "'SFUIDisplay', system-ui, sans-serif" }}
          >
            Made by{" "}
            <a 
              href="https://www.instagram.com/uccdfti.untar" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#1C241E] font-bold hover:text-[#C25939] hover:underline transition-colors"
            >
              UCCD-ArgentinaJuara
            </a>{" "}
            for{" "}
            <a 
              href="https://www.instagram.com/veternity.verse/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#32452C] font-bold hover:text-[#C25939] hover:underline transition-colors"
            >
              Veternity Beraksi 2026
            </a>
          </p>

          {/* 3. BAWAH TENGAH: 2 Developer Dekatan di Tengah dengan Scale & Shadow */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 md:gap-6 pt-1">
            
            {/* Developer 1: Arya Rava Pradana */}
            <a 
              href="https://www.instagram.com/aryarava_" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-3 bg-white border border-[#32452C]/15 px-4.5 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-xl hover:scale-105 hover:bg-[#32452C] hover:border-[#32452C] transition-all duration-300 cursor-pointer active:scale-95"
            >
              <img
                src="/devs/arya.webp"
                alt="Arya Rava Pradana"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#32452C] group-hover:border-white shrink-0 shadow-xs transition-colors"
                loading="lazy"
                decoding="async"
              />
              <div className="flex flex-col text-left">
                <span 
                  className="text-xs sm:text-sm font-bold text-[#1C241E] group-hover:text-white leading-tight transition-colors"
                  style={{ fontFamily: "'SFUIDisplay', system-ui, sans-serif" }}
                >
                  Arya Rava Pradana
                </span>
                <span 
                  className="text-[11px] text-[#5A635B] group-hover:text-emerald-100/90 font-medium transition-colors"
                  style={{ fontFamily: "'SFUIDisplay', system-ui, sans-serif" }}
                >
                  Teknik Informatika 2024
                </span>
              </div>
            </a>

            {/* Developer 2: Leticia Michelle Purba */}
            <a 
              href="https://www.instagram.com/mchvelle/" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-3 bg-white border border-[#32452C]/15 px-4.5 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-xl hover:scale-105 hover:bg-[#32452C] hover:border-[#32452C] transition-all duration-300 cursor-pointer active:scale-95"
            >
              <img
                src="/devs/michelle.webp"
                alt="Leticia Michelle Purba"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#32452C] group-hover:border-white shrink-0 shadow-xs transition-colors"
                loading="lazy"
                decoding="async"
              />
              <div className="flex flex-col text-left">
                <span 
                  className="text-xs sm:text-sm font-bold text-[#1C241E] group-hover:text-white leading-tight transition-colors"
                  style={{ fontFamily: "'SFUIDisplay', system-ui, sans-serif" }}
                >
                  Leticia Michelle Purba
                </span>
                <span 
                  className="text-[11px] text-[#5A635B] group-hover:text-emerald-100/90 font-medium transition-colors"
                  style={{ fontFamily: "'SFUIDisplay', system-ui, sans-serif" }}
                >
                  Sistem Informasi 2024
                </span>
              </div>
            </a>

          </div>

        </div>
      </footer>
    </div>
  );
}
