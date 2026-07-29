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
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StandaloneIntelligencePage() {
  const router = useRouter();
  const [profile, setProfile] =
    useState<any>(null);
  const [contextData, setContextData] =
    useState<any>(null);

  const {
    messages,
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
        );
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      const API_BASE = getApiBaseUrl();

      try {
        const [prodRes, ordRes] =
          await Promise.all([
            fetchApi(
              `${API_BASE}/api/products/seller/${session.id}`,
            ).catch(() => null),
            fetchApi(
              `${API_BASE}/api/orders/PRODUCER/${session.id}`,
            ).catch(() => null),
          ]);

        const products =
          prodRes && prodRes.ok
            ? await prodRes.json()
            : [];
        const orders =
          ordRes && ordRes.ok
            ? await ordRes.json()
            : [];
        setContextData({
          profile: session,
          products: Array.isArray(products)
            ? products
            : products.data || [],
          orders: Array.isArray(orders)
            ? orders
            : orders.data || [],
        });
      } catch (e) {
        console.error(
          "Background context fetch failed",
          e,
        );
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

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

  return (
    <div
      className={cn(
        "min-h-screen bg-[#F8F6F0] text-[#1C241E]",
        "flex flex-col justify-between",
        "selection:bg-[#2B4C3B] selection:text-white",
      )}
    >
      {/* ── Top Header Navigation ── */}
      <header
        className={cn(
          "w-full max-w-6xl mx-auto",
          "pt-4 px-4 sm:px-6",
          "flex items-center justify-between",
          "z-20 shrink-0",
        )}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/hub"
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-white border border-[#E8E3D2]",
              "flex items-center justify-center",
              "text-[#1C241E] hover:bg-[#EEF2E6] hover:text-[#2B4C3B]",
              "transition-colors shadow-sm active:scale-95",
              "cursor-pointer",
            )}
            title="Kembali ke Hub"
          >
            <ChevronLeft size={20} />
          </Link>

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
      </header>

      {/* ── Main Canvas Content ── */}
      <main
        className={cn(
          "flex-1 w-full max-w-5xl",
          "mx-auto px-4 sm:px-6",
          "py-6 flex flex-col",
          "justify-center items-center",
        )}
      >
        {messages.length === 0 ? (
          <div
            className={cn(
              "w-full flex flex-col",
              "items-center justify-center text-center",
              "my-auto",
            )}
          >
            {/* Greeting Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-4xl sm:text-5xl lg:text-6xl",
                "font-black bg-gradient-to-r from-[#2B4C3B]",
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
              Ada yang bisa saya bantu hari
              ini?
            </motion.p>

            {/* Suggestion Cards / Pills (Exact Layout from Design) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-3",
                "gap-3.5 max-w-3xl w-full",
                "mb-8 text-left",
              )}
            >
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
                      "uppercase tracking-wider bg-[#FEF3C7]",
                      "text-[#D97706] mb-2.5",
                    )}
                  >
                    Analisis Bisnis
                  </span>
                  <p
                    className={cn(
                      "text-xs font-bold text-[#5A635B]",
                      "leading-relaxed group-hover:text-[#1C241E] transition-colors",
                    )}
                  >
                    Ringkasan performa
                    penjualan & rekomendasi
                    AI
                  </p>
                </div>
              </button>
            </motion.div>
          </div>
        ) : (
          /* Active Chat Stream View */
          <div
            className={cn(
              "w-full flex-1 overflow-y-auto",
              "mb-6 space-y-5 px-2",
              "custom-scrollbar max-h-[60vh]",
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
                  className={`flex gap-3 sm:gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role ===
                    "assistant" && (
                    <div
                      className={cn(
                        "w-9 h-9 sm:w-10",
                        "sm:h-10 shrink-0 rounded-2xl",
                        "bg-gradient-to-br from-[#1C241E] to-[#2B4C3B]",
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
                    className={`max-w-[88%] sm:max-w-[82%] rounded-[2rem] p-4 sm:p-5 shadow-sm ${
                      m.role === "user"
                        ? "bg-[#2B4C3B] text-white rounded-tr-none"
                        : "bg-white border border-[#E8E3D2] text-[#1C241E] rounded-tl-none"
                    }`}
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

                    {/* Render Markdown Text */}
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap font-bold text-sm sm:text-base">
                        {m.content}
                      </p>
                    ) : (
                      <div className="text-xs sm:text-sm leading-relaxed">
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
                          {m.content}
                        </ReactMarkdown>
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

        {/* ── Big Futuristic Chat Input Box (Exact Design from Reference Image) ── */}
        <div className="w-full max-w-3xl">
          {/* File Attachment Previews */}
          {files && files.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {Array.from(files).map(
                (file, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative bg-white rounded-xl",
                      "p-2.5 flex items-center",
                      "gap-2 text-xs font-bold",
                      "text-[#1C241E] border border-[#E8E3D2]",
                      "shadow-sm shrink-0",
                    )}
                  >
                    <Paperclip
                      size={14}
                      className="text-[#C25939]"
                    />
                    <span className="truncate max-w-[140px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(null);
                        if (
                          fileInputRef.current
                        )
                          fileInputRef.current.value =
                            "";
                      }}
                      className={cn(
                        "ml-1 p-0.5 hover:bg-[#F8F6F0]",
                        "rounded-full text-[#5A635B] hover:text-[#C25939]",
                        "transition-colors cursor-pointer",
                      )}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}

          {error && (
            <div
              className={cn(
                "text-red-600 text-xs font-bold",
                "mb-3 p-3 bg-red-50",
                "rounded-2xl border border-red-200",
              )}
            >
              Terjadi kesalahan:{" "}
              {error.message}. Mohon periksa
              koneksi atau API Key.
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className={cn(
              "bg-[#1C241E] text-white p-4",
              "sm:p-5 rounded-[2.5rem] shadow-2xl",
              "border border-[#2B4C3B]/50 relative",
              "overflow-hidden transition-all focus-within:ring-2",
              "focus-within:ring-[#4A7C59]/40",
            )}
          >
            {/* Top Sparkle Icon */}
            <div className="flex items-center gap-1.5 mb-2 text-white/70">
              <Sparkles
                size={16}
                className="text-[#F5990D]"
              />
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
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  onSubmit(e as any);
                }
              }}
            />

            {/* Bottom Actions Bar inside Input Container */}
            <div
              className={cn(
                "flex items-center justify-between",
                "pt-3 mt-1 border-t",
                "border-white/10",
              )}
            >
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={(e) =>
                  setFiles(e.target.files)
                }
                accept="image/*,.pdf,.csv,.txt"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={cn(
                  "inline-flex items-center gap-2",
                  "bg-white/10 hover:bg-white/20 text-white",
                  "text-xs font-extrabold px-3.5",
                  "py-2 rounded-full transition-colors",
                  "border border-white/10 cursor-pointer",
                  "active:scale-95",
                )}
              >
                <Paperclip
                  size={14}
                  className="text-[#F5990D]"
                />
                <span>
                  Lampirkan File / Gambar
                </span>
              </button>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  (!input && !files)
                }
                className={cn(
                  "w-10 h-10 sm:w-11",
                  "sm:h-11 rounded-full bg-[#2B4C3B]",
                  "hover:bg-[#3B664C] text-white flex",
                  "items-center justify-center shadow-lg",
                  "transition-all disabled:opacity-40 disabled:hover:bg-[#2B4C3B]",
                  "active:scale-95 cursor-pointer shrink-0",
                )}
              >
                {isLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <ArrowUp
                    size={20}
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className={cn(
          "w-full text-center py-4",
          "text-[11px] font-bold text-[#7A8678]",
          "tracking-wider uppercase shrink-0",
        )}
      >
        Powered by Pranata Intelligence
        Engine • Kebebasan Informasi &
        Diagnosa AI Peternakan
      </footer>
    </div>
  );
}
