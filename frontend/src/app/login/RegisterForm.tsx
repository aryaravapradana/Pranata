"use client";
import Cookies from 'js-cookie';
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ShoppingCart, Beef, Bird, Tractor, Droplet, Circle, MoreHorizontal, ArrowRight, Check, X, Eye, EyeOff } from "lucide-react";

const LIVESTOCK_OPTIONS = [
  { id: "SAPI", label: "Sapi", icon: Beef },
  { id: "AYAM", label: "Ayam", icon: Bird },
  { id: "KAMBING", label: "Kambing", icon: Tractor },
  { id: "SUSU", label: "Susu", icon: Droplet },
  { id: "TELUR", label: "Telur", icon: Circle },
  { id: "BEBEK", label: "Bebek", icon: Bird },
  { id: "LAINNYA", label: "Lainnya", icon: MoreHorizontal },
];

export function RegisterForm({ onSuccess, onSwitchToLogin }: { onSuccess: () => void, onSwitchToLogin: () => void }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const [role, setRole] = useState<"PRODUCER" | "BUYER" | null>(null);
  const [livestock, setLivestock] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Debounced Username Checker
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }
    
    if (username.includes(" ")) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    const timeoutId = setTimeout(async () => {
      try {
        const API_BASE = getApiBaseUrl();
        const res = await fetchApi(`${API_BASE}/api/profile/check-username?username=${encodeURIComponent(username.trim().toLowerCase())}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch (err) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  // Step 1: Validate local inputs and move to next step
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError("Username hanya boleh huruf kecil, angka, dan underscore (_).");
      return;
    }
    if (usernameAvailable === false) {
      setError("Username sudah digunakan, silakan pilih username lain.");
      return;
    }
    if (usernameAvailable !== true) {
      setError("Mohon tunggu pengecekan username selesai.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    
    setError(null);
    setStep(2);
  };

  const isStep1Valid = 
    fullName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    /^[a-z0-9_]+$/.test(username.trim().toLowerCase()) &&
    usernameAvailable === true &&
    password.length >= 8;

  // Finalize Profile in Backend
  const finalizeRegistration = async (selectedRole: "PRODUCER" | "BUYER") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`${getApiBaseUrl()}/api/profile/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username: username.toLowerCase().trim(),
          password,
          role: selectedRole,
          livestockTypes: selectedRole === "PRODUCER" ? livestock : []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat akun");
      
      localStorage.setItem("farmpro_session", JSON.stringify(data));
      if (data.token) {
        Cookies.set("auth-token", data.token, { expires: 7, path: '/' });
      }
      if (data.role === "BUYER") {
        router.push("/market");
      } else {
        router.push("/hub");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyelesaikan pendaftaran");
      setLoading(false);
    }
  };

  const handleRoleSelection = (selected: "PRODUCER" | "BUYER") => {
    setRole(selected);
    if (selected === "BUYER") {
      finalizeRegistration(selected);
    } else {
      setStep(3);
    }
  };

  const handleLivestockSubmit = () => {
    if (role === "PRODUCER") {
      finalizeRegistration(role);
    }
  };

  const toggleLivestock = (id: string) => {
    setLivestock(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <>
        <div className="mb-6 mt-1">
          <h1 className="text-2xl font-black text-[#2B4C3B] mb-1 tracking-tight">
            {step === 1 ? "Daftar Akun Baru" : step === 2 ? "Pilih Peran Anda" : "Pilih Komoditas Anda"}
          </h1>
          <p className="text-[#5A635B] text-xs sm:text-sm font-medium">
            {step === 1 ? "Isi data diri & kredensial akun Pranata Anda." : step === 2 ? "Sesuaikan aplikasi sesuai kebutuhan Anda." : "Pilih komoditas ternak yang Anda hasilkan."}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-xs sm:text-sm font-bold text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStep1Submit} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs sm:text-sm font-extrabold mb-1.5 text-[#2B4C3B]">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full bg-[#F8F6F0] border border-[#DDE2D6] rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 focus:ring-[#3A6B49] focus:bg-white transition-all placeholder:text-[#9A9E96]" 
                  required 
                  placeholder="Contoh: Budi Santoso" 
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-extrabold mb-1.5 text-[#2B4C3B]">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.toLowerCase())} 
                    className={`w-full bg-[#F8F6F0] border ${
                      usernameAvailable === false || (username.trim() && !/^[a-z0-9_]+$/.test(username.trim()))
                        ? 'border-red-400 focus:ring-red-400' 
                        : usernameAvailable === true 
                        ? 'border-emerald-500 focus:ring-emerald-500' 
                        : 'border-[#DDE2D6] focus:ring-[#3A6B49]'
                    } rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 transition-all pr-12 placeholder:text-[#9A9E96]`} 
                    required 
                    placeholder="budi_farm" 
                  />
                  
                  {username.trim() && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {checkingUsername ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#DDE2D6] border-t-[#2B4C3B] animate-spin" />
                      ) : usernameAvailable && /^[a-z0-9_]+$/.test(username.trim()) ? (
                        <Check size={18} className="text-emerald-600" />
                      ) : usernameAvailable === false || !/^[a-z0-9_]+$/.test(username.trim()) ? (
                        <X size={18} className="text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Username live indicator / warnings */}
                {username.trim() && !checkingUsername && (
                  <div className="mt-1.5 ml-1 text-xs font-bold">
                    {!/^[a-z0-9_]+$/.test(username.trim()) ? (
                      <p className="text-red-500">Username hanya boleh huruf kecil, angka, dan underscore (_)</p>
                    ) : username.trim().length < 3 ? (
                      <p className="text-amber-600">Username minimal 3 karakter</p>
                    ) : usernameAvailable === false ? (
                      <p className="text-red-500">Username sudah terpakai, gunakan username lain</p>
                    ) : usernameAvailable === true ? (
                      <p className="text-emerald-600 flex items-center gap-1"><Check size={14} /> Username tersedia</p>
                    ) : null}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold mb-1.5 text-[#2B4C3B]">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={`w-full bg-[#F8F6F0] border ${
                      password.length > 0 && password.length < 8 
                        ? 'border-amber-400 focus:ring-amber-400' 
                        : password.length >= 8 
                        ? 'border-emerald-500 focus:ring-emerald-500' 
                        : 'border-[#DDE2D6] focus:ring-[#3A6B49]'
                    } rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 transition-all pr-12 placeholder:text-[#9A9E96]`} 
                    required 
                    minLength={8} 
                    placeholder="Minimal 8 karakter" 
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

                {/* Password live strength indicator */}
                {password.length > 0 && (
                  <div className="mt-1.5 ml-1 text-xs font-bold">
                    {password.length < 8 ? (
                      <p className="text-amber-600">Password minimal 8 karakter (kurang {8 - password.length} karakter lagi)</p>
                    ) : (
                      <p className="text-emerald-600 flex items-center gap-1"><Check size={14} /> Password memenuhi syarat (minimal 8 karakter)</p>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={loading || checkingUsername || !isStep1Valid} 
                className="w-full bg-[#2B4C3B] hover:bg-[#1E362A] active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm sm:text-base py-3.5 shadow-md shadow-[#2B4C3B]/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Lanjut Pilih Peran</span>
                <ArrowRight size={18} />
              </button>

              <div className="mt-5 text-center text-xs font-semibold text-[#5A635B]">
                Sudah memiliki akun?{" "}
                <button 
                  type="button" 
                  onClick={onSwitchToLogin} 
                  className="text-[#C25939] font-extrabold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-3.5"
            >
              <button 
                onClick={() => handleRoleSelection("PRODUCER")}
                disabled={loading}
                className="w-full flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border-2 border-[#DDE2D6] hover:border-[#2B4C3B] hover:bg-[#F8F6F0] active:scale-[0.99] transition-all text-left group cursor-pointer"
              >
                <div className="w-11 h-11 bg-[#2B4C3B] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"><Store size={22} /></div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C241E]">Peternak / Produsen</h3>
                  <p className="text-xs text-[#5A635B] font-medium">Mengelola peternakan & menjual hasil ternak langsung.</p>
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelection("BUYER")}
                disabled={loading}
                className="w-full flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border-2 border-[#DDE2D6] hover:border-[#C25939] hover:bg-[#F8F6F0] active:scale-[0.99] transition-all text-left group cursor-pointer"
              >
                <div className="w-11 h-11 bg-[#C25939] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"><ShoppingCart size={22} /></div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C241E]">Pembeli / Konsumen</h3>
                  <p className="text-xs text-[#5A635B] font-medium">Membeli produk ternak terverifikasi langsung dari peternak.</p>
                </div>
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-2.5">
                {LIVESTOCK_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = livestock.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleLivestock(item.id)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all gap-1.5 cursor-pointer ${
                        isSelected 
                          ? "border-[#2B4C3B] bg-[#2B4C3B] text-white shadow-md" 
                          : "border-[#DDE2D6] bg-[#F8F6F0] text-[#5A635B] hover:border-[#3A6B49]"
                      }`}
                    >
                      <Icon size={24} />
                      <span className="font-extrabold text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleLivestockSubmit}
                disabled={loading || livestock.length === 0}
                className="w-full bg-[#C25939] hover:bg-[#A34529] active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm sm:text-base py-3.5 shadow-md shadow-[#C25939]/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Menyelesaikan Pendaftaran..." : "Selesaikan Pendaftaran"} <Check size={18} />
              </button>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}
