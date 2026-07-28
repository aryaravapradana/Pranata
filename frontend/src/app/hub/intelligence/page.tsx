"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Paperclip, Loader2, Sparkles, X, ArrowUp, ChevronLeft, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { fetchApi, getApiBaseUrl } from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePageLoading, useGlobalLoading } from "@/components/shared/loading-context";

export default function IntelligencePage() {
  const router = useRouter();
  const { navigateTo } = useGlobalLoading();
  const [profile, setProfile] = useState<any>(null);
  const [contextData, setContextData] = useState<any>(null);
  const [fetchingContext, setFetchingContext] = useState(true);
  usePageLoading(fetchingContext);

  const { messages, setMessages, input, setInput, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    body: { contextData }
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showClearModal, setShowClearModal] = useState(false);

  // Load saved chat history from localStorage on initial mount
  useEffect(() => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    const storageKey = `pranata_chat_history_${session.id || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    }
  }, [setMessages]);

  // Save chat history to localStorage on message updates
  useEffect(() => {
    if (messages.length > 0) {
      const sessionStr = localStorage.getItem("farmpro_session");
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      const storageKey = `pranata_chat_history_${session.id || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages]);

  const handleConfirmClear = () => {
    setMessages([]);
    const sessionStr = localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      localStorage.removeItem(`pranata_chat_history_${session.id || 'default'}`);
    }
    setShowClearModal(false);
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem("farmpro_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setProfile(session);
    }

    const fetchContext = async () => {
      const sessionStr = localStorage.getItem("farmpro_session");
      if (!sessionStr) { setFetchingContext(false); return; }
      const session = JSON.parse(sessionStr);
      const API_BASE = getApiBaseUrl();

      try {
        const [prodRes, ordRes] = await Promise.all([
          fetchApi(`${API_BASE}/api/products/seller/${session.id}`).catch(() => null),
          fetchApi(`${API_BASE}/api/orders/PRODUCER/${session.id}`).catch(() => null)
        ]);

        const products = prodRes && prodRes.ok ? await prodRes.json() : [];
        const orders = ordRes && ordRes.ok ? await ordRes.json() : [];
        setContextData({
          profile: session,
          products: Array.isArray(products) ? products : (products.data || []),
          orders: Array.isArray(orders) ? orders : (orders.data || [])
        });
      } catch (e) {
        console.error("Background context fetch failed", e);
      } finally {
        setFetchingContext(false);
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const compressImage = (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.75): Promise<{ name: string; contentType: string; url: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, contentType: file.type, url: reader.result as string });
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

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ name: file.name, contentType: file.type, url: e.target?.result as string });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          if (compressedDataUrl && compressedDataUrl.startsWith('data:image/') && compressedDataUrl.includes(';base64,') && compressedDataUrl.length > 100) {
            resolve({
              name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              contentType: 'image/jpeg',
              url: compressedDataUrl,
            });
          } else {
            resolve({ name: file.name, contentType: file.type, url: e.target?.result as string });
          }
        };
        img.onerror = () => resolve({ name: file.name, contentType: file.type, url: e.target?.result as string });
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input && (!files || files.length === 0)) return;

    let attachments: Array<{ name: string; contentType: string; url: string }> | undefined = undefined;
    if (files && files.length > 0) {
      attachments = await Promise.all(
        Array.from(files).map((file) => compressImage(file))
      );
    }

    handleSubmit(e, {
      experimental_attachments: attachments as any,
    });
    setFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateInsights = async () => {
    append({
      role: 'user',
      content: 'Tolong berikan ringkasan performa bisnis saya saat ini dan berikan 1-2 rekomendasi (Actionable Insights) terpenting berdasarkan data penjualan dan produk saya di backend.'
    });
  };

  const userName = profile?.fullName?.split(" ")[0] || profile?.farmName || "Peternak";

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E] flex flex-col justify-between selection:bg-[#2B4C3B] selection:text-white relative">
      {/* ── Top Header Navigation (Sticky Top) ── */}
      <header className="sticky top-0 z-40 w-full bg-[#F8F6F0]/90 backdrop-blur-md pt-3.5 pb-2.5 px-4 sm:px-6 shrink-0 border-b border-[#E8E3D2]/40">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between relative">
          <button 
            onClick={() => navigateTo("/hub")} 
            className="w-10 h-10 rounded-full bg-white border border-[#E8E3D2] flex items-center justify-center text-[#1C241E] hover:bg-[#EEF2E6] hover:text-[#2B4C3B] transition-colors shadow-sm active:scale-95 cursor-pointer z-10"
            title="Kembali ke Hub"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Centered Intelligence WebP Logo (shows only when chat has started) */}
          {messages.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img 
                src="/logos/intelligence/intelligence-black.webp" 
                alt="Pranata Intelligence" 
                className="h-6 sm:h-7 w-auto object-contain drop-shadow-sm pointer-events-auto" 
              />
            </div>
          )}

          <div className="w-10 h-10" />
        </div>
      </header>

      {/* ── Main Canvas Content (Native Page Scroll Flow) ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-28 flex flex-col justify-between items-center">
        {messages.length === 0 ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center text-center my-auto">
            
            {/* Centered Pranata Intelligence Logo */}
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-4 sm:mb-6 flex items-center justify-center"
            >
              <img 
                src="/logos/intelligence/intelligence-black.webp" 
                alt="Pranata Intelligence" 
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain drop-shadow-sm" 
              />
            </motion.div>

            {/* Greeting Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#2B4C3B] via-[#3B664C] to-[#1E362A] bg-clip-text text-transparent tracking-tight mb-2"
            >
              Halo, {userName}!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base lg:text-lg font-medium text-[#5A635B] mb-8 tracking-tight"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", system-ui, sans-serif' }}
            >
              Ada yang bisa saya bantu hari ini?
            </motion.p>

            {/* Suggestion Cards / Pills (Exact Layout from Design) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl w-full mb-8 text-left"
            >
              <button 
                type="button"
                onClick={() => setInput("Bantu hitung rasio pakan (FCR) dan optimalkan biaya operasional harian ternak saya.")}
                className="bg-white hover:bg-[#F8F6F0] border border-[#E8E3D2] p-4 sm:p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between active:scale-[0.98]"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EEF2E6] text-[#2B4C3B] mb-2.5">
                    Simulasi Pakan
                  </span>
                  <p className="text-xs font-bold text-[#5A635B] leading-relaxed group-hover:text-[#1C241E] transition-colors">
                    Hitung rasio FCR & optimalkan estimasi pakan harian
                  </p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setInput("Kapan jadwal vaksinasi terbaik dan gejala klinis penyakit yang perlu diwaspadai?")}
                className="bg-white hover:bg-[#F8F6F0] border border-[#E8E3D2] p-4 sm:p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between active:scale-[0.98]"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF1F2] text-[#E11D48] mb-2.5">
                    Kesehatan Ternak
                  </span>
                  <p className="text-xs font-bold text-[#5A635B] leading-relaxed group-hover:text-[#1C241E] transition-colors">
                    Konsultasi jadwal vaksinasi & diagnosa penyakit
                  </p>
                </div>
              </button>

              <button 
                type="button"
                onClick={handleGenerateInsights}
                className="bg-white hover:bg-[#F8F6F0] border border-[#E8E3D2] p-4 sm:p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between active:scale-[0.98]"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FEF3C7] text-[#D97706] mb-2.5">
                    Analisis Bisnis
                  </span>
                  <p className="text-xs font-bold text-[#5A635B] leading-relaxed group-hover:text-[#1C241E] transition-colors">
                    Ringkasan performa penjualan & rekomendasi AI
                  </p>
                </div>
              </button>
            </motion.div>

          </div>
        ) : (
          /* Active Chat Stream View (Native Page Flow) */
          <div className="w-full space-y-5 px-2">
            <AnimatePresence initial={false}>
              {messages.map(m => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 sm:gap-4 items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-white border border-[#E8E3D2] p-1.5 flex items-center justify-center shadow-sm overflow-hidden sticky top-20 z-10">
                      <img 
                        src="/logomarks/intelligence-logomark.png" 
                        alt="Pranata AI" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] rounded-[2rem] p-4 sm:p-5 shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-[#2B4C3B] text-white rounded-tr-none' 
                      : 'bg-white border border-[#E8E3D2] text-[#1C241E] rounded-tl-none'
                  }`}>
                    {/* Sender Name Label */}
                    {m.role === 'assistant' ? (
                      <div className="text-[10px] sm:text-[11px] font-black text-[#2B4C3B] uppercase tracking-wider mb-2">
                        Pranata Intelligence
                      </div>
                    ) : (
                      <div className="text-[10px] sm:text-[11px] font-black text-[#C8E6C9] uppercase tracking-wider mb-2 text-right">
                        {profile?.fullName || profile?.farmName || "Peternak"}
                      </div>
                    )}

                    {/* Render Image Attachments */}
                    {m.experimental_attachments && m.experimental_attachments.map((att, i) => (
                      <div key={i} className="mb-3">
                        {att.contentType?.startsWith('image/') ? (
                          <img src={att.url} alt="Attachment" className="rounded-2xl max-h-60 object-cover border border-[#E8E3D2] shadow-sm" />
                        ) : (
                          <div className="bg-[#F8F6F0] text-[#1C241E] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold border border-[#E8E3D2]">
                            <Paperclip size={14} className="text-[#C25939]" /> {att.name || "File"}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Render Markdown Text */}
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap font-bold text-sm sm:text-base">{m.content}</p>
                    ) : (
                      <div className="text-xs sm:text-sm leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-[#1C241E] font-medium" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-black text-[#2B4C3B] mt-5 mb-2.5 first:mt-0" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-black text-[#2B4C3B] mt-5 mb-2.5 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-black text-[#2B4C3B] mt-4 mb-2 first:mt-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[#1C241E] font-medium marker:text-[#C25939]" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-[#1C241E] font-medium marker:text-[#C25939]" {...props} />,
                            li: ({node, ...props}) => <li className="" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-black text-[#1C241E]" {...props} />,
                            a: ({node, ...props}) => <a className="text-[#C25939] hover:text-[#F5990D] font-bold underline" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full text-left border-collapse" {...props} /></div>,
                            th: ({node, ...props}) => <th className="border-b-2 border-[#E8E3D2] p-2.5 font-bold text-[#2B4C3B] bg-[#F8F6F0]" {...props} />,
                            td: ({node, ...props}) => <td className="border-b border-[#E8E3D2] p-2.5" {...props} />
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-[#2B4C3B] border border-[#2B4C3B]/30 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm overflow-hidden sticky top-20 z-10">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={userName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span>{userName ? userName[0].toUpperCase() : <User size={18} />}</span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-3 sm:gap-4 justify-start items-start">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-white border border-[#E8E3D2] p-1.5 flex items-center justify-center shadow-sm overflow-hidden sticky top-20 z-10 animate-pulse">
                  <img 
                    src="/logomarks/intelligence-logomark.png" 
                    alt="Pranata AI" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="bg-white border border-[#E8E3D2] rounded-[2rem] rounded-tl-none p-4 flex items-center gap-2 text-[#5A635B] text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#F5990D] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#F5990D] animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 rounded-full bg-[#F5990D] animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="ml-1 text-[#5A635B]">Pranata Intelligence berpikir...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* ── Fixed Bottom Chat Input Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-3 sm:pb-4 pt-4 bg-gradient-to-t from-[#F8F6F0] via-[#F8F6F0]/95 to-transparent">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pointer-events-auto">
          
          {/* File Attachment Previews */}
          {files && files.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {Array.from(files).map((file, i) => (
                <div key={i} className="relative bg-white rounded-xl p-2 flex items-center gap-2 text-xs font-bold text-[#1C241E] border border-[#E8E3D2] shadow-sm shrink-0">
                  <Paperclip size={13} className="text-[#C25939]" />
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setFiles(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="ml-1 p-0.5 hover:bg-[#F8F6F0] rounded-full text-[#5A635B] hover:text-[#C25939] transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-xs font-bold mb-2 p-2.5 bg-red-50 rounded-2xl border border-red-200">
              Terjadi kesalahan: {error.message}. Mohon periksa koneksi atau API Key.
            </div>
          )}

          <form 
            onSubmit={onSubmit}
            className="bg-white text-[#1C241E] p-3 sm:p-4 rounded-3xl sm:rounded-[2rem] shadow-xl border border-[#E8E3D2] relative overflow-hidden transition-all focus-within:border-[#2B4C3B] focus-within:ring-2 focus-within:ring-[#2B4C3B]/10"
          >
            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              className="w-full bg-transparent border-none text-[#1C241E] text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 resize-none placeholder:text-[#7A8678] leading-relaxed min-h-[36px] max-h-[120px]"
              placeholder="Tanyakan apa saja seputar ternak, pakan, atau analisis bisnis..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as any);
                }
              }}
            />

            {/* Bottom Actions Bar inside Input Container */}
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-[#E8E3D2]/60">
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => setFiles(e.target.files)}
                  accept="image/*,.pdf,.csv,.txt"
                />

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 bg-[#F8F6F0] hover:bg-[#EEF2E6] text-[#2B4C3B] text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors border border-[#E8E3D2] cursor-pointer active:scale-95"
                >
                  <Paperclip size={13} className="text-[#C25939]" />
                  <span>Lampirkan Berkas</span>
                </button>

                {messages.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setShowClearModal(true)}
                    className="inline-flex items-center gap-1.5 bg-[#F8F6F0] hover:bg-red-50 text-[#7A8678] hover:text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors border border-[#E8E3D2] cursor-pointer active:scale-95"
                    title="Hapus Riwayat Chat"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Chat</span>
                  </button>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoading || (!input && !files)}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#2B4C3B] hover:bg-[#1E362A] text-white flex items-center justify-center shadow-md transition-all disabled:opacity-30 disabled:hover:bg-[#2B4C3B] active:scale-95 cursor-pointer shrink-0"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin text-white" /> : <ArrowUp size={18} strokeWidth={2.5} />}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* ── Custom Confirmation Modal ── */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative z-10 bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E8E3D2] shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100 shadow-sm">
                <Trash2 size={24} />
              </div>

              <h3 className="text-base sm:text-lg font-black text-[#1C241E] mb-1">
                Hapus Riwayat Chat?
              </h3>
              <p className="text-xs text-[#5A635B] font-medium leading-relaxed mb-6">
                Seluruh percakapan Anda dengan Pranata Intelligence akan dihapus dari perangkat ini.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 bg-[#F8F6F0] hover:bg-[#EEF2E6] text-[#1C241E] font-extrabold text-xs py-2.5 px-4 rounded-full transition-colors border border-[#E8E3D2] active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-full transition-colors shadow-md active:scale-95 cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="w-full text-center pb-3 pt-1 text-[11px] font-bold text-[#7A8678] tracking-wider uppercase shrink-0">
        Powered by Pranata Intelligence Engine • Kebebasan Informasi & Diagnosa AI Peternakan
      </footer>
    </div>
  );
}
