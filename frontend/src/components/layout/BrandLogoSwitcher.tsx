"use client";
import { cn } from "@/lib/utils";

import React, {
  useState,
  useRef,
  useEffect,
} from "react";
import Link from "next/link";
import {
  ChevronDown,
  Check,
  Lock,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useGlobalLoading } from "@/components/shared/loading-context";
import { SellerOnboardingModal } from "@/components/modals/SellerOnboardingModal";
import { SellerWarningModal } from "@/components/modals/SellerWarningModal";

export default function BrandLogoSwitcher({
  currentApp,
  isProducer,
}: {
  currentApp:
    | "basic"
    | "market"
    | "hub"
    | "intelligence";
  isProducer?: boolean;
}) {
  const [isOpen, setIsOpen] =
    useState(false);
  const [
    showWarningModal,
    setShowWarningModal,
  ] = useState(false);
  const [
    showOnboardingModal,
    setShowOnboardingModal,
  ] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { navigateTo } = useGlobalLoading();

  const LOGO_PATHS = [
    "/logos/basic/logo black.webp?v=2",
    "/logos/market/market-black.webp?v=2",
    "/logos/hub/hub-black.webp?v=2",
    "/logos/intelligence/intelligence-black.webp?v=2",
  ];

  useEffect(() => {
    // Preload logo images into browser memory cache for instant dropdown opening
    LOGO_PATHS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const handleClickOutside = (
      e: MouseEvent,
    ) => {
      if (
        ref.current &&
        !ref.current.contains(
          e.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const renderCurrentLogo = () => {
    const v = "?v=2";
    switch (currentApp) {
      case "hub":
        return (
          <img
            src={"/logos/hub/hub-black.webp" + v}
            alt="Pranata Hub"
            className="h-[26px] w-auto object-contain object-left"
            loading="eager"
            decoding="sync"
          />
        );
      case "intelligence":
        return (
          <img
            src={
              "/logos/intelligence/intelligence-black.webp" +
              v
            }
            alt="Pranata Intelligence"
            className="h-[32px] w-auto object-contain object-left"
            loading="eager"
            decoding="sync"
          />
        );
      case "basic":
        return (
          <img
            src={
              "/logos/basic/logo black.webp" +
              v
            }
            alt="Pranata Basic"
            className="h-[32px] w-auto object-contain object-left"
            loading="eager"
            decoding="sync"
          />
        );
      case "market":
      default:
        return (
          <img
            src={
              "/logos/market/market-black.webp" +
              v
            }
            alt="Pranata Market"
            className="h-[26px] w-auto object-contain object-left"
            loading="eager"
            decoding="sync"
          />
        );
    }
  };

  const handleHubClick = () => {
    setIsOpen(false);
    if (isProducer) {
      navigateTo("/hub");
    } else {
      setShowWarningModal(true);
    }
  };

  const handleIntelligenceClick = () => {
    setIsOpen(false);
    if (isProducer) {
      navigateTo("/hub/intelligence");
    } else {
      setShowWarningModal(true);
    }
  };

  return (
    <>
      <div
        className="relative"
        ref={ref}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Pilih Modul Pranata"
          className={cn(
            "flex items-center gap-2.5",
            "px-3 py-1.5 rounded-2xl border",
            "bg-white/95 border-[#DDE2D6]",
            "hover:border-[#2B4C3B]/40 hover:bg-white hover:shadow-md",
            "active:scale-98 transition-all cursor-pointer group",
            "focus:outline-none shadow-2xs",
            isOpen && "border-[#2B4C3B] ring-2 ring-[#2B4C3B]/15 bg-white shadow-md",
          )}
        >
          <div className="h-7 sm:h-8 flex items-center justify-start">
            {renderCurrentLogo()}
          </div>
          <div
            className={cn(
              "flex items-center justify-center",
              "w-6 h-6 rounded-full bg-[#EEF2E6]",
              "text-[#2B4C3B] border border-[#2B4C3B]/25",
              "group-hover:bg-[#2B4C3B] group-hover:text-white group-hover:border-[#2B4C3B]",
              "group-hover:scale-105 transition-all shadow-2xs",
              "shrink-0 ml-0.5",
            )}
          >
            <ChevronDown
              size={14}
              strokeWidth={2.5}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: 6,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 6,
                scale: 0.95,
              }}
              transition={{
                duration: 0.16,
                ease: "easeOut",
              }}
              className={cn(
                "absolute left-0 mt-2",
                "w-64 bg-white border",
                "border-[#E8E3D2] rounded-2xl shadow-xl",
                "z-50 overflow-hidden py-1.5",
                "space-y-0.5",
              )}
            >
              {/* Option 1: Pranata Basic */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigateTo("/");
                }}
                className={`w-full px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  currentApp === "basic"
                    ? "bg-[#F8F6F0]"
                    : "hover:bg-[#F8F6F0]"
                }`}
              >
                <div className="h-8 flex items-center justify-start shrink-0">
                  <img
                    src="/logos/basic/logo black.webp?v=2"
                    alt="Pranata Basic"
                    className="h-[32px] w-auto object-contain object-left"
                    loading="eager"
                    decoding="sync"
                  />
                </div>
                {currentApp === "basic" && (
                  <Check
                    size={16}
                    className="text-[#2B4C3B] shrink-0 ml-2"
                  />
                )}
              </button>

              {/* Option 2: Market */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigateTo("/market");
                }}
                className={`w-full px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  currentApp === "market"
                    ? "bg-[#F8F6F0]"
                    : "hover:bg-[#F8F6F0]"
                }`}
              >
                <div className="h-8 flex items-center justify-start shrink-0">
                  <img
                    src="/logos/market/market-black.webp?v=2"
                    alt="Pranata Market"
                    className="h-[26px] w-auto object-contain object-left"
                    loading="eager"
                    decoding="sync"
                  />
                </div>
                {currentApp === "market" && (
                  <Check
                    size={16}
                    className="text-[#2B4C3B] shrink-0 ml-2"
                  />
                )}
              </button>

              {/* Option 3: Hub */}
              <button
                onClick={handleHubClick}
                title={
                  !isProducer
                    ? "Kamu belum mendaftar sebagai penjual"
                    : undefined
                }
                className={`w-full px-3.5 py-2 flex items-center justify-between transition-all cursor-pointer ${
                  currentApp === "hub"
                    ? "bg-[#EEF2E6]"
                    : "hover:bg-[#F8F6F0]"
                } ${!isProducer ? "opacity-60" : ""}`}
              >
                <div className="h-8 flex items-center justify-start shrink-0">
                  <img
                    src="/logos/hub/hub-black.webp?v=2"
                    alt="Pranata Hub"
                    className={`h-[26px] w-auto object-contain object-left ${!isProducer ? "grayscale" : ""}`}
                    loading="eager"
                    decoding="sync"
                  />
                </div>

                {isProducer ? (
                  currentApp === "hub" && (
                    <Check
                      size={16}
                      className="text-[#2B4C3B] shrink-0 ml-2"
                    />
                  )
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      "bg-amber-100 text-amber-800 text-[10px]",
                      "font-extrabold px-1.5 py-0.5",
                      "rounded-md border border-amber-200",
                      "shrink-0 ml-2 shadow-2xs",
                    )}
                  >
                    <Lock
                      size={11}
                      className="text-amber-700"
                    />
                    <span>Locked</span>
                  </div>
                )}
              </button>

              {/* Option 4: Intelligence */}
              <button
                onClick={
                  handleIntelligenceClick
                }
                title={
                  !isProducer
                    ? "Kamu belum mendaftar sebagai penjual"
                    : undefined
                }
                className={`w-full px-3.5 py-2 flex items-center justify-between transition-all cursor-pointer ${
                  currentApp ===
                  "intelligence"
                    ? "bg-[#EEF2E6]"
                    : "hover:bg-[#F8F6F0]"
                } ${!isProducer ? "opacity-60" : ""}`}
              >
                <div className="h-8 flex items-center justify-start shrink-0">
                  <img
                    src="/logos/intelligence/intelligence-black.webp?v=2"
                    alt="Pranata Intelligence"
                    className={`h-[32px] w-auto object-contain object-left ${!isProducer ? "grayscale" : ""}`}
                    loading="eager"
                    decoding="sync"
                  />
                </div>

                {isProducer ? (
                  currentApp ===
                    "intelligence" && (
                    <Check
                      size={16}
                      className="text-[#2B4C3B] shrink-0 ml-2"
                    />
                  )
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      "bg-amber-100 text-amber-800 text-[10px]",
                      "font-extrabold px-1.5 py-0.5",
                      "rounded-md border border-amber-200",
                      "shrink-0 ml-2 shadow-2xs",
                    )}
                  >
                    <Lock
                      size={11}
                      className="text-amber-700"
                    />
                    <span>Locked</span>
                  </div>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SellerWarningModal
        isOpen={showWarningModal}
        onClose={() =>
          setShowWarningModal(false)
        }
        onConfirmUpgrade={() =>
          setShowOnboardingModal(true)
        }
      />

      <SellerOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() =>
          setShowOnboardingModal(false)
        }
      />

      {/* Hidden preloader so browser keeps switcher images decoded in memory across page navigations */}
      <div className="hidden" aria-hidden="true">
        {LOGO_PATHS.map((src) => (
          <img key={src} src={src} alt="" loading="eager" decoding="sync" />
        ))}
      </div>
    </>
  );
}
