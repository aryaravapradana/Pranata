"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect, use } from "react";
import { Store, ArrowLeft, ShieldCheck, MapPin, Phone, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import { Footer } from "@/components/layout/Footer";

const API_BASE = getApiBaseUrl();
const LIMIT = 20;

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sellerId = resolvedParams.id;

  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  usePageLoading(initialLoading);
  const router = useRouter();

  useEffect(() => { loadData(1, true); }, [sellerId]);

  const loadData = async (pageToLoad = 1, isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    }
    setGridLoading(true);
    try {
      const [sellerRes, prodRes] = await Promise.all([
        fetchApi(`${API_BASE}/api/profile/${sellerId}`),
        fetchApi(`${API_BASE}/api/products/seller/${sellerId}?page=${pageToLoad}&limit=${LIMIT}`),
      ]);
      if (sellerRes.ok) setSeller(await sellerRes.json());
      if (prodRes.ok) {
        const pData = await prodRes.json();
        if (pData && Array.isArray(pData.data)) {
          setProducts(pData.data);
          setTotalProducts(pData.total || pData.data.length);
          setTotalPages(pData.totalPages || 1);
          setCurrentPage(pData.page || pageToLoad);
        } else if (Array.isArray(pData)) {
          setProducts(pData);
          setTotalProducts(pData.length);
          setTotalPages(Math.ceil(pData.length / LIMIT) || 1);
          setCurrentPage(pageToLoad);
        } else {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
      setGridLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <div className="sticky top-0 z-40 px-3.5 sm:px-4 pt-3.5 sm:pt-4">
        <div className="max-w-7xl mx-auto bg-white border border-[#E8E3D2] rounded-2xl shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-12 sm:h-14 flex items-center px-4 md:px-8 lg:px-12">
          <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
        </div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto pt-4 sm:pt-6 pb-16 sm:pb-24 space-y-6 sm:space-y-8 px-3.5 sm:px-6 md:px-8 lg:px-12">
        <div className="bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-12px_rgba(43,76,59,0.14)]">
          <div className="relative h-32 sm:h-40 md:h-52 skeleton-shimmer bg-[#E8E3D2]" />
          <div className="px-4 sm:px-8 pb-5 sm:pb-7">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3 sm:mb-5">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white skeleton-shimmer bg-[#E8E3D2] shrink-0" />
            </div>
            <div className="w-48 sm:w-64 h-7 sm:h-8 rounded-xl skeleton-shimmer bg-[#E8E3D2] mb-3" />
            <div className="w-32 sm:w-40 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-4 sm:mb-5" />
            <div className="flex gap-2">
              <div className="w-28 sm:w-32 h-7 sm:h-8 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
              <div className="w-32 sm:w-40 h-7 sm:h-8 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-32 sm:w-40 h-7 sm:h-8 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[1.75rem] overflow-hidden h-[300px] sm:h-[340px] skeleton-shimmer bg-[#E8E3D2]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0] p-4">
      <div className="text-center">
        <Store size={48} className="mx-auto text-[#C4BAA8] mb-3 sm:w-14 sm:h-14" />
        <p className="font-black text-lg sm:text-xl text-[#5A635B]">Toko tidak ditemukan.</p>
        <button onClick={() => router.push("/market")} className="mt-3 sm:mt-4 text-[#2B4C3B] font-bold text-sm sm:text-base underline">Kembali ke Pasar</button>
      </div>
    </div>
  );

  const initials = (seller.farmName || seller.fullName || seller.username || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]" >
      <MarketplaceNavbar />

      <div className="relative z-10 max-w-7xl mx-auto pt-4 sm:pt-6 pb-16 sm:pb-24 space-y-6 sm:space-y-8 px-3.5 sm:px-6 md:px-8 lg:px-12">
        <div>
          <button onClick={() => router.push("/market")} className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-[#E8E3D2] hover:bg-[#F8F6F0] text-[#1C241E] hover:text-[#2B4C3B] font-bold text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors shadow-sm active:scale-95">
            <ChevronLeft size={16} /> Kembali
          </button>
        </div>

        {/* ── Store Hero (Twitter / FB style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-12px_rgba(43,76,59,0.14)]"
        >
          {/* Banner */}
          <div className="relative h-32 sm:h-40 md:h-52 bg-pranata overflow-hidden">
            {seller.bannerUrl ? (
              <img src={seller.bannerUrl} alt="Banner" decoding="async" className="w-full h-full object-cover"  loading="lazy" />
            ) : (
              /* Fallback earthy SVG pattern */
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="200" fill="#2B4C3B"/>
                <circle cx="100" cy="-20" r="150" fill="#3A6B49" opacity="0.5"/>
                <circle cx="700" cy="220" r="180" fill="#1E362A" opacity="0.6"/>
                <circle cx="400" cy="100" r="120" fill="#4A7C59" opacity="0.25"/>
                <circle cx="650" cy="20" r="90" fill="#F5990D" opacity="0.08"/>
              </svg>
            )}
          </div>

          <div className="px-4 sm:px-8 pb-5 sm:pb-7">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3 sm:mb-5">
              {/* Circular avatar overlapping banner */}
              <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white overflow-hidden bg-pranata shadow-xl shrink-0">
                {seller.avatarUrl ? (
                  <img src={seller.avatarUrl} alt={seller.farmName || seller.fullName} decoding="async" className="w-full h-full object-cover"  loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl sm:text-4xl">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-3xl font-black text-[#1C241E] leading-tight">
                {seller.farmName || seller.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#EEF2E6] text-[#2B4C3B] text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                <ShieldCheck size={11} className="sm:w-3 sm:h-3" /> Terverifikasi
              </span>
            </div>

            {seller.fullName && seller.farmName && (
              <p className="text-xs sm:text-sm font-bold text-[#7A8678] mb-2.5 sm:mb-3">@{seller.username || seller.fullName}</p>
            )}

            {/* Location + contact pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 bg-[#F8F6F0] border border-[#E8E3D2] text-[#5A635B] text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                <MapPin size={12} className="text-[#C25939] shrink-0" />
                <span>{seller.location || "Lokasi tidak ditentukan"}</span>
              </span>
              {seller.contact && (
                <span className="inline-flex items-center gap-1.5 bg-[#F8F6F0] border border-[#E8E3D2] text-[#5A635B] text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                  <Phone size={12} className="text-[#2B4C3B] shrink-0" />
                  <span>{seller.contact}</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Products Grid ── */}
        <div id="products-section" className="scroll-mt-24 sm:scroll-mt-28">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#1C241E]">Etalase Produk</h2>
          </div>

          {gridLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[1.75rem] overflow-hidden h-[300px] sm:h-[340px] skeleton-shimmer bg-[#E8E3D2]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 sm:py-20 border-2 border-dashed border-[#DDE2D6] rounded-2xl sm:rounded-[2rem]">
              <Package size={40} className="mx-auto text-[#C4BAA8] mb-3 sm:w-12 sm:h-12" />
              <p className="font-black text-lg sm:text-xl text-[#5A635B] mb-1">Belum ada produk</p>
              <p className="text-xs sm:text-sm text-[#A4B0A7] font-medium">Penjual ini belum menambahkan produk.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: "easeOut" }}
                  onClick={p.stock > 0 ? () => router.push(`/market/product/${p.id}`) : undefined}
                  className={`bg-white border border-[#E8E3D2] rounded-2xl sm:rounded-[1.75rem] overflow-hidden group will-change-transform transition-all duration-200 ${
                    p.stock > 0 ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0_24px_48px_-12px_rgba(43,76,59,0.18)] active:scale-98" : "cursor-not-allowed opacity-60 grayscale-[0.8]"
                  }`}
                  style={{ contain: "layout style" }}
                >
                  {/* Image */}
                  <div className="h-44 sm:h-52 w-full bg-[#F1EBE1] overflow-hidden relative">
                    {p.imageUrls && p.imageUrls.length > 0 ? (
                      <img
                        src={p.imageUrls[0]}
                        alt={p.title}
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                       loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={40} className="text-[#C4BAA8] opacity-60" />
                      </div>
                    )}
                    {p.category && (
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white text-[#2B4C3B] text-[10px] sm:text-[11px] font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#E8E3D2] shadow-sm">
                        {p.category}
                      </div>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                        <span className="bg-[#C25939] text-white font-black px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm shadow-lg rotate-[-10deg]">
                          HABIS
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-black text-[#1C241E] truncate group-hover:text-[#2B4C3B] transition-colors mb-1">{p.title}</h3>
                    <div className="flex items-end justify-between mt-2.5 sm:mt-3">
                      <div>
                        <p className="text-lg sm:text-xl font-black text-[#C25939] leading-none">Rp {p.price?.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] sm:text-[11px] text-[#7A8678] font-semibold mt-0.5">/{p.unit}</p>
                      </div>
                      <span className={`text-[10px] sm:text-[11px] font-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl ${
                        p.stock > 0 ? "bg-[#EEF2E6] text-[#2B4C3B]" : "bg-gray-200 text-gray-500"
                      }`}>
                        Stok {p.stock} {p.unit}
                      </span>
                    </div>
                    {p.minOrder && p.minOrder > 1 && (
                      <p className="text-[10px] text-[#7A8678] font-semibold mt-1.5 sm:mt-2">Min. order {p.minOrder} {p.unit}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Pagination Controls ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-[#E8E3D2]">
              <p className="text-xs sm:text-sm font-semibold text-[#7A8678]">
                Menampilkan <span className="font-bold text-[#1C241E]">{products.length}</span> dari <span className="font-bold text-[#1C241E]">{totalProducts}</span> Produk
              </p>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    if (currentPage > 1 && !gridLoading) {
                      const prev = currentPage - 1;
                      setCurrentPage(prev);
                      loadData(prev, false);
                      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  disabled={currentPage === 1 || gridLoading}
                  className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-[#E8E3D2] text-[#1C241E] font-bold text-xs sm:text-sm hover:bg-[#F8F6F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          if (pageNum !== currentPage && !gridLoading) {
                            setCurrentPage(pageNum);
                            loadData(pageNum, false);
                            document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        disabled={gridLoading}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-xs transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#2B4C3B] text-white shadow-sm scale-105' 
                            : 'bg-white text-[#7A8678] hover:text-[#1C241E] border border-[#E8E3D2]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    if (currentPage < totalPages && !gridLoading) {
                      const next = currentPage + 1;
                      setCurrentPage(next);
                      loadData(next, false);
                      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  disabled={currentPage === totalPages || gridLoading}
                  className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-[#E8E3D2] text-[#1C241E] font-bold text-xs sm:text-sm hover:bg-[#F8F6F0] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
