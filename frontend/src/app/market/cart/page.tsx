"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import React, { useState, useEffect, Suspense } from "react";
import { Search, ShoppingCart, Menu, Zap, Trash2, Package, ChevronLeft, Clock, CheckCircle, Truck, Store, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter, useSearchParams } from "next/navigation";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";

const API_BASE = getApiBaseUrl();

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[#FFF3E0] text-[#C25939]",
  PAID: "bg-[#EEF2E6] text-[#2B4C3B]",
  SHIPPED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-[#EEF2E6] text-[#2B4C3B]",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Dibayar - Diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<"cart" | "orders">(
    searchParams.get("tab") === "orders" ? "orders" : "cart"
  );

  const [loading, setLoading] = useState(true);
  
  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  
  usePageLoading(loading);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders" || tab === "cart") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sessionStr = localStorage.getItem("farmpro_session");
      if (!sessionStr) { router.push("/login"); return; }
      
      const session = JSON.parse(sessionStr);
      setProfile(session);

      // Load cart
      try {
        const cartRes = await fetchApi(`${API_BASE}/api/cart/${session.id}`);
        if (cartRes.ok) {
          setCart(await cartRes.json());
        }
      } catch (err) {
        console.error(err);
      }

      // Load orders for this user (acting as buyer)
      try {
        const res = await fetchApi(`${API_BASE}/api/orders/BUYER/${session.id}`);
        if (res.ok) {
          setOrders(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Update URL silently without reload
  const handleTabChange = (tab: "cart" | "orders") => {
    setActiveTab(tab);
    router.replace(`/market/cart?tab=${tab}`, { scroll: false });
  };

  // --- Cart Actions ---
  const updateQty = async (id: string, delta: number) => {
    const itemToUpdate = cart.find(item => item.id === id);
    if (!itemToUpdate) return;
    
    const stock = itemToUpdate.product?.stock || 0;
    const currentQ = itemToUpdate.quantity || 1;
    const minQ = 1;
    const newQ = Math.max(minQ, Math.min(stock, currentQ + delta));
    
    // Optimistic update
    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: newQ };
      }
      return item;
    });
    setCart(newCart);

    try {
      if (profile) {
        await fetchApi(`${API_BASE}/api/cart/${profile.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: itemToUpdate.productId, quantity: newQ })
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (id: string) => {
    const itemToRemove = cart.find(item => item.id === id);
    if (!itemToRemove) return;

    setCart(cart.filter(item => item.id !== id));
    try {
      if (profile) {
        await fetchApi(`${API_BASE}/api/cart/${profile.id}/${itemToRemove.productId}`, {
          method: 'DELETE'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || item.orderQuantity || 1)), 0);
  const discount = subtotal > 100000 ? 5000 : 0;
  const total = subtotal - discount || 0;

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <div className="px-4 pt-4 md:px-8">
        <div className="bg-pranata rounded-[2rem] p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full skeleton-shimmer bg-[#3A6B49]" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="w-48 h-8 rounded-full skeleton-shimmer bg-[#3A6B49]" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full skeleton-shimmer bg-[#3A6B49]" />
            <div className="w-10 h-10 rounded-full skeleton-shimmer bg-[#3A6B49]" />
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto pt-12 md:pt-16 px-4 md:px-8 lg:px-12">
        <div className="w-48 h-12 rounded-xl skeleton-shimmer bg-[#E8E3D2] mb-6" />
        <div className="w-64 h-4 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-12" />
        <div className="flex flex-col gap-8">
          {[1, 2].map(i => (
            <div key={i} className="w-full h-32 rounded-[1.5rem] skeleton-shimmer bg-[#E8E3D2]" />
          ))}
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] font-sans pb-24 lg:pb-12" >
      
      {/* Segmented Control in Navbar Center */}
      <MarketplaceNavbar 
        centerContent={
          <div className="bg-[#E8E3D2]/80 p-1 rounded-full flex items-center gap-0.5 sm:gap-1 relative shadow-inner border border-[#E8E3D2] shrink-0">
            <button 
              onClick={() => handleTabChange('cart')} 
              className={`px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-extrabold transition-all duration-300 relative z-10 whitespace-nowrap ${
                activeTab === 'cart' ? 'text-[#2B4C3B]' : 'text-[#7A8678] hover:text-[#1C241E]'
              }`}
            >
              {activeTab === 'cart' && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full -z-10 shadow-xs" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
              )}
              <span>Keranjang</span>
            </button>
            <button 
              onClick={() => handleTabChange('orders')} 
              className={`px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-extrabold transition-all duration-300 relative z-10 whitespace-nowrap ${
                activeTab === 'orders' ? 'text-[#2B4C3B]' : 'text-[#7A8678] hover:text-[#1C241E]'
              }`}
            >
              {activeTab === 'orders' && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full -z-10 shadow-xs" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
              )}
              <span><span className="hidden sm:inline">Pesanan Saya</span><span className="sm:hidden">Pesanan</span></span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-6 md:pt-8 px-4 md:px-8 lg:px-12">
        
        <div className="mb-6 hidden sm:block">
          <button onClick={() => router.push("/market")} className="inline-flex items-center gap-2 bg-white border border-[#E8E3D2] hover:bg-[#F8F6F0] text-[#1C241E] hover:text-[#2B4C3B] font-bold text-sm px-4 py-2 rounded-full transition-colors shadow-sm">
            <ChevronLeft size={18} /> Back
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'cart' ? (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-4xl md:text-[3.5rem] font-black tracking-tight text-[#1C241E] mb-6">
                Keranjang
              </h1>

              {/* Stepper for Cart */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-[#1C241E] mb-12">
                <span className="text-[#1C241E]">1. Keranjang</span>
                <div className="w-8 sm:w-16 h-px bg-[#DDE2D6]"></div>
                <span className="text-[#A4B0A7] font-semibold">2. Checkout</span>
                <div className="w-8 sm:w-16 h-px bg-[#DDE2D6]"></div>
                <span className="text-[#A4B0A7] font-semibold">3. Pembayaran</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-[#DDE2D6] rounded-[2rem] bg-white max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                  <h3 className="text-xl font-black text-[#5A635B] mb-2">Keranjang Kosong</h3>
                  <p className="text-[#A4B0A7] text-sm font-medium mb-6">Belum ada produk yang kamu tambahkan.</p>
                  <button
                    onClick={() => router.push("/market")}
                    className="px-8 py-3.5 bg-pranata text-white font-black rounded-full hover:bg-[#1E362A] transition-colors shadow-lg"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 flex flex-col gap-8">
                    {cart.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-[#E8E3D2]">
                        <div className="w-32 h-32 rounded-[1.5rem] bg-[#F1EBE1] flex-shrink-0 overflow-hidden flex items-center justify-center text-5xl relative">
                          {item.product?.imageUrls && item.product.imageUrls.length > 0 ? (
                            <img src={item.product.imageUrls[0]} alt={item.product.title} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                          ) : (
                            <Package className="text-[#C4BAA8] opacity-60" size={40} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                              <h3 className="text-[22px] font-bold text-[#1C241E] mb-1 leading-tight tracking-tight">{item.product?.title}</h3>
                              <p className="text-[13px] font-semibold text-[#5A635B] mb-3 line-clamp-1">{item.product?.description || "Produk Pilihan Pranata"}</p>
                              <div className="flex items-center gap-2 text-[13px] font-bold text-[#A4B0A7]">
                                <span>Kategori <span className="text-[#1C241E]">{item.product?.category}</span></span>
                                <span className="text-[#DDE2D6]">/</span>
                                <span>Unit <span className="text-[#1C241E]">{item.product?.unit}</span></span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-[22px] font-bold text-[#1C241E]">Rp {(item.product?.price || 0).toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center border border-[#DDE2D6] rounded-xl px-2 py-1 bg-white">
                              <button 
                                onClick={() => updateQty(item.id, -1)} 
                                className="w-8 h-8 flex items-center justify-center text-[#5A635B] hover:text-[#2B4C3B] hover:bg-[#EEF2E6] active:scale-95 rounded-lg transition-all font-bold"
                              >-</button>
                              
                              <div className="w-8 h-6 relative overflow-hidden flex items-center justify-center">
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={item.quantity || item.orderQuantity || 1}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                                    className="font-bold text-[#1C241E] text-sm absolute"
                                  >
                                    {item.quantity || item.orderQuantity || 1}
                                  </motion.span>
                                </AnimatePresence>
                              </div>
                              
                              <button 
                                onClick={() => updateQty(item.id, 1)} 
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all font-bold ${
                                  (item.quantity || item.orderQuantity || 1) >= (item.product?.stock || 0) 
                                    ? "text-[#DDE2D6] cursor-not-allowed" 
                                    : "text-[#5A635B] hover:text-[#2B4C3B] hover:bg-[#EEF2E6] active:scale-95"
                                }`}
                                disabled={(item.quantity || item.orderQuantity || 1) >= (item.product?.stock || 0)}
                              >+</button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#A4B0A7]">Stok Tersedia: {item.product?.stock}</span>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="w-10 h-10 flex items-center justify-center text-[#A4B0A7] hover:text-[#C25939] hover:bg-red-50 border border-[#E8E3D2] bg-white rounded-xl active:scale-95 transition-all"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-[#F1EBE1] rounded-[2rem] p-8 shadow-[0_8px_32px_-16px_rgba(43,76,59,0.15)] sticky top-28">
                    <h2 className="text-xl font-bold text-[#1C241E] mb-8">Ringkasan Pesanan</h2>
                    
                    <div className="space-y-5 text-sm font-semibold mb-6">
                      <div className="flex justify-between items-center text-[#5A635B]">
                        <span>Sub Total</span>
                        <span className="text-[#1C241E] font-bold text-[15px]">Rp {subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center text-[#5A635B]">
                          <span>Diskon</span>
                          <span className="text-[#1C241E] font-bold text-[15px]">Rp {discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[#5A635B]">
                        <span>Pajak</span>
                        <span className="text-[#1C241E] font-bold text-[15px]">Rp 0</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5A635B]">
                        <span>Ongkos Kirim</span>
                        <span className="text-[#C25939] font-bold text-[15px]">Gratis</span>
                      </div>
                    </div>
                    
                    <div className="h-px bg-[#DDE2D6] mb-6"></div>
                    
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[#1C241E] font-bold">Total Keseluruhan</span>
                      <span className="text-[22px] font-bold text-[#2B4C3B]">Rp {total.toLocaleString()}</span>
                    </div>
                    
                    <button 
                      onClick={() => router.push("/market/checkout")}
                      className="w-full bg-[#1C241E] hover:bg-pranata text-white py-4 rounded-full font-bold transition-all shadow-lg shadow-[#1C241E]/20 hover:shadow-[#2B4C3B]/30 hover:-translate-y-0.5"
                    >
                      Lanjut ke Pembayaran
                    </button>
                    
                    <p className="text-center text-xs font-semibold text-[#5A635B] mt-6 flex justify-center items-center gap-1">
                      Estimasi Pengiriman pada <span className="text-[#1C241E] font-bold">Esok Hari</span>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12"
            >
              <h1 className="text-4xl md:text-[3.5rem] font-black tracking-tight text-[#1C241E] mb-10">
                Pesanan Saya
              </h1>

              {orders.length === 0 ? (
                <div className="bg-white border border-[#E8E3D2] rounded-[2rem] p-12 text-center shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)] mt-10">
                  <div className="w-20 h-20 bg-[#F1EBE1] rounded-full flex items-center justify-center mx-auto mb-5">
                    <Package size={32} className="text-[#A4B0A7]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1C241E] mb-2">Belum ada pesanan</h2>
                  <p className="text-[#5A635B] mb-6 font-medium">Kamu belum memiliki riwayat pesanan.</p>
                  <button
                    onClick={() => router.push("/market")}
                    className="px-6 py-3 bg-pranata text-white font-black rounded-2xl hover:bg-[#1E362A] transition-colors"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="bg-white border border-[#E8E3D2] rounded-[1.5rem] p-5 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4 border-b border-[#E8E3D2] pb-4">
                        <div>
                          <p className="text-xs font-bold text-[#7A8678] mb-1 flex items-center gap-1.5">
                            <Store size={14} className="text-[#A4B0A7]" />
                            Toko: {o.seller?.farmName || o.seller?.fullName}
                          </p>
                          <p className="text-[10px] text-[#A4B0A7] flex items-center gap-2">
                            <span className="font-bold text-[#1C241E]">Order #{o.id.substring(o.id.length - 8).toUpperCase()}</span>
                            <span>•</span>
                            <span>{new Date(o.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1.5 ${STATUS_COLORS[o.status]}`}>
                          {o.status === "PENDING" && <Clock size={12} />}
                          {o.status === "PAID" && <CheckCircle size={12} />}
                          {o.status === "SHIPPED" && <Truck size={12} />}
                          {o.status === "COMPLETED" && <CheckCircle size={12} />}
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-4">
                        {o.items.map((i: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl bg-[#F1EBE1] overflow-hidden shrink-0">
                              {i.product?.imageUrls && i.product.imageUrls.length > 0 ? (
                                <img src={i.product.imageUrls[0]} alt={i.product.title} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={20} className="text-[#C4BAA8]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-sm text-[#1C241E]">{i.product?.title || "Produk dihapus"}</h4>
                              <p className="text-xs font-semibold text-[#7A8678] mt-0.5">
                                {i.quantity} × Rp {i.priceAtTime?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Address */}
                      <div className="mt-4 pt-4 border-t border-[#E8E3D2] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-start gap-2 text-xs text-[#5A635B] bg-[#F8F6F0] p-3 rounded-xl border border-[#DDE2D6]">
                          <MapPin size={16} className="text-[#C25939] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#1C241E] mb-0.5">Alamat Pengiriman:</p>
                            <p>{o.buyer?.location || "Jl. Pertanian Raya No. 42, Sleman, DI Yogyakarta"}</p>
                          </div>
                        </div>
                        <div className="sm:text-right flex justify-between sm:block items-center">
                          <span className="text-xs font-bold text-[#5A635B] block mb-1">Total Belanja</span>
                          <span className="font-black text-xl text-[#C25939]">Rp {o.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function CombinedActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
        <div className="px-4 pt-4 md:px-8">
          <div className="bg-pranata rounded-[2rem] p-4 flex items-center justify-between shadow-md h-[88px]" />
        </div>
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
}
