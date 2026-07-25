"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bird, Heart, ArrowRight } from "lucide-react";
import { EditorialGallery } from "@/components/ui/editorial-gallery";
import { FeaturesRopeSection } from "@/components/ui/features-rope-section";
import { AnimatedDekorasi } from "@/components/ui/animated-dekorasi";
import { Footer } from "@/components/layout/Footer";
import "@fontsource/stack-sans-notch";



export default function LandingPage() {
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (sessionStr) {
      setSession(JSON.parse(sessionStr));
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans overflow-x-hidden relative">
      
      {/* Unified Responsive Hero Section */}
      <section className="relative w-full flex flex-col justify-between min-h-screen md:min-h-0 pt-6 sm:pt-4 md:pt-6 pb-0 bg-[#F8F6F0] overflow-hidden">
        {/* Soft Organic Background Gradients - Omitted heavy CSS blurs on mobile for 60 FPS performance */}
        <div className="hidden sm:block absolute top-0 right-0 w-100 sm:w-200 h-100 sm:h-200 bg-[#E8E3D2]/40 rounded-full blur-[80px] sm:blur-[120px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-75 sm:w-150 h-75 sm:h-150 bg-[#DDE2D6]/50 rounded-full blur-[60px] sm:blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />
        <div className="hidden sm:block absolute top-1/2 left-1/2 w-150 sm:w-250 h-150 sm:h-250 bg-[#F1EBE1]/30 rounded-full blur-[100px] sm:blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Text Content Container */}
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center mb-2 md:mb-4 px-5 sm:px-8 lg:px-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center w-full transform-gpu"
          >
            {/* Pranata Basic Black Logo (Top Center) */}
            <div className="mb-1 pt-4 sm:pt-2 md:pt-3 flex justify-center">
              <img 
                src="/logos/basic/logo black.webp" 
                alt="Pranata Logo" 
                className="h-6 sm:h-8 md:h-10 w-auto object-contain" 
                fetchPriority="high"
                decoding="async"
              />
            </div>

            <h1 className="text-[1.65rem] min-[380px]:text-[1.95rem] min-[440px]:text-[2.25rem] sm:text-[2.5rem] md:text-[2.85rem] lg:text-[3.65rem] font-extrabold text-[#1C241E] tracking-tight mt-6 min-[380px]:mt-8 sm:mt-2 md:mt-3 mb-2 md:mb-3 leading-[1.15] sm:leading-tight text-center px-1">
              <span className="block">Dari Peternak,</span>
              <span className="text-[#3A6B49] block">Langsung ke Konsumen</span>
            </h1>

            <p className="text-[11px] sm:text-xs md:text-sm text-[#5A635B] font-medium max-w-xl text-center leading-relaxed mt-1 mb-2 sm:mb-3 px-4">
              Pranata membantu peternak menjual hasil ternaknya langsung kepada konsumen dan pembeli bisnis tanpa perantara. Dapatkan harga yang lebih adil, perluas pasar, dan kembangkan usaha dengan insight bisnis serta AI Assistant.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 mt-3 sm:mt-2.5 w-full sm:w-auto">
              {session ? (
                <>
                  <Link href={session.role === 'PRODUCER' ? '/hub' : '/market'} className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] transition-all flex items-center justify-center gap-2 group transform-gpu cursor-pointer"
                    >
                      {(session?.avatarUrl || session?.avatar) ? (
                        <img src={session.avatarUrl || session.avatar} alt="PFP" className="w-5 h-5 rounded-full object-cover border-2 border-white/50" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/50 bg-[#3A6B49] flex items-center justify-center text-white text-[9px] font-bold">
                          {(session?.fullName || session?.name || session?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>Lanjut sebagai {session?.username || session?.name?.split(" ")[0] || session?.fullName?.split(" ")[0]}</span>
                      <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("farmpro_session");
                      import("js-cookie").then(Cookies => Cookies.default.remove("auth-token"));
                      window.location.href = "/login";
                    }}
                    className="w-full sm:w-auto bg-white/50 text-[#3F4841] border border-[#D5D0C5] backdrop-blur-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm hover:bg-white cursor-pointer"
                  >
                    Use Another Account
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login?mode=register" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] transition-all flex items-center justify-center gap-2 group transform-gpu cursor-pointer"
                    >
                      Create Account
                      <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-white/50 text-[#3F4841] border border-[#D5D0C5] backdrop-blur-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm transform-gpu cursor-pointer"
                    >
                      Log In
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Hero Illustration Section inside white/cream background section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative w-full flex items-center justify-center z-20 pointer-events-none -mt-10 sm:-mt-14 md:-mt-20 lg:-mt-24 transform-gpu"
        >
          <img 
            src="/images/hero_section.webp" 
            alt="Pranata Hero" 
            className="w-full h-auto pointer-events-none object-cover scale-[2.2] min-[380px]:scale-[2.0] min-[440px]:scale-[1.85] sm:scale-100 -translate-y-48 min-[380px]:-translate-y-56 min-[440px]:-translate-y-64 sm:translate-y-0 origin-top" 
            fetchPriority="high"
            decoding="async"
          />
          
          {/* Smooth Gradient Fade to Rope Section */}
          <div className="absolute bottom-0 left-0 w-full h-32 sm:h-48 md:h-64 bg-linear-to-b from-transparent to-forest pointer-events-none" />
        </motion.div>
      </section>

      {/* Rope Features Section */}
      <FeaturesRopeSection />

      {/* Seamless Editorial Testimonials Gallery */}
      <section className="relative z-10 w-full" style={{ padding: 0, margin: 0 }}>
        <EditorialGallery />
      </section>


      
      {/* Responsive Pranata Footer */}
      <Footer variant="dark" />
    </div>
  );
}

