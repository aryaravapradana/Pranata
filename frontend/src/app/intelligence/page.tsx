"use client";
import { cn } from "@/lib/utils";

import { useChat } from "ai/react";
import {
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Bot,
  User,
  Send,
  Paperclip,
  Loader2,
  Sparkles,
  X,
  ArrowUp,
  ChevronLeft,
  ShieldCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import ReactMarkdown from "react-markdown";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import Link from "next/link";
import { useAppRouter as useRouter } from "@/components/shared/loading-context";
import { UpgradePlusModal } from "@/components/modals/UpgradePlusModal";
import { PlusBadge } from "@/components/ui/plus-badge";
import { Lock, Crown, CheckCircle2, TrendingUp, Utensils, ShoppingCart } from "lucide-react";
import { ChatProductEmbed, MarketProductItem } from "@/components/chat/ChatProductEmbed";

const API_BASE = getApiBaseUrl();

export default function StandaloneIntelligencePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [contextData, setContextData] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<"pakan" | "harga" | "medis">("pakan");



  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  } = useChat({
    body: { contextData },
  });

  const [files, setFiles] =
    useState<FileList | null>(null);
  const fileInputRef =
    useRef<HTMLInputElement>(null);
  const messagesEndRef =
    useRef<HTMLDivElement>(null);
  const textareaRef =
    useRef<HTMLTextAreaElement>(null);
  const chatScrollContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem(
      "farmpro_session",
    );
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setProfile(session);
    }

    const fetchContext = async () => {
      const sessionStr =
        localStorage.getItem(
          "farmpro_session",
        ) || localStorage.getItem("pranata_session");
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      const API_BASE = getApiBaseUrl();
      const isBuyer = session.role === "BUYER";

      try {
        if (isBuyer) {
          // Fetch real marketplace catalog so AI can accurately recommend in-stock items
          const marketRes = await fetchApi(`${API_BASE}/api/products?limit=50`).catch(() => null);
          const marketData = marketRes && marketRes.ok ? await marketRes.json() : null;
          const catalog = Array.isArray(marketData)
            ? marketData
            : marketData?.data || [];

          setContextData({
            profile: session,
            isBuyer: true,
            marketCatalog: catalog,
          });
        } else {
          // Producer context
          const [prodRes, ordRes, marketRes] =
            await Promise.all([
              fetchApi(
                `${API_BASE}/api/products/seller/${session.id}`,
              ).catch(() => null),
              fetchApi(
                `${API_BASE}/api/orders/PRODUCER/${session.id}`,
              ).catch(() => null),
              fetchApi(`${API_BASE}/api/products?limit=30`).catch(() => null),
            ]);

          const products =
            prodRes && prodRes.ok
              ? await prodRes.json()
              : [];
          const orders =
            ordRes && ordRes.ok
              ? await ordRes.json()
              : [];
          const marketData =
            marketRes && marketRes.ok
              ? await marketRes.json()
              : null;

          setContextData({
            profile: session,
            isBuyer: false,
            products: Array.isArray(products)
              ? products
              : products.data || [],
            orders: Array.isArray(orders)
              ? orders
              : orders.data || [],
            marketCatalog: Array.isArray(marketData)
              ? marketData
              : marketData?.data || [],
          });
        }
      } catch (e) {
        console.error(
          "Background context fetch failed",
          e,
        );
      }
    };
    fetchContext();
  }, []);

  // ─── Chat History Persistence (Load on Mount) ───
  useEffect(() => {
    if (!profile?.id) return;
    const cacheKey = `pranata_intelligence_chat_${profile.id}`;
    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed loading saved chat history:", e);
    } finally {
      setMessagesLoaded(true);
    }
  }, [profile?.id, setMessages]);

  // ─── Chat History Persistence (Save on Messages Update) ───
  useEffect(() => {
    if (!profile?.id || !messagesLoaded || isLoading) return;
    const cacheKey = `pranata_intelligence_chat_${profile.id}`;
    try {
      if (messages.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(messages));
      } else {
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.warn("Failed saving chat history:", e);
    }
  }, [messages, isLoading, profile?.id, messagesLoaded]);

  const handleClearChatHistory = () => {
    if (!profile?.id) return;
    if (confirm("Hapus seluruh riwayat percakapan dengan Pranata Intelligence?")) {
      const cacheKey = `pranata_intelligence_chat_${profile.id}`;
      localStorage.removeItem(cacheKey);
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ─── Silky Smooth Inertial Wheel Scrolling (Lenis-like Lerp) ───
  useEffect(() => {
    let targetScroll = 0;
    let currentScroll = 0;
    let isAnimating = false;
    let rafId: number | null = null;

    const onScroll = () => {
      const container = chatScrollContainerRef.current;
      if (!container) return;
      if (!isAnimating) {
        targetScroll = container.scrollTop;
        currentScroll = container.scrollTop;
      }
    };

    const update = () => {
      const container = chatScrollContainerRef.current;
      if (!container) {
        isAnimating = false;
        return;
      }
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

      const diff = targetScroll - currentScroll;
      if (Math.abs(diff) > 0.5) {
        currentScroll += diff * 0.12;
        isAnimating = true;
        container.scrollTop = Math.round(currentScroll);
        rafId = requestAnimationFrame(update);
      } else {
        currentScroll = targetScroll;
        container.scrollTop = targetScroll;
        isAnimating = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const container = chatScrollContainerRef.current;
      if (!container || e.ctrlKey) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest('[role="dialog"], .modal, [data-modal]')) {
        return;
      }

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      if (maxScroll <= 0) return;

      e.preventDefault();

      if (!isAnimating) {
        targetScroll = container.scrollTop;
        currentScroll = container.scrollTop;
      }

      targetScroll = Math.max(0, Math.min(targetScroll + e.deltaY, maxScroll));

      if (!isAnimating) {
        rafId = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("wheel", onWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const compressImage = (
    file: File,
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.75,
  ): Promise<{
    name: string;
    contentType: string;
    url: string;
  }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            name: file.name,
            contentType: file.type,
            url: reader.result as string,
          });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (
            width > maxWidth ||
            height > maxHeight
          ) {
            if (width > height) {
              height = Math.round(
                (height * maxWidth) / width,
              );
              width = maxWidth;
            } else {
              width = Math.round(
                (width * maxHeight) / height,
              );
              height = maxHeight;
            }
          }

          const canvas =
            document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx =
            canvas.getContext("2d");
          if (!ctx) {
            resolve({
              name: file.name,
              contentType: file.type,
              url: e.target
                ?.result as string,
            });
            return;
          }

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height,
          );
          const compressedDataUrl =
            canvas.toDataURL(
              "image/jpeg",
              quality,
            );

          if (
            compressedDataUrl &&
            compressedDataUrl.startsWith(
              "data:image/",
            ) &&
            compressedDataUrl.includes(
              ";base64,",
            ) &&
            compressedDataUrl.length > 100
          ) {
            resolve({
              name:
                file.name.replace(
                  /\.[^/.]+$/,
                  "",
                ) + ".jpg",
              contentType: "image/jpeg",
              url: compressedDataUrl,
            });
          } else {
            resolve({
              name: file.name,
              contentType: file.type,
              url: e.target
                ?.result as string,
            });
          }
        };
        img.onerror = () =>
          resolve({
            name: file.name,
            contentType: file.type,
            url: e.target?.result as string,
          });
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (
      !input &&
      (!files || files.length === 0)
    )
      return;

    let attachments:
      | Array<{
          name: string;
          contentType: string;
          url: string;
        }>
      | undefined = undefined;
    if (files && files.length > 0) {
      attachments = await Promise.all(
        Array.from(files).map((file) =>
          compressImage(file),
        ),
      );
    }

    handleSubmit(e, {
      experimental_attachments:
        attachments as any,
      data: { contextData },
      body: { contextData },
    });
    setFiles(null);
    if (fileInputRef.current)
      fileInputRef.current.value = "";
  };

  const handleGenerateInsights =
    async () => {
      append({
        role: "user",
        content:
          "Tolong berikan ringkasan performa bisnis saya saat ini dan berikan 1-2 rekomendasi (Actionable Insights) terpenting berdasarkan data penjualan dan produk saya di backend.",
      });
    };

  const userName =
    profile?.fullName?.split(" ")[0] ||
    profile?.farmName ||
    "Peternak";

  const isPlus = Boolean(profile?.subscriptionTier && profile.subscriptionTier !== "FREE");

  const refreshProfile = async () => {
    const sessionStr =
      localStorage.getItem("pranata_session") ||
      localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed.id) {
        try {
          const res = await fetchApi(`${API_BASE}/api/profile/${parsed.id}`);
          if (res.ok) {
            const data = await res.json();
            const updated = { ...parsed, ...data };
            setProfile(updated);
            localStorage.setItem("pranata_session", JSON.stringify(updated));
            localStorage.setItem("farmpro_session", JSON.stringify(updated));
          }
        } catch (e) {}
      }
    }
  };

  return (
    <div
      data-lenis-prevent
      className={cn(
        "h-dvh bg-[#F8F6F0] text-[#1C241E]",
        "flex flex-col overflow-hidden",
        "selection:bg-[#2B4C3B] selection:text-white",
      )}
    >
      {/* ── Top Sticky Header Navigation ── */}
      <header
        className={cn(
          "w-full bg-[#F8F6F0]/90 backdrop-blur-md",
          "border-b border-[#E8E3D2]/80 z-30 shrink-0",
          "transition-all",
        )}
      >
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-back="true"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push(profile?.role === "BUYER" ? "/market" : "/hub");
                }
              }}
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-white border border-[#E8E3D2]",
                "flex items-center justify-center",
                "text-[#1C241E] hover:bg-[#EEF2E6] hover:text-[#2B4C3B]",
                "transition-colors shadow-xs active:scale-95",
                "cursor-pointer",
              )}
              title="Kembali ke halaman sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>

            <Link
              href="/intelligence"
              className="flex items-center gap-2"
            >
              <img
                src="/logos/intelligence/intelligence-black.webp"
                alt="Pranata Intelligence"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isPlus && messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChatHistory}
                className={cn(
                  "p-2 rounded-xl bg-white/80 hover:bg-rose-50 text-[#7A8678] hover:text-rose-600",
                  "border border-[#E8E3D2] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs",
                )}
                title="Hapus riwayat chat"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Reset Chat</span>
              </button>
            )}

            {isPlus ? (
              <PlusBadge
                variant="white"
                size="md"
                wrapper="pill"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center px-4 py-2 rounded-full bg-linear-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#1C2E24] shadow-[0_4px_12px_-4px_rgba(212,175,55,0.4)] text-xs font-bold tracking-wider uppercase transition-all duration-200 transform-gpu hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-amber-300/40"
              >
                <span className="flex items-center gap-1.5">Upgrade ke <img src="/logos/plus/plus-black.webp" alt="Pranata Plus" className="h-5 w-auto object-contain inline" /></span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* If FREE Tier: Render Paywall Showcase */}
      {!isPlus ? (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col items-center justify-center text-center my-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold mb-4 shadow-xs"
          >
            <span className="flex items-center gap-1.5">Fitur Eksklusif <img src="/logos/plus/plus-black.webp" alt="Pranata Plus" className="h-5 sm:h-5.5 w-auto object-contain inline" /></span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black text-[#1C241E] tracking-tight mb-3"
          >
            Buka Kekuatan <span className="bg-linear-to-r from-[#2B4C3B] via-[#4A7C59] to-[#D4AF37] bg-clip-text text-transparent">Agentic AI Copilot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-[#5A635B] max-w-2xl mb-8 leading-relaxed font-medium"
          >
            Pranata Intelligence bukan sekadar chatbot umum. AI kami terhubung langsung ke basis data peternakan Anda—menganalisis riwayat transaksi, stok etalase, estimasi FCR pakan, hingga diagnosa klinis penyakit ternak.
          </motion.p>

          {/* Interactive Preview Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-white border border-[#E8E3D2] rounded-3xl p-5 sm:p-7 shadow-lg text-left mb-8"
          >
            <div className="flex items-center justify-between border-b border-[#E8E3D2] pb-4 mb-4">
              <span className="text-xs font-black uppercase text-[#7A8678] tracking-wider">
                Simulasi Respons AI Berbasis Database Anda
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                ● Live Context Ready
              </span>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {profile?.role === "BUYER"
                ? [
                    { id: "rendang", label: "🥩 Resep & Bahan Rendang" },
                    { id: "steak", label: "🥩 Steak & Bumbu Marinasi" },
                    { id: "diet", label: "🥚 Menu Diet Tinggi Protein" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewTab(tab.id as any)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                        previewTab === tab.id
                          ? "bg-[#2B4C3B] text-white shadow-xs"
                          : "bg-[#FAF8F5] text-[#5A635B] hover:bg-[#EEF2E6] border border-[#E8E3D2]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))
                : [
                    { id: "pakan", label: "🌾 Optimasi Pakan (FCR)" },
                    { id: "harga", label: "📊 Margin & Rekomendasi Jual" },
                    { id: "medis", label: "🩺 Diagnosa Gejala Klinis" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewTab(tab.id as any)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                        previewTab === tab.id
                          ? "bg-[#2B4C3B] text-white shadow-xs"
                          : "bg-[#FAF8F5] text-[#5A635B] hover:bg-[#EEF2E6] border border-[#E8E3D2]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-[#FAF8F5] border border-[#E8E3D2] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-[#1C241E] leading-relaxed">
              {/* Buyer previews */}
              {profile?.role === "BUYER" ? (
                <>
                  {(previewTab === "pakan" || previewTab === ("rendang" as any)) && (
                    <div className="space-y-2">
                      <p className="font-extrabold text-[#2B4C3B] flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#D4AF37]" />
                        Resep Rendang Daging Sapi & Belanja Otomatis:
                      </p>
                      <p className="text-[#4A5568]">
                        "Untuk membuat Rendang Sapi Padang 1 kg yang empuk meresap, gunakan bagian <strong>Daging Sapi Gandik Segar</strong>. Kami telah menyiapkan bahannya langsung dari peternakan terverifikasi!"
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-[#E8E3D2] mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-[#EEF2E6] flex items-center justify-center text-[#2B4C3B] font-black text-xs">
                            🥩
                          </div>
                          <div>
                            <p className="font-black text-xs text-[#1C241E]">Daging Sapi Gandik Segar 1kg</p>
                            <p className="text-[10px] text-[#7A8678]">Peternakan Berkah Mandiri • Rp 135.000/kg</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-[#2B4C3B] bg-[#EEF2E6] px-2.5 py-1 rounded-lg">
                          + 1-Click Keranjang
                        </span>
                      </div>
                    </div>
                  )}

                  {(previewTab === "harga" || previewTab === ("steak" as any)) && (
                    <div className="space-y-2">
                      <p className="font-extrabold text-[#2B4C3B] flex items-center gap-1.5">
                        <Utensils size={14} className="text-emerald-600" />
                        Paket Steak Sirloin Meltique & Bumbu:
                      </p>
                      <p className="text-[#4A5568]">
                        "Dapatkan tekstur juicy maksimal dengan memanggang 3 menit tiap sisi pada pan panas. Kami mendeteksi Sirloin Prime Cut Grade A siap antar hari ini."
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-[#E8E3D2] mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#7A8678] font-bold block">PAKET BAHAN LENGKAP</span>
                          <span className="font-black text-[#2B4C3B] text-sm">Sirloin 500g + Butter Herbal</span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800">
                          Tersedia di Market
                        </span>
                      </div>
                    </div>
                  )}

                  {(previewTab === "medis" || previewTab === ("diet" as any)) && (
                    <div className="space-y-2">
                      <p className="font-extrabold text-[#2B4C3B] flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-blue-600" />
                        Meal Plan Diet Tinggi Protein 3 Hari:
                      </p>
                      <p className="text-[#4A5568]">
                        "Target 110g protein harian terpenuhi dengan kombinasi Telur Ayam Omega-3 dan Dada Ayam Fillet segar dari peternak lokal."
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-[#E8E3D2] mt-2">
                        <p className="font-bold text-[#1C241E]">🛒 Paket Keranjang Otomatis:</p>
                        <p className="text-[#5A635B] mt-0.5">
                          1 Tray Telur Omega-3 (10 butir) + 1 kg Dada Ayam Fillet tanpa lemak siap masuk keranjang dalam 1 ketukan.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {previewTab === "pakan" && (
                    <div className="space-y-2">
                      <p className="font-extrabold text-[#2B4C3B] flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#D4AF37]" />
                        Analisis Rasio FCR & Rekomendasi Pakan:
                      </p>
                      <p className="text-[#4A5568]">
                        "Berdasarkan populasi ternak Anda di Sleman, bobot rata-rata saat ini 1,8 kg/ekor dengan konsumsi pakan harian 110 gram. Rasio FCR saat ini berada di angka <strong>1.52</strong> (kategori sangat efisien)."
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-[#E8E3D2] mt-2">
                        <p className="font-bold text-[#1C241E]">💡 Tindakan Penghematan Biaya:</p>
                        <p className="text-[#5A635B] mt-0.5">
                          Substitusi 12% pakan komersial dengan fermentasi dedak + ampas tahu lokal dapat memangkas biaya hingga <strong>Rp 340.000 / minggu</strong> tanpa mengurangi laju pertumbuhan harian (ADG).
                        </p>
                      </div>
                    </div>
                  )}

                  {previewTab === "harga" && (
                    <div className="space-y-2">
                      <p className="font-extrabold text-[#2B4C3B] flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-600" />
                        Insight Harga Pasar & Margin Keuntungan:
                      </p>
                      <p className="text-[#4A5568]">
                        "Harga acuan daging sapi karkas di Yogyakarta minggu ini stabil di Rp 118.000/kg. Dengan HPP peternakan Anda di Rp 92.000/kg, kami menyarankan Anda menetapkan harga etalase di <strong>Rp 115.000/kg</strong> untuk memenangkan kompetisi pasar."
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-[#E8E3D2] mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#7A8678] font-bold block">POTENSI GROSS MARGIN</span>
                          <span className="font-black text-emerald-700 text-base">25.0% (Rp 23.000/kg)</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-800">
                          Rekomendasi: Jual Sekarang
                        </span>
                      </div>
                    </div>
                  )}

                  {previewTab === "medis" && (
                    <div className="space-y-2">
                      <p className="font-extrabold text-[#2B4C3B] flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-blue-600" />
                        Protokol Diagnosa Gejala & Karantina:
                      </p>
                      <p className="text-[#4A5568]">
                        "Ternak menunjukkan penurunan nafsu makan dan lesi ringan pada kuku. Kemungkinan indikasi awal defisiensi mineral seng atau paparan kelembapan tinggi."
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-[#E8E3D2] mt-2">
                        <p className="font-bold text-[#1C241E]">🚨 Langkah Pencegahan Darurat:</p>
                        <p className="text-[#5A635B] mt-0.5">
                          1. Keringkan alas kandang dan semprotkan desinfektan iodin 1%.<br/>
                          2. Berikan suplemen vitamin ADE + Zinc cair pada air minum selama 3 hari berturut-turut.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Value Props & CTA Button */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] font-bold text-sm sm:text-base shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)] flex items-center justify-center cursor-pointer transition-all duration-200 transform-gpu hover:scale-[1.02] active:scale-[0.98] border border-white/10"
            >
              <span className="flex items-center gap-2">Aktivasi <img src="/logos/plus/plus-white.webp" alt="Pranata Plus" className="h-6 sm:h-7 w-auto object-contain inline" /> (Rp 79.000 / 30 Hari)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full">
            {[
              "Copilot AI Database Connected",
              "1 Slot Produk Sponsor",
              "Papan Pasokan B2B Resto",
              "Analisis Laba Rugi P&L",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E8E3D2] text-xs font-bold text-[#1C241E]">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        </main>
      ) : (
        /* ── Active Copilot Interface for Pranata Plus ── */
        <main
          className={cn(
            "flex-1 w-full max-w-[1720px]",
            "mx-auto flex flex-col",
            "min-h-0 overflow-hidden relative",
          )}
        >
          {messages.length === 0 ? (
            <div
              ref={chatScrollContainerRef}
              data-lenis-prevent
              className={cn(
                "flex-1 w-full overflow-y-auto px-4 sm:px-8 lg:px-12 py-6",
                "flex flex-col items-center justify-center text-center",
                "custom-scrollbar overscroll-contain",
              )}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold mb-3"
              >
                <span className="flex items-center gap-1.5">
                  <PlusBadge variant="black" size="sm" />
                  <span>Copilot Aktif</span>
                </span>
              </motion.div>

              {/* Greeting Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "text-4xl sm:text-5xl lg:text-6xl",
                  "font-black bg-linear-to-r from-[#2B4C3B]",
                  "via-[#3B664C] to-[#1E362A] bg-clip-text",
                  "text-transparent tracking-tight mb-2",
                )}
              >
                Halo, {userName}!
              </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "text-sm sm:text-base lg:text-lg",
                "font-medium text-[#5A635B] mb-8",
                "tracking-tight",
              )}
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", system-ui, sans-serif',
              }}
            >
              {profile?.role === "BUYER"
                ? "Mau masak apa hari ini? Tanyakan resep atau sebutkan menu favoritmu!"
                : "Ada yang bisa saya bantu untuk operasional & bisnis ternak Anda hari ini?"}
            </motion.p>

            {/* Suggestion Cards / Pills (Exact Layout from Design) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-3",
                "gap-4 max-w-5xl lg:max-w-6xl w-full",
                "mb-8 text-left",
              )}
            >
              {profile?.role === "BUYER" ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setInput("gw mau bikin rendang sapi Padang asli, carikan bahan-bahannya")
                    }
                    className={cn(
                      "bg-white hover:bg-[#F8F6F0] border",
                      "border-[#E8E3D2] p-4 sm:p-5",
                      "rounded-3xl shadow-sm hover:shadow-md",
                      "transition-all group cursor-pointer",
                      "flex flex-col justify-between",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-block px-3 py-1",
                          "rounded-full text-[10px] font-black",
                          "uppercase tracking-wider bg-[#EEF2E6]",
                          "text-[#2B4C3B] mb-2.5",
                        )}
                      >
                        Resep & Belanja
                      </span>
                      <p
                        className={cn(
                          "text-xs font-bold text-[#5A635B]",
                          "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                        )}
                      >
                        Bahan & bumbu rendang daging sapi empuk
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInput("Gimana resep bikin Steak Sirloin teflon rumahan yang juicy dan bahan apa aja yang perlu dibeli?")
                    }
                    className={cn(
                      "bg-white hover:bg-[#F8F6F0] border",
                      "border-[#E8E3D2] p-4 sm:p-5",
                      "rounded-3xl shadow-sm hover:shadow-md",
                      "transition-all group cursor-pointer",
                      "flex flex-col justify-between",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-block px-3 py-1",
                          "rounded-full text-[10px] font-black",
                          "uppercase tracking-wider bg-[#FFF1F2]",
                          "text-[#E11D48] mb-2.5",
                        )}
                      >
                        Steak Rumahan
                      </span>
                      <p
                        className={cn(
                          "text-xs font-bold text-[#5A635B]",
                          "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                        )}
                      >
                        Resep steak sirloin lezat & bahan pelengkap
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInput("Buatkan menu diet tinggi protein 3 hari menggunakan telur dan dada ayam, carikan produknya")
                    }
                    className={cn(
                      "bg-white hover:bg-[#F8F6F0] border",
                      "border-[#E8E3D2] p-4 sm:p-5",
                      "rounded-3xl shadow-sm hover:shadow-md",
                      "transition-all group cursor-pointer",
                      "flex flex-col justify-between",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-block px-3 py-1",
                          "rounded-full text-[10px] font-black",
                          "uppercase tracking-wider bg-[#F5F0E6]",
                          "text-[#856608] mb-2.5",
                        )}
                      >
                        Diet Sehat
                      </span>
                      <p
                        className={cn(
                          "text-xs font-bold text-[#5A635B]",
                          "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                        )}
                      >
                        Paket meal prep protein telur & ayam segar
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setInput(
                        "Bantu hitung rasio pakan (FCR) dan optimalkan biaya operasional harian ternak saya.",
                      )
                    }
                    className={cn(
                      "bg-white hover:bg-[#F8F6F0] border",
                      "border-[#E8E3D2] p-4 sm:p-5",
                      "rounded-3xl shadow-sm hover:shadow-md",
                      "transition-all group cursor-pointer",
                      "flex flex-col justify-between",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-block px-3 py-1",
                          "rounded-full text-[10px] font-black",
                          "uppercase tracking-wider bg-[#EEF2E6]",
                          "text-[#2B4C3B] mb-2.5",
                        )}
                      >
                        Simulasi Pakan
                      </span>
                      <p
                        className={cn(
                          "text-xs font-bold text-[#5A635B]",
                          "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                        )}
                      >
                        Hitung rasio FCR &
                        optimalkan estimasi pakan
                        harian
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInput(
                        "Kapan jadwal vaksinasi terbaik dan gejala klinis penyakit yang perlu diwaspadai?",
                      )
                    }
                    className={cn(
                      "bg-white hover:bg-[#F8F6F0] border",
                      "border-[#E8E3D2] p-4 sm:p-5",
                      "rounded-3xl shadow-sm hover:shadow-md",
                      "transition-all group cursor-pointer",
                      "flex flex-col justify-between",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-block px-3 py-1",
                          "rounded-full text-[10px] font-black",
                          "uppercase tracking-wider bg-[#FFF1F2]",
                          "text-[#E11D48] mb-2.5",
                        )}
                      >
                        Kesehatan Ternak
                      </span>
                      <p
                        className={cn(
                          "text-xs font-bold text-[#5A635B]",
                          "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                        )}
                      >
                        Konsultasi jadwal
                        vaksinasi & diagnosa
                        penyakit
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleGenerateInsights
                    }
                    className={cn(
                      "bg-white hover:bg-[#F8F6F0] border",
                      "border-[#E8E3D2] p-4 sm:p-5",
                      "rounded-3xl shadow-sm hover:shadow-md",
                      "transition-all group cursor-pointer",
                      "flex flex-col justify-between",
                      "active:scale-[0.98]",
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-block px-3 py-1",
                          "rounded-full text-[10px] font-black",
                          "uppercase tracking-wider bg-[#F5F0E6]",
                          "text-[#856608] mb-2.5",
                        )}
                      >
                        Insight Toko
                      </span>
                      <p
                        className={cn(
                          "text-xs font-bold text-[#5A635B]",
                          "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                        )}
                      >
                        Analisis data stok,
                        pesanan & cuaca peternakan
                      </p>
                    </div>
                  </button>
                </>
              )}
            </motion.div>
          </div>
        ) : (
          /* Active Chat Stream View — Fully Scrollable Chat Area */
          <div
            ref={chatScrollContainerRef}
            data-lenis-prevent
            className={cn(
              "flex-1 w-full overflow-y-auto min-h-0",
              "px-4 sm:px-8 lg:px-12 py-6 space-y-6",
              "custom-scrollbar overscroll-contain",
            )}
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={`flex gap-3 sm:gap-4 ${m.role === "user" ? "justify-end" : "justify-start"} w-full`}
                >
                  {m.role ===
                    "assistant" && (
                    <div
                      className={cn(
                        "w-9 h-9 sm:w-10",
                        "sm:h-10 shrink-0 rounded-2xl",
                        "bg-linear-to-br from-[#1C241E] to-[#2B4C3B]",
                        "flex items-center justify-center",
                        "text-white shadow-md mt-1",
                        "border border-white/20",
                      )}
                    >
                      <Sparkles
                        size={18}
                        className="text-emerald-400"
                      />
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-[2rem] p-4 sm:p-5.5 shadow-sm transition-all",
                      m.role === "user"
                        ? "max-w-[85%] sm:max-w-[70%] lg:max-w-[55%] bg-[#2B4C3B] text-white rounded-tr-none"
                        : "w-full max-w-[96%] lg:max-w-[94%] xl:max-w-[92%] bg-white border border-[#E8E3D2] text-[#1C241E] rounded-tl-none min-w-0",
                    )}
                  >
                    {/* Render Image Attachments */}
                    {m.experimental_attachments &&
                      m.experimental_attachments.map(
                        (att, i) => (
                          <div
                            key={i}
                            className="mb-3"
                          >
                            {att.contentType?.startsWith(
                              "image/",
                            ) ? (
                              <img
                                src={att.url}
                                alt="Attachment"
                                className={cn(
                                  "rounded-2xl max-h-60 object-cover",
                                  "border border-[#E8E3D2] shadow-sm",
                                )}
                              />
                            ) : (
                              <div
                                className={cn(
                                  "bg-[#F8F6F0] text-[#1C241E] px-3.5",
                                  "py-2.5 rounded-xl flex",
                                  "items-center gap-2 text-xs",
                                  "font-bold border border-[#E8E3D2]",
                                )}
                              >
                                <Paperclip
                                  size={14}
                                  className="text-[#C25939]"
                                />{" "}
                                {att.name ||
                                  "File"}
                              </div>
                            )}
                          </div>
                        ),
                      )}

                    {/* Render Assistant Content with Embedded Products */}
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap font-bold text-sm sm:text-base">
                        {m.content}
                      </p>
                    ) : (
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {(() => {
                          const content = m.content || "";
                          
                          let cleanContent = content;
                          let parsedProducts: MarketProductItem[] | null = null;

                          // 1. Try matching explicit :::products [...] ::: or ```products [...] ```
                          const delimiterMatch = content.match(/(?:::products|```products)\s*([\s\S]*?)(?:::|```|$)/i);
                          if (delimiterMatch) {
                            const rawJson = delimiterMatch[1].trim();
                            try {
                              parsedProducts = JSON.parse(rawJson);
                            } catch {
                              // Try extracting standard bracketed JSON array within the delimiter
                              const arrayMatch = rawJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
                              if (arrayMatch) {
                                try {
                                  parsedProducts = JSON.parse(arrayMatch[0]);
                                } catch {}
                              }
                            }
                            // Clean delimiter out of text view
                            cleanContent = cleanContent.replace(/(?:::products|```products)\s*[\s\S]*?(?:::|```|$)/i, "").trim();
                          }

                          // 2. Fallback: Search for any JSON array containing product objects {"id": ... "title": ...}
                          if (!parsedProducts) {
                            const genericArrayMatch = content.match(/(\[\s*\{[\s\S]*?"(?:title|name)"[\s\S]*?"(?:price|id)"[\s\S]*?\}\s*\])/i);
                            if (genericArrayMatch) {
                              try {
                                const candidate = JSON.parse(genericArrayMatch[1].trim());
                                if (Array.isArray(candidate) && candidate.length > 0 && candidate[0].title) {
                                  parsedProducts = candidate;
                                  cleanContent = cleanContent.replace(genericArrayMatch[1], "").replace(/```(?:json)?/gi, "").trim();
                                }
                              } catch {}
                            }
                          }

                          return (
                            <>
                              {cleanContent && (
                                <ReactMarkdown
                                  components={{
                                    p: ({
                                      node,
                                      ...props
                                    }) => (
                                      <p
                                        className="mb-4 last:mb-0 text-[#1C241E] font-medium"
                                        {...props}
                                      />
                                    ),
                                    h1: ({
                                      node,
                                      ...props
                                    }) => (
                                      <h1
                                        className={cn(
                                          "text-xl font-black text-[#2B4C3B]",
                                          "mt-5 mb-2.5 first:mt-0",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    h2: ({
                                      node,
                                      ...props
                                    }) => (
                                      <h2
                                        className={cn(
                                          "text-lg font-black text-[#2B4C3B]",
                                          "mt-5 mb-2.5 first:mt-0",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    h3: ({
                                      node,
                                      ...props
                                    }) => (
                                      <h3
                                        className={cn(
                                          "text-base font-black text-[#2B4C3B]",
                                          "mt-4 mb-2 first:mt-0",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    ul: ({
                                      node,
                                      ...props
                                    }) => (
                                      <ul
                                        className={cn(
                                          "list-disc pl-5 mb-4",
                                          "space-y-1.5 text-[#1C241E] font-medium",
                                          "marker:text-[#C25939]",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    ol: ({
                                      node,
                                      ...props
                                    }) => (
                                      <ol
                                        className={cn(
                                          "list-decimal pl-5 mb-4",
                                          "space-y-1.5 text-[#1C241E] font-medium",
                                          "marker:text-[#C25939]",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    li: ({
                                      node,
                                      ...props
                                    }) => (
                                      <li
                                        className=""
                                        {...props}
                                      />
                                    ),
                                    strong: ({
                                      node,
                                      ...props
                                    }) => (
                                      <strong
                                        className="font-black text-[#1C241E]"
                                        {...props}
                                      />
                                    ),
                                    a: ({
                                      node,
                                      ...props
                                    }) => (
                                      <a
                                        className={cn(
                                          "text-[#C25939] hover:text-[#F5990D] font-bold",
                                          "underline",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    table: ({
                                      node,
                                      ...props
                                    }) => (
                                      <div className="overflow-x-auto mb-4">
                                        <table
                                          className="w-full text-left border-collapse"
                                          {...props}
                                        />
                                      </div>
                                    ),
                                    th: ({
                                      node,
                                      ...props
                                    }) => (
                                      <th
                                        className={cn(
                                          "border-b-2 border-[#E8E3D2] p-2.5",
                                          "font-bold text-[#2B4C3B] bg-[#F8F6F0]",
                                        )}
                                        {...props}
                                      />
                                    ),
                                    td: ({
                                      node,
                                      ...props
                                    }) => (
                                      <td
                                        className="border-b border-[#E8E3D2] p-2.5"
                                        {...props}
                                      />
                                    ),
                                  }}
                                >
                                  {cleanContent}
                                </ReactMarkdown>
                              )}

                              {parsedProducts && parsedProducts.length > 0 && (
                                <ChatProductEmbed products={parsedProducts} />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-3 sm:gap-4">
                <div
                  className={cn(
                    "w-9 h-9 sm:w-10",
                    "sm:h-10 shrink-0 rounded-2xl",
                    "bg-[#2B4C3B] flex items-center",
                    "justify-center text-white shadow-md",
                    "mt-1 border border-white/20",
                    "animate-pulse",
                  )}
                >
                  <Loader2
                    size={18}
                    className="animate-spin text-emerald-400"
                  />
                </div>
                <div
                  className={cn(
                    "bg-white border border-[#E8E3D2]",
                    "rounded-[2rem] rounded-tl-none p-4",
                    "flex items-center gap-2",
                    "text-[#5A635B] text-xs font-bold",
                    "shadow-sm",
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-[#F5990D] animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-[#F5990D] animate-bounce"
                    style={{
                      animationDelay:
                        "0.15s",
                    }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[#F5990D] animate-bounce"
                    style={{
                      animationDelay: "0.3s",
                    }}
                  />
                  <span className="ml-1 text-[#5A635B]">
                    Pranata Intelligence
                    berpikir...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Sticky Bottom Chat Input Bar & Footer ── */}
        <div className="w-full shrink-0 bg-linear-to-t from-[#F8F6F0] via-[#F8F6F0]/95 to-transparent pt-3 pb-3 sm:pb-4 px-4 sm:px-8 lg:px-12 z-20">
          <div className="w-full max-w-5xl xl:max-w-6xl mx-auto">
            {/* File Attachment Previews */}
            {files && files.length > 0 && (
              <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1">
                {Array.from(files).map((file, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative bg-white rounded-xl",
                      "p-2.5 flex items-center",
                      "gap-2 text-xs font-bold",
                      "text-[#1C241E] border border-[#E8E3D2]",
                      "shadow-xs shrink-0",
                    )}
                  >
                    <Paperclip size={14} className="text-[#C25939]" />
                    <span className="truncate max-w-35">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className={cn(
                        "ml-1 p-0.5 hover:bg-[#F8F6F0]",
                        "rounded-full text-[#5A635B] hover:text-[#C25939]",
                        "transition-colors cursor-pointer",
                      )}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className={cn(
                "bg-[#1C241E] text-white p-3.5",
                "sm:p-4 rounded-[2rem] shadow-xl",
                "border border-[#2B4C3B]/50 relative",
                "transition-all focus-within:ring-2",
                "focus-within:ring-[#4A7C59]/40",
              )}
            >
              {/* Top Sparkle Icon */}
              <div className="flex items-center gap-1.5 mb-1.5 text-white/70">
                <Sparkles size={15} className="text-[#F5990D]" />
                <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">Pranata Intelligence</span>
              </div>

              {/* Input Textarea */}
              <textarea
                ref={textareaRef}
                rows={2}
                className={cn(
                  "w-full bg-transparent border-none",
                  "text-white text-sm sm:text-base",
                  "font-medium focus:outline-none focus:ring-0",
                  "resize-none placeholder:text-white/40 leading-relaxed",
                )}
                placeholder="Tanyakan apa saja pada Pranata Intelligence..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e as any);
                  }
                }}
              />

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFiles(e.target.files);
                  }
                }}
                accept="image/*"
                className="hidden"
              />

              {/* Bottom Actions Bar inside Input Container */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-2",
                    "text-xs font-bold text-white/70",
                    "hover:text-white px-3 py-1.5",
                    "rounded-xl hover:bg-white/10",
                    "transition-colors cursor-pointer",
                  )}
                >
                  <Paperclip size={14} className="text-[#F5990D]" />
                  <span className="hidden sm:inline">Lampirkan Foto/File</span>
                  <span className="sm:hidden">Lampirkan</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || (!input && !files)}
                  className={cn(
                    "w-9 h-9 sm:w-10",
                    "sm:h-10 rounded-full bg-[#2B4C3B]",
                    "hover:bg-[#3B664C] text-white flex",
                    "items-center justify-center shadow-md",
                    "transition-all disabled:opacity-40 disabled:hover:bg-[#2B4C3B]",
                    "active:scale-95 cursor-pointer shrink-0",
                  )}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowUp size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </form>

            <p className="text-center mt-2 text-[10px] sm:text-[11px] font-bold text-[#7A8678]/80 tracking-wide">
              Pranata Intelligence Copilot • Informasi & Diagnosa AI Pasar Ternak
            </p>
          </div>
        </div>
      </main>
      )}

      {/* Upgrade Modal */}
      <UpgradePlusModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        initialPlan={profile?.role === "PRODUCER" ? "seller" : "customer"}
        onSuccess={() => {
          refreshProfile();
        }}
      />
    </div>
  );
}

