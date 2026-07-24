"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect, use } from "react";
import {
  Store, ShoppingCart, ArrowLeft, ShieldCheck, MapPin,
  CheckCircle, Package, Star, ChevronLeft, X,
  ChevronDown, ChevronUp, Heart, Crown, Info, Loader2,
  Share2, ArrowRight, ChevronRight, Check
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import { ImageSwiper } from "@/components/ui/image-swiper";

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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  usePageLoading(loading);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);

  useEffect(() => { loadProduct(); }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const prodRes = await fetchApi(`${API_BASE}/api/products/${productId}`);
      if (prodRes.ok) {
        const found = await prodRes.json();
        setProduct(found);
        
        let initialQty = found.minOrder || 1;

        const sessionStr = localStorage.getItem("farmpro_session");
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          const cartRes = await fetchApi(`${API_BASE}/api/cart/${session.id}`).catch(() => null);
          if (cartRes && cartRes.ok) {
            const cartData = await cartRes.json();
            if (Array.isArray(cartData)) {
              const existingItem = cartData.find((item: any) => item.productId === productId);
              if (existingItem) {
                initialQty = existingItem.quantity;
              }
            }
          }
        }
        
        setQuantity(initialQty);

        if (found.sellerId) {
          const sellerRes = await fetchApi(`${API_BASE}/api/profile/${found.sellerId}`);
          if (sellerRes.ok) setSeller(await sellerRes.json());
        }
      } else {
        setProduct(null);
      }
    } catch (e) {
      console.error(e);
      setProduct(null);
    }
    setLoading(false);
  };

  const fallbackImg = getCategoryFallbackImage(product?.category);
  const displayImages = (product?.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : [fallbackImg];

  // Real-time backend cart sync on (+) and (-) clicks
  const updateCartQuantityInBackend = async (newQty: number) => {
    if (!product) return;
    const maxQ = product.stock || 0;
    const minQ = maxQ === 0 ? 0 : Math.min(product.minOrder || 1, maxQ);

    if (newQty < minQ && newQty !== 0) return;
    if (newQty > maxQ) return;

    setQuantity(newQty);

    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(sessionStr);

    try {
      if (newQty <= 0) {
        await fetchApi(`${API_BASE}/api/cart/${session.id}/${productId}`, { method: 'DELETE' });
      } else {
        await fetchApi(`${API_BASE}/api/cart/${session.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: newQty })
        });
      }
    } catch (e) {
      console.error("Failed syncing quantity to backend cart:", e);
    }
  };

  const handleAddToCart = async () => {
    if (isSubmitting || !product || product.stock === 0) return;
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) { router.push("/login"); return; }
    const session = JSON.parse(sessionStr);
    
    setIsSubmitting(true);
    try {
      const res = await fetchApi(`${API_BASE}/api/cart/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      if (res.ok) {
        setAddedSuccess(true);
        setTimeout(() => {
          router.push("/market/cart");
        }, 800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxQ = product?.stock || 0;
  const minQ = maxQ === 0 ? 0 : Math.min(product?.minOrder || 1, maxQ);
  const totalPrice = (product?.price || 0) * quantity;

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <div className="hidden md:block sticky top-0 z-40 px-4 pt-4">
        <div className="max-w-7xl mx-auto bg-white border border-[#E8E3D2] rounded-2xl shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-14 flex items-center justify-between px-4 md:px-8 lg:px-12">
          <div className="w-24 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-48 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2] hidden sm:block" />
          <div className="w-20" />
        </div>
      </div>
      <main className="relative z-10 max-w-7xl mx-auto pt-4 md:pt-6 pb-32 space-y-6 px-4 md:px-8 lg:px-12">
        <div className="bg-white border border-[#E8E3D2] rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-12px_rgba(43,76,59,0.12)]">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 lg:w-1/2 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] skeleton-shimmer" />
            <div className="w-full md:w-3/5 lg:w-1/2 p-7 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="w-3/4 h-10 rounded-xl skeleton-shimmer mb-4" />
                <div className="w-1/2 h-8 rounded-lg skeleton-shimmer mb-6" />
                <div className="w-full h-24 rounded-2xl skeleton-shimmer mb-6" />
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="h-24 rounded-2xl skeleton-shimmer" />
                  <div className="h-24 rounded-2xl skeleton-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]">
      <div className="text-center px-4">
        <Package size={56} className="mx-auto text-[#C4BAA8] mb-4" />
        <p className="font-black text-xl text-[#5A635B]">Produk tidak ditemukan.</p>
        <button onClick={() => router.push("/market")} className="mt-4 text-[#2B4C3B] font-bold underline">
          Kembali ke Marketplace
        </button>
      </div>
    </div>
  );

  const getGradeStyle = (gradeStr: string) => {
    const g = (gradeStr || "").toLowerCase();
    if (g === "premium") {
      return {
        bg: "bg-[#FFF9E6]",
        border: "border-[#F5990D]",
        text: "text-[#D97706]",
        badgeBg: "bg-[#F5990D]",
        badgeText: "text-white",
        icon: Crown,
      };
    } else if (g.includes("a")) {
      return {
        bg: "bg-[#F0F7F2]",
        border: "border-[#2B4C3B]",
        text: "text-[#2B4C3B]",
        badgeBg: "bg-[#2B4C3B]",
        badgeText: "text-[#B4C179]",
        icon: Star,
      };
    } else if (g.includes("b")) {
      return {
        bg: "bg-[#F6F8EF]",
        border: "border-[#767C15]",
        text: "text-[#767C15]",
        badgeBg: "bg-[#767C15]",
        badgeText: "text-white",
        icon: CheckCircle,
      };
    }
    return {
      bg: "bg-[#FDF6F3]",
      border: "border-[#C25939]",
      text: "text-[#C25939]",
      badgeBg: "bg-[#C25939]",
      badgeText: "text-white",
      icon: Info,
    };
  };

  const gradeStyle = getGradeStyle(product.grade || "Grade A");
  const GradeIconComponent = gradeStyle.icon;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] font-sans pb-36 md:pb-12 overflow-x-clip selection:bg-[#B4C179]">
      
      {/* Desktop/Tablet Sticky Navbar */}
      <div className="hidden md:block sticky top-0 z-50">
        <MarketplaceNavbar />
      </div>

      {/* ── MOBILE PRODUCT DETAIL PAGE (<768px) ── */}
      <div className="md:hidden w-full">
        
        {/* Mobile Sticky Top Header Row */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8E3D2] py-3 px-4 shadow-sm flex items-center justify-between">
          <button 
            onClick={() => router.push("/market")}
            className="w-9 h-9 rounded-full bg-white border border-[#E8E3D2] flex items-center justify-center text-[#1C241E] hover:bg-[#F8F6F0] active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </button>
          
          <h2 className="text-sm font-extrabold text-[#1C241E]">Detail Produk</h2>

          <button 
            onClick={() => setLiked(!liked)}
            className="w-9 h-9 rounded-full bg-white border border-[#E8E3D2] flex items-center justify-center text-[#1C241E] hover:bg-[#F8F6F0] active:scale-95 transition-all shadow-sm"
          >
            <Heart size={18} className={liked ? "fill-[#C25939] stroke-[#C25939]" : "stroke-[#1C241E] stroke-[2.2]"} />
          </button>
        </div>

        <div className="max-w-md mx-auto px-4 pt-3 pb-36 space-y-4">

        {/* Product Category Badge & Title */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#2B4C3B]/10 text-[#2B4C3B] text-[10px] font-black uppercase tracking-wider">
              {product.category || "Produk Agriculture"}
            </span>
            {product.grade && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#F5990D]/15 text-[#D97706] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Star size={10} fill="currentColor" /> {product.grade}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-[#1C241E] tracking-tight leading-snug">
            {product.title}
          </h1>
        </div>

        {/* INTEGRATED SHADCN IMAGE SWIPER COMPONENT (Zoom to Fit / Full Edge to Edge) */}
        <div className="w-full flex items-center justify-center py-2 select-none overflow-visible min-h-[330px]">
          <ImageSwiper 
            images={displayImages} 
            cardWidth={280} 
            cardHeight={320} 
            className="mx-auto cursor-zoom-in" 
            onImageClick={(imgUrl) => setFullscreenImg(imgUrl)}
          />
        </div>

        {/* 2-Column Product Specs & Seller Cards */}
        <div className="grid grid-cols-12 gap-3 pt-1">
          {/* Left Spec Card (7 cols) */}
          <div className="col-span-7 bg-white border border-[#E8E3D2] rounded-3xl p-3.5 space-y-2.5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black uppercase text-[#2B4C3B] tracking-wider block mb-1">Informasi Produk</span>
              <p className="text-[11px] text-[#5A635B] leading-relaxed line-clamp-3">
                {product.description || "Hasil panen berkualitas dari petani lokal binaan Pranata Market."}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F8F6F0] grid grid-cols-2 gap-2 text-[9px]">
              <div>
                <span className="text-gray-400 font-bold block uppercase">Min. Order</span>
                <strong className="text-[#1C241E] font-black">{product.minOrder || 1} {product.unit}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-bold block uppercase">Sisa Stok</span>
                <strong className="text-[#2B4C3B] font-black">{product.stock} {product.unit}</strong>
              </div>
            </div>
          </div>

          {/* Right Seller & Pricing Card (5 cols) */}
          <div className="col-span-5 bg-white border border-[#E8E3D2] rounded-3xl p-3.5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Mitra Toko</span>
              <Link href={seller ? `/market/seller/${seller.id}` : "#"} className="group block mt-1">
                <h4 className="text-xs font-black text-[#1C241E] line-clamp-1 group-hover:text-[#2B4C3B] transition-colors">
                  {seller?.farmName || seller?.fullName || "Petani Sleman"}
                </h4>
                {seller?.location && (
                  <p className="text-[9px] font-bold text-[#7A8678] flex items-center gap-0.5 mt-0.5 truncate">
                    <MapPin size={10} className="text-[#C25939] shrink-0" />
                    <span className="truncate">{seller.location}</span>
                  </p>
                )}
              </Link>
            </div>

            <div className="pt-2 border-t border-[#F8F6F0]">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Harga Satuan</span>
              <p className="text-xs font-black text-[#C25939] mt-0.5">
                Rp {product.price?.toLocaleString()} <span className="text-[9px] text-[#5A635B] font-bold">/ {product.unit}</span>
              </p>
            </div>
          </div>
        </div>

        {/* AI Quality Grading Analysis Card (Mobile) */}
        <div className={`rounded-3xl overflow-hidden shadow-sm border-2 ${gradeStyle.bg} ${gradeStyle.border}`}>
          <div className="p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className={`text-xs font-black flex items-center gap-1.5 ${gradeStyle.text}`}>
                <ShieldCheck size={15} />
                AI Quality Grading
              </h3>
              <span className={`text-[10px] font-black uppercase ${gradeStyle.badgeBg} ${gradeStyle.badgeText} px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1`}>
                <GradeIconComponent size={10} fill="currentColor" /> {product.grade || "Grade A"}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-[#5A635B] leading-relaxed">
              {product.aiAnalysis || "Produk ini telah melalui proses penilaian otomatis kualitas dan kesegaran berbasis AI."}
            </p>

            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-black/5 justify-start">
              <span className="text-[9px] font-light tracking-tight text-[#2B4C3B] uppercase">Powered By</span>
              <img src="/logos/intelligence/intelligence-black.webp" alt="Pranata Intelligence" className="h-5 drop-shadow-sm" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>

        {/* Fully Functional Mobile Sticky Bottom Bar (Connected Realtime to Backend) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F8F6F0]/95 backdrop-blur-xl border-t border-[#E8E3D2] p-3.5 shadow-2xl">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            
            {/* Quantity Stepper Buttons connected to backend API */}
            <div className="flex items-center space-x-2 bg-white border border-[#E8E3D2] rounded-full p-1 shadow-sm shrink-0">
              <button 
                onClick={() => updateCartQuantityInBackend(quantity - 1)}
                disabled={maxQ === 0 || quantity <= minQ}
                className="w-9 h-9 rounded-full bg-[#F8F6F0] text-[#1C241E] font-black text-sm flex items-center justify-center active:scale-95 disabled:opacity-40 transition-all"
              >
                -
              </button>

              <span className="text-xs font-black text-[#1C241E] w-6 text-center">
                {maxQ === 0 ? 0 : quantity}
              </span>

              <button 
                onClick={() => updateCartQuantityInBackend(quantity + 1)}
                disabled={maxQ === 0 || quantity >= maxQ}
                className="w-9 h-9 rounded-full bg-[#2B4C3B] text-white font-black text-sm flex items-center justify-center active:scale-95 disabled:opacity-40 transition-all"
              >
                +
              </button>
            </div>

            {/* Total Price & Add to Cart Pranata Green Gradient Action Button */}
            <button
              onClick={handleAddToCart}
              disabled={maxQ === 0 || isSubmitting}
              className={`flex-1 py-3.5 px-5 rounded-full font-black text-xs shadow-xl flex items-center justify-between transition-all ${
                maxQ === 0 
                  ? 'bg-gray-400 opacity-60 text-white cursor-not-allowed'
                  : addedSuccess
                  ? 'bg-[#1E362A] text-white'
                  : 'bg-gradient-to-r from-[#2B4C3B] via-[#32452C] to-[#1E362A] hover:from-[#1E362A] hover:to-[#2B4C3B] text-white active:scale-95 shadow-[#2B4C3B]/20'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-[#B4C179] font-extrabold uppercase tracking-wider">Total</span>
                <span className="text-xs font-black text-white">
                  {maxQ === 0 ? "Stok Habis" : `Rp ${totalPrice.toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 font-black text-white">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : addedSuccess ? (
                  <>
                    <Check size={16} className="text-[#B4C179]" />
                    <span className="text-white">Sukses!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} className="text-white" />
                    <span className="text-white">Tambah ke Keranjang</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

      </div>

      </div>

      {/* ── DESKTOP & TABLET LAYOUT (>=768px - 100% UNTOUCHED & COMPLETE) ── */}
      <div className="hidden md:block max-w-7xl mx-auto pt-8 pb-16 relative z-10 px-4 md:px-8 lg:px-12">
        <div className="mb-6">
          <button 
            onClick={() => router.push("/market")} 
            className="inline-flex items-center gap-2 bg-white border border-[#E8E3D2] hover:bg-[#F8F6F0] text-[#1C241E] hover:text-[#2B4C3B] font-bold text-sm px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            <ChevronLeft size={18} /> Kembali ke Marketplace
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* Left Side: Desktop Main Image & Thumbnail Picker */}
          <div className="w-full md:w-2/5 lg:w-1/2 flex flex-col">
            <div 
              onClick={() => setFullscreenImg(displayImages[currentImageIdx % displayImages.length])}
              className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-white border border-[#E8E3D2] rounded-[2.5rem] overflow-hidden shadow-md p-0 flex items-center justify-center cursor-zoom-in group"
            >
              {displayImages && displayImages.length > 0 ? (
                <motion.img 
                  key={currentImageIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={displayImages[currentImageIdx % displayImages.length]} 
                  alt={product.title}
                  className="w-full h-full object-cover object-center scale-[1.08] group-hover:scale-[1.12] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F1EBE1]">
                  <Package size={80} className="text-[#C4BAA8] opacity-50" />
                </div>
              )}
            </div>

            {/* Desktop Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                {displayImages.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`w-20 h-20 rounded-2xl bg-white border overflow-hidden p-0 transition-all ${
                      currentImageIdx === idx 
                        ? "border-[#2B4C3B] ring-2 ring-[#2B4C3B]/30 scale-105 shadow-sm" 
                        : "border-[#E8E3D2] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover object-center scale-[1.08]" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Buying Actions */}
          <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col justify-between">
            <div>
              {product.category && (
                <span className="inline-block px-4 py-1.5 rounded-full border border-[#DDE2D6] text-xs font-black text-[#2B4C3B] uppercase tracking-wider mb-4 bg-white shadow-sm">
                  {product.category}
                </span>
              )}
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C241E] leading-tight mb-4">
                {product.title}
              </h1>
              
              <p className="text-2xl sm:text-3xl font-black text-[#C25939] mb-6">
                Rp {product.price?.toLocaleString()} <span className="text-lg text-[#5A635B] font-bold">/ {product.unit}</span>
              </p>

              {/* Seller Profile Link Card */}
              {seller && (
                <Link href={`/market/seller/${seller.id}`} className="flex items-center gap-4 bg-white hover:bg-[#F8F6F0] border border-[#E8E3D2] p-4 rounded-2xl mb-6 shadow-sm transition-colors group">
                  {seller.avatarUrl ? (
                    <img src={seller.avatarUrl} alt="Seller Avatar" className="w-12 h-12 rounded-full object-cover shrink-0 shadow-inner group-hover:scale-105 transition-transform" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2B4C3B] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      {(seller.farmName || seller.fullName || seller.username || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-[#1C241E] flex items-center gap-1.5 mb-0.5">
                      {seller.farmName || seller.fullName}
                      <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    </h3>
                    {seller.location && (
                      <p className="text-xs text-[#5A635B] flex items-center gap-1">
                        <MapPin size={12} className="text-[#C25939]" /> {seller.location}
                      </p>
                    )}
                  </div>
                </Link>
              )}

              {/* Product Description */}
              <div className="bg-white border border-[#E8E3D2] rounded-2xl p-5 mb-6 shadow-sm">
                <h4 className="text-xs font-black text-[#2B4C3B] uppercase tracking-wider mb-2">Deskripsi Produk</h4>
                <p className="text-sm text-[#5A635B] leading-relaxed">
                  {product.description || "Produk pertanian berkualitas tinggi langsung disalurkan dari mitra petani lokal terverifikasi di platform Pranata Market."}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#F8F6F0] text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block uppercase text-[10px]">Min. Order</span>
                    <strong className="text-[#1C241E] font-black text-sm">{product.minOrder || 1} {product.unit}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase text-[10px]">Sisa Stok</span>
                    <strong className="text-[#2B4C3B] font-black text-sm">{product.stock} {product.unit}</strong>
                  </div>
                </div>
              </div>

              {/* AI Quality Grading Card (Desktop) */}
              <div className={`rounded-2xl overflow-hidden shadow-sm border-2 mb-8 ${gradeStyle.bg} ${gradeStyle.border}`}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-black flex items-center gap-1.5 ${gradeStyle.text}`}>
                      <ShieldCheck size={18} />
                      Hasil Penilaian Kualitas (AI Quality Grading)
                    </h3>
                    <span className={`text-xs font-black uppercase ${gradeStyle.badgeBg} ${gradeStyle.badgeText} px-3 py-1 rounded-full shadow-sm flex items-center gap-1`}>
                      <GradeIconComponent size={12} fill="currentColor" /> {product.grade || "Grade A"}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#5A635B] leading-relaxed">
                    {product.aiAnalysis || "Produk ini telah melalui proses penilaian otomatis kualitas dan kesegaran berbasis visi AI."}
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-black/5 justify-start">
                    <span className="text-[10px] font-light tracking-tight text-[#2B4C3B] uppercase">Powered By</span>
                    <img src="/logos/intelligence/intelligence-black.webp" alt="Pranata Intelligence" className="h-5 drop-shadow-sm" loading="lazy" decoding="async" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex gap-4">
              <div className="flex items-center space-x-3 bg-white border border-[#E8E3D2] rounded-2xl px-4 py-2 shadow-sm">
                <button 
                  onClick={() => updateCartQuantityInBackend(quantity - 1)}
                  disabled={maxQ === 0 || quantity <= minQ}
                  className="w-10 h-10 rounded-full bg-[#F8F6F0] text-[#1C241E] font-black text-lg flex items-center justify-center active:scale-95 disabled:opacity-40 transition-all"
                >
                  -
                </button>

                <span className="text-base font-black text-[#1C241E] w-8 text-center">
                  {maxQ === 0 ? 0 : quantity}
                </span>

                <button 
                  onClick={() => updateCartQuantityInBackend(quantity + 1)}
                  disabled={maxQ === 0 || quantity >= maxQ}
                  className="w-10 h-10 rounded-full bg-[#2B4C3B] text-white font-black text-lg flex items-center justify-center active:scale-95 disabled:opacity-40 transition-all"
                >
                  +
                </button>
              </div>

              <motion.button 
                onClick={handleAddToCart}
                disabled={maxQ === 0 || isSubmitting}
                className="flex-1 h-14 rounded-2xl font-black text-base bg-gradient-to-r from-[#2B4C3B] via-[#32452C] to-[#1E362A] text-white hover:brightness-110 shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  <>
                    <ShoppingCart size={20} className="text-white" />
                    <span className="text-white">{maxQ === 0 ? 'Stok Habis' : `Tambah ke Keranjang • Rp ${totalPrice.toLocaleString()}`}</span>
                  </>
                )}
              </motion.button>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {fullscreenImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImg(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none cursor-zoom-out"
          >
            {/* Close Button X */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImg(null);
              }}
              className="absolute top-5 right-5 z-[110] w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center border border-white/30 transition-all active:scale-95 shadow-xl cursor-pointer"
              title="Tutup Preview"
            >
              <X size={26} className="stroke-[2.5]" />
            </button>

            {/* Large Fullscreen Image */}
            <motion.img 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              src={fullscreenImg} 
              alt="Fullscreen Product Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
