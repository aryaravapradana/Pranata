/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Granular positioning configuration per testimony panel (Standardized for 100% exact spot consistency across viewports)
const TESTIMONIAL_PANELS = [
  {
    id: 1,
    title: "Pranata Intelligence",
    image: "/testimonies/ayam.webp",
    alt: "Peternakan Ayam Broiler",
    logo: "/logos/intelligence/intelligence-black.webp",
    quote: "fitur AI Scanner langsung memberikan klasifikasi grade otomatis serta asisten AI 24/7 yang membantu pencegahan wabah penyakit ternak ayam kami.",
    author: "Slamet Widodo",
    role: "Peternak Ayam Broiler di Subang",
    maskType: "none",
    // STANDARDIZED TOP-LEFT SPOT POSITIONING:
    containerAlign: "justify-start items-start pt-16 sm:pt-20 md:pt-24 pl-4 sm:pl-8 md:pl-12",
    maxWidth: "max-w-lg sm:max-w-xl md:max-w-2xl",
    bubbleAlign: "items-end",
    textAlign: "text-right",
    tailPosition: "after:right-8 sm:after:right-12",
    authorAlign: "items-end text-right pr-2 sm:pr-4",
    topGradient: true,
    bottomGradient: false,
  },
  {
    id: 2,
    title: "Pranata Market",
    image: "/testimonies/sapi.webp",
    alt: "Peternakan Sapi Potong",
    logo: "/logos/market/market-black.webp",
    quote: "saya bisa langsung membuka toko ternak terverifikasi, memasang acuan harga transparan per kg, dan menjual daging sapi tanpa perantara.",
    author: "Sugeng Priyanto",
    role: "Peternak Sapi Potong di Boyolali",
    maskType: "circle",
    // STANDARDIZED TOP-LEFT SPOT POSITIONING:
    containerAlign: "justify-start items-start pt-16 sm:pt-20 md:pt-24 pl-4 sm:pl-8 md:pl-12",
    maxWidth: "max-w-lg sm:max-w-xl md:max-w-2xl",
    bubbleAlign: "items-end",
    textAlign: "text-right",
    tailPosition: "after:right-8 sm:after:right-12",
    authorAlign: "items-end text-right pr-2 sm:pr-4",
    topGradient: false,
    bottomGradient: false,
  },
  {
    id: 3,
    title: "Pranata Hub",
    image: "/testimonies/susu.webp",
    alt: "Peternakan Sapi Perah",
    logo: "/logos/hub/hub-black.webp",
    quote: "jadwal pakan harian tercatat di kalender interaktif, stok susu terhubung otomatis ke toko, dan pesanan masuk dapat dipantau dalam satu dasbor.",
    author: "Mulyono",
    role: "Peternak Sapi Perah di Lembang",
    maskType: "inset",
    // STANDARDIZED TOP-RIGHT SPOT POSITIONING (MIRRORED INNER ALIGNMENT):
    containerAlign: "justify-start items-end pt-16 sm:pt-20 md:pt-24 pr-4 sm:pr-8 md:pr-12",
    maxWidth: "max-w-lg sm:max-w-xl md:max-w-2xl",
    bubbleAlign: "items-start",
    textAlign: "text-left",
    tailPosition: "after:left-8 sm:after:left-12",
    authorAlign: "items-start text-left pl-2 sm:pl-4",
    topGradient: false,
    bottomGradient: true,
  }
];

// ─── Elegant Mobile Testimonials Showcase (Native Touch-Snap 60 FPS) ───
// Built for mobile viewports to provide a silky-smooth, native swipe experience without scroll-jacking.
function MobileTestimoniCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth * 0.85;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), TESTIMONIAL_PANELS.length - 1));
  };

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.85;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative w-full bg-[#32452C] py-10 px-0 flex flex-col justify-center overflow-hidden">
      
      {/* Editorial Section Header */}
      <div className="px-5 mb-6 text-center flex flex-col items-center">
        <span className="inline-block bg-[#405D46] text-emerald-100 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-2 border border-white/10">
          Cerita Peternak Nusantara
        </span>
        <h2 className="text-2xl font-bold font-rustic text-white tracking-tight" style={{ fontFamily: "'Rustic Delight', serif" }}>
          Dampak Nyata di Lapangan
        </h2>
        <p className="text-xs text-emerald-100/80 mt-1 max-w-xs leading-relaxed">
          Geser untuk melihat testimoni pengguna Pranata di berbagai daerah.
        </p>
      </div>

      {/* Touch-Snap Cards Scroll Track */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto snap-x snap-mandatory gap-4 px-5 py-2 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TESTIMONIAL_PANELS.map((panel, i) => (
          <div
            key={`mobile-card-${panel.id}`}
            className="shrink-0 w-[85vw] max-w-xs h-[450px] rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/20 snap-center flex flex-col justify-between p-5"
          >
            {/* Background Image */}
            <img
              src={panel.image}
              alt={panel.alt}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C241E]/95 via-[#1C241E]/40 to-transparent pointer-events-none" />

            {/* Top Module Badge */}
            <div className="relative z-10 flex justify-between items-center">
              <span className="inline-flex items-center bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-white/80">
                <img src={panel.logo} alt={panel.title} className="h-4 w-auto object-contain" decoding="async" />
              </span>
              <span className="text-white/80 text-[11px] font-black tracking-widest">
                0{panel.id} / 03
              </span>
            </div>

            {/* Bottom Content & Speech Bubble */}
            <div className="relative z-10 flex flex-col gap-3">
              {/* Glassmorphism Speech Bubble */}
              <div 
                className="w-full bg-white/95 backdrop-blur-sm border border-white/80 p-4 rounded-2xl shadow-xl relative text-left after:content-[''] after:absolute after:top-full after:left-6 after:border-x-[10px] after:border-t-[12px] after:border-x-transparent after:border-b-transparent after:border-t-white/95"
              >
                <p className="text-xs font-semibold text-[#1C241E] leading-relaxed" style={{ fontFamily: "'Rustic Delight', serif" }}>
                  "{panel.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex flex-col pt-1 pl-1">
                <h3 className="text-white font-black text-sm tracking-wider uppercase drop-shadow-md">
                  {panel.author}
                </h3>
                <p className="text-emerald-300 font-medium text-[11px] drop-shadow-sm">
                  {panel.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dot Controls */}
      <div className="flex justify-center items-center gap-2 mt-5">
        {TESTIMONIAL_PANELS.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => scrollToCard(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            aria-label={`Go to testimony ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Desktop Gallery (full GSAP pin+scrub+clip-path) ───
function DesktopEditorialGallery() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const panels = gsap.utils.toArray('.panel') as HTMLElement[]
    if (!panels.length) return;
    const isMobileBrowser = window.innerWidth < 640;

    // Initially hide panel contents except panel 0
    panels.forEach((panel, i) => {
      const content = panel.querySelector('.panel-content')
      if (content) {
        gsap.set(content, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 25 })
      }
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${(panels.length - 1) * 100}%`,
        scrub: true,
        pin: true,
        anticipatePin: 0,
        fastScrollEnd: true,
        preventOverlaps: true,
        invalidateOnRefresh: true
      }
    })

    panels.forEach((panel, i) => {
      if (i === 0) return;
      
      const config = TESTIMONIAL_PANELS[i];
      const isCircle = config ? config.maskType === "circle" : i % 2 !== 0;
      const content = panel.querySelector('.panel-content');
      const img = panel.querySelector('.parallax-img');

      if (isCircle) {
        gsap.set(panel, { 
          clipPath: "circle(0% at 50% 50%)",
          WebkitClipPath: "circle(0% at 50% 50%)" 
        });
        tl.to(panel, {
          clipPath: "circle(150% at 50% 50%)",
          WebkitClipPath: "circle(150% at 50% 50%)",
          ease: "none"
        });
      } else {
        gsap.set(panel, { 
          clipPath: "inset(100% 0 0 0)",
          WebkitClipPath: "inset(100% 0 0 0)" 
        });
        tl.to(panel, {
          clipPath: "inset(0% 0 0 0)",
          WebkitClipPath: "inset(0% 0 0 0)",
          ease: "none"
        });
      }

      // Parallax image within the panel (desktop only — skip on mobile)
      if (img && !isMobileBrowser) {
        tl.fromTo(img, 
          { scale: 1.12, y: isCircle ? -20 : 30 }, 
          { scale: 1, y: 0, ease: "none" }, 
          "<"
        );
      }

      // Smooth scrubbed content reveal
      if (content) {
        tl.fromTo(content,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: "power1.out" },
          "<+=0.05"
        );
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative h-screen min-h-screen w-full bg-[#32452C] editorial-gallery-container overflow-hidden">
      
      {TESTIMONIAL_PANELS.map((item, index) => {
        const isCircle = item.maskType === "circle";
        const initialClip = index === 0 
          ? "none" 
          : isCircle 
          ? "circle(0% at 50% 50%)" 
          : "inset(100% 0 0 0)";

        return (
          <div 
            key={`testimony-panel-${item.id}`} 
            className="panel absolute inset-0 w-full h-full bg-[#32452C] overflow-hidden transform-gpu" 
            style={{ 
              zIndex: (index + 1) * 10,
              clipPath: initialClip,
              WebkitClipPath: initialClip
            }}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 parallax-img opacity-100 transform-gpu">
              <img 
                src={item.image} 
                alt={item.alt} 
                className="w-full h-full object-cover object-center"  
                loading="lazy" 
                decoding="async" 
              />
            </div>
            
            {/* Top Transition Gradient */}
            {item.topGradient && (
              <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-[#32452C] via-[#32452C]/70 to-transparent w-full h-48 sm:h-64 md:h-80 pointer-events-none" />
            )}

            {/* Bottom Transition Gradient */}
            {item.bottomGradient && (
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-linear-to-t from-[#32452C] via-[#32452C]/70 to-transparent w-full h-48 sm:h-64 md:h-80 pointer-events-none" />
            )}
            
            {/* Panel Content (Granular Positioning Container) */}
            <div className={`panel-content absolute inset-0 z-20 flex flex-col p-4 sm:p-8 md:p-20 ${item.containerAlign}`}>
              <div className={`${item.maxWidth} w-full flex flex-col ${item.bubbleAlign}`}>
                
                {/* Compact Speech Bubble Container (White Glassmorphism) */}
                <div 
                  className={`w-full relative bg-white/95 sm:backdrop-blur-sm border border-white/60 p-4 sm:p-5 md:p-7 rounded-2xl sm:rounded-3xl shadow-xl mb-4 sm:mb-6 ${item.textAlign} after:content-[''] after:absolute after:top-full ${item.tailPosition} after:border-x-[14px] sm:after:border-x-[18px] after:border-t-[18px] sm:after:border-t-[22px] after:border-x-transparent after:border-b-transparent after:border-t-white/95 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]`}
                >
                  <h2 
                    className="text-xs sm:text-sm md:text-lg font-bold font-rustic text-transparent bg-clip-text bg-linear-to-r from-[#1C241E] via-[#32452C] to-[#2B4C3B] leading-[1.4] tracking-wide" 
                    style={{ fontFamily: "'Rustic Delight', serif" }}
                  >
                    "Melalui <img src={item.logo} alt={item.title} className="inline-block h-4 sm:h-5 md:h-6 w-auto align-middle mx-1 object-contain -translate-y-0.5 sm:-translate-y-1 relative" decoding="async" />, {item.quote}"
                  </h2>
                </div>

                {/* Author & Location (GPU-Accelerated Text Shadow) */}
                <div className={`flex flex-col gap-0.5 ${item.authorAlign}`}>
                  <p className="text-white font-black tracking-wider uppercase text-xs sm:text-sm md:text-base [text-shadow:0_2px_4px_#000,0_4px_12px_#000,0_8px_20px_rgba(0,0,0,0.95)]">
                    {item.author}
                  </p>
                  <p className="text-emerald-100 font-semibold text-[11px] sm:text-xs md:text-sm [text-shadow:0_2px_4px_#000,0_4px_12px_#000]">
                    {item.role}
                  </p>
                </div>

              </div>
            </div>
          </div>
        );
      })}

    </div>
  )
}

// ─── Main export: mobile = carousel, desktop = GSAP gallery ───
export function EditorialGallery() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 640);
  }, []);

  // Render nothing until we know the device type (avoids hydration mismatch)
  if (isMobile === null) return (
    <div className="w-full bg-[#32452C]" style={{ height: '100svh', minHeight: 500 }} />
  );

  return isMobile ? <MobileTestimoniCarousel /> : <DesktopEditorialGallery />;
}


