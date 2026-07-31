"use client";
import { cn } from "@/lib/utils";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";
import { Footer } from "@/components/layout/Footer";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Package,
  Clock,
  User,
  ChevronRight,
  CheckCircle,
  Truck,
  MapPin,
  Search,
  Filter,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  usePageLoading,
  useGlobalLoading,
} from "@/components/shared/loading-context";
import { useRouter } from "next/navigation";

const API_BASE = getApiBaseUrl();

const STATUS_COLORS: Record<string, string> =
  {
    PENDING: "bg-[#FFF3E0] text-[#C25939]",
    PAID: "bg-[#EEF2E6] text-[#2B4C3B]",
    SHIPPED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-[#EEF2E6] text-[#2B4C3B]",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

const STATUS_LABELS: Record<string, string> =
  {
    PENDING: "Menunggu Pembayaran",
    PAID: "Perlu Dikirim",
    SHIPPED: "Sedang Dikirim",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

export default function SellerOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] =
    useState(true);
  const [orders, setOrders] = useState<
    any[]
  >([]);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const [toastMessage, setToastMessage] =
    useState<string | null>(null);
  usePageLoading(loading);
  const { navigateTo } = useGlobalLoading();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const sessionStr =
          localStorage.getItem(
            "farmpro_session",
          );
        if (!sessionStr) {
          router.push("/login");
          return;
        }
        const parsedSession =
          JSON.parse(sessionStr);

        // If not a PRODUCER, they shouldn't be here
        if (
          parsedSession.role !== "PRODUCER"
        ) {
          navigateTo(
            "/market/cart?tab=orders",
          );
          return;
        }

        const res = await fetchApi(
          `${API_BASE}/api/orders/PRODUCER/${parsedSession.id}`,
        );
        if (res.ok)
          setOrders(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetchApi(
        `${API_BASE}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: newStatus }
              : o,
          ),
        );
        const statusText =
          newStatus === "SHIPPED"
            ? "Pesanan berhasil dikirim!"
            : newStatus === "COMPLETED"
              ? "Pesanan telah diselesaikan!"
              : "Status pesanan berhasil diperbarui!";
        setToastMessage(statusText);
        setTimeout(
          () => setToastMessage(null),
          3000,
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-[#F8F6F0] text-[#1C241E]"
    >
      <main
        className={cn(
          "max-w-7xl mx-auto pt-6",
          "pb-24 px-4 md:px-8",
          "lg:px-12",
        )}
      >
        <h1 className="text-2xl font-black text-[#1C241E] mb-6">
          Kelola Pesanan
        </h1>

        {orders.length === 0 ? (
          <div
            className={cn(
              "bg-white border border-[#E8E3D2]",
              "rounded-[2rem] p-12 text-center",
              "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)] mt-6",
            )}
          >
            <div
              className={cn(
                "w-20 h-20 bg-[#F1EBE1]",
                "rounded-full flex items-center",
                "justify-center mx-auto mb-5",
              )}
            >
              <Package
                size={32}
                className="text-[#A4B0A7]"
              />
            </div>
            <h2 className="text-2xl font-black text-[#1C241E] mb-2">
              Belum ada pesanan masuk
            </h2>
            <p className="text-[#5A635B] mb-6 font-medium">
              Pesanan dari pembeli akan
              muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className={cn(
                  "bg-white border border-[#E8E3D2]",
                  "rounded-[1.5rem] p-5 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
                )}
              >
                {/* Header */}
                <div
                  className={cn(
                    "flex flex-col sm:flex-row",
                    "justify-between items-start sm:items-center",
                    "gap-2 mb-4 border-b",
                    "border-[#E8E3D2] pb-4",
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "text-xs font-bold text-[#7A8678]",
                        "mb-1 flex items-center",
                        "gap-1.5",
                      )}
                    >
                      <User
                        size={14}
                        className="text-[#A4B0A7]"
                      />
                      Pembeli:{" "}
                      {o.buyer?.fullName ||
                        o.buyer?.username ||
                        "Unknown"}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] text-[#A4B0A7] flex",
                        "items-center gap-2 flex-wrap",
                      )}
                    >
                      <span className="font-bold text-[#1C241E]">
                        Order #
                        {o.id
                          .substring(
                            o.id.length - 8,
                          )
                          .toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(
                          o.createdAt,
                        ).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute:
                              "2-digit",
                          },
                        )}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1.5 shrink-0 ${STATUS_COLORS[o.status]}`}
                  >
                    {o.status ===
                      "PENDING" && (
                      <Clock size={12} />
                    )}
                    {o.status === "PAID" && (
                      <CheckCircle
                        size={12}
                      />
                    )}
                    {o.status ===
                      "SHIPPED" && (
                      <Truck size={12} />
                    )}
                    {o.status ===
                      "COMPLETED" && (
                      <CheckCircle
                        size={12}
                      />
                    )}
                    {STATUS_LABELS[
                      o.status
                    ] || o.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {o.items.map(
                    (
                      i: any,
                      idx: number,
                    ) => (
                      <div
                        key={idx}
                        className="flex gap-4"
                      >
                        <div
                          className={cn(
                            "w-16 h-16 rounded-xl",
                            "bg-[#F1EBE1] overflow-hidden shrink-0",
                          )}
                        >
                          {i.product
                            ?.imageUrls &&
                          i.product.imageUrls
                            .length > 0 ? (
                            <img
                              src={
                                i.product
                                  .imageUrls[0]
                              }
                              alt={
                                i.product
                                  .title
                              }
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package
                                size={20}
                                className="text-[#C4BAA8]"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-sm text-[#1C241E]">
                            {i.product
                              ?.title ||
                              "Produk dihapus"}
                          </h4>
                          <p className="text-xs font-semibold text-[#7A8678] mt-0.5">
                            {i.quantity} × Rp{" "}
                            {i.priceAtTime?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Footer & Address */}
                <div
                  className={cn(
                    "mt-4 pt-4 border-t",
                    "border-[#E8E3D2] flex flex-col",
                    "sm:flex-row justify-between sm:items-center",
                    "gap-4",
                  )}
                >
                  <div className="flex flex-1 flex-col sm:flex-row gap-3">
                    <div
                      className={cn(
                        "flex-1 flex items-start",
                        "gap-2 text-xs text-[#5A635B]",
                        "bg-[#F8F6F0] p-3 rounded-xl",
                        "border border-[#DDE2D6]",
                      )}
                    >
                      <MapPin
                        size={16}
                        className="text-[#C25939] shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-[#1C241E] mb-0.5">
                          Tujuan Pengiriman:
                        </p>
                        <p>
                          {o.shippingAddress ||
                            o.buyer
                              ?.location ||
                            "Jl. Pertanian Raya No. 42, Sleman, DI Yogyakarta"}
                        </p>
                        {o.shippingMethod && (
                          <p
                            className={cn(
                              "mt-1 text-[10px] uppercase",
                              "font-bold text-[#767C15]",
                            )}
                          >
                            Via:{" "}
                            {
                              o.shippingMethod
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    {o.requestedArrivalDate && (
                      <div
                        className={cn(
                          "flex-1 flex items-start",
                          "gap-2 text-xs text-[#5A635B]",
                          "bg-[#F8F6F0] p-3 rounded-xl",
                          "border border-[#DDE2D6]",
                        )}
                      >
                        <Calendar
                          size={16}
                          className="text-[#3B664C] shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="font-bold text-[#1C241E] mb-0.5">
                            Permintaan Tiba:
                          </p>
                          <p className="text-[#2B4C3B] font-bold text-sm">
                            {new Date(
                              o.requestedArrivalDate,
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                weekday:
                                  "short",
                                day: "numeric",
                                month:
                                  "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "sm:text-right flex justify-between",
                      "sm:block items-center",
                    )}
                  >
                    <span className="text-xs font-bold text-[#5A635B] block mb-1">
                      Pendapatan
                    </span>
                    <span className="font-black text-xl text-[#C25939]">
                      Rp{" "}
                      {o.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons for Seller */}
                <div
                  className={cn(
                    "mt-4 pt-4 border-t",
                    "border-[#F8F6F0] flex gap-2",
                    "justify-end items-center",
                  )}
                >
                  {o.status ===
                    "PENDING" && (
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      disabled={
                        updatingId === o.id
                      }
                      onClick={() =>
                        updateOrderStatus(
                          o.id,
                          "CANCELLED",
                        )
                      }
                      className={cn(
                        "px-4 py-2.5 bg-[#F8F6F0]",
                        "text-[#5A635B] text-xs font-bold",
                        "rounded-xl hover:bg-gray-200 transition-colors",
                        "flex items-center gap-1.5",
                        "disabled:opacity-50",
                      )}
                    >
                      {updatingId ===
                      o.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin text-[#5A635B]"
                        />
                      ) : null}
                      <span>
                        Batalkan Pesanan
                      </span>
                    </motion.button>
                  )}

                  {o.status === "PAID" && (
                    <motion.button
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      disabled={
                        updatingId === o.id
                      }
                      onClick={() =>
                        updateOrderStatus(
                          o.id,
                          "SHIPPED",
                        )
                      }
                      className={cn(
                        "px-5 py-2.5 bg-pranata",
                        "text-white text-xs font-black",
                        "rounded-xl hover:bg-[#1E362A] transition-all",
                        "flex items-center gap-2",
                        "shadow-lg shadow-[#2B4C3B]/20 disabled:opacity-60",
                        "cursor-pointer",
                      )}
                    >
                      {updatingId ===
                      o.id ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin text-white"
                          />
                          <span>
                            Mengirim
                            Pesanan...
                          </span>
                        </>
                      ) : (
                        <>
                          <Truck size={14} />
                          <span>
                            Kirim Pesanan
                          </span>
                        </>
                      )}
                    </motion.button>
                  )}

                  {o.status ===
                    "SHIPPED" && (
                    <motion.button
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      disabled={
                        updatingId === o.id
                      }
                      onClick={() =>
                        updateOrderStatus(
                          o.id,
                          "COMPLETED",
                        )
                      }
                      className={cn(
                        "px-5 py-2.5 bg-[#F5990D]",
                        "text-white text-xs font-black",
                        "rounded-xl hover:bg-[#C25939] transition-all",
                        "flex items-center gap-2",
                        "shadow-lg shadow-[#F5990D]/20 disabled:opacity-60",
                        "cursor-pointer",
                      )}
                    >
                      {updatingId ===
                      o.id ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin text-white"
                          />
                          <span>
                            Memproses...
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle
                            size={14}
                          />
                          <span>
                            Selesaikan
                          </span>
                        </>
                      )}
                    </motion.button>
                  )}

                  {o.status ===
                    "CANCELLED" && (
                    <span className="text-xs font-bold text-gray-400 py-2">
                      Pesanan Dibatalkan
                    </span>
                  )}
                  {o.status ===
                    "COMPLETED" && (
                    <span
                      className={cn(
                        "text-xs font-bold text-[#4A7C59]",
                        "py-2 flex items-center",
                        "gap-1",
                      )}
                    >
                      <CheckCircle
                        size={14}
                        className="text-[#4A7C59]"
                      />{" "}
                      Pesanan Selesai
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast Floating Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 50,
              scale: 0.9,
            }}
            className={cn(
              "fixed bottom-6 right-6",
              "z-50 bg-[#2B4C3B] text-white",
              "px-5 py-3 rounded-2xl",
              "shadow-2xl flex items-center",
              "gap-3 font-bold text-sm",
              "border border-[#B4C179]/30",
            )}
          >
            <CheckCircle
              size={18}
              className="text-[#B4C179]"
            />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16">
        <Footer />
      </div>
    </motion.div>
  );
}
