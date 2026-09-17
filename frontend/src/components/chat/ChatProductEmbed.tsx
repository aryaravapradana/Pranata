"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Check,
  Loader2,
  Store,
  ExternalLink,
  PackageCheck,
  ChevronRight,
} from "lucide-react";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import Link from "next/link";

export interface MarketProductItem {
  id: string;
  title: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  farmName?: string;
  sellerName?: string;
  stock?: number;
  grade?: string;
}

interface ChatProductEmbedProps {
  products: MarketProductItem[];
}

export function ChatProductEmbed({ products }: ChatProductEmbedProps) {
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [addingAll, setAddingAll] = useState(false);
  const [allAdded, setAllAdded] = useState(false);

  if (!products || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  const getSession = () => {
    try {
      const raw =
        localStorage.getItem("farmpro_session") ||
        localStorage.getItem("pranata_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const notifyCartUpdated = () => {
    window.dispatchEvent(new Event("cart_updated"));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddToCart = async (product: MarketProductItem) => {
    const session = getSession();
    if (!session?.id) return;

    setAddingIds((prev) => ({ ...prev, [product.id]: true }));
    const API_BASE = getApiBaseUrl();

    try {
      const res = await fetchApi(`${API_BASE}/api/cart/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        notifyCartUpdated();
      }
    } catch (err) {
      console.error("Failed adding to cart", err);
    } finally {
      setAddingIds((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleAddAllToCart = async () => {
    const session = getSession();
    if (!session?.id) return;

    setAddingAll(true);
    const API_BASE = getApiBaseUrl();

    try {
      await Promise.all(
        products.map((p) =>
          fetchApi(`${API_BASE}/api/cart/${session.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: p.id,
              quantity: 1,
            }),
          }).catch((e) => console.error(e)),
        ),
      );

      const allSuccessMap: Record<string, boolean> = {};
      products.forEach((p) => {
        allSuccessMap[p.id] = true;
      });
      setAddedIds(allSuccessMap);
      setAllAdded(true);
      notifyCartUpdated();
    } catch (err) {
      console.error("Failed adding all items to cart", err);
    } finally {
      setAddingAll(false);
    }
  };

  const totalEstimatedPrice = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0),
    0,
  );

  return (
    <div className="my-3.5 bg-linear-to-b from-[#FAF8F5] to-[#F4F1EA] border border-[#E8E3D2] rounded-3xl p-3 sm:p-4.5 shadow-xs overflow-hidden w-full min-w-0">
      {/* Header Widget */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Link
          href="/market"
          target="_blank"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity min-w-0"
          title="Buka Pranata Market"
        >
          <img
            src="/logos/market/market-black.webp"
            alt="Pranata Market"
            className="h-5 sm:h-6 w-auto object-contain shrink-0"
          />
          <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-[#EEF2E6] text-[#2B4C3B] text-[10px] font-extrabold uppercase tracking-wider shrink-0">
            {products.length} Bahan
          </span>
        </Link>

        <Link
          href="/market/cart"
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#2B4C3B] hover:underline bg-white/80 hover:bg-white px-2.5 py-1 rounded-xl border border-[#E8E3D2] transition-colors shrink-0"
        >
          <span>Lihat Keranjang</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* Product List Grid - Spacious, generous breakpoints so cards are never cramped */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mb-3.5">
        {products.map((product) => {
          const isAdding = !!addingIds[product.id];
          const isAdded = !!addedIds[product.id];
          const sellerDisplay =
            product.farmName || product.sellerName || "Mitra Pranata";

          return (
            <div
              key={product.id}
              className="group/card flex flex-col justify-between p-3 sm:p-3.5 bg-white rounded-2xl border border-[#E8E3D2] hover:border-[#2B4C3B] hover:shadow-md transition-all shadow-2xs relative min-w-0"
            >
              {/* Top Row: Thumbnail + Full Product Title & Farm */}
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                {/* Thumbnail (Clickable to Market Product) */}
                <Link
                  href={`/market/product/${product.id}`}
                  target="_blank"
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#F8F6F0] shrink-0 border border-[#E8E3D2]/60 relative block group-hover/card:opacity-90 transition-opacity"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#7A8678]">
                      <Store size={18} />
                    </div>
                  )}
                  {product.grade && (
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-[#2B4C3B] text-white text-[8px] font-black rounded-xs">
                      {product.grade}
                    </span>
                  )}
                </Link>

                {/* Detail */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/market/product/${product.id}`}
                    target="_blank"
                    className="text-xs sm:text-sm font-black text-[#1C241E] group-hover/card:text-[#2B4C3B] transition-colors leading-snug block wrap-break-word"
                    title={product.title}
                  >
                    {product.title}
                  </Link>

                  <p className="text-[10px] sm:text-[11px] text-[#7A8678] font-bold truncate mt-1 flex items-center gap-1">
                    <Store size={11} className="shrink-0 text-[#7A8678]" />
                    <span className="truncate">{sellerDisplay}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Row: Full-width Price & Add to Cart Action */}
              <div className="mt-2.5 pt-2 border-t border-[#E8E3D2]/60 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/market/product/${product.id}`}
                  target="_blank"
                  className="whitespace-nowrap hover:underline shrink-0"
                >
                  <span className="text-xs sm:text-sm font-black text-[#2B4C3B]">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-normal text-[#5A635B] ml-0.5">
                    /{product.unit || "kg"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 whitespace-nowrap ${
                    isAdded
                      ? "bg-[#EEF2E6] text-[#2B4C3B] border border-[#2B4C3B]/30"
                      : "bg-[#2B4C3B] hover:bg-[#1E362A] text-white shadow-2xs"
                  }`}
                >
                  {isAdding ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : isAdded ? (
                    <>
                      <Check size={12} />
                      <span>Masuk</span>
                    </>
                  ) : (
                    <>
                      <span>+ Keranjang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Action Button */}
      <div className="pt-3 border-t border-[#E8E3D2]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-bold text-[#5A635B] flex items-center gap-1.5 flex-wrap">
          <span>Estimasi Total ({products.length} bahan):</span>{" "}
          <strong className="text-[#1C241E] font-black text-sm sm:text-base">
            Rp {totalEstimatedPrice.toLocaleString("id-ID")}
          </strong>
        </div>

        <button
          type="button"
          onClick={handleAddAllToCart}
          disabled={addingAll}
          className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0 ${
            allAdded
              ? "bg-[#EEF2E6] text-[#2B4C3B] border border-[#2B4C3B]"
              : "bg-linear-to-r from-[#2B4C3B] to-[#1E362A] hover:opacity-95 text-white"
          }`}
        >
          {addingAll ? (
            <>
              <Loader2 size={14} className="animate-spin shrink-0" />
              <span>Memasukkan Semua...</span>
            </>
          ) : allAdded ? (
            <>
              <PackageCheck size={15} className="shrink-0" />
              <span>Semua Bahan Ditambahkan!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} className="shrink-0" />
              <span>+ Keranjang Semua ({products.length} Bahan)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
