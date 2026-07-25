"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect } from "react";
import { Store, Package, Plus, CheckCircle, Image as ImageIcon, Info, X, Edit2, Trash2, Sparkles, ChevronRight, Crown, Star, AlertTriangle, Loader2, ShieldCheck, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";

const getGradeStyle = (gradeStr: string) => {
  const g = (gradeStr || "").toLowerCase().trim();
  if (g === "premium") {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", icon: Crown, iconColor: "text-[#F5990D]" };
  } else if (g === "grade a" || g === "a" || g.endsWith(" a")) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300", icon: Star, iconColor: "text-emerald-500" };
  } else if (g === "grade b" || g === "b" || g.endsWith(" b")) {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300", icon: CheckCircle, iconColor: "text-blue-500" };
  } else if (g === "grade c" || g === "c" || g.endsWith(" c") || g.includes("tidak layak")) {
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", icon: AlertTriangle, iconColor: "text-red-500" };
  }
  return null;
};

export default function StoreDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Delete Modal State
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  usePageLoading(loading);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(sessionStr);
    
    if (session.role === 'BUYER') {
      router.push("/market");
      return;
    }
    
    setProfile(session);

    const API_BASE = getApiBaseUrl();

    try {
      const prodRes = await fetchApi(`${API_BASE}/api/products/seller/${session.id}`);
      const pData = await prodRes.json();
      setProducts(Array.isArray(pData) ? pData : []);
      
      const ordRes = await fetchApi(`${API_BASE}/api/orders/PRODUCER/${session.id}`);
      const oData = await ordRes.json();
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load store data");
    } finally {
      setLoading(false);
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

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 sm:p-10 text-[#1C241E]">
      <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 md:px-8 lg:px-12">
        <div className="bg-pranata rounded-3xl p-8 shadow-xl flex justify-between items-center">
          <div className="space-y-2">
            <div className="w-64 h-10 rounded-xl skeleton-shimmer bg-[#3A6B49]" />
            <div className="w-96 h-5 rounded-md skeleton-shimmer bg-[#3A6B49] hidden md:block" />
          </div>
          <div className="w-40 h-12 rounded-xl skeleton-shimmer bg-[#3A6B49]" />
        </div>
        <div className="space-y-6">
          <div className="w-48 h-8 rounded-xl skeleton-shimmer bg-[#E8E3D2]" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-[#DDE2D6] rounded-3xl p-5">
                <div className="h-40 w-full rounded-2xl skeleton-shimmer bg-[#E8E3D2] mb-4" />
                <div className="flex justify-between items-start mb-2">
                  <div className="w-1/2 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
                  <div className="w-16 h-6 rounded-full skeleton-shimmer bg-[#E8E3D2]" />
                </div>
                <div className="w-full h-3 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-3" />
                <div className="w-1/3 h-8 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-6 sm:p-10 text-[#1C241E]" >
      <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="bg-pranata rounded-3xl p-8 text-[#F8F6F0] shadow-xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Store className="text-[#F5990D]" size={32} />
              My Farm Store
            </h1>
            <p className="text-[#DDE2D6] font-medium">
              Manage your listings and incoming orders without middlemen.
            </p>
          </div>
          
          <button 
            onClick={() => { router.push("/hub/store/new") }}
            className="bg-[#F5990D] hover:bg-[#C25939] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        {/* Content Tabs */}
        <div className="space-y-6">
          
          {/* Main List */}
          <h2 className="text-2xl font-black text-[#2B4C3B]">
            My Active Listings
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length === 0 && <p className="text-[#5A635B]">No active products.</p>}
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-[#DDE2D6] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                  <div className="h-40 w-full rounded-2xl bg-gray-100 mb-4 overflow-hidden">
                    {p.imageUrls && p.imageUrls.length > 0 ? (
                      <img src={p.imageUrls[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"  loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={40} /></div>
                    )}
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <h3 className="text-lg font-black text-[#1C241E] line-clamp-2 leading-tight mb-2 pr-2">{p.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="bg-[#F8F6F0] px-2 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-[#5A635B] uppercase tracking-wider">{p.category || "Produk"}</span>
                      </div>
                      {p.grade && (() => {
                        const style = getGradeStyle(p.grade);
                        if (!style) return null;
                        const GradeIcon = style.icon;
                        return (
                          <span className={`${style.bg} ${style.text} border ${style.border} px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs`}>
                            <GradeIcon size={10} className={(style as any).iconColor} fill="currentColor" />
                            {p.grade}
                          </span>
                        );
                      })()}
                    </div>

                    {p.description && <p className="text-xs text-[#5A635B] line-clamp-2 mb-3">{p.description}</p>}

                    <div className="mt-auto w-full pt-3 border-t border-[#E8E3D2]/50 flex items-end justify-between">
                      <div>
                        <p className="font-black text-[#C25939] text-xl leading-none mb-1">Rp {p.price.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-[#2B4C3B]">Stok: {p.stock} {p.unit}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/hub/store/edit/${p.id}`)} className="p-2 bg-[#F8F6F0] text-[#5A635B] rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setProductToDelete(p)} className="p-2 bg-[#F8F6F0] text-[#5A635B] rounded-full hover:bg-red-100 hover:text-red-700 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Custom Designed Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-8 border border-[#E8E3D2] shadow-2xl z-10 space-y-6 text-center"
            >
              <button 
                onClick={() => !isDeleting && setProductToDelete(null)}
                disabled={isDeleting}
                className="absolute top-6 right-6 p-2 rounded-full text-[#7A8678] hover:text-[#1C241E] hover:bg-[#F8F6F0] transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={32} />
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#1C241E] mb-2">Hapus Produk Ini?</h3>
                <p className="text-sm font-medium text-[#5A635B] leading-relaxed">
                  Apakah Anda yakin ingin menghapus <span className="font-bold text-[#1C241E]">"{productToDelete.title}"</span>? Produk ini akan secara permanen dihapus dari toko Anda.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-[#DDE2D6] text-[#1C241E] font-bold hover:bg-[#F8F6F0] transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
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
    </div>
  );
}
