"use client";
import { cn } from "@/lib/utils";
import React, {
  useEffect,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  useGlobalLoading,
  SPLASH_CLOSE_DURATION,
  SPLASH_OPEN_DURATION,
} from "@/components/shared/loading-context";
import { Loader2 } from "lucide-react";

export function SplashScreen() {
  const [targetRadius, setTargetRadius] = useState(15000);
  const { phase, isGlobalReady } = useGlobalLoading();

  useEffect(() => {
    const calculateRadius = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const logoWidth = Math.min(w * 0.8, 400);
      const ratio = logoWidth / 3343;
      const logoHeight = logoWidth * (994 / 3343);

      const originXPhysical = w / 2 - logoWidth / 2 + 520 * ratio;
      const originYPhysical = h / 2 - logoHeight / 2 + 497 * ratio;

      const maxCornerDist = Math.max(
        Math.hypot(originXPhysical, originYPhysical),
        Math.hypot(w - originXPhysical, originYPhysical),
        Math.hypot(originXPhysical, h - originYPhysical),
        Math.hypot(w - originXPhysical, h - originYPhysical),
      );

      const requiredRadius = Math.ceil((maxCornerDist / ratio) * 1.08);
      setTargetRadius(requiredRadius);
    };

    calculateRadius();
    window.addEventListener("resize", calculateRadius);
    return () => window.removeEventListener("resize", calculateRadius);
  }, []);

  const isClosed =
    phase === "INITIAL" ||
    phase === "CLOSING" ||
    phase === "COVERED";

  // Only block pointer events when the screen is actually closed/covered!
  // During OPENING and IDLE, pointer-events-none guarantees the user can click anywhere!
  const isPointerBlocked = phase === "CLOSING" || phase === "COVERED";

  // STEP 1: TUTUP DULU - Smooth & deliberate iris close
  const inTransition = {
    duration: SPLASH_CLOSE_DURATION,
    ease: [0.7, 0, 0.3, 1] as import("framer-motion").Easing,
  };

  // STEP 3: BARU BUKA - Slower, majestic, smooth iris expansion across the viewport
  const outTransition = {
    duration: SPLASH_OPEN_DURATION,
    ease: [0.35, 0.05, 0.2, 1] as import("framer-motion").Easing,
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999]",
        isGlobalReady
          ? "pointer-events-none opacity-0 invisible"
          : isPointerBlocked
          ? "pointer-events-auto opacity-100 visible"
          : "pointer-events-none opacity-100 visible",
      )}
      style={{
        contain: "strict",
        willChange: "transform",
      }}
    >
      <svg className="absolute inset-0 w-full h-full z-0">
        <defs>
          <mask id="splash-mask">
            <rect
              width="100%"
              height="100%"
              fill="white"
            />
            <svg
              x="calc(50vw - min(40vw, 200px))"
              y="calc(50vh - min(11.89vw, 59.45px))"
              width="min(80vw, 400px)"
              height="min(23.78vw, 118.9px)"
              viewBox="0 0 3343 994"
              overflow="visible"
            >
              <motion.circle
                cx="520"
                cy="497"
                fill="black"
                initial={false}
                animate={{
                  r: isClosed ? 0 : targetRadius || 15000,
                }}
                transition={isClosed ? inTransition : outTransition}
              />
            </svg>
          </mask>
        </defs>

        <g mask="url(#splash-mask)">
          <rect
            width="100%"
            height="100%"
            fill="white"
          />
          <svg
            x="calc(50vw - min(40vw, 200px))"
            y="calc(50vh - min(11.89vw, 59.45px))"
            width="min(80vw, 400px)"
            height="min(23.78vw, 118.9px)"
            viewBox="0 0 3343 994"
            overflow="visible"
          >
            <image
              href="/logos/basic/logo black.webp"
              width="3343"
              height="994"
            />
          </svg>
        </g>
      </svg>

      <AnimatePresence>
        {isClosed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.15 },
            }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute bottom-12 left-1/2",
              "-translate-x-1/2 flex flex-col",
              "items-center gap-3 z-10 pointer-events-none select-none",
            )}
          >
            <Loader2 className="w-8 h-8 text-[#2B4C3B] animate-spin" />
            <span
              className={cn(
                "text-[#2B4C3B] font-bold text-sm",
                "tracking-widest uppercase",
              )}
            >
              Loading...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
