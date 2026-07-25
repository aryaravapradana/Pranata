"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect, memo, useMemo, useRef, Suspense, useCallback } from "react";
import { 
  Search, MapPin, ChevronRight, Package, ArrowRight, Minus, Plus, 
  ShoppingBag, Store, User, Star, CheckCircle, Info, Crown, ChevronLeft, 
  X, SlidersHorizontal, Sparkles, TrendingDown, TrendingUp, Layers, Check, ShieldCheck, Tag, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter, useSearchParams } from "next/navigation";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 20;

const CATEGORIES = [
  { name: "Semua", icon: "🌾", image: null },
  { name: "Daging", icon: "🥩", image: "/icons/daging.webp" },
  { name: "Susu", icon: "🥛", image: "/icons/susu.webp" },
  { name: "Telur", icon: "🥚", image: "/icons/telor.webp" },
];

const API_BASE = getApiBaseUrl();

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

// ─── Product Card Component ───────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ p, index, onClick, cartQty, onUpdateQuantity }: { p: any; index?: number; onClick: () => void; cartQty: number; onUpdateQuantity: (e: React.MouseEvent, delta: number) => void }) {
  const fallbackImg = getCategoryFallbackImage(p.category);
  const imgUrl = (p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls[0] : fallbackImg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      onClick={p.stock > 0 ? onClick : undefined}
      className={`rounded-[2rem] flex flex-col p-3.5 sm:p-4 shadow-[0_12px_24px_-12px_rgba(43,76,59,0.08)] group relative transition-all duration-300 overflow-hidden z-0 ${
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
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-start flex-1 w-full text-left">
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <div className={`px-1.5 py-0.5 rounded-md ${cartQty > 0 ? "bg-white/10" : "bg-[#F8F6F0]"}`}>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${cartQty > 0 ? "text-white/80" : "text-[#5A635B]"}`}>{p.category || "Produk"}</span>
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
              <span className={`${style.bg} ${style.text} border ${style.border} px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${cartQty > 0 ? "opacity-90" : ""}`}>
                <GradeIcon size={9} className={style.iconColor} fill="currentColor" />
                {p.grade}
              </span>
            );
          })()}
        </div>
        
        <div className={`mt-auto w-full pt-2 border-t flex items-end justify-between ${cartQty > 0 ? "border-white/20" : "border-[#E8E3D2]/50"}`}>
          <div>
            <p className={`text-sm sm:text-lg font-black leading-none mb-0.5 ${cartQty > 0 ? "text-white" : "text-[#C25939]"}`}>
              Rp {p.price?.toLocaleString()}
            </p>
            <p className={`text-[9px] sm:text-[10px] font-bold ${cartQty > 0 ? "text-white/80" : "text-[#2B4C3B]"}`}>Stok: {p.stock} {p.unit}</p>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {p.stock > 0 ? (
        cartQty > 0 ? (
          <div className="mt-3 sm:mt-5 w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-1.5 sm:py-2 rounded-xl flex items-center justify-between px-3 shadow-sm" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => onUpdateQuantity(e, -1)} className="p-1 hover:bg-white/20 rounded-md transition-colors"><Minus size={15} strokeWidth={3} /></button>
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={cartQty}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-black text-xs sm:text-sm"
              >
                {cartQty}
              </motion.span>
            </AnimatePresence>
            <button onClick={(e) => onUpdateQuantity(e, 1)} disabled={cartQty >= p.stock} className={`p-1 rounded-md transition-colors ${cartQty >= p.stock ? 'opacity-50 pointer-events-none' : 'hover:bg-white/20'}`}><Plus size={15} strokeWidth={3} /></button>
          </div>
        ) : (
          <button 
            onClick={(e) => onUpdateQuantity(e, 1)}
            className="mt-3 sm:mt-5 w-full bg-[#EEF2E6] hover:bg-[#DDE2D6] text-[#2B4C3B] py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center transition-colors active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        )
      ) : (
        <div className="mt-3 sm:mt-5 w-full bg-gray-100 text-gray-400 py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center">
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
        className="flex items-center justify-between gap-2 sm:gap-3 bg-white border border-[#E8E3D2] text-[#2B4C3B] font-black text-xs sm:text-sm rounded-full py-2 px-3 sm:py-2.5 sm:pl-4 sm:pr-3 hover:bg-[#F8F6F0] transition-all shadow-sm shrink-0"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icon size={14} className="text-[#32452C] shrink-0" />
          <span className="truncate">{displayValue}</span>
        </div>
        <ChevronRight size={14} className={`text-[#A4B0A7] transition-transform duration-300 shrink-0 ${isOpen ? "rotate-90" : "rotate-0"}`} />
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
            {options.map((opt, i) => (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
                  value === opt.value ? "bg-[#2B4C3B] text-white" : "text-[#5A635B] hover:bg-[#F8F6F0] hover:text-[#1C241E]"
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function MarketplaceProductsContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category") || "Semua";

  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryParam);
  const [sortBy, setSortBy] = useState("Terbaru");
  const [selectedGrade, setSelectedGrade] = useState("Semua Grade");
  const [currentPage, setCurrentPage] = useState(1);
  
  usePageLoading(loading);

  // Debounce search query — prevents re-render on every mobile keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch, selectedGrade, sortBy]);

  useEffect(() => { loadData(); }, []);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);

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

  const handleUpdateQuantity = async (e: React.MouseEvent, p: any, delta: number) => {
    e.stopPropagation();
    
    const existing = cartItems.find(item => item.productId === p.id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty === 0 && delta > 0) {
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
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchCat = selectedCategory === "Semua" || (p.category || "").toLowerCase() === selectedCategory.toLowerCase();
      // Use debouncedSearch to avoid filtering on every mobile keystroke
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

    return filtered;
  }, [products, debouncedSearch, selectedCategory, selectedGrade, sortBy]);

  // Exactly 20 items per page pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <div className="p-8 flex justify-center items-center">
        <div className="w-12 h-12 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] overflow-x-clip font-sans selection:bg-[#B4C179]">
      
      {/* Sticky White Navbar */}
      <div className="sticky top-0 z-50 w-full">
        <MarketplaceNavbar cartCount={cartCount} />
      </div>

      <main className="max-w-7xl mx-auto pt-4 sm:pt-8 pb-24 px-4 sm:px-6 md:px-8 lg:px-12 space-y-4">
        
        {/* Header & Back Navigation */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/market')}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white border border-[#E8E3D2] rounded-full flex items-center justify-center text-[#5A635B] hover:text-[#2B4C3B] shadow-sm active:scale-95 transition-all"
            >
              <ChevronLeft size={18} className="stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-[#1C241E] tracking-tight">
                {selectedCategory === "Semua" ? "Semua Produk" : selectedCategory}
              </h1>
            </div>
          </div>
        </div>

        {/* Filter Bar (Responsive for Mobile & Desktop) */}
        <div className="bg-white rounded-3xl sm:rounded-full p-2.5 sm:p-2 sm:pl-6 shadow-sm border border-[#E8E3D2] flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Input inside filter bar */}
          <div className="flex items-center gap-2.5 w-full md:w-auto px-3 sm:px-0 py-1 sm:py-0 bg-[#F8F6F0] md:bg-transparent rounded-2xl md:rounded-none">
            <Search className="text-[#A4B0A7] shrink-0" size={16} />
            <input 
              type="text"
              placeholder="Cari sayuran, daging, buah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-transparent outline-none text-[#1C241E] placeholder:text-[#A4B0A7] text-xs sm:text-sm font-bold"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-[#E8E3D2]" />
          
          {/* Scrollable Category Filter Pills */}
          <div className="w-full md:flex-1 overflow-x-auto hide-scrollbar relative">
            <div className="flex items-center gap-2 px-1 pb-1 md:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    router.replace(`/market/products?category=${encodeURIComponent(cat.name)}`);
                  }}
                  className={`shrink-0 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all border ${
                    selectedCategory === cat.name
                      ? "bg-[#2B4C3B] text-white border-[#2B4C3B] shadow-sm scale-105"
                      : "bg-[#F8F6F0] text-[#5A635B] border-[#E8E3D2] hover:bg-[#E8E3D2] hover:text-[#1C241E]"
                  }`}
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-4 h-4 object-contain" loading="lazy" decoding="async" />
                  ) : (
                    <span className="text-sm">{cat.icon}</span>
                  )}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block w-px h-8 bg-[#E8E3D2]" />
          
          {/* Dropdown Filters */}
          <div className="flex items-center justify-between sm:justify-end gap-2 relative z-20 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-[#F8F6F0]">
            {selectedCategory === "Daging" && (
              <CustomDropdown
                align="left"
                value={selectedGrade}
                onChange={setSelectedGrade}
                icon={Crown}
                placeholder="Filter Grade"
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
          </div>
        </div>

        {/* ── RESPONSIVE PRODUCT GRID (20 ITEMS PER PAGE) ── */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#E8E3D2] rounded-3xl bg-white max-w-7xl mx-auto px-4">
            <Package size={44} className="mx-auto text-[#C4BAA8] mb-3" />
            <h3 className="text-lg font-black text-[#5A635B] mb-1">Produk tidak ditemukan</h3>
            <p className="text-gray-400 text-xs font-medium">Coba ubah kata kunci atau kategori pencarian {selectedCategory !== "Semua" ? `"${selectedCategory}"` : ""}.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 pb-6 pt-2">
              {paginatedProducts.map((p, i) => {
                const qty = cartItems.find(item => item.productId === p.id)?.quantity || 0;
                return (
                  <ProductCard 
                    key={p.id} 
                    p={p} 
                    index={i} 
                    onClick={() => router.push(`/market/product/${p.id}`)}
                    cartQty={qty}
                    onUpdateQuantity={(e, delta) => handleUpdateQuantity(e, p, delta)} 
                  />
                );
              })}
            </div>

            {/* Pagination Controls (20 Products per Page) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E8E3D2] rounded-3xl p-4 shadow-sm mt-4">
                <span className="text-xs sm:text-sm font-bold text-[#5A635B]">
                  Menampilkan <strong className="text-[#1C241E] font-black">{((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</strong> dari <strong className="text-[#2B4C3B] font-black">{filteredProducts.length}</strong> Produk
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.max(p - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-2xl bg-[#F8F6F0] hover:bg-[#E8E3D2] text-[#1C241E] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={18} className="stroke-[2.5]" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-2xl font-black text-xs transition-all ${
                        currentPage === page
                          ? "bg-[#2B4C3B] text-white shadow-md scale-105"
                          : "bg-[#F8F6F0] hover:bg-[#E8E3D2] text-[#5A635B]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.min(p + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-2xl bg-[#F8F6F0] hover:bg-[#E8E3D2] text-[#1C241E] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight size={18} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Fly to Cart Animations */}
      {animations.map(anim => (
        <motion.div
          key={anim.id}
          initial={{ x: anim.x, y: anim.y, scale: 1, opacity: 1 }}
          animate={{ x: window.innerWidth - 40, y: 30, scale: 0.1, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed top-0 left-0 z-[100] w-12 h-12 rounded-xl shadow-xl overflow-hidden border-2 border-[#2B4C3B] bg-white flex items-center justify-center pointer-events-none"
        >
          {anim.image ? <img src={anim.image} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <Package size={20} className="text-[#2B4C3B]" />}
        </motion.div>
      ))}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function MarketplaceProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
      </div>
    }>
      <MarketplaceProductsContent />
    </Suspense>
  );
}
