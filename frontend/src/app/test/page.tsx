"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { 
  Search, 
  ShoppingCart, 
  Zap, 
  ChevronRight, 
  Plus, 
  Minus, 
  Check, 
  Package, 
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = getApiBaseUrl();

const CATEGORIES = [
  { name: "Semua", icon: "🌾", image: null },
  { name: "Daging", icon: "🥩", image: "/icons/daging.webp" },
  { name: "Susu", icon: "🥛", image: "/icons/susu.webp" },
  { name: "Telur", icon: "🥚", image: "/icons/telor.webp" },
  { name: "Sayuran", icon: "🥬", image: "/mocks/mock_sayuran_1784287377280.webp" },
  { name: "Buah", icon: "🍎", image: "/mocks/mock_buah_1784287387762.webp" },
];

const GRADES = ["Semua Grade", "Premium", "Grade A", "Grade B", "Grade C"];

const getCategoryFallbackImage = (category: string) => {
  const c = (category || "").toLowerCase();
  if (c.includes("sayur")) return "/mocks/mock_sayuran_1784287377280.webp";
  if (c.includes("buah")) return "/mocks/mock_buah_1784287387762.webp";
  if (c.includes("daging")) return "/mocks/mock_daging_1784287407027.webp";
  if (c.includes("susu")) return "/mocks/mock_susu_1784287426207.webp";
  if (c.includes("telur")) return "/mocks/mock_telur_1784287417129.webp";
  if (c.includes("pupuk")) return "/mocks/mock_pupuk_1784287436416.webp";
  if (c.includes("alat")) return "/mocks/mock_alat_1784287447181.webp";
  return "/mocks/mock_ternak_1784287398084.webp";
};

export default function MobileTestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Cart State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedGrade, setSelectedGrade] = useState("Semua Grade");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const sessionStr = localStorage.getItem("farmpro_session");
    let sessionObj = null;
    if (sessionStr) {
      try {
        sessionObj = JSON.parse(sessionStr);
        setProfile(sessionObj);
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const [prodRes, cartRes] = await Promise.all([
        fetchApi(`${API_BASE}/api/products?limit=100`).catch(() => null),
        sessionObj ? fetchApi(`${API_BASE}/api/cart/${sessionObj.id}`).catch(() => null) : null
      ]);

      if (prodRes && prodRes.ok) {
        const data = await prodRes.json();
        const arr = Array.isArray(data) ? data : (data.data ?? []);
        setProducts(arr);
      }

      if (cartRes && cartRes.ok) {
        const cartData = await cartRes.json();
        if (Array.isArray(cartData)) setCartItems(cartData);
      }
    } catch (e) {
      console.error("Failed loading backend data:", e);
    }
    setLoading(false);
  };

  // Cart quantity Handler connected to Backend API
  const handleUpdateQuantity = async (p: any, delta: number) => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(sessionStr);

    const existing = cartItems.find(item => item.productId === p.id);
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + delta;

    if (newQty > p.stock) return;

    // Optimistic Update
    let newCart = [...cartItems];
    if (newQty <= 0) {
      newCart = newCart.filter(item => item.productId !== p.id);
    } else {
      if (existing) {
        existing.quantity = newQty;
      } else {
        newCart.push({ productId: p.id, quantity: newQty, product: p });
      }
    }
    setCartItems(newCart);

    if (delta > 0) {
      setToastMessage(`${p.title} ditambahkan ke keranjang`);
      setTimeout(() => setToastMessage(null), 2500);
    }

    try {
      if (newQty <= 0) {
        await fetchApi(`${API_BASE}/api/cart/${session.id}/${p.id}`, { method: 'DELETE' });
      } else {
        await fetchApi(`${API_BASE}/api/cart/${session.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: p.id, quantity: newQty })
        });
      }
    } catch (e) {
      console.error("Cart update error:", e);
    }
  };

  // Filter products (Grade filter ONLY applies when selectedCategory === "Daging")
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchGrade = true;
      if (selectedCategory === "Daging" && selectedGrade !== "Semua Grade") {
        matchGrade = p.grade && p.grade.toLowerCase().includes(selectedGrade.toLowerCase());
      }
      
      return matchCat && matchSearch && matchGrade;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, searchQuery, selectedCategory, selectedGrade]);

  const cartTotalQty = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  }, [cartItems]);

  const cartTotalPrice = useMemo(() => {
    return cartItems.reduce((acc, curr) => {
      const price = curr.product?.price || 0;
      return acc + (price * (curr.quantity || 1));
    }, 0);
  }, [cartItems]);

  return (
    <main className="min-h-screen bg-[#F8F6F0] text-[#1C241E] flex flex-col items-center justify-start pb-32 font-sans selection:bg-[#B4C179] selection:text-[#1C241E] overflow-x-hidden">
      {/* Container restricted to mobile viewport max-width */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative px-4 pt-0 space-y-4">
        
        {/* HERO SECTION - Full Edge Top Header */}
        <section className="-mx-4 -mt-0 relative w-[calc(100%+2rem)] rounded-b-[2.75rem] bg-pranata text-white overflow-hidden shadow-2xl border-b border-[#32452C]/30 flex flex-col justify-between p-5 pt-3">
          
          {/* Ambient Glow Background Effect */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-[70px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#B4C179]/15 rounded-full blur-[60px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

          {/* Top Mobile Status Bar (Without 5G text and battery icon) */}
          <div className="relative z-20 flex items-center justify-between pb-2 text-xs font-semibold text-white/90 select-none mb-3">
            <span>9:41</span>
          </div>

          {/* Top Bar: White Logo & Cart + Profile */}
          <div className="relative z-10 flex items-center justify-between mb-4 px-1">
            <Link href="/market" className="flex items-center gap-2 group">
              <img 
                src="/logos/market/market-white.webp" 
                alt="Pranata Market" 
                className="h-7 sm:h-8 object-contain transition-transform group-hover:scale-105" 
              />
            </Link>

            <div className="flex items-center space-x-2.5">
              {/* Cart Button */}
              <Link 
                href="/market/cart" 
                className="relative w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartTotalQty > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C25939] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm border border-white/40">
                    {cartTotalQty}
                  </span>
                )}
              </Link>

              {/* Profile Avatar */}
              <Link 
                href="/profile"
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 p-0.5 overflow-hidden hover:scale-105 active:scale-95 transition-transform shadow-sm flex items-center justify-center"
              >
                {profile?.avatarUrl || profile?.avatar ? (
                  <img 
                    src={profile.avatarUrl || profile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#32452C] flex items-center justify-center text-[#B4C179] font-black text-xs">
                    {(profile?.fullName || profile?.username || 'P').charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* Main Copywriting & PNG Image Slot */}
          <div className="relative z-10 grid grid-cols-12 items-end pt-1 pb-3 px-1">
            <div className="col-span-7 space-y-2 z-10 pr-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-[1.15] tracking-tight">
                Hasil Ternak Segar, <br />
                <span className="text-[#B4C179]">Langsung dari Peternak.</span>
              </h1>
              
              <p className="text-[#A4C4A8] text-xs leading-relaxed font-medium line-clamp-3">
                Nikmati daging, susu, telur, dan produk peternakan berkualitas yang dikirim langsung dari peternak lokal Indonesia.
              </p>
            </div>

            <div className="col-span-5 relative -mr-3 -mb-4 flex justify-end items-end h-full">
              <div className="relative w-36 h-44 flex items-end justify-center">
                <div className="absolute inset-0 bg-[#B4C179]/30 rounded-full blur-xl transform translate-y-3 pointer-events-none"></div>
                <img 
                  src="/mocks/mock_sayuran_1784287377280.webp" 
                  alt="Hasil Ternak Segar"
                  className="w-full h-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform duration-300 pointer-events-none mix-blend-normal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE SEARCH BAR */}
        <section className="relative z-20 pt-1">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari sayuran, daging, susu, telur..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-[#1C241E] font-bold text-xs rounded-full py-3.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2B4C3B] border border-[#E8E3D2] shadow-sm transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A635B]" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </section>

        {/* CATEGORY SELECTOR CAROUSEL */}
        <section className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C241E]/70">Kategori Produk</h3>
            <span className="text-[11px] font-bold text-[#2B4C3B]">{selectedCategory}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    if (cat.name !== "Daging") setSelectedGrade("Semua Grade");
                  }}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-1.5 transition-all border ${
                    active 
                      ? "bg-[#1C241E] text-white border-[#32452C] shadow-md scale-105" 
                      : "bg-white text-[#1C241E] border-[#E8E3D2] hover:bg-[#F2EFE9]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* GRADE FILTER CHIPS - ONLY DISPLAYED WHEN CATEGORY IS "Daging" */}
        <AnimatePresence>
          {selectedCategory === "Daging" && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#1C241E]/60">Pilih Grade Daging:</span>
              </div>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${
                      selectedGrade === g 
                        ? "bg-[#32452C] text-white border-[#32452C] shadow-sm" 
                        : "bg-white text-[#1C241E]/70 border-[#E8E3D2] hover:bg-[#F2EFE9]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* REKOMENDASI TERPOPULER / FEATURED SLIDER */}
        <section className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#1C241E] tracking-tight">
              Rekomendasi Terpopuler
            </h2>
            <Link href="/market" className="text-xs font-bold text-[#2B4C3B] hover:underline flex items-center">
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 h-40 skeleton-shimmer border border-[#E8E3D2]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E8E3D2] rounded-2xl p-6 text-center text-xs text-gray-500 space-y-2">
              <Package className="w-8 h-8 mx-auto text-gray-300" />
              <p className="font-bold">Tidak ada produk ditemukan</p>
              <p className="text-[10px]">Coba cari dengan kata kunci lain atau ubah filter kategori.</p>
            </div>
          ) : (
            /* 2-Column Real Products Grid */
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.slice(0, 6).map((p, index) => {
                const cartEntry = cartItems.find(item => item.productId === p.id);
                const cartQty = cartEntry ? cartEntry.quantity : 0;
                const fallbackImg = getCategoryFallbackImage(p.category);
                const imgUrl = (p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls[0] : fallbackImg;

                return (
                  <motion.div
                    key={p.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => router.push(`/market/product/${p.id}`)}
                    className={`bg-white rounded-2xl p-3 flex flex-col justify-between min-h-[175px] relative overflow-hidden shadow-sm border border-[#E8E3D2] cursor-pointer hover:shadow-md transition-all group ${
                      cartQty > 0 ? "ring-2 ring-[#2B4C3B]" : ""
                    }`}
                  >
                    {/* Image Header */}
                    <div className="w-full h-24 rounded-xl bg-[#F8F6F0] overflow-hidden relative mb-2 flex items-center justify-center">
                      <img 
                        src={imgUrl} 
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {p.grade && (
                        <span className="absolute top-1.5 left-1.5 bg-[#1C241E]/80 backdrop-blur-md text-[#B4C179] text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          {p.grade}
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-[#1C241E] line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{p.category || "Produk"}</p>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-[#C25939]">
                          Rp {p.price?.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">
                          {p.stock} {p.unit}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector / Add to Cart Button */}
                    <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                      {cartQty > 0 ? (
                        <div className="w-full bg-[#32452C] text-white py-1.5 px-2 rounded-xl flex items-center justify-between shadow-sm">
                          <button 
                            onClick={() => handleUpdateQuantity(p, -1)}
                            className="p-0.5 hover:bg-white/20 rounded-md"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="text-xs font-extrabold">{cartQty}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(p, 1)}
                            className="p-0.5 hover:bg-white/20 rounded-md"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUpdateQuantity(p, 1)}
                          className="w-full bg-[#F8F6F0] hover:bg-[#2B4C3B] hover:text-white text-[#2B4C3B] py-1.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-colors border border-[#E8E3D2]"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          <span>Beli</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* TOAST NOTIFICATION ON ADD TO CART */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#32452C] text-white p-3.5 rounded-2xl shadow-2xl border border-[#B4C179]/30 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#B4C179] text-[#1C241E] flex items-center justify-center font-bold shrink-0">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold line-clamp-1">{toastMessage}</p>
                  <p className="text-[10px] text-white/80">Keranjang diperbarui</p>
                </div>
              </div>
              <Link href="/market/cart" className="text-xs font-bold text-[#B4C179] underline px-2 shrink-0">
                Lihat
              </Link>
            </motion.div>
          )}
        </AnimatePresence>



      </div>
    </main>
  );
}
