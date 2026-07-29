"use client";
import { cn } from "@/lib/utils";

import React, {
  useRef,
  useEffect,
  useState,
} from "react";
import { GlobalRope } from "./global-rope";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    title: "Pranata Intelligence",
    description:
      "Asisten AI yang siap membantu menjawab pertanyaan seputar peternakan, memberikan rekomendasi berbasis data, serta membantu Anda mengambil keputusan bisnis dengan lebih cepat dan tepat.",
    logoWhite:
      "/logos/intelligence/intelligence-white.webp",
    logoBlack:
      "/logos/intelligence/intelligence-black.webp",
    illustration:
      "/images/PRANATA_INTELLIGENCE.webp",
    layout: "right-card",
  },
  {
    title: "Pranata Market",
    description:
      "Jual hasil peternakan langsung kepada konsumen dan pembeli bisnis tanpa melalui tengkulak. Nikmati proses transaksi yang lebih transparan dengan peluang keuntungan yang lebih besar.",
    logoWhite:
      "/logos/market/market-white.webp",
    logoBlack:
      "/logos/market/market-black.webp",
    illustration:
      "/images/PRANATA_MARKET.webp",
    layout: "left-card",
  },
  {
    title: "Pranata Hub",
    description:
      "Pantau performa penjualan, tren permintaan, dan perkembangan usaha melalui dashboard analitik yang mudah dipahami, sehingga setiap keputusan didukung oleh data.",
    logoWhite: "/logos/hub/hub-white.webp",
    logoBlack: "/logos/hub/hub-black.webp",
    illustration: "/images/PRANATA_HUB.webp",
    layout: "right-card",
  },
];

type FeatureType = (typeof features)[0];

const FeatureCard = ({
  feature,
  layout,
  index,
}: {
  feature: FeatureType;
  layout?: string;
  index: number;
}) => {
  const isCenter = layout === "center-stack";
  const isLeft = layout === "left-card";

  const flexDir = isCenter
    ? "flex-col items-center text-center"
    : isLeft
      ? "flex-row-reverse items-center"
      : "flex-row items-center";

  const cardRef =
    useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] =
    useState(false);
  const [isActive, setIsActive] =
    useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    if (!cardRef.current) return;

    // Use browser native IntersectionObserver for zero-reflow, 60 FPS performance
    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsActive(true);
            } else if (
              entry.boundingClientRect.top >
              0
            ) {
              setIsActive(false);
            }
          });
        },
        {
          rootMargin: "-15% 0px -15% 0px",
          threshold: 0.1,
        },
      );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const renderCardContent = (
    active: boolean,
  ) => (
    <div
      className={`w-full flex ${flexDir} gap-3.5 sm:gap-8 lg:gap-16 p-4 sm:p-7 lg:p-12 relative`}
    >
      {/* Graphic Container */}
      <div
        className={`relative flex items-center justify-center shrink-0 group w-28 sm:w-48 lg:w-72`}
        {...(!active
          ? { "data-rope-anchor": true }
          : {})}
      >
        <div
          data-parallax="0.6"
          className="w-full relative z-50 transform-gpu"
        >
          <div
            className={cn(
              "w-full drop-shadow-2xl transition-transform",
              "duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105",
              "group-hover:-translate-y-2",
            )}
          >
            <div
              className={`w-full flex items-center justify-center border-[3px] sm:border-[5px] lg:border-[6px] rounded-[1.5rem] sm:rounded-[2.2rem] lg:rounded-[2.5rem] shadow-inner overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${active ? "bg-[#2B4C3B]/20 border-[#F4F6F0]" : "bg-white border-[#E8E3D2]"}`}
            >
              <img
                src={feature.illustration}
                alt={feature.title}
                className="w-full h-auto object-contain block scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Text Container */}
      <div
        className={`flex-1 w-full relative z-10 flex flex-col items-start text-left justify-center`}
        data-parallax="-0.4"
      >
        {/* Logo acting as Heading */}
        <div className="mb-2 sm:mb-4 lg:mb-8">
          {/* backdrop-blur only on sm+ to avoid GPU thrash on mobile */}
          <div
            className={`inline-flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-500 ${active ? "p-2 sm:p-3.5 lg:p-5 bg-white/10 sm:backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]" : ""}`}
          >
            <div
              className={cn(
                "h-6 sm:h-10 lg:h-16",
                "shrink-0 inline-block relative",
              )}
            >
              {active && (
                <img
                  src={feature.logoWhite}
                  alt={feature.title}
                  className="h-full w-auto object-contain"
                  decoding="async"
                />
              )}
              {!active && (
                <img
                  src={feature.logoBlack}
                  alt={feature.title}
                  className={cn(
                    "h-full w-auto object-contain",
                    "transition-opacity duration-150 group-[.is-active]/card:opacity-0",
                  )}
                  decoding="async"
                />
              )}
            </div>
          </div>
        </div>

        <p
          className={`font-medium leading-relaxed text-xs sm:text-sm lg:text-[17px] transition-colors duration-0 max-w-md ${active ? "text-white/95" : "text-slate-600"}`}
        >
          {feature.description}
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={cardRef}
      className={`group/card relative overflow-clip border-[3px] rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] w-full max-w-4xl bg-white ${
        isActive
          ? "border-white -translate-y-2"
          : "border-[#E8E3D2] hover:-translate-y-2"
      } transition-[border-color,transform] duration-700`}
    >
      {/* BASE LAYER (Dark Text, White BG) — visible when inactive */}
      <div
        className="transition-opacity duration-700"
        style={{ opacity: isActive ? 0 : 1 }}
        aria-hidden={isActive}
      >
        {renderCardContent(false)}
      </div>

      {/* OVERLAY LAYER (White Text, Soft Green BG) — fade in on mobile, clip-path on desktop */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br",
          "from-[#8FA76B] to-[#405D46] z-20",
          "flex items-center justify-center",
          "pointer-events-none",
        )}
        style={
          isMobile
            ? {
                opacity: isActive ? 1 : 0,
                transition:
                  "opacity 0.5s ease",
              }
            : {
                clipPath: isActive
                  ? "circle(150% at 50% 50%)"
                  : "circle(0% at 50% 50%)",
                WebkitClipPath: isActive
                  ? "circle(150% at 50% 50%)"
                  : "circle(0% at 50% 50%)",
                transition:
                  "clip-path 1s cubic-bezier(0.32,0.72,0,1), -webkit-clip-path 1s cubic-bezier(0.32,0.72,0,1)",
              }
        }
      >
        {renderCardContent(true)}
      </div>
    </div>
  );
};

export function FeaturesRopeSection() {
  const containerRef =
    useRef<HTMLElement>(null);

  return (
    <section
      ref={containerRef}
      className={cn(
        "py-16 sm:py-24 md:py-32",
        "relative bg-forest features-rope-container",
        "overflow-hidden",
      )}
    >
      {/* Decorative Background Elements */}
      <div className="block">
        <GlobalRope />
      </div>

      <div
        className={cn(
          "max-w-7xl mx-auto relative",
          "z-10 px-4 md:px-8",
          "lg:px-12",
        )}
      >
        {/* Header section */}
        <div
          className={cn(
            "text-center mb-12 sm:mb-16",
            "md:mb-20 flex flex-col",
            "items-center",
          )}
        >
          <h2
            className={cn(
              "text-3xl sm:text-4xl md:text-6xl",
              "lg:text-7xl font-black text-slate-50",
              "tracking-tight mb-4 sm:mb-6",
              "leading-[1.05] max-w-4xl",
            )}
            data-parallax="0.5"
          >
            Semua yang Dibutuhkan dalam Satu
            Platform
          </h2>
          <p
            className={cn(
              "text-sm sm:text-lg md:text-xl",
              "text-slate-300/90 max-w-2xl font-medium",
              "leading-relaxed px-2 sm:px-0",
            )}
            data-parallax="0.8"
          >
            Tiga solusi utama yang saling
            terintegrasi untuk membantu
            peternak menjual langsung ke
            konsumen, memahami performa
            bisnis, dan mengambil keputusan
            yang lebih cerdas
          </p>
        </div>

        {/* Hero Anchor - Kept for rope math to match the anchors */}
        <div
          className={cn(
            "flex justify-center mb-10",
            "sm:mb-14 md:mb-18 relative",
            "z-20 w-full max-w-7xl",
            "mx-auto h-1 px-4",
            "md:px-8 lg:px-12",
          )}
          data-rope-anchor
        ></div>

        {/* Features Timeline Cards with Rope Anchors */}
        <div
          className={cn(
            "flex flex-col relative",
            "gap-24 sm:gap-32 md:gap-40",
            "lg:gap-56",
          )}
        >
          {features.map((feature, index) => {
            return (
              <div
                key={`feature-card-${index}`}
                className="relative z-20 w-full flex justify-center"
              >
                <div
                  className={cn(
                    "w-full sm:w-[90%] lg:w-full",
                    "flex items-center justify-center",
                  )}
                >
                  <FeatureCard
                    feature={feature}
                    layout={feature.layout}
                    index={index}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Anchor */}
        <div
          className={cn(
            "flex justify-center mt-24",
            "sm:mt-32 relative z-20",
            "w-full h-1",
          )}
          data-rope-anchor
        ></div>
      </div>
    </section>
  );
}
