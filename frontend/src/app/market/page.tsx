"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { Footer } from "@/components/layout/Footer";

import { useState, useEffect, memo, useRef, useMemo, useCallback } from "react";
import { 
  Search, 
  ChevronRight, 
  Package, 
  ArrowRight, 
  Minus, 
  Plus, 
  Store, 
  Star, 
  CheckCircle, 
  Info, 
  Crown, 
  SlidersHorizontal, 
  X, 
  ChevronLeft, 
  TrendingDown, 
  TrendingUp, 
  ShoppingCart,
  Sparkles,
  Award,
  ShieldCheck,
  Tag,
  Layers,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading, useGlobalLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import { NavbarSkeleton, MarketHeroSkeleton, CategoryCardsSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Semua", icon: "🌾", image: null },
  { name: "Daging", icon: "🥩", image: "/icons/daging.webp" },
  { name: "Susu", icon: "🥛", image: "/icons/susu.webp" },
  { name: "Telur", icon: "🥚", image: "/icons/telor.webp" },
];
const API_BASE = getApiBaseUrl();

const getCategoryFallbackImage = (category: string) => {
  const c = (category || "").toLowerCase();
  if (c.includes("daging")) return "/icons/daging.webp";
  if (c.includes("susu")) return "/icons/susu.webp";
  if (c.includes("telur")) return "/icons/telor.webp";
  if (c.includes("sapi") || c.includes("ternak")) return "/icons/sapi.webp";
  if (c.includes("pupuk")) return "/mocks/mock_pupuk_1784287436416.webp";
  if (c.includes("alat")) return "/mocks/mock_alat_1784287447181.webp";
  return "/icons/sapi.webp";
};

// ─── Product Card Component ───────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ p, index, onClick, cartQty, onUpdateQuantity }: { p: any; index: number; onClick: () => void; cartQty: number; onUpdateQuantity: (e: React.MouseEvent, delta: number) => void }) {
  const fallbackImg = getCategoryFallbackImage(p.category);
  const imgUrl = (p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls[0] : fallbackImg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "300px" }}
      transition={{ duration: 0.3 }}
      onClick={p.stock > 0 ? onClick : undefined}
      className={`rounded-[2rem] flex flex-col p-3.5 sm:p-4 shadow-[0_12px_24px_-12px_rgba(43,76,59,0.08)] group relative transition-all duration-300 overflow-hidden z-0 transform-gpu [content-visibility:auto] [contain-intrinsic-size:1px_280px] sm:[content-visibility:visible] ${
        cartQty > 0 ? "border-transparent shadow-[0_12px_24px_-8px_rgba(43,76,59,0.3)] ring-2 ring-[#2B4C3B]" : "bg-white border border-[#E8E3D2]"
      } ${
        p.stock > 0 ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : "cursor-not-allowed opacity-60 grayscale-[0.8]"
      }`}
    >
      <div 
        className={`absolute inset-0 bg-pranata -z-10 transition-opacity duration-300 ${cartQty > 0 ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      {/* Product Image Container */}
      <div className="w-full h-34 sm:h-36 flex items-center justify-center mb-3 bg-[#F8F6F0] rounded-2xl sm:rounded-3xl group-hover:scale-[0.98] transition-transform overflow-hidden relative shrink-0">
        <img
          src={imgUrl}
          alt={p.title}
          decoding="async"
          className="w-full h-full object-cover"
          loading="lazy" 
        />
        
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
            <span className="bg-[#C25939] text-white font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm shadow-lg rotate-[-10deg]">
              HABIS
            </span>
          </div>
        )}
        {index < 2 && p.stock > 0 && (
          <div className="absolute top-2 right-2 bg-[#F5990D] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 z-10">
            <Star size={10} fill="currentColor" /> TERLARIS
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-start flex-1 w-full text-left">
        <h3 className={`font-black text-xs sm:text-[15px] leading-tight mb-1.5 sm:mb-2 line-clamp-2 w-full ${cartQty > 0 ? "text-white" : "text-[#1C241E]"}`} title={p.title}>
          {p.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          <div className={`px-2 py-0.5 sm:py-1 rounded-lg ${cartQty > 0 ? "bg-white/10" : "bg-[#F8F6F0]"}`}>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${cartQty > 0 ? "text-white/80" : "text-[#5A635B]"}`}>
              {p.category || "Produk"}
            </span>
          </div>
          {p.grade && (() => {
            const g = (p.grade || "").toLowerCase().trim();
            let style = { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", icon: AlertTriangle, iconColor: "text-red-500" };
            if (g === "premium") style = { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", icon: Crown, iconColor: "text-[#F5990D]" };
            else if (g === "grade a" || g === "a" || g.endsWith(" a")) style = { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300", icon: Star, iconColor: "text-emerald-500" };
            else if (g === "grade b" || g === "b" || g.endsWith(" b")) style = { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", icon: CheckCircle, iconColor: "text-blue-500" };
            else if (g === "grade c" || g === "c" || g.endsWith(" c") || g.includes("tidak layak")) style = { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", icon: AlertTriangle, iconColor: "text-red-500" };
            const GradeIcon = style.icon;
            return (
              <span className={`${style.bg} ${style.text} border ${style.border} px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${cartQty > 0 ? "opacity-90" : ""}`}>
                <GradeIcon size={10} className={style.iconColor} fill="currentColor" />
                {p.grade}
              </span>
            );
          })()}
        </div>
        
        <div className={`mt-auto w-full pt-2 sm:pt-3 border-t flex items-end justify-between ${cartQty > 0 ? "border-white/20" : "border-[#E8E3D2]/50"}`}>
          <div>
            <p className={`text-sm sm:text-lg font-black leading-none mb-1 ${cartQty > 0 ? "text-white" : "text-[#C25939]"}`}>
              Rp {p.price?.toLocaleString()}
            </p>
            <p className={`text-[9px] sm:text-[10px] font-bold ${cartQty > 0 ? "text-white/80" : "text-[#2B4C3B]"}`}>
              Stok: {p.stock} {p.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Control Button */}
      {p.stock > 0 ? (
        cartQty > 0 ? (
          <div className="mt-3 sm:mt-5 w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-1.5 sm:py-2 rounded-xl flex items-center justify-between px-3 sm:px-4 shadow-sm" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => onUpdateQuantity(e, -1)} className="p-0.5 sm:p-1 hover:bg-white/20 rounded-md transition-colors">
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="font-extrabold text-xs sm:text-sm">{cartQty}</span>
            <button onClick={(e) => onUpdateQuantity(e, 1)} disabled={cartQty >= p.stock} className={`p-0.5 sm:p-1 rounded-md transition-colors ${cartQty >= p.stock ? 'opacity-50 pointer-events-none' : 'hover:bg-white/20'}`}>
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => onUpdateQuantity(e, 1)}
            className="mt-3 sm:mt-5 w-full bg-[#EEF2E6] hover:bg-[#2B4C3B] hover:text-white text-[#2B4C3B] py-2 sm:py-3.5 rounded-xl flex items-center justify-center transition-colors border border-[#E8E3D2]"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        )
      ) : (
        <div className="mt-3 sm:mt-5 w-full bg-gray-100 text-gray-400 py-2 sm:py-3.5 rounded-xl flex items-center justify-center">
          <X size={18} strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
});

// ─── Custom Dropdown ────────────────────────────────────────────────────────────
const CustomDropdown = ({ value, options, onChange, icon: Icon, placeholder, align = "right" }: { value: string, options: {label: any, value: string}[], onChange: (val: string) => void, icon: any, placeholder?: string, align?: "left" | "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const displayValue = options.find(o => o.value === value)?.label || placeholder || value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 bg-white border border-[#E8E3D2] text-[#2B4C3B] font-extrabold text-xs sm:text-sm rounded-full py-2 px-3.5 sm:py-2.5 sm:pl-4 sm:pr-3 hover:bg-[#F8F6F0] transition-all shadow-sm min-w-32 sm:min-w-40"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon size={14} className="text-[#32452C]" />
          <span>{displayValue}</span>
        </div>
        <ChevronRight size={14} className={`text-[#A4B0A7] transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute ${align === "left" ? "left-0" : "left-0 sm:left-auto sm:right-0"} mt-2 w-52 sm:w-56 bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-3xl p-2 shadow-xl z-50 overflow-hidden`}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
                  value === opt.value ? "bg-[#2B4C3B] text-white" : "text-[#5A635B] hover:bg-[#F8F6F0] hover:text-[#1C241E]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Marketplace Page ────────────────────────────────────────────────────
export default function MarketplacePage() {
  const router = useRouter();
  const { navigateTo } = useGlobalLoading();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  usePageLoading(loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [selectedGrade, setSelectedGrade] = useState("Semua Grade");
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  
  const [canScroll, setCanScroll] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Debounce search to avoid re-filtering on every mobile keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleScroll = useCallback(() => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScroll(scrollWidth > clientWidth + 2);
    setIsAtStart(scrollLeft <= 40);
    setIsAtEnd(Math.ceil(scrollLeft) >= scrollWidth - clientWidth - 40);
  }, []);

  useEffect(() => {
    handleScroll();
    // Passive event listener — prevents scroll jank on mobile
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => window.removeEventListener("resize", handleScroll);
  }, [products, handleScroll]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const { scrollWidth, clientWidth } = categoryScrollRef.current;
      categoryScrollRef.current.scrollTo({ 
        left: direction === 'left' ? 0 : scrollWidth - clientWidth, 
        behavior: "smooth" 
      });
    }
  };

  const handleUpdateQuantity = async (e: React.MouseEvent, p: any, delta: number) => {
    if (e) e.stopPropagation();
    
    const existing = cartItems.find(item => item.productId === p.id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty === 0 && delta > 0 && e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const animId = Date.now();
      setAnimations(prev => [...prev, { id: animId, x: rect.left + rect.width/2 - 20, y: rect.top, image: p.imageUrls?.[0] }]);
      setTimeout(() => {
        setAnimations(prev => prev.filter(a => a.id !== animId));
      }, 500);
    }

    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) { router.push("/login"); return; }
    const session = JSON.parse(sessionStr);

    const newQty = currentQty + delta;
    if (newQty > p.stock) return;

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
    if (currentQty === 0 && delta > 0) {
      setTimeout(() => setCartCount(newCart.length), 400);
    } else {
      setCartCount(newCart.length);
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) { router.push("/login"); return; }
    const session = JSON.parse(sessionStr);
    setProfile(session);

    try {
      const [prodRes, cartRes] = await Promise.all([
        fetchApi(`${API_BASE}/api/products?limit=200`).catch(() => null),
        fetchApi(`${API_BASE}/api/cart/${session.id}`).catch(() => null)
      ]);
      
      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        const arr = Array.isArray(prodData) ? prodData : (prodData.data ?? []);
        setProducts(arr);
      }
      
      if (cartRes && cartRes.ok) {
        const cartData = await cartRes.json();
        if (Array.isArray(cartData)) {
          setCartItems(cartData);
          setCartCount(cartData.length);
        }
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    
    setLoading(false);
  };

  const { displayedProducts, hasMore } = useMemo(() => {
    const filtered = products.filter(p => {
      const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
      // Use debouncedSearch for filtering to avoid jank on mobile keystrokes
      const matchSearch = p.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      let matchGrade = true;
      if (selectedCategory === "Daging" && selectedGrade !== "Semua Grade") {
        matchGrade = p.grade && p.grade.toLowerCase().includes(selectedGrade.toLowerCase());
      }
      
      return matchCat && matchSearch && matchGrade;
    });

    filtered.sort((a, b) => {
      if (sortBy === "Harga Terendah") return a.price - b.price;
      if (sortBy === "Harga Tertinggi") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      displayedProducts: filtered.slice(0, 16),
      hasMore: filtered.length > 16
    };
  }, [products, debouncedSearch, selectedCategory, selectedGrade, sortBy]);

  const cartTotalQty = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  }, [cartItems]);

  const cartTotalPrice = useMemo(() => {
    return cartItems.reduce((acc, curr) => {
      const price = curr.product?.price || 0;
      return acc + (price * (curr.quantity || 1));
    }, 0);
  }, [cartItems]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F0] w-full flex flex-col overflow-x-clip">
      <NavbarSkeleton />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-0 sm:pt-4 space-y-4 sm:space-y-6 pb-28">
        <MarketHeroSkeleton />
        <CategoryCardsSkeleton />
        <section className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-56 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
          <ProductGridSkeleton count={8} />
        </section>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] font-sans selection:bg-[#B4C179] selection:text-[#1C241E] overflow-x-clip">
      
      {/* ── Sticky Top Navbar (Visible & Sticky on Mobile, Tablet & Desktop) ── */}
      <div className="sticky top-0 z-50 w-full">
        <MarketplaceNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartCount={cartCount} />
      </div>

      {/* ── Main Container: Seamlessly Fluid across 320px -> 1400px ── */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-0 sm:pt-4 space-y-4 sm:space-y-6 pb-28">
        
        {/* HERO BANNER SECTION (Slightly taller mobile height) */}
        <div className="relative z-10">
          {/* layout animation disabled on mobile — too expensive on low-end devices */}
          <motion.div 
            layout
            className="bg-pranata text-white overflow-hidden shadow-xl relative
                       -mx-4 sm:mx-0 -mt-0 sm:mt-0 
                       w-[calc(100%+2rem)] sm:w-full 
                       rounded-b-[2.2rem] sm:rounded-[2.5rem] md:rounded-t-[2.5rem] md:rounded-b-[4rem] lg:rounded-b-[5rem]
                       p-5 sm:p-8 md:p-12 lg:p-16 
                       flex flex-row items-center justify-between min-h-[185px] min-[380px]:min-h-[200px] sm:min-h-[260px] md:min-h-[300px]"
          >
            {/* Ambient blur decorations — hidden on mobile (GPU-intensive, zero visual impact) */}
            <div className="hidden sm:block absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-[70px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="hidden sm:block absolute bottom-0 right-0 w-64 h-64 bg-[#B4C179]/15 rounded-full blur-[60px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Hero Copywriting - Left ~55% container */}
            <div className="relative z-10 flex-1 max-w-[55%] min-[380px]:max-w-[58%] sm:max-w-md lg:max-w-xl pr-2 sm:pr-4">
              <h1 className="text-[1.25rem] min-[360px]:text-[1.35rem] min-[400px]:text-[1.45rem] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight sm:leading-[1.1] tracking-tight">
                Hasil Ternak Segar, <br className="hidden sm:inline" />
                <span>Langsung dari Peternak.</span>
              </h1>

              <p className="text-white text-[10.5px] min-[360px]:text-xs sm:text-base font-medium max-w-md leading-relaxed line-clamp-2 sm:line-clamp-none mt-1.5 sm:mt-3">
                Nikmati daging, susu, telur, dan produk peternakan berkualitas yang dikirim langsung dari peternak lokal Indonesia.
              </p>
            </div>

            {/* Hero Image Graphic - Large & prominent, bleeding down right corner */}
            <div className="absolute right-0 bottom-0 pointer-events-none z-10 translate-x-1 sm:translate-x-3 translate-y-4 min-[360px]:translate-y-6 sm:translate-y-12 md:translate-y-16 lg:translate-y-20">
              <img 
                src="/images/market_hero.webp" 
                alt="Hasil Ternak Segar Pranata Market"
                fetchPriority="high"
                decoding="async"
                className="w-48 min-[360px]:w-56 min-[400px]:w-64 sm:w-[24rem] md:w-[30rem] lg:w-[34rem] h-auto object-contain pointer-events-none origin-bottom-right"
              />
            </div>
          </motion.div>
        </div>

        {/* RECTANGLE CATEGORY CARDS (COMPACT & SLEEK WITH REDUCED WIDTH RATIO) */}
        <section className="-mt-4 min-[360px]:-mt-5 sm:-mt-8 md:-mt-10 relative z-30 pt-0 w-full px-1 sm:px-0">
          <div 
            ref={categoryScrollRef}
            onScroll={handleScroll}
            className="grid grid-cols-4 gap-1.5 min-[360px]:gap-2 sm:gap-3 md:gap-3.5 w-full max-w-[280px] min-[360px]:max-w-[340px] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    if (cat.name !== "Daging") setSelectedGrade("Semua Grade");
                  }}
                  className={`w-full aspect-[1/0.92] sm:aspect-[1/0.9] 
                             rounded-[0.8rem] min-[360px]:rounded-[1.1rem] sm:rounded-[1.3rem] lg:rounded-[1.5rem] 
                             p-1.5 min-[360px]:p-2.5 sm:p-3 
                             flex flex-col justify-between items-start text-left transition-all duration-300 relative overflow-hidden group ${
                    active 
                      ? "bg-linear-to-br from-[#8FA76B] to-[#405D46] text-white border-[1.5px] sm:border-2 border-white scale-[1.02]" 
                      : "bg-white text-[#1C241E] border-[1.5px] sm:border-2 border-[#E8E3D2] hover:border-[#32452C]"
                  }`}
                >
                  {/* Top-Left Category Name */}
                  <div className="flex flex-col pt-0.5">
                    <span className={`font-black text-[9px] min-[360px]:text-[11px] min-[400px]:text-xs sm:text-xs md:text-sm tracking-tight leading-none ${active ? "text-white" : "text-[#1C241E]"}`}>
                      {cat.name}
                    </span>
                  </div>

                  {/* Bottom-Right Category Icon/Image Graphic */}
                  <div className="self-end mt-auto flex items-center justify-center">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-4 h-4 min-[360px]:w-6 min-[360px]:h-6 min-[400px]:w-7 min-[400px]:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain transition-transform group-hover:scale-110" 
                        decoding="async" 
                      />
                    ) : (
                      <span className="text-sm min-[360px]:text-base min-[400px]:text-lg sm:text-xl md:text-2xl transition-transform group-hover:scale-110">{cat.icon}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* MAIN PRODUCTS SECTION */}
        <section className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-2xl font-black text-[#1C241E] tracking-tight">
              {selectedCategory === "Semua" ? "Mungkin Anda butuhkan" : selectedCategory}
            </h2>

            <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
              {/* Conditional Grade Daging Pill Sorter (Only shown when selectedCategory is 'Daging') */}
              {selectedCategory === "Daging" && (
                <CustomDropdown
                  value={selectedGrade}
                  onChange={setSelectedGrade}
                  icon={Crown}
                  placeholder="Grade Daging"
                  options={[
                    { label: "Semua Grade", value: "Semua Grade" },
                    { label: "Premium", value: "Premium" },
                    { label: "Grade A", value: "Grade A" },
                    { label: "Grade B", value: "Grade B" },
                    { label: "Grade C", value: "Grade C" }
                  ]}
                />
              )}

              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                icon={SlidersHorizontal}
                placeholder="Urutkan"
                options={[
                  { label: "Terbaru", value: "Terbaru" },
                  { label: "Harga Terendah", value: "Harga Terendah" },
                  { label: "Harga Tertinggi", value: "Harga Tertinggi" }
                ]}
              />

              {hasMore && (
                <button 
                  onClick={() => navigateTo(`/market/products?category=${selectedCategory}`)} 
                  className="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 bg-gradient-to-br from-[#8FA76B] to-[#405D46] px-4 py-2 sm:px-5 sm:py-2.5 rounded-full hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Products Grid: Fluidly 2 cols on mobile -> 3 cols on tablet -> 4 cols on desktop */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[#E8E3D2] rounded-[2rem] bg-white max-w-7xl mx-auto px-4">
              <Package size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-black text-[#5A635B] mb-1">Produk tidak ditemukan</h3>
              <p className="text-gray-400 text-xs">Coba ubah kata kunci atau kategori pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {displayedProducts.map((p, i) => {
                const qty = cartItems.find(item => item.productId === p.id)?.quantity || 0;
                return (
                  <ProductCard 
                    key={p.id}
                    p={p} 
                    index={i} 
                    onClick={() => navigateTo(`/market/product/${p.id}`)}
                    cartQty={qty}
                    onUpdateQuantity={(e, delta) => handleUpdateQuantity(e, p, delta)} 
                  />
                );
              })}
            </div>
          )}

          {/* Mobile Bottom "Lihat Semua Produk" Button */}
          <div className="pt-4 sm:hidden">
            <button 
              onClick={() => navigateTo(`/market/products?category=${encodeURIComponent(selectedCategory)}`)} 
              className="w-full bg-[#C25939] hover:bg-[#A34529] active:scale-95 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#C25939]/20 transition-all"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </section>



      </main>

      {/* Fly to Cart Animation Particles */}
      {animations.map(anim => (
        <motion.div
          key={anim.id}
          initial={{ x: anim.x, y: anim.y, scale: 1, opacity: 1 }}
          animate={{ x: window.innerWidth - 40, y: 30, scale: 0.1, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed top-0 left-0 z-100 w-12 h-12 rounded-xl shadow-xl overflow-hidden border-2 border-[#2B4C3B] bg-white flex items-center justify-center pointer-events-none"
        >
          {anim.image ? <img src={anim.image} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <Package size={20} className="text-[#2B4C3B]" />}
        </motion.div>
      ))}

      {/* Footer */}
      <div className="mt-16">
        <Footer />
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
