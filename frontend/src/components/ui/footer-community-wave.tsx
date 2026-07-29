"use client";
import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";

interface FooterProps {
  variant?: "light" | "dark";
}

export function FooterCommunityWave({
  variant = "light",
}: FooterProps) {
  const isLightPage = variant === "light";

  // Colors:
  // Light Page (white/cream bg): SVG wave is Green (#32452C), Footer is Green (#32452C)
  // Dark Page (green/dark bg): SVG wave is Cream (#F8F6F0), Footer is Cream (#F8F6F0)
  const waveFill = isLightPage
    ? "#32452C"
    : "#F8F6F0";
  const footerBg = isLightPage
    ? "bg-[#32452C] text-[#E8E3D2]"
    : "bg-[#F8F6F0] text-[#1C241E]";
  const logoSrc = isLightPage
    ? "/logos/basic/logo-white.webp"
    : "/logos/basic/logo black.webp";
  const subtextColor = isLightPage
    ? "text-white font-medium opacity-90"
    : "text-[#5A635B]";
  const linkTextMain = isLightPage
    ? "text-white font-bold hover:underline hover:opacity-80"
    : "text-[#1C241E] font-bold hover:text-[#C25939] hover:underline";
  const linkTextSub = isLightPage
    ? "text-white font-bold hover:underline hover:opacity-80"
    : "text-[#32452C] font-bold hover:text-[#C25939] hover:underline";

  // Dev Card styles:
  const cardBg = isLightPage
    ? "bg-white/10 border-white/20 text-white hover:bg-white hover:text-[#1C241E]"
    : "bg-white border-[#32452C]/15 text-[#1C241E] hover:bg-[#32452C] hover:text-white hover:border-[#32452C]";
  const devTitleColor = isLightPage
    ? "text-white group-hover:text-[#1C241E]"
    : "text-[#1C241E] group-hover:text-white";
  const devSubColor = isLightPage
    ? "text-white/80 group-hover:text-[#5A635B]"
    : "text-[#5A635B] group-hover:text-emerald-100/90";
  const devAvatarBorder = isLightPage
    ? "border-white group-hover:border-[#32452C]"
    : "border-[#32452C] group-hover:border-white";

  const waveContainerBg = isLightPage
    ? "bg-transparent"
    : "bg-[#32452C]";

  return (
    <div className="w-full font-sans overflow-hidden">
      {/* ── Curved Wave Divider ── */}
      <div
        className={`w-full relative z-20 overflow-hidden leading-none select-none pointer-events-none -mb-1 -mt-2 ${waveContainerBg}`}
      >
        <svg
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 sm:h-24 md:h-32 block"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 180 L 0 45 C 120 45 250 110 420 110 C 580 110 650 15 720 15 C 790 15 860 110 1020 110 C 1190 110 1320 45 1440 45 L 1440 180 Z"
            fill={waveFill}
          />
        </svg>
      </div>

      {/* ── Main Footer Body ── */}
      <footer
        className={`relative ${footerBg} pt-4 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-8 lg:px-12 z-20 w-full`}
      >
        <div
          className={cn(
            "max-w-4xl mx-auto flex",
            "flex-col items-center text-center",
            "space-y-4",
          )}
        >
          {/* 1. Logo Pranata */}
          <Link
            href="/"
            className={cn(
              "inline-block transition-transform hover:scale-105",
              "active:scale-95",
            )}
          >
            <img
              src={logoSrc}
              alt="Pranata Logo"
              className={cn(
                "h-9 sm:h-11 w-auto",
                "object-contain opacity-95 hover:opacity-100",
                "transition-opacity",
              )}
              loading="lazy"
              decoding="async"
            />
          </Link>

          {/* 2. Made by UCCD-ArgentinaJuara for Veternity Beraksi 2026 */}
          <p
            className={`text-xs sm:text-sm font-medium ${subtextColor} tracking-wide`}
            style={{
              fontFamily:
                "'SFUIDisplay', system-ui, sans-serif",
            }}
          >
            Made by{" "}
            <a
              href="https://www.instagram.com/uccdfti.untar"
              target="_blank"
              rel="noreferrer"
              className={`${linkTextMain} font-bold underline transition-colors`}
            >
              UCCD-ArgentinaJuara
            </a>{" "}
            for{" "}
            <a
              href="https://www.instagram.com/veternity.verse/"
              target="_blank"
              rel="noreferrer"
              className={`${linkTextSub} font-bold underline transition-colors`}
            >
              Veternity Beraksi 2026
            </a>
          </p>

          {/* 3. Developers */}
          <div
            className={cn(
              "w-full flex flex-col",
              "sm:flex-row items-center justify-center",
              "gap-3.5 sm:gap-5 md:gap-6",
              "pt-1",
            )}
          >
            {/* Developer 1: Arya Rava Pradana */}
            <a
              href="https://www.instagram.com/aryarava_"
              target="_blank"
              rel="noreferrer"
              className={`group flex items-center gap-3 border px-4.5 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95 ${cardBg}`}
            >
              <img
                src="/devs/arya.webp"
                alt="Arya Rava Pradana"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 shrink-0 shadow-xs transition-colors ${devAvatarBorder}`}
                loading="lazy"
                decoding="async"
              />
              <div className="flex flex-col text-left">
                <span
                  className={`text-xs sm:text-sm font-bold leading-tight transition-colors ${devTitleColor}`}
                  style={{
                    fontFamily:
                      "'SFUIDisplay', system-ui, sans-serif",
                  }}
                >
                  Arya Rava Pradana
                </span>
                <span
                  className={`text-[11px] font-medium transition-colors ${devSubColor}`}
                  style={{
                    fontFamily:
                      "'SFUIDisplay', system-ui, sans-serif",
                  }}
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
              className={`group flex items-center gap-3 border px-4.5 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95 ${cardBg}`}
            >
              <img
                src="/devs/michelle.webp"
                alt="Leticia Michelle Purba"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 shrink-0 shadow-xs transition-colors ${devAvatarBorder}`}
                loading="lazy"
                decoding="async"
              />
              <div className="flex flex-col text-left">
                <span
                  className={`text-xs sm:text-sm font-bold leading-tight transition-colors ${devTitleColor}`}
                  style={{
                    fontFamily:
                      "'SFUIDisplay', system-ui, sans-serif",
                  }}
                >
                  Leticia Michelle Purba
                </span>
                <span
                  className={`text-[11px] font-medium transition-colors ${devSubColor}`}
                  style={{
                    fontFamily:
                      "'SFUIDisplay', system-ui, sans-serif",
                  }}
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
