"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import { Footer } from "@/components/layout/Footer";

import { useState, useEffect } from "react";
import { Store, Package, Plus, CheckCircle, Image as ImageIcon, Info, X, Edit2, Trash2, Sparkles, ChevronRight, ChevronLeft, Crown, Star, AlertTriangle, Loader2, ShieldCheck, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading, useGlobalLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

const getGradeStyle = (gradeStr: string) => {
  const g = (gradeStr || "").toLowerCase().trim();
  if (g === "premium") {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", icon: Crown, iconColor: "text-[#F5990D]" };
  } else if (g === "grade a" || g === "a" || g.endsWith(" a")) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300", icon: Star, iconColor: "text-emerald-500" };
  } else if (g === "grade b" || g === "b" || g.endsWith(" b")) {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", icon: CheckCircle, iconColor: "text-blue-500" };
  }
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", icon: AlertTriangle, iconColor: "text-red-500" };
};

export default function StoreDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(true);
  
  // Pagination State (20 products per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const LIMIT = 20;

  // Custom Delete Modal State
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  usePageLoading(initialLoading);
  const router = useRouter();
  const { navigateTo } = useGlobalLoading();

  useEffect(() => {
    loadData(1, true);
  }, []);

  const loadData = async (pageToLoad = 1, isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    }
    setGridLoading(true);
    
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(sessionStr);
    
    if (session.role === 'BUYER') {
      navigateTo("/market");
      return;
    }
    
    setProfile(session);

    const API_BASE = getApiBaseUrl();

    try {
      const prodRes = await fetchApi(`${API_BASE}/api/products/seller/${session.id}?page=${pageToLoad}&limit=${LIMIT}`);
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
      
      const ordRes = await fetchApi(`${API_BASE}/api/orders/PRODUCER/${session.id}`);
      const oData = await ordRes.json();
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
      setGridLoading(false);
    }
  };

  const getGradeStyle = (grade: string | null) => {
    if (!grade) return null;
    const g = grade.toLowerCase();
    if (g === "premium") return { bg: "bg-gradient-to-r from-amber-200 to-yellow-400", text: "text-amber-900", border: "border-amber-300", icon: Crown };
    if (g.includes("a")) return { bg: "bg-gradient-to-r from-emerald-100 to-emerald-300", text: "text-emerald-900", border: "border-emerald-400", icon: Star };
    if (g.includes("b")) return { bg: "bg-gradient-to-r from-cyan-100 to-cyan-300", text: "text-cyan-900", border: "border-cyan-400", icon: CheckCircle };
    if (g.includes("c")) return { bg: "bg-gradient-to-r from-orange-100 to-orange-300", text: "text-orange-900", border: "border-orange-400", icon: Info };
    return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", icon: Info };
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || isDeleting) return;
    setIsDeleting(true);
    
    const API_BASE = getApiBaseUrl();
    try {
      await fetchApi(`${API_BASE}/api/products/${productToDelete.id}`, { method: "DELETE" });
      setProductToDelete(null);
      await loadData();
    } catch (error) {
      alert("Gagal menghapus produk.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (initialLoading) return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] pt-4 sm:pt-10">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-32 px-3.5 sm:px-6 md:px-8 lg:px-12">
        <div className="bg-pranata rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="space-y-2 w-full sm:w-auto">
            <div className="w-48 sm:w-64 h-8 sm:h-10 rounded-xl skeleton-shimmer bg-[#3A6B49]" />
            <div className="w-full sm:w-96 h-4 sm:h-5 rounded-md skeleton-shimmer bg-[#3A6B49]" />
          </div>
          <div className="w-full sm:w-40 h-11 sm:h-12 rounded-xl skeleton-shimmer bg-[#3A6B49]" />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="w-40 sm:w-48 h-7 sm:h-8 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-[#DDE2D6] rounded-2xl sm:rounded-3xl p-4 sm:p-5">
                <div className="h-36 sm:h-40 w-full rounded-xl sm:rounded-2xl skeleton-shimmer bg-[#E8E3D2] mb-3 sm:mb-4" />
                <div className="flex justify-between items-start mb-2">
                  <div className="w-1/2 h-5 sm:h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
                  <div className="w-16 h-5 sm:h-6 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
                </div>
                <div className="w-full h-3 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-3" />
                <div className="w-1/3 h-7 sm:h-8 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] flex flex-col justify-between" >
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-3.5 sm:px-6 md:px-8 lg:px-12 w-full flex-1 pt-4 sm:pt-6 mb-8 md:mb-12">
        
        {/* Header */}
        <div className="bg-pranata rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-[#F8F6F0] shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <Store className="text-[#F5990D] shrink-0" size={26} />
              <span>Toko Saya</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#DDE2D6] font-medium">
              Kelola daftar produk dan pesanan masuk secara langsung tanpa perantara.
            </p>
          </div>
          
          <button 
            onClick={() => { router.push("/hub/store/new") }}
            className="w-full sm:w-auto bg-[#F5990D] hover:bg-[#C25939] text-white px-5 py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all text-xs sm:text-sm active:scale-95 shrink-0"
          >
            <Plus size={18} /> <span>Tambah Produk</span>
          </button>
        </div>

        {/* Content Tabs */}
        <div id="products-section" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-28">
          
          {/* Main List */}
          <h2 className="text-xl sm:text-2xl font-black text-[#2B4C3B]">
            Daftar Produk Aktif
          </h2>
          {gridLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.length === 0 && <p className="text-[#5A635B] text-sm">Belum ada produk aktif.</p>}
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-[#DDE2D6] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-44 sm:h-40 w-full rounded-xl sm:rounded-2xl bg-gray-100 mb-3 sm:mb-4 overflow-hidden">
                      {p.imageUrls && p.imageUrls.length > 0 ? (
                        <img src={p.imageUrls[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"  loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={36} /></div>
                      )}
                    </div>
                    <div className="flex flex-col items-start w-full">
                      <h3 className="text-base sm:text-lg font-black text-[#1C241E] line-clamp-2 leading-snug mb-2 pr-1">{p.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <div className="bg-[#F8F6F0] px-2 py-0.5 sm:py-1 rounded-lg">
                          <span className="text-[9px] sm:text-[10px] font-bold text-[#5A635B] uppercase tracking-wider">{p.category || "Produk"}</span>
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
                            <span className={`${style.bg} ${style.text} border ${style.border} px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs`}>
                              <GradeIcon size={10} className={style.iconColor} fill="currentColor" />
                              {p.grade}
                            </span>
                          );
                        })()}
                      </div>

                      {p.description && <p className="text-xs text-[#5A635B] line-clamp-2 mb-3 leading-relaxed">{p.description}</p>}
                    </div>
                  </div>

                  <div className="w-full pt-3 mt-2 border-t border-[#E8E3D2]/50 flex items-end justify-between">
                    <div>
                      <p className="font-black text-[#C25939] text-lg sm:text-xl leading-none mb-1">Rp {p.price.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs font-bold text-[#2B4C3B]">Stok: {p.stock} {p.unit}</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <button onClick={() => router.push(`/hub/store/edit/${p.id}`)} className="p-2 bg-[#F8F6F0] text-[#5A635B] rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors active:scale-95" title="Edit Produk">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setProductToDelete(p)} className="p-2 bg-[#F8F6F0] text-[#5A635B] rounded-full hover:bg-red-100 hover:text-red-700 transition-colors active:scale-95" title="Hapus Produk">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls (20 Items Per Page) */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E8E3D2]/60">
                <p className="text-xs sm:text-sm font-bold text-[#7A8678]">
                  Menampilkan <span className="text-[#1C241E] font-black">{((currentPage - 1) * LIMIT) + 1} - {Math.min(currentPage * LIMIT, totalProducts)}</span> dari <span className="text-[#1C241E] font-black">{totalProducts}</span> produk
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
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
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
                    className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#2B4C3B] hover:bg-[#20392C] text-white font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Custom Designed Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setProductToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-[#E8E3D2] shadow-2xl z-10 space-y-4 sm:space-y-6 text-center"
            >
              <button 
                onClick={() => !isDeleting && setProductToDelete(null)}
                disabled={isDeleting}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#F8F6F0] transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={28} />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#1C241E] mb-2">Hapus Produk Ini?</h3>
                <p className="text-xs sm:text-sm font-medium text-[#5A635B] leading-relaxed">
                  Apakah Anda yakin ingin menghapus <span className="font-bold text-[#1C241E]">"{productToDelete.title}"</span>? Produk ini akan secara permanen dihapus dari toko Anda.
                </p>
              </div>

              <div className="flex gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-[#DDE2D6] text-[#1C241E] font-bold text-xs sm:text-base hover:bg-[#F8F6F0] transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-base transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Hapus Produk</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
