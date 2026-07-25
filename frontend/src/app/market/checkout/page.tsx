"use client";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";

import { useState, useEffect } from "react";
import { CheckCircle, ShieldCheck, MapPin, Truck, Store, ChevronLeft, Building2, QrCode, HandCoins, Calendar, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateWheelPicker } from "@/components/ui/date-wheel-picker";
import { Logo } from "idn-finlogos/react";

const API_BASE = getApiBaseUrl();

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingFee, setShippingFee] = useState(45000);
  const [shippingMethod, setShippingMethod] = useState("kargo");
  const [paymentMethod, setPaymentMethod] = useState("bca");
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [requestedArrivalDate, setRequestedArrivalDate] = useState<Date | null>(null);
  const [markerCoords, setMarkerCoords] = useState<{ lng: number; lat: number }>({ lng: 110.37, lat: -7.76 });
  const [session, setSession] = useState<any>(null);
  const [addressText, setAddressText] = useState("Jl. Pertanian Raya No. 42, Sleman, DI Yogyakarta");
  const [openPaymentCategory, setOpenPaymentCategory] = useState<string>("Virtual Account");
  usePageLoading(loading);

  useEffect(() => {
    const dates = [];
    const start = new Date();
    start.setDate(start.getDate() + 3);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    setAvailableDates(dates);
    setRequestedArrivalDate(dates[0]);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const sessionStr = localStorage.getItem("farmpro_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        setSession(session);
        try {
          const res = await fetchApi(`${API_BASE}/api/cart/${session.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.length === 0) {
              router.push("/market/cart");
            } else {
              setCart(data);
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        router.push("/market/cart");
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  // Reverse Geocoding
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setAddressText("Mendeteksi lokasi...");
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${markerCoords.lat}&lon=${markerCoords.lng}&format=json`, {
          headers: { "User-Agent": "FarmPro-B2B-App" }
        });
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(", ");
          setAddressText(parts.slice(0, 4).join(", "));
        } else {
          setAddressText("Lokasi tidak dikenali");
        }
      } catch (e) {
        setAddressText("Gagal mendeteksi lokasi");
      }
    };
    
    const timeout = setTimeout(fetchAddress, 500);
    return () => clearTimeout(timeout);
  }, [markerCoords.lat, markerCoords.lng]);

  const handleCheckout = async () => {
    if (isSubmitting || cart.length === 0) return;
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);

    setIsSubmitting(true);

    // Assuming all items belong to same seller for MVP
    const sellerId = cart[0].product?.sellerId || cart[0].sellerId;

    try {
      await fetchApi(`${API_BASE}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: session.id,
          sellerId: sellerId,
          shippingAddress: addressText,
          shippingMethod,
          paymentMethod,
          shippingFee,
          platformFee: 2500,
          items: cart.map(item => ({ 
            productId: item.product?.id || item.productId, 
            quantity: item.quantity || item.orderQuantity || 1, 
            price: item.product?.price || item.price || 0
          })),
          requestedArrivalDate: requestedArrivalDate ? requestedArrivalDate.toISOString() : undefined,
        }),
      });
      
      // Clear DB cart
      try {
        await fetchApi(`${API_BASE}/api/cart/${session.id}`, { method: 'DELETE' });
      } catch (e) {}

      router.push("/market/checkout/success");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const subtotal = cart.reduce((s, i) => s + (i.product?.price || i.price || 0) * (i.quantity || i.orderQuantity || 1), 0);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <div className="sticky top-0 z-40 px-4 pt-4">
        <div className="max-w-7xl mx-auto bg-white border border-[#E8E3D2] rounded-2xl shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-14 flex items-center justify-between px-4 md:px-8 lg:px-12">
          <div className="w-40 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-32 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
          <div className="w-24" />
        </div>
      </div>
      <main className="max-w-7xl mx-auto pt-6 pb-24 flex flex-col lg:flex-row gap-6 px-4 md:px-8 lg:px-12">
        <div className="flex-1 flex flex-col md:flex-row lg:flex-col gap-6">
          <div className="flex-1 space-y-6">
            {[1, 2].map(i => (
              <section key={i} className="bg-white border border-[#E8E3D2] rounded-[1.5rem] p-6">
                <div className="w-48 h-5 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-4" />
                <div className="w-full h-32 rounded-2xl skeleton-shimmer bg-[#E8E3D2]" />
              </section>
            ))}
          </div>
          <div className="flex-1 space-y-6">
            <section className="bg-white border border-[#E8E3D2] rounded-[1.5rem] p-6 h-full">
              <div className="w-48 h-5 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-4" />
              <div className="w-full h-64 rounded-2xl skeleton-shimmer bg-[#E8E3D2]" />
            </section>
          </div>
        </div>
        <div className="w-full lg:w-[22rem]">
          <div className="bg-white border border-[#E8E3D2] rounded-2xl p-6">
            <div className="w-3/4 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2] mb-5" />
            <div className="space-y-4 mb-6">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 rounded-md skeleton-shimmer" />
                    <div className="w-2/3 h-3 rounded-md skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E8E3D2] pt-4 space-y-3">
              <div className="w-full h-4 rounded-md skeleton-shimmer" />
              <div className="w-full h-4 rounded-md skeleton-shimmer" />
              <div className="w-full h-4 rounded-md skeleton-shimmer" />
              <div className="w-full h-8 rounded-md skeleton-shimmer mt-4" />
              <div className="w-full h-14 rounded-2xl skeleton-shimmer mt-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]" >
      <MarketplaceNavbar />
      {/* ── Breadcrumb ── */}
      <main className="max-w-7xl mx-auto pt-6 pb-24 flex flex-col lg:flex-row gap-6 px-4 md:px-8 lg:px-12">
        {/* Left: Forms */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          
          <div className="col-span-1 flex flex-col gap-6">
            <div className="mb-2">
              <button onClick={() => router.push("/market/cart")} className="inline-flex items-center gap-2 bg-white border border-[#E8E3D2] hover:bg-[#F8F6F0] text-[#1C241E] hover:text-[#2B4C3B] font-bold text-sm px-4 py-2 rounded-full transition-colors shadow-sm">
                <ChevronLeft size={18} /> Kembali
              </button>
            </div>

            {/* Address */}
          <section className="flex-1 bg-white border border-[#E8E3D2] rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
            <h3 className="text-sm font-black text-[#5A635B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-[#C25939]" /> Alamat Pengiriman
            </h3>
            <div className="bg-gradient-to-br from-[#1C241E] via-[#2B4C3B] to-[#3B664C] rounded-2xl p-4 border-none shadow-md">
              <p className="font-black text-white mb-1">{session?.fullName || "Nama Pembeli"}</p>
              <p className="text-sm text-[#E8E3D2] mb-3">{addressText}</p>
              <div className="h-48 rounded-xl overflow-hidden border border-[#E8E3D2] relative z-0">
                <Map 
                  theme="light" 
                  center={[markerCoords.lng, markerCoords.lat]} 
                  zoom={15} 
                  className="w-full h-full"
                >
                  <MapControls 
                    showLocate
                    autoLocate 
                    onLocate={(coords) => setMarkerCoords({ lng: coords.longitude, lat: coords.latitude })} 
                  />
                  <MapMarker 
                    longitude={markerCoords.lng} 
                    latitude={markerCoords.lat}
                    draggable
                    onDragEnd={(coords) => setMarkerCoords({ lng: coords.lng, lat: coords.lat })}
                  >
                    <MarkerContent>
                      <div className="relative h-6 w-6 rounded-full border-2 border-white bg-[#C25939] shadow-lg flex items-center justify-center cursor-move">
                        <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>
              </div>
            </div>
          </section>
          </div>

          <div className="col-span-1 flex flex-col gap-6">
            <div className="mb-2 hidden md:block invisible">
              <button className="px-4 py-2 cursor-default">Back</button>
            </div>

          {/* Shipping */}
          <section className="bg-white border border-[#E8E3D2] rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
            <h3 className="text-sm font-black text-[#5A635B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck size={16} className="text-[#767C15]" /> Metode Pengiriman
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Kargo Express", sub: "2-3 Hari • Rp 45.000", id: "kargo", fee: 45000 },
                { label: "Lokal Kurir", sub: "Same Day • Rp 15.000", id: "lokal", fee: 15000 },
              ].map(s => (
                <label key={s.id} className="cursor-pointer group">
                  <input 
                    type="radio" 
                    name="shipping" 
                    className="sr-only" 
                    checked={shippingFee === s.fee}
                    onChange={() => {
                      setShippingFee(s.fee);
                      setShippingMethod(s.id);
                    }}
                  />
                  <div className="rounded-2xl border-2 border-[#E8E3D2] p-4 group-has-[:checked]:border-transparent group-has-[:checked]:bg-gradient-to-r group-has-[:checked]:from-[#2B4C3B] group-has-[:checked]:to-[#4A7C59] group-has-[:checked]:shadow-md transition-all text-center">
                    <p className="font-black text-[#1C241E] group-has-[:checked]:text-white text-sm transition-colors">{s.label}</p>
                    <p className="text-[11px] text-[#7A8678] group-has-[:checked]:text-[#E8E3D2] mt-1 transition-colors">{s.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Arrival Date */}
          <section className="flex-1 bg-white border border-[#E8E3D2] rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
            <h3 className="text-sm font-black text-[#5A635B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-[#3B664C]" /> Tanggal Kedatangan (Estimasi)
            </h3>
            <div className="mt-2">
              <Popover>
                <PopoverTrigger className="w-full flex items-center justify-between bg-gradient-to-r from-[#2B4C3B] to-[#4A7C59] p-4 font-bold text-white border-none rounded-2xl shadow-md transition-all focus:outline-none hover:opacity-95">
                  <span>
                    {requestedArrivalDate 
                      ? requestedArrivalDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
                      : "Pilih Tanggal Kedatangan"}
                  </span>
                  <Calendar size={20} className="text-white" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-white rounded-[2rem] border border-[#E8E3D2] shadow-[0_20px_60px_-15px_rgba(43,76,59,0.2)]">
                  <div className="mb-4 text-center">
                    <h4 className="font-black text-[#1C241E]">Pilih Tanggal Kedatangan</h4>
                    <p className="text-xs text-[#7A8678] font-medium">Geser untuk memilih</p>
                  </div>
                  <DateWheelPicker
                    value={requestedArrivalDate || new Date()}
                    onChange={(date) => setRequestedArrivalDate(date)}
                    minYear={new Date().getFullYear()}
                    maxYear={new Date().getFullYear() + 2}
                    size="sm"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-[#7A8678] font-medium bg-[#F8F6F0] p-3 rounded-xl border border-[#E8E3D2]/60 flex gap-2 items-start mt-4">
              <span className="text-[#C25939] font-black">*</span>
              Sesuai standar B2B, estimasi pengiriman paling cepat adalah 3 hari dari waktu pemesanan untuk persiapan armada logistik dan *quality control* komoditas.
            </p>
          </section>
          </div>

          {/* Payment Method - Spans 2 columns on Tablet */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <section className="bg-white border border-[#E8E3D2] rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]">
              <h3 className="text-sm font-black text-[#5A635B] uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#2B4C3B]" /> Metode Pembayaran
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Virtual Account",
                    options: [
                      { label: "BCA Virtual Account", tag: "Bank", tagColor: "bg-blue-100 text-blue-700", id: "bca", slug: "bca" },
                      { label: "Mandiri Virtual Account", tag: "Bank", tagColor: "bg-amber-100 text-amber-700", id: "mandiri", slug: "mandiri" },
                      { label: "BRI Virtual Account", tag: "Bank", tagColor: "bg-blue-100 text-blue-700", id: "bri", slug: "bri" },
                      { label: "BNI Virtual Account", tag: "Bank", tagColor: "bg-orange-100 text-orange-700", id: "bni", slug: "bni" },
                    ]
                  },
                  {
                    title: "E-Money",
                    options: [
                      { label: "GoPay", tag: "E-Wallet", tagColor: "bg-emerald-100 text-emerald-700", id: "gopay", slug: "gopay" },
                      { label: "OVO", tag: "E-Wallet", tagColor: "bg-purple-100 text-purple-700", id: "ovo", slug: "ovo" },
                      { label: "ShopeePay", tag: "E-Wallet", tagColor: "bg-orange-100 text-orange-700", id: "shopeepay", slug: "shopeepay" },
                    ]
                  },
                  {
                    title: "Credit & Debit Card",
                    options: [
                      { label: "Visa", tag: "Card", tagColor: "bg-slate-100 text-slate-700", id: "visa", slug: "visa" },
                      { label: "Mastercard", tag: "Card", tagColor: "bg-slate-100 text-slate-700", id: "mastercard", slug: "mastercard" },
                      { label: "JCB", tag: "Card", tagColor: "bg-slate-100 text-slate-700", id: "jcb", slug: "jcb" },
                      { label: "GPN", tag: "Card", tagColor: "bg-slate-100 text-slate-700", id: "gpn", slug: "gpn" },
                    ]
                  },
                  {
                    title: "QRIS",
                    options: [
                      { label: "QRIS", tag: "Scan QR", tagColor: "bg-red-100 text-red-700", id: "qris", slug: "qris" },
                    ]
                  }
                ].map((category, catIdx) => (
                  <div key={catIdx} className="border border-[#E8E3D2] rounded-2xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setOpenPaymentCategory(openPaymentCategory === category.title ? "" : category.title)}
                      className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F8F6F0] transition-colors font-bold text-[#1C241E]"
                    >
                      {category.title}
                      {openPaymentCategory === category.title ? <ChevronUp size={18} className="text-[#5A635B]" /> : <ChevronDown size={18} className="text-[#5A635B]" />}
                    </button>
                    <AnimatePresence>
                      {openPaymentCategory === category.title && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 bg-white"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F8F6F0]">
                            {category.options.map(pm => (
                              <label key={pm.id} className="group flex items-center gap-3 p-3 border-2 border-[#E8E3D2] rounded-xl cursor-pointer hover:border-[#2B4C3B]/40 has-[:checked]:border-transparent has-[:checked]:bg-gradient-to-r has-[:checked]:from-[#2B4C3B] has-[:checked]:to-[#4A7C59] has-[:checked]:shadow-md transition-all">
                                <input 
                                  type="radio" 
                                  name="payment" 
                                  className="w-4 h-4 accent-[#2B4C3B] group-has-[:checked]:accent-white shrink-0" 
                                  checked={paymentMethod === pm.id}
                                  onChange={() => setPaymentMethod(pm.id)} 
                                />
                                <div className="w-12 h-8 rounded bg-white flex items-center justify-center border border-[#E8E3D2] p-1 overflow-hidden shadow-sm shrink-0">
                                  {pm.slug && <Logo slug={pm.slug} className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />}
                                </div>
                                <span className="font-bold text-[#1C241E] group-has-[:checked]:text-white text-sm truncate transition-colors">{pm.label}</span>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="w-full lg:w-[22rem]">
          <div className="bg-white border border-[#E8E3D2] rounded-2xl p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)] lg:sticky lg:top-20">
            <h3 className="font-black text-lg text-[#1C241E] mb-5">Ringkasan Pesanan</h3>
            <div className="space-y-4 mb-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F1EBE1] overflow-hidden shrink-0">
                    {item.product?.imageUrls && item.product.imageUrls.length > 0
                      ? <img src={item.product.imageUrls[0]} className="w-full h-full object-cover" decoding="async"  loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><Store size={18} className="text-[#A4B0A7]" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#1C241E] truncate">{item.product?.title || item.title}</p>
                    <p className="text-xs text-[#7A8678] mt-0.5">{item.quantity || item.orderQuantity || 1}× Rp {(item.product?.price || item.price || 0)?.toLocaleString()}</p>
                  </div>
                  <p className="font-black text-sm text-[#C25939] shrink-0">Rp {((item.product?.price || item.price || 0) * (item.quantity || item.orderQuantity || 1))?.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E8E3D2] pt-4 space-y-3">
              {[
                { label: "Subtotal", val: subtotal },
                { label: "Ongkir", val: shippingFee },
                { label: "Biaya Platform", val: 2500 },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-[#7A8678] font-bold">{row.label}</span>
                  <span className="font-black text-[#1C241E]">Rp {row.val.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-[#E8E3D2] mt-2">
                <span className="font-black text-[#1C241E]">Total Pembayaran</span>
                <span className="text-xl font-black text-[#F5990D]">
                  Rp {(subtotal + shippingFee + 2500).toLocaleString()}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0}
                className={`w-full mt-4 py-4 font-black text-white rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  isSubmitting || cart.length === 0
                    ? 'bg-gray-400 opacity-60 cursor-not-allowed shadow-none'
                    : 'bg-pranata hover:bg-[#1E362A] shadow-[0_8px_20px_-6px_rgba(43,76,59,0.5)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={19} className="animate-spin text-white" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={19} />
                    <span>Bayar Sekarang</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
