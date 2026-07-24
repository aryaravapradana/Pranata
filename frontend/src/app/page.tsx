"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bird, Heart, ArrowRight } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import { EditorialGallery } from "@/components/ui/editorial-gallery";
import { FeaturesRopeSection } from "@/components/ui/features-rope-section";
import { AnimatedDekorasi } from "@/components/ui/animated-dekorasi";
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
            <div className="mb-2 sm:mb-2 pt-6 sm:pt-4 md:pt-5 flex justify-center">
              <img 
                src="/logos/basic/logo black.webp" 
                alt="Pranata Logo" 
                className="h-7 sm:h-9 md:h-11 w-auto object-contain" 
                fetchPriority="high"
                decoding="async"
              />
            </div>

            <h1 className="text-[1.85rem] min-[380px]:text-[2.15rem] min-[440px]:text-[2.5rem] sm:text-[2.85rem] md:text-5xl lg:text-[4.35rem] font-bold text-[#1C241E] tracking-tight mt-12 min-[380px]:mt-14 sm:mt-4 md:mt-6 mb-3 md:mb-4 leading-[1.15] sm:leading-tight flex flex-col items-center justify-center text-center px-1">
              <span className="block max-w-[230px] min-[380px]:max-w-[270px] sm:max-w-none sm:whitespace-nowrap">Empowering farmers with</span>
              <FlipWords 
                duration={3500}
                words={["beautiful precision.", "actionable insights.", "smart analytics."]} 
                className="text-[#3A6B49] bg-clip-text font-black tracking-tight text-center whitespace-nowrap inline-block" 
              />
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mt-8 sm:mt-4 w-full sm:w-auto">
              {session ? (
                <>
                  <Link href={session.role === 'PRODUCER' ? '/hub' : '/market'} className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] px-6 sm:px-7.5 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-sm sm:text-base shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] transition-all flex items-center justify-center gap-2.5 group transform-gpu"
                    >
                      {session.avatar ? (
                        <img src={session.avatar} alt="PFP" className="w-5 h-5 rounded-full object-cover border-2 border-white/50" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/50 bg-[#3A6B49] flex items-center justify-center text-white text-[10px] font-bold">
                          {(session.fullName || session.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      Lanjut sebagai {session.username}
                      <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("farmpro_session");
                      import("js-cookie").then(Cookies => Cookies.default.remove("auth-token"));
                      window.location.href = "/login";
                    }}
                    className="w-full sm:w-auto bg-white/50 text-[#3F4841] border border-[#D5D0C5] backdrop-blur-sm px-6 sm:px-7.5 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-sm hover:bg-white"
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
                      className="w-full sm:w-auto bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] px-6 sm:px-7.5 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-sm sm:text-base shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] transition-all flex items-center justify-center gap-2.5 group transform-gpu"
                    >
                      Create Account
                      <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-white/50 text-[#3F4841] border border-[#D5D0C5] backdrop-blur-sm px-6 sm:px-7.5 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-sm transform-gpu"
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
          className="relative w-full flex items-center justify-center z-20 pointer-events-none -mt-6 sm:-mt-8 md:-mt-12 transform-gpu"
        >
          <img 
            src="/images/hero_section.webp" 
            alt="Pranata Hero" 
            className="w-full h-auto pointer-events-none object-cover scale-[2.8] min-[380px]:scale-[2.6] min-[440px]:scale-[2.4] sm:scale-100 -translate-y-72 min-[380px]:-translate-y-80 min-[440px]:-translate-y-96 sm:translate-y-0 origin-top" 
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

      {/* Global Network Section */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative bg-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-rust rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden transform-gpu"
          >
            <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-vibrant/40 rounded-full blur-3xl" />
            <div className="hidden sm:block absolute bottom-0 left-0 w-96 h-96 bg-sage/40 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 sm:mb-6">
                Ready to transform your farm?
              </h2>
              <p className="text-slate-400 font-medium text-sm sm:text-base lg:text-lg max-w-xl mx-auto mb-8 sm:mb-10 px-0">
                Join our non-profit initiative to digitalize local agriculture. Setup takes less than 5 minutes and is completely free forever.
              </p>
              <Link href="/hub">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-vibrant text-white px-10 py-4 rounded-full font-extrabold text-lg shadow-xl transform-gpu"
                >
                  Create Organization
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-sage border-t border-olive/30 py-8 sm:py-12 px-4 text-center text-forest font-bold">
        <p>© 2026 Pranata Org. A non-profit initiative.</p>
      </footer>
    </div>
  );
}

