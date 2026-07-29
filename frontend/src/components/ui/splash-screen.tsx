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
import { useGlobalLoading } from "@/components/shared/loading-context";
import { Loader2 } from "lucide-react";

export function SplashScreen() {
  const [targetRadius, setTargetRadius] =
    useState(15000);
  const { phase, isGlobalReady } =
    useGlobalLoading();

  useEffect(() => {
    const calculateRadius = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const logoWidth = Math.min(
        w * 0.8,
        400,
      );
      const ratio = logoWidth / 3343;
      const logoHeight =
        logoWidth * (994 / 3343);

      const originXPhysical =
        w / 2 - logoWidth / 2 + 520 * ratio;
      const originYPhysical =
        h / 2 - logoHeight / 2 + 497 * ratio;

      const maxCornerDist = Math.max(
        Math.hypot(
          originXPhysical,
          originYPhysical,
        ),
        Math.hypot(
          w - originXPhysical,
          originYPhysical,
        ),
        Math.hypot(
          originXPhysical,
          h - originYPhysical,
        ),
        Math.hypot(
          w - originXPhysical,
          h - originYPhysical,
        ),
      );

      const requiredRadius =
        maxCornerDist / ratio + 10000;
      setTargetRadius(requiredRadius);
    };

    calculateRadius();
    window.addEventListener(
      "resize",
      calculateRadius,
    );
    return () =>
      window.removeEventListener(
        "resize",
        calculateRadius,
      );
  }, []);

  const isClosed =
    phase === "INITIAL" ||
    phase === "CLOSING" ||
    phase === "COVERED";

  // TUTUP DULU (IN): 0.55s close animation
  const inTransition = {
    duration: 0.55,
    ease: [
      0.65, 0, 0.35, 1,
    ] as import("framer-motion").Easing,
  };

  // BARU BUKA (OUT): 0.95s open animation
  const outTransition = {
    duration: 0.95,
    ease: [
      0.85, 0, 0.15, 1,
    ] as import("framer-motion").Easing,
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-opacity duration-300 pointer-events-none ${
        isGlobalReady
          ? "opacity-0"
          : "opacity-100"
      }`}
      style={{
        contain: "strict",
        willChange: "opacity, transform",
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
                initial={{ r: 0 }}
                animate={{
                  r: isClosed
                    ? 0
                    : targetRadius || 15000,
                }}
                transition={
                  isClosed
                    ? inTransition
                    : outTransition
                }
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
              transition: { delay: 0.1 },
            }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute bottom-12 left-1/2",
              "-translate-x-1/2 flex flex-col",
              "items-center gap-3 z-10",
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
