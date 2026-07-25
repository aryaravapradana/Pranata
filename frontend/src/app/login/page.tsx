"use client";
import Cookies from 'js-cookie';
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bird, Eye, EyeOff, Loader2 } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

function AuthContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(searchParams.get('mode') === 'register' ? 'register' : 'login');

  useEffect(() => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.role === 'PRODUCER') {
        router.push('/hub');
      } else {
        router.push('/market');
      }
    }
  }, [router]);

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError(null);
    if (mode === 'register') {
      router.replace('/login?mode=register', { scroll: false });
    } else {
      router.replace('/login', { scroll: false });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchApi(`${getApiBaseUrl()}/api/profile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      // Store custom session
      localStorage.setItem("farmpro_session", JSON.stringify(data));
      Cookies.set("auth-token", data.token, { expires: 7, path: '/' });
      if (data.role === "BUYER") {
        router.push("/market");
      } else {
        router.push("/hub");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-5 text-[#1C241E] relative overflow-hidden">
      {/* Background Soft Organic Blurs */}
      <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-[#E8E3D2]/50 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-96 h-96 bg-[#DDE2D6]/60 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img 
              src="/logos/basic/logo black.webp" 
              alt="Pranata Logo" 
              className="h-10 sm:h-12 w-auto object-contain mb-2" 
              fetchPriority="high"
              decoding="async"
            />
          </Link>
          <p className="text-[#5A635B] text-xs sm:text-sm font-semibold">
            {authMode === 'login' ? 'Masuk ke Akun Peternakan & Pasar Anda' : 'Buat Akun Pranata Baru'}
          </p>
        </div>

        {/* Segmented Auth Switcher (Login / Register) */}
        <div className="bg-[#EAE6D8] p-1.5 rounded-full flex items-center justify-between mb-6 shadow-inner border border-[#DDD8C8]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`relative flex-1 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 ${
              authMode === 'login' ? 'text-[#1C241E]' : 'text-[#6C756D] hover:text-[#1C241E]'
            }`}
          >
            {authMode === 'login' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-white rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`relative flex-1 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 ${
              authMode === 'register' ? 'text-[#1C241E]' : 'text-[#6C756D] hover:text-[#1C241E]'
            }`}
          >
            {authMode === 'register' && (
              <motion.div
                layoutId="activeAuthPill"
                className="absolute inset-0 bg-white rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Daftar</span>
          </button>
        </div>

        {/* Card Body */}
        <AnimatePresence mode="wait">
          {authMode === 'login' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-xl border border-[#DDE2D6] p-7 sm:p-9 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(43,76,59,0.08)]"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-xs sm:text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold mb-1.5 text-[#2B4C3B]">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#DDE2D6] rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 focus:ring-[#3A6B49] focus:bg-white transition-all placeholder:text-[#9A9E96]"
                    required
                    placeholder="Contoh: budi_farm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-extrabold mb-1.5 text-[#2B4C3B]">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F8F6F0] border border-[#DDE2D6] rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 focus:ring-[#3A6B49] focus:bg-white transition-all pr-12 placeholder:text-[#9A9E96]"
                      required
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A8678] hover:text-[#2B4C3B] transition-colors p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#2B4C3B] hover:bg-[#1E362A] active:scale-[0.99] text-[#F8F6F0] rounded-2xl font-extrabold text-sm sm:text-base py-3.5 shadow-md shadow-[#2B4C3B]/20 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Memproses Masuk...</span>
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>

                <div className="mt-5 text-center text-xs font-semibold text-[#5A635B]">
                  Belum memiliki akun?{" "}
                  <button 
                    type="button" 
                    onClick={() => switchMode('register')} 
                    className="text-[#C25939] font-extrabold hover:underline cursor-pointer"
                  >
                    Daftar Akun Baru
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-xl border border-[#DDE2D6] p-6 sm:p-9 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(43,76,59,0.08)]"
            >
              <RegisterForm onSuccess={() => {}} onSwitchToLogin={() => switchMode('login')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#2B4C3B] border-t-transparent rounded-full animate-spin"></div></div>}>
      <AuthContent />
    </Suspense>
  );
}
