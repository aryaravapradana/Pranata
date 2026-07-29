"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalLoading } from "@/components/shared/loading-context";
import { SellerOnboardingModal } from "@/components/modals/SellerOnboardingModal";

export default function BrandLogoSwitcher({ 
  currentApp, 
  isProducer 
}: { 
  currentApp: 'basic' | 'market' | 'hub' | 'intelligence'; 
  isProducer?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { navigateTo } = useGlobalLoading();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLogoSrc = () => {
    switch (currentApp) {
      case 'hub':
        return "/logos/hub/hub-black.webp";
      case 'intelligence':
        return "/logos/intelligence/intelligence-black.webp";
      case 'basic':
        return "/logos/basic/logo black.webp";
      case 'market':
      default:
        return "/logos/market/market-black.webp";
    }
  };

  const handleHubClick = () => {
    setIsOpen(false);
    if (isProducer) {
      navigateTo("/hub");
    } else {
      setShowOnboardingModal(true);
    }
  };

  const handleIntelligenceClick = () => {
    setIsOpen(false);
    if (isProducer) {
      navigateTo("/hub/intelligence");
    } else {
      setShowOnboardingModal(true);
    }
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 -ml-1.5 rounded-2xl border border-transparent hover:border-[#E8E3D2] hover:bg-[#F8F6F0] transition-all cursor-pointer group focus:outline-none shadow-xs"
        >
          <div className="h-6.5 min-[380px]:h-7.5 sm:h-8">
            <img src={getLogoSrc()} alt="Pranata Logo" className="h-full object-contain" decoding="async" />
          </div>
          <div className="flex items-center justify-center w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-[#EEF2E6] text-[#2B4C3B] border border-[#2B4C3B]/25 group-hover:bg-[#2B4C3B] group-hover:text-white group-hover:border-[#2B4C3B] group-hover:scale-105 transition-all shadow-xs shrink-0">
            <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 mt-2 w-56 bg-white border border-[#E8E3D2] rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
            >
              {/* Option 1: Pranata Basic */}
              <button
                onClick={() => { setIsOpen(false); navigateTo("/"); }}
                className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                  currentApp === 'basic' ? 'bg-[#F8F6F0]' : 'hover:bg-[#F8F6F0]'
                }`}
              >
                <div className="h-6 flex items-center">
                  <img src="/logos/basic/logo black.webp" alt="Pranata Basic" className="h-full object-contain" decoding="async" />
                </div>
                {currentApp === 'basic' && <Check size={16} className="text-[#2B4C3B] shrink-0 ml-2" />}
              </button>

              {/* Option 2: Market */}
              <button
                onClick={() => { setIsOpen(false); navigateTo("/market"); }}
                className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                  currentApp === 'market' ? 'bg-[#F8F6F0]' : 'hover:bg-[#F8F6F0]'
                }`}
              >
                <div className="h-6 flex items-center">
                  <img src="/logos/market/market-black.webp" alt="Pranata Market" className="h-full object-contain" decoding="async" />
                </div>
                {currentApp === 'market' && <Check size={16} className="text-[#2B4C3B] shrink-0 ml-2" />}
              </button>

              {/* Option 3: Hub */}
              <button
                onClick={handleHubClick}
                title={!isProducer ? "Kamu belum mendaftar sebagai penjual" : undefined}
                className={`w-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${
                  currentApp === 'hub' ? 'bg-[#EEF2E6]' : 'hover:bg-[#F8F6F0]'
                } ${!isProducer ? 'opacity-60' : ''}`}
              >
                <div className="h-6 flex items-center gap-2">
                  <img 
                    src="/logos/hub/hub-black.webp" 
                    alt="Pranata Hub" 
                    className={`h-full object-contain ${!isProducer ? 'grayscale' : ''}`} 
                    decoding="async" 
                  />
                </div>

                {isProducer ? (
                  currentApp === 'hub' && <Check size={16} className="text-[#2B4C3B] shrink-0 ml-2" />
                ) : (
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0 ml-2 shadow-2xs">
                    <Lock size={11} className="text-amber-700" />
                    <span>Locked</span>
                  </div>
                )}
              </button>

              {/* Option 4: Intelligence */}
              <button
                onClick={handleIntelligenceClick}
                title={!isProducer ? "Kamu belum mendaftar sebagai penjual" : undefined}
                className={`w-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${
                  currentApp === 'intelligence' ? 'bg-[#EEF2E6]' : 'hover:bg-[#F8F6F0]'
                } ${!isProducer ? 'opacity-60' : ''}`}
              >
                <div className="h-6 flex items-center gap-2">
                  <img 
                    src="/logos/intelligence/intelligence-black.webp" 
                    alt="Pranata Intelligence" 
                    className={`h-full object-contain ${!isProducer ? 'grayscale' : ''}`} 
                    decoding="async" 
                  />
                </div>

                {isProducer ? (
                  currentApp === 'intelligence' && <Check size={16} className="text-[#2B4C3B] shrink-0 ml-2" />
                ) : (
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0 ml-2 shadow-2xs">
                    <Lock size={11} className="text-amber-700" />
                    <span>Locked</span>
                  </div>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SellerOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
    </>
  );
}
