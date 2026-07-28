"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalLoading } from "@/components/shared/loading-context";
import { Loader2 } from "lucide-react";

type SplashState = "IDLE_OPEN" | "CLOSING" | "WAITING" | "OPENING";

export function SplashScreen() {
  const [targetRadius, setTargetRadius] = useState(15000);
  const { isGlobalReady } = useGlobalLoading();

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const logoWidth = Math.min(w * 0.8, 400);
    const ratio = logoWidth / 3343;
    const logoHeight = logoWidth * (994 / 3343);
    
    // The SVG is centered. The circle cx is 437 inside the viewBox.
    const originXPhysical = (w / 2) - (logoWidth / 2) + (437 * ratio); 
    const originYPhysical = (h / 2) - (logoHeight / 2) + (497 * ratio); 

    // Find the max distance from this origin to any of the 4 screen corners
    const maxCornerDist = Math.max(
      Math.hypot(originXPhysical, originYPhysical), // Top-left
      Math.hypot(w - originXPhysical, originYPhysical), // Top-right
      Math.hypot(originXPhysical, h - originYPhysical), // Bottom-left
      Math.hypot(w - originXPhysical, h - originYPhysical) // Bottom-right
    );
    
    // Perfect target radius plus a MASSIVE 10000 unit buffer 
    const requiredRadius = (maxCornerDist / ratio) + 10000; 
    setTargetRadius(requiredRadius);
  }, []);

  // Transisi Tutup (IN): Menutup lingkaran dari r=targetRadius ke r=0 (Tutup Mulus 0.5s)
  const inTransition = {
    duration: 0.5,
    ease: [0.65, 0, 0.35, 1] as import("framer-motion").Easing
  };

  // Transisi Buka (OUT): Membuka lingkaran dari r=0 ke r=targetRadius (Buka Sinematik 0.85s)
  const outTransition = {
    duration: 0.85,
    ease: [0.87, 0, 0.13, 1] as import("framer-motion").Easing
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none" style={{ contain: "strict", willChange: "opacity, transform" }}>
      {/* 
        Bulletproof SVG Mask Layer:
        Creates a white background and logo that BOTH get an expanding circular hole 
        originating from the logo mark.
      */}
      <svg className="absolute inset-0 w-full h-full z-0">
        <defs>
          <mask id="splash-mask">
            {/* Keep the background everywhere initially */}
            <rect width="100%" height="100%" fill="white" />
            {/* Punch a circular hole from the center of the logo mark (cx: 437, cy: 497 in viewBox) */}
            <svg x="calc(50vw - min(40vw, 200px))" y="calc(50vh - min(11.89vw, 59.45px))" width="min(80vw, 400px)" height="min(23.78vw, 118.9px)" viewBox="0 0 3343 994" overflow="visible">
              <motion.circle
                cx="437"
                cy="497"
                fill="black"
                initial={{ r: 0 }}
                animate={{ r: isGlobalReady ? (targetRadius || 15000) : 0 }}
                transition={isGlobalReady ? outTransition : inTransition}
              />
            </svg>
          </mask>
        </defs>

        {/* Everything inside this group gets the hole punched through it */}
        <g mask="url(#splash-mask)">
          <rect width="100%" height="100%" fill="white" />
          
          <svg x="calc(50vw - min(40vw, 200px))" y="calc(50vh - min(11.89vw, 59.45px))" width="min(80vw, 400px)" height="min(23.78vw, 118.9px)" viewBox="0 0 3343 994" overflow="visible">
            {/* The Colored Logo remains static in the center. Only the circular hole expands/shrinks. */}
            <image href="/logos/basic/logo black.webp" width="3343" height="994" />
          </svg>
        </g>
      </svg>

      {/* Loading Indicator - Placed AFTER the SVG so it renders on top of the solid white background */}
      <AnimatePresence>
        {!isGlobalReady && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, transition: { delay: 0.25 } }} 
            exit={{ opacity: 0 }} 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
          >
            <Loader2 className="w-8 h-8 text-[#2B4C3B] animate-spin" />
            <span className="text-[#2B4C3B] font-bold text-sm tracking-widest uppercase">Loading...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
