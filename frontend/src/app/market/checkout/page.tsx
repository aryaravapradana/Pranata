"use client";
import { cn } from "@/lib/utils";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  ShieldCheck,
  MapPin,
  Truck,
  Store,
  ChevronLeft,
  Building2,
  QrCode,
  HandCoins,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { usePageLoading } from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";
import MarketplaceNavbar from "@/components/layout/MarketplaceNavbar";
import { PranataPayModal } from "@/components/modals/PranataPayModal";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@/components/ui/map";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateWheelPicker } from "@/components/ui/date-wheel-picker";
import { Logo } from "idn-finlogos/react";

const API_BASE = getApiBaseUrl();


export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] =
    useState(true);
  const [cart, setCart] = useState<any[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [shippingFee, setShippingFee] =
    useState(45000);
  const [shippingMethod, setShippingMethod] =
    useState("kargo");
  const [paymentMethod, setPaymentMethod] =
    useState("pranata_pay");
  const [useInsurance, setUseInsurance] =
    useState(false);
  const [useColdChain, setUseColdChain] =
    useState(false);
  const [useQcInspection, setUseQcInspection] =
    useState(false);
  const [showTopUpModal, setShowTopUpModal] =
    useState(false);
  const [availableDates, setAvailableDates] =
    useState<Date[]>([]);
  const [
    requestedArrivalDate,
    setRequestedArrivalDate,
  ] = useState<Date | null>(null);
  const [markerCoords, setMarkerCoords] =
    useState<{
      lng: number;
      lat: number;
    }>({ lng: 110.37, lat: -7.76 });
  const [session, setSession] =
    useState<any>(null);
  const [addressText, setAddressText] =
    useState(
      "Jl. Pertanian Raya No. 42, Sleman, DI Yogyakarta",
    );
  const [
    openPaymentCategory,
    setOpenPaymentCategory,
  ] = useState<string>("Bank VA Lain (Fee Rp 2.000)");
  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);
  usePageLoading(loading);

  const fetchSessionProfile = async () => {
    const sessionStr =
      localStorage.getItem("pranata_session") ||
      localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      setSession(parsed);
      if (parsed.id) {
        try {
          const res = await fetchApi(`${API_BASE}/api/profile/${parsed.id}`);
          if (res.ok) {
            const data = await res.json();
            const updated = { ...parsed, ...data };
            setSession(updated);
            localStorage.setItem("pranata_session", JSON.stringify(updated));
            localStorage.setItem("farmpro_session", JSON.stringify(updated));
          }
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    const handleSessionUpdate = () => {
      const s = localStorage.getItem("pranata_session") || localStorage.getItem("farmpro_session");
      if (s) {
        try {
          setSession(JSON.parse(s));
        } catch (e) {}
      }
    };
    window.addEventListener("session_updated", handleSessionUpdate);
    window.addEventListener("storage", handleSessionUpdate);
    return () => {
      window.removeEventListener("session_updated", handleSessionUpdate);
      window.removeEventListener("storage", handleSessionUpdate);
    };
  }, []);

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
      fetchSessionProfile();
      const sessionStr =
        localStorage.getItem("pranata_session") ||
        localStorage.getItem("farmpro_session");
      if (sessionStr) {
        const session =
          JSON.parse(sessionStr);
        setSession(session);
        try {
          const res = await fetchApi(
            `${API_BASE}/api/cart/${session.id}`,
          );
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
        setAddressText(
          "Mendeteksi lokasi...",
        );
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${markerCoords.lat}&lon=${markerCoords.lng}&format=json`,
          {
            headers: {
              "User-Agent":
                "FarmPro-B2B-App",
            },
          },
        );
        const data = await res.json();
        if (data && data.display_name) {
          const parts =
            data.display_name.split(", ");
          setAddressText(
            parts.slice(0, 4).join(", "),
          );
        } else {
          setAddressText(
            "Lokasi tidak dikenali",
          );
        }
      } catch (e) {
        setAddressText(
          "Gagal mendeteksi lokasi",
        );
      }
    };

    const timeout = setTimeout(
      fetchAddress,
      500,
    );
    return () => clearTimeout(timeout);
  }, [markerCoords.lat, markerCoords.lng]);

  const insuranceFee = useInsurance ? 3500 : 0;
  const coldChainFee = useColdChain ? 18000 : 0;
  const qcInspectionFee = useQcInspection ? 5000 : 0;
  const isPranataPay = paymentMethod === "pranata_pay";
  const platformFee = isPranataPay ? 0 : 2000;

  const subtotal = cart.reduce(
    (s, i) =>
      s +
      (i.product?.price || i.price || 0) *
        (i.quantity || i.orderQuantity || 1),
    0,
  );

  const grandTotal =
    subtotal +
    shippingFee +
    platformFee +
    insuranceFee +
    coldChainFee +
    qcInspectionFee;

  const handleCheckout = async () => {
    if (isSubmitting || cart.length === 0)
      return;
    const sessionStr =
      localStorage.getItem("pranata_session") ||
      localStorage.getItem("farmpro_session");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);

    if (isPranataPay && (session?.walletBalance || 0) < grandTotal) {
      setCheckoutError("Saldo Pranata Pay tidak mencukupi. Silakan isi saldo terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    // Assuming all items belong to same seller for MVP
    const sellerId =
      cart[0].product?.sellerId ||
      cart[0].sellerId;

    try {
      const res = await fetchApi(
        `${API_BASE}/api/orders/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            buyerId: session.id,
            sellerId: sellerId,
            shippingAddress: addressText,
            shippingMethod,
            paymentMethod,
            shippingFee,
            platformFee,
            insuranceFee,
            coldChainFee,
            qcInspectionFee,
            items: cart.map((item) => ({
              productId:
                item.product?.id ||
                item.productId,
              quantity:
                item.quantity ||
                item.orderQuantity ||
                1,
              price:
                item.product?.price ||
                item.price ||
                0,
            })),
            requestedArrivalDate:
              requestedArrivalDate
                ? requestedArrivalDate.toISOString()
                : undefined,
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Checkout gagal");
      }

      // Clear DB cart
      try {
        await fetchApi(
          `${API_BASE}/api/cart/${session.id}`,
          {
            method: "DELETE",
          },
        );
      } catch (e) {}

      // Refresh wallet balance in local storage if paid via Pranata Pay
      if (isPranataPay) {
        const updated = {
          ...session,
          walletBalance: Math.max(0, (session.walletBalance || 0) - grandTotal),
        };
        localStorage.setItem("pranata_session", JSON.stringify(updated));
        localStorage.setItem("farmpro_session", JSON.stringify(updated));
      }

      router.push(
        "/market/checkout/success",
      );
    } catch (e: any) {
      console.error(e);
      setCheckoutError(e.message || "Terjadi kesalahan saat memproses pesanan.");
      setIsSubmitting(false);
    }
  };


  if (loading)
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
        <div className="sticky top-0 z-40 px-4 pt-4">
          <div
            className={cn(
              "max-w-7xl mx-auto bg-white",
              "border border-[#E8E3D2] rounded-2xl",
              "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-14 flex",
              "items-center justify-between px-4",
              "md:px-8 lg:px-12",
            )}
          >
            <div className="w-40 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
            <div className="w-32 h-6 rounded-md skeleton-shimmer bg-[#E8E3D2]" />
            <div className="w-24" />
          </div>
        </div>
        <main
          className={cn(
            "max-w-7xl mx-auto pt-6",
            "pb-24 flex flex-col",
            "lg:flex-row gap-6 px-4",
            "md:px-8 lg:px-12",
          )}
        >
          <div
            className={cn(
              "flex-1 flex flex-col",
              "md:flex-row lg:flex-col gap-6",
            )}
          >
            <div className="flex-1 space-y-6">
              {[1, 2].map((i) => (
                <section
                  key={i}
                  className={cn(
                    "bg-white border border-[#E8E3D2]",
                    "rounded-[1.5rem] p-6",
                  )}
                >
                  <div
                    className={cn(
                      "w-48 h-5 rounded-md",
                      "skeleton-shimmer bg-[#E8E3D2] mb-4",
                    )}
                  />
                  <div
                    className={cn(
                      "w-full h-32 rounded-2xl",
                      "skeleton-shimmer bg-[#E8E3D2]",
                    )}
                  />
                </section>
              ))}
            </div>
            <div className="flex-1 space-y-6">
              <section
                className={cn(
                  "bg-white border border-[#E8E3D2]",
                  "rounded-[1.5rem] p-6 h-full",
                )}
              >
                <div
                  className={cn(
                    "w-48 h-5 rounded-md",
                    "skeleton-shimmer bg-[#E8E3D2] mb-4",
                  )}
                />
                <div
                  className={cn(
                    "w-full h-64 rounded-2xl",
                    "skeleton-shimmer bg-[#E8E3D2]",
                  )}
                />
              </section>
            </div>
          </div>
          <div className="w-full lg:w-[22rem]">
            <div className="bg-white border border-[#E8E3D2] rounded-2xl p-6">
              <div
                className={cn(
                  "w-3/4 h-6 rounded-md",
                  "skeleton-shimmer bg-[#E8E3D2] mb-5",
                )}
              />
              <div className="space-y-4 mb-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3"
                  >
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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
      <MarketplaceNavbar />
      {/* ── Breadcrumb ── */}
      <main
        className={cn(
          "max-w-7xl mx-auto pt-6",
          "pb-24 flex flex-col",
          "lg:flex-row gap-6 px-4",
          "md:px-8 lg:px-12",
        )}
      >
        {/* Left: Forms */}
        <div
          className={cn(
            "flex-1 grid grid-cols-1",
            "md:grid-cols-2 lg:grid-cols-1 gap-6",
          )}
        >
          <div className="col-span-1 flex flex-col gap-6">
            <div className="mb-2">
              <button
                onClick={() =>
                  router.push("/market/cart")
                }
                className={cn(
                  "inline-flex items-center gap-2",
                  "bg-white border border-[#E8E3D2]",
                  "hover:bg-[#F8F6F0] text-[#1C241E] hover:text-[#2B4C3B]",
                  "font-bold text-sm px-4",
                  "py-2 rounded-full transition-colors",
                  "shadow-sm",
                )}
              >
                <ChevronLeft size={18} />{" "}
                Kembali
              </button>
            </div>

            {/* Address */}
            <section
              className={cn(
                "flex-1 bg-white border",
                "border-[#E8E3D2] rounded-[1.5rem] p-6",
                "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              )}
            >
              <h3
                className={cn(
                  "text-sm font-black text-[#5A635B]",
                  "uppercase tracking-wider mb-4",
                  "flex items-center gap-2",
                )}
              >
                <MapPin
                  size={16}
                  className="text-[#C25939]"
                />{" "}
                Alamat Pengiriman
              </h3>
              <div
                className={cn(
                  "bg-gradient-to-br from-[#1C241E] via-[#2B4C3B]",
                  "to-[#3B664C] rounded-2xl p-4",
                  "border-none shadow-md",
                )}
              >
                <p className="font-black text-white mb-1">
                  {session?.fullName ||
                    "Nama Pembeli"}
                </p>
                <p className="text-sm text-[#E8E3D2] mb-3">
                  {addressText}
                </p>
                <div
                  className={cn(
                    "h-48 rounded-xl overflow-hidden",
                    "border border-[#E8E3D2] relative",
                    "z-0",
                  )}
                >
                  <Map
                    theme="light"
                    center={[
                      markerCoords.lng,
                      markerCoords.lat,
                    ]}
                    zoom={15}
                    className="w-full h-full"
                  >
                    <MapControls
                      showLocate
                      autoLocate
                      onLocate={(coords) =>
                        setMarkerCoords({
                          lng: coords.longitude,
                          lat: coords.latitude,
                        })
                      }
                    />
                    <MapMarker
                      longitude={
                        markerCoords.lng
                      }
                      latitude={
                        markerCoords.lat
                      }
                      draggable
                      onDragEnd={(coords) =>
                        setMarkerCoords({
                          lng: coords.lng,
                          lat: coords.lat,
                        })
                      }
                    >
                      <MarkerContent>
                        <div
                          className={cn(
                            "relative h-6 w-6",
                            "rounded-full border-2 border-white",
                            "bg-[#C25939] shadow-lg flex",
                            "items-center justify-center cursor-move",
                          )}
                        >
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
              <button className="px-4 py-2 cursor-default">
                Back
              </button>
            </div>

            {/* Shipping */}
            <section
              className={cn(
                "bg-white border border-[#E8E3D2]",
                "rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              )}
            >
              <h3
                className={cn(
                  "text-sm font-black text-[#5A635B]",
                  "uppercase tracking-wider mb-4",
                  "flex items-center gap-2",
                )}
              >
                <Truck
                  size={16}
                  className="text-[#767C15]"
                />{" "}
                Metode Pengiriman
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Kargo Express",
                    sub: "2-3 Hari • Rp 45.000",
                    id: "kargo",
                    fee: 45000,
                  },
                  {
                    label: "Lokal Kurir",
                    sub: "Same Day • Rp 15.000",
                    id: "lokal",
                    fee: 15000,
                  },
                ].map((s) => (
                  <label
                    key={s.id}
                    className="cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      className="sr-only"
                      checked={
                        shippingFee === s.fee
                      }
                      onChange={() => {
                        setShippingFee(
                          s.fee,
                        );
                        setShippingMethod(
                          s.id,
                        );
                      }}
                    />
                    <div
                      className={cn(
                        "rounded-2xl border-2 border-[#E8E3D2]",
                        "p-4 group-has-[:checked]:border-transparent group-has-[:checked]:bg-gradient-to-r",
                        "group-has-[:checked]:from-[#2B4C3B] group-has-[:checked]:to-[#4A7C59] group-has-[:checked]:shadow-md",
                        "transition-all text-center",
                      )}
                    >
                      <p
                        className={cn(
                          "font-black text-[#1C241E] group-has-[:checked]:text-white",
                          "text-sm transition-colors",
                        )}
                      >
                        {s.label}
                      </p>
                      <p
                        className={cn(
                          "text-[11px] text-[#7A8678] group-has-[:checked]:text-[#E8E3D2]",
                          "mt-1 transition-colors",
                        )}
                      >
                        {s.sub}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Arrival Date */}
            <section
              className={cn(
                "flex-1 bg-white border",
                "border-[#E8E3D2] rounded-[1.5rem] p-6",
                "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              )}
            >
              <h3
                className={cn(
                  "text-sm font-black text-[#5A635B]",
                  "uppercase tracking-wider mb-4",
                  "flex items-center gap-2",
                )}
              >
                <Calendar
                  size={16}
                  className="text-[#3B664C]"
                />{" "}
                Tanggal Kedatangan (Estimasi)
              </h3>
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "w-full flex items-center",
                      "justify-between bg-gradient-to-r from-[#2B4C3B]",
                      "to-[#4A7C59] p-4 font-bold",
                      "text-white border-none rounded-2xl",
                      "shadow-md transition-all focus:outline-none",
                      "hover:opacity-95",
                    )}
                  >
                    <span>
                      {requestedArrivalDate
                        ? requestedArrivalDate.toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "Pilih Tanggal Kedatangan"}
                    </span>
                    <Calendar size={20} className="text-white" />
                  </PopoverTrigger>
                  <PopoverContent
                    className={cn(
                      "w-auto p-4 bg-white",
                      "rounded-[2rem] border border-[#E8E3D2]",
                      "shadow-[0_20px_60px_-15px_rgba(43,76,59,0.2)]",
                    )}
                  >
                    <div className="mb-4 text-center">
                      <h4 className="font-black text-[#1C241E]">
                        Pilih Tanggal Kedatangan
                      </h4>
                      <p className="text-xs text-[#7A8678] font-medium">
                        Geser untuk memilih
                      </p>
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
              <p
                className={cn(
                  "text-xs text-[#7A8678] font-medium",
                  "bg-[#F8F6F0] p-3 rounded-xl",
                  "border border-[#E8E3D2]/60 flex",
                  "gap-2 items-start mt-4",
                )}
              >
                <span className="text-[#C25939] font-black">*</span>
                Sesuai standar B2B, estimasi pengiriman paling cepat adalah 3 hari dari waktu pemesanan untuk persiapan armada logistik dan *quality control* komoditas.
              </p>
            </section>

            {/* Value-Added Services (VAS) Section */}
            <section
              className={cn(
                "bg-white border border-[#E8E3D2]",
                "rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-[#5A635B] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#2B4C3B]" />
                  Layanan Tambahan & Proteksi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2E6] text-[#2B4C3B] uppercase">
                  Opsional
                </span>
              </div>

              <div className="space-y-3">
                {/* VAS 1: Asuransi Segar */}
                <label className={cn(
                  "p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between cursor-pointer",
                  useInsurance ? "border-[#2B4C3B] bg-[#EEF2E6]/40" : "border-[#E8E3D2] bg-white hover:bg-[#FAF8F5]"
                )}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={useInsurance}
                      onChange={(e) => setUseInsurance(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#2B4C3B] rounded shrink-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[#1C241E]">
                          Asuransi Pengiriman Ternak Segar
                        </span>
                        <span className="text-[10px] font-black text-[#C85A32]">+Rp 3.500</span>
                      </div>
                      <p className="text-[11px] text-[#5A635B] mt-0.5 leading-relaxed">
                        Penggantian 100% jika produk karkas/ternak mengalami kerusakan atau mati di perjalanan.
                      </p>
                    </div>
                  </div>
                </label>

                {/* VAS 2: Cold Chain Box */}
                <label className={cn(
                  "p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between cursor-pointer",
                  useColdChain ? "border-[#2B4C3B] bg-[#EEF2E6]/40" : "border-[#E8E3D2] bg-white hover:bg-[#FAF8F5]"
                )}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={useColdChain}
                      onChange={(e) => setUseColdChain(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#2B4C3B] rounded shrink-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[#1C241E]">
                          Kemasan Rantai Dingin (Cold Box + Ice Gel)
                        </span>
                        <span className="text-[10px] font-black text-[#C85A32]">+Rp 18.000</span>
                      </div>
                      <p className="text-[11px] text-[#5A635B] mt-0.5 leading-relaxed">
                        Sterofoam insulasi suhu dan ice gel pack beku menjaga daging/susu tetap segar hingga 36 jam.
                      </p>
                    </div>
                  </div>
                </label>

                {/* VAS 3: Sertifikasi QC Higienitas */}
                <label className={cn(
                  "p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between cursor-pointer",
                  useQcInspection ? "border-[#2B4C3B] bg-[#EEF2E6]/40" : "border-[#E8E3D2] bg-white hover:bg-[#FAF8F5]"
                )}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={useQcInspection}
                      onChange={(e) => setUseQcInspection(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#2B4C3B] rounded shrink-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[#1C241E]">
                          Sertifikasi Uji Mutu & Higienitas (QC Tag)
                        </span>
                        <span className="text-[10px] font-black text-[#C85A32]">+Rp 5.000</span>
                      </div>
                      <p className="text-[11px] text-[#5A635B] mt-0.5 leading-relaxed">
                        Pemeriksaan fisik standar higienitas laboratorium sebelum dikirim dengan stempel digital.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Payment Method - Spans 2 columns on Tablet */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <section
              className={cn(
                "bg-white border border-[#E8E3D2]",
                "rounded-[1.5rem] p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              )}
            >
              <h3
                className={cn(
                  "text-sm font-black text-[#5A635B]",
                  "uppercase tracking-wider mb-4",
                  "flex items-center gap-2",
                )}
              >
                <ShieldCheck
                  size={16}
                  className="text-[#2B4C3B]"
                />{" "}
                Metode Pembayaran
              </h3>

              {/* FEATURED: PRANATA PAY OPTION */}
              <div className="mb-4">
                <label
                  className={cn(
                    "p-4 rounded-2xl border-2 flex flex-col gap-3 cursor-pointer transition-all relative overflow-hidden",
                    paymentMethod === "pranata_pay"
                      ? "border-[#2B4C3B] bg-gradient-to-br from-[#EEF2E6] to-white shadow-md ring-2 ring-[#2B4C3B]/20"
                      : "border-[#E8E3D2] bg-white hover:bg-[#FAF8F5]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "pranata_pay"}
                        onChange={() => setPaymentMethod("pranata_pay")}
                        className="w-4 h-4 accent-[#2B4C3B]"
                      />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <img
                            src="/logos/pay/pay-black.webp"
                            alt="Pranata Pay"
                            className="h-7 sm:h-8 w-auto object-contain"
                          />
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#2B4C3B] text-white tracking-wider">
                            Rekomendasi
                          </span>
                        </div>
                        <p className="text-xs text-[#2B4C3B] font-bold mt-1">
                          Bebas Biaya Layanan (Hemat Rp 2.000) • 1-Klik Bayar
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#7A8678] block">Saldo Anda</span>
                      <span className={cn(
                        "text-xs sm:text-sm font-black",
                        (session?.walletBalance || 0) >= grandTotal ? "text-emerald-700" : "text-rose-600"
                      )}>
                        Rp {(session?.walletBalance || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Insufficient Balance Alert inside Card */}
                  {paymentMethod === "pranata_pay" && (session?.walletBalance || 0) < grandTotal && (
                    <div className="pt-2 border-t border-[#DDE2D6] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-rose-600 font-semibold">
                        Saldo kurang Rp {(grandTotal - (session?.walletBalance || 0)).toLocaleString("id-ID")}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTopUpModal(true);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#2B4C3B] text-white text-xs font-bold hover:bg-[#223d2f] transition-all shadow-xs"
                      >
                        + Isi Saldo Instan
                      </button>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Bank VA Lain (Fee Rp 2.000)",
                    options: [
                      {
                        label: "BCA VA",
                        tag: "Bank",
                        id: "bca",
                        slug: "bca",
                      },
                      {
                        label: "Mandiri VA",
                        tag: "Bank",
                        id: "mandiri",
                        slug: "mandiri",
                      },
                      {
                        label: "BRI VA",
                        tag: "Bank",
                        id: "bri",
                        slug: "bri",
                      },
                      {
                        label: "BNI VA",
                        tag: "Bank",
                        id: "bni",
                        slug: "bni",
                      },
                    ],
                  },
                  {
                    title: "QRIS & E-Money (Fee Rp 2.000)",
                    options: [
                      {
                        label: "QRIS All Payment",
                        tag: "Scan QR",
                        id: "qris",
                        slug: "qris",
                      },
                      {
                        label: "GoPay",
                        tag: "E-Wallet",
                        id: "gopay",
                        slug: "gopay",
                      },
                    ],
                  },
                ].map((category, catIdx) => (
                  <div
                    key={catIdx}
                    className={cn(
                      "border border-[#E8E3D2] rounded-2xl overflow-hidden shadow-sm",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPaymentCategory(
                          openPaymentCategory === category.title ? "" : category.title,
                        )
                      }
                      className={cn(
                        "w-full flex items-center justify-between p-4 bg-white hover:bg-[#F8F6F0] transition-colors font-bold text-xs sm:text-sm text-[#1C241E]",
                      )}
                    >
                      <span>{category.title}</span>
                      {openPaymentCategory === category.title ? (
                        <ChevronUp size={18} className="text-[#5A635B]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#5A635B]" />
                      )}
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
                            {category.options.map((pm) => (
                              <label
                                key={pm.id}
                                className={cn(
                                  "group flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all",
                                  paymentMethod === pm.id
                                    ? "border-[#2B4C3B] bg-[#EEF2E6] ring-2 ring-[#2B4C3B]/20"
                                    : "border-[#E8E3D2] bg-white hover:bg-[#FAF8F5]",
                                )}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  className="w-4 h-4 accent-[#2B4C3B] shrink-0"
                                  checked={paymentMethod === pm.id}
                                  onChange={() => setPaymentMethod(pm.id)}
                                />
                                {pm.slug && (
                                  <Logo
                                    slug={pm.slug as any}
                                    className="flex items-center justify-center shrink-0 w-11 h-6 [&>svg]:max-h-5 [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain [&>svg]:block [&>svg]:mx-auto [&>svg]:my-auto"
                                  />
                                )}
                                <span className="font-bold text-[#1C241E] text-xs truncate">
                                  {pm.label}
                                </span>
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
          <div
            className={cn(
              "bg-white border border-[#E8E3D2]",
              "rounded-2xl p-6 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              "lg:sticky lg:top-20",
            )}
          >
            <h3 className="font-black text-lg text-[#1C241E] mb-5">
              Ringkasan Pesanan
            </h3>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl",
                      "bg-[#F1EBE1] overflow-hidden shrink-0",
                    )}
                  >
                    {item.product
                      ?.imageUrls &&
                    item.product.imageUrls
                      .length > 0 ? (
                      <img
                        src={
                          item.product
                            .imageUrls[0]
                        }
                        className="w-full h-full object-cover"
                        decoding="async"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store
                          size={18}
                          className="text-[#A4B0A7]"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#1C241E] truncate">
                      {item.product?.title ||
                        item.title}
                    </p>
                    <p className="text-xs text-[#7A8678] mt-0.5">
                      {item.quantity ||
                        item.orderQuantity ||
                        1}
                      × Rp{" "}
                      {(
                        item.product
                          ?.price ||
                        item.price ||
                        0
                      )?.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-black text-sm text-[#C25939] shrink-0">
                    Rp{" "}
                    {(
                      (item.product?.price ||
                        item.price ||
                        0) *
                      (item.quantity ||
                        item.orderQuantity ||
                        1)
                    )?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8E3D2] pt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-[#5A635B]">
                <span className="font-bold">Subtotal Produk</span>
                <span className="font-extrabold text-[#1C241E]">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between text-[#5A635B]">
                <span className="font-bold">Biaya Pengiriman</span>
                <span className="font-extrabold text-[#1C241E]">
                  Rp {shippingFee.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between text-[#5A635B]">
                <span className="font-bold">Biaya Layanan & Proteksi</span>
                <span className={cn(
                  "font-extrabold",
                  isPranataPay ? "text-emerald-700" : "text-[#1C241E]"
                )}>
                  {isPranataPay ? "Rp 0 (Promo Pay)" : "Rp 2.000"}
                </span>
              </div>

              {useInsurance && (
                <div className="flex justify-between text-[#5A635B]">
                  <span className="font-bold">Asuransi Segar</span>
                  <span className="font-extrabold text-[#1C241E]">Rp 3.500</span>
                </div>
              )}

              {useColdChain && (
                <div className="flex justify-between text-[#5A635B]">
                  <span className="font-bold">Cold Box Rantai Dingin</span>
                  <span className="font-extrabold text-[#1C241E]">Rp 18.000</span>
                </div>
              )}

              {useQcInspection && (
                <div className="flex justify-between text-[#5A635B]">
                  <span className="font-bold">Uji Mutu QC Higienitas</span>
                  <span className="font-extrabold text-[#1C241E]">Rp 5.000</span>
                </div>
              )}

              <div
                className={cn(
                  "flex justify-between items-center",
                  "pt-4 border-t border-[#E8E3D2]",
                  "mt-2",
                )}
              >
                <span className="font-black text-sm text-[#1C241E]">
                  Total Pembayaran
                </span>
                <span className="text-xl font-black text-[#2B4C3B]">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-1.5 mt-3">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <motion.button
                whileHover={{
                  scale: isSubmitting ? 1 : 1.01,
                }}
                whileTap={{
                  scale: isSubmitting ? 1 : 0.98,
                }}
                onClick={handleCheckout}
                disabled={
                  isSubmitting ||
                  cart.length === 0
                }
                className={`w-full mt-4 py-4 font-black text-white rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting ||
                  cart.length === 0
                    ? "bg-gray-400 opacity-60 cursor-not-allowed shadow-none"
                    : "bg-[#2B4C3B] hover:bg-[#1E362A] shadow-lg shadow-[#2B4C3B]/25"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin text-white"
                    />
                    <span>
                      Memproses Pesanan...
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={19} />
                    <span>
                      Bayar Sekarang (Rp {grandTotal.toLocaleString("id-ID")})
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      {/* Top Up Modal from Checkout */}
      <PranataPayModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        initialTab="topup"
        onSuccess={() => {
          fetchSessionProfile();
          setCheckoutError(null);
        }}
      />
    </div>
  );
}

