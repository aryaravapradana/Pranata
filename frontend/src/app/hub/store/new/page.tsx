"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  X,
  Image as ImageIcon,
  Crown,
  Star,
  CheckCircle,
  Info,
  Loader2,
  XCircle,
  Minus,
  Plus,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";
import { uploadImage } from "@/lib/supabaseStorage";

const getGradeStyle = (gradeStr: string) => {
  const g = (gradeStr || "")
    .toLowerCase()
    .trim();
  if (g === "premium") {
    return {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700",
      badgeBg: "bg-amber-500",
      badgeText: "text-white",
      icon: Crown,
      iconColor: "text-[#F5990D]",
    };
  } else if (
    g === "grade a" ||
    g === "a" ||
    g.endsWith(" a")
  ) {
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      icon: Star,
      iconColor: "text-emerald-500",
    };
  } else if (
    g === "grade b" ||
    g === "b" ||
    g.endsWith(" b")
  ) {
    return {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      badgeBg: "bg-blue-600",
      badgeText: "text-white",
      icon: CheckCircle,
      iconColor: "text-blue-500",
    };
  }
  return {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    icon: AlertTriangle,
    iconColor: "text-red-500",
  };
};

export default function NewProductPage() {
  const router = useRouter();
  const [profile, setProfile] =
    useState<any>(null);

  const [stepperStep, setStepperStep] =
    useState(1);
  const [newProduct, setNewProduct] =
    useState({
      title: "",
      description: "",
      category: "Daging",
      price: 0,
      stock: 0,
      minOrder: 1,
      unit: "kg",
      imageUrls: [] as string[],
    });

  const [benchmarkPrice, setBenchmarkPrice] =
    useState<number | null>(null);
  const [isAiProcessing, setIsAiProcessing] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [
    aiAnalysisResult,
    setAiAnalysisResult,
  ] = useState<{
    grade: string;
    analysis: string;
  } | null>(null);
  const [
    showUnitDropdown,
    setShowUnitDropdown,
  ] = useState(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem(
      "farmpro_session",
    );
    if (!sessionStr) {
      router.push("/login");
      return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role === "BUYER") {
      router.push("/market");
      return;
    }
    setProfile(session);
    checkBenchmark();
  }, []);

  const checkBenchmark = async () => {
    const API_BASE = getApiBaseUrl();
    try {
      const res = await fetchApi(
        `${API_BASE}/api/prices`,
      );
      const data = await res.json();
      if (data.length > 0) {
        setBenchmarkPrice(
          data[0].pricePerKg,
        );
      }
    } catch (e) {}
  };

  const handleCheckGradeAIWithImage = async (
    imageUrl: string,
  ) => {
    setIsAiProcessing(true);
    try {
      const aiRes = await fetch(
        "/api/ai/grade",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        },
      );
      const aiData = await aiRes.json();
      if (aiData.grade) {
        setAiAnalysisResult({
          grade: aiData.grade,
          analysis: aiData.analysis,
        });
      } else {
        alert(
          "Gagal memproses AI Grading. Pastikan gambar daging jelas.",
        );
      }
    } catch (error) {
      alert(
        "Terjadi kesalahan saat memproses AI Grading.",
      );
    }
    setIsAiProcessing(false);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots =
      5 - newProduct.imageUrls.length;
    const filesToProcess = Array.from(
      files,
    ).slice(0, remainingSlots);

    for (
      let index = 0;
      index < filesToProcess.length;
      index++
    ) {
      const file = filesToProcess[index];
      const imageUrl = await uploadImage(
        file,
        "products",
        800,
      );
      setNewProduct((prev) => ({
        ...prev,
        imageUrls: [
          ...prev.imageUrls,
          imageUrl,
        ],
      }));

      if (
        newProduct.category === "Daging" &&
        newProduct.imageUrls.length === 0 &&
        index === 0
      ) {
        setAiAnalysisResult(null);
        handleCheckGradeAIWithImage(
          imageUrl,
        );
      }
    }
    e.target.value = "";
  };

  const handleAddProduct = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    if (
      isSubmitting ||
      isAiProcessing ||
      !profile
    )
      return;

    const isUnfitMeat =
      newProduct.category === "Daging" &&
      aiAnalysisResult &&
      (aiAnalysisResult.grade ===
        "Tidak Layak" ||
        aiAnalysisResult.grade ===
          "Bukan Daging" ||
        aiAnalysisResult.grade
          ?.toLowerCase()
          .includes("tidak layak") ||
        aiAnalysisResult.grade
          ?.toLowerCase()
          .includes("bukan daging"));

    if (isUnfitMeat) {
      alert(
        `Daging dinilai '${aiAnalysisResult?.grade}'. Produk tidak layak konsumsi tidak dapat dipublish!`,
      );
      return;
    }

    const API_BASE = getApiBaseUrl();

    let gradeToSave = undefined;
    let aiAnalysisToSave = undefined;

    if (
      newProduct.category === "Daging" &&
      newProduct.imageUrls.length > 0
    ) {
      if (!aiAnalysisResult) {
        alert(
          "Mohon lakukan 'Cek Grade AI' terlebih dahulu pada foto daging Anda sebelum mem-publish.",
        );
        return;
      } else {
        gradeToSave = aiAnalysisResult.grade;
        aiAnalysisToSave =
          aiAnalysisResult.analysis;
      }
    }

    setIsSubmitting(true);

    try {
      await fetchApi(
        `${API_BASE}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sellerId: profile.id,
            title: newProduct.title,
            description:
              newProduct.description,
            category: newProduct.category,
            price: newProduct.price,
            stock: newProduct.stock,
            minOrder: newProduct.minOrder,
            unit: newProduct.unit,
            imageUrls:
              newProduct.imageUrls.length > 0
                ? newProduct.imageUrls
                : [
                    "https://images.unsplash.com/photo-1595856728084-2b63897d2644?q=80&w=600&auto=format&fit=crop",
                  ],
            grade: gradeToSave,
            aiAnalysis: aiAnalysisToSave,
          }),
        },
      );
      router.push("/hub/store");
    } catch (err) {
      alert("Gagal membuat produk.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-[#F8F6F0] p-3.5",
        "sm:p-6 md:p-10 text-[#1C241E]",
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto space-y-6",
          "sm:space-y-8 px-0 sm:px-4",
          "md:px-8 lg:px-12",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() =>
              stepperStep === 2
                ? setStepperStep(1)
                : router.push("/hub/store")
            }
            className={cn(
              "text-[#5A635B] hover:text-[#2B4C3B] p-2.5",
              "sm:p-3 bg-white rounded-full",
              "shadow-sm transition-all hover:shadow-md",
              "shrink-0",
            )}
          >
            <ArrowLeft
              size={20}
              className="sm:w-6 sm:h-6"
            />
          </button>
          <div>
            <h1
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl",
                "font-black text-[#2B4C3B] tracking-tight",
              )}
            >
              {stepperStep === 1
                ? "Pilih Kategori Produk"
                : "Detail Produk Baru"}
            </h1>
            <p
              className={cn(
                "text-xs sm:text-sm text-[#5A635B]",
                "font-semibold mt-0.5 sm:mt-1",
              )}
            >
              Langkah {stepperStep} dari 2
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            "bg-white rounded-2xl sm:rounded-3xl",
            "shadow-xl overflow-hidden border",
            "border-[#E8E3D2]",
          )}
        >
          <div className="p-4 sm:p-8 md:p-12">
            {stepperStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    name: "Daging",
                    image:
                      "/icons/daging.webp",
                    desc: "Sapi, Kambing, Ayam, dll.",
                    theme:
                      "hover:border-red-400 hover:bg-red-50",
                  },
                  {
                    name: "Susu",
                    image:
                      "/icons/susu.webp",
                    desc: "Susu sapi segar, kambing, dll.",
                    theme:
                      "hover:border-blue-400 hover:bg-blue-50",
                  },
                  {
                    name: "Telur",
                    image:
                      "/icons/telor.webp",
                    desc: "Telur ayam, bebek, puyuh, dll.",
                    theme:
                      "hover:border-amber-400 hover:bg-amber-50",
                  },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setNewProduct({
                        ...newProduct,
                        category: cat.name,
                      });
                      setStepperStep(2);
                    }}
                    className={`flex flex-col items-center justify-center p-6 sm:p-10 bg-[#F8F6F0] rounded-2xl sm:rounded-3xl border-2 border-[#E8E3D2] transition-all shadow-sm group hover:-translate-y-2 ${cat.theme}`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className={cn(
                        "w-16 h-16 sm:w-20",
                        "sm:h-20 mb-4 sm:mb-6",
                        "object-contain group-hover:scale-110 transition-transform",
                      )}
                      loading="lazy"
                      decoding="async"
                    />
                    <h3
                      className={cn(
                        "font-black text-xl sm:text-2xl",
                        "text-[#1C241E] mb-2 sm:mb-3",
                      )}
                    >
                      {cat.name}
                    </h3>
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-semibold",
                        "text-[#7A8678] text-center leading-tight",
                      )}
                    >
                      {cat.desc}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <form
                id="productForm"
                onSubmit={handleAddProduct}
                className="space-y-6 sm:space-y-10"
              >
                {/* Photo & Basic Details Row */}
                <div
                  className={cn(
                    "flex flex-col lg:flex-row",
                    "gap-6 sm:gap-8 lg:gap-10",
                  )}
                >
                  <div className="w-full lg:w-1/3 flex flex-col gap-3 sm:gap-4">
                    <div className="flex justify-between items-end mb-1 sm:mb-2">
                      <label
                        className={cn(
                          "block text-xs sm:text-sm",
                          "font-black text-[#2B4C3B] uppercase",
                          "tracking-wider",
                        )}
                      >
                        Foto Produk
                      </label>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-bold",
                          "text-[#7A8678] bg-[#F8F6F0] px-2.5",
                          "py-0.5 sm:px-3 sm:py-1",
                          "rounded-full",
                        )}
                      >
                        {
                          newProduct
                            .imageUrls.length
                        }
                        /5
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {newProduct.imageUrls.map(
                        (url, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "aspect-square bg-[#F8F6F0] rounded-xl",
                              "sm:rounded-2xl border border-[#DDE2D6]",
                              "overflow-hidden relative group",
                              "shadow-inner",
                            )}
                          >
                            <img
                              src={url}
                              alt={`Preview ${idx}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewProduct(
                                  (
                                    prev,
                                  ) => ({
                                    ...prev,
                                    imageUrls:
                                      prev.imageUrls.filter(
                                        (
                                          _,
                                          i,
                                        ) =>
                                          i !==
                                          idx,
                                      ),
                                  }),
                                );
                                setAiAnalysisResult(
                                  null,
                                );
                              }}
                              className={cn(
                                "absolute inset-0 bg-black/50",
                                "backdrop-blur-sm flex items-center",
                                "justify-center opacity-0 group-hover:opacity-100",
                                "transition-opacity",
                              )}
                            >
                              <X
                                className="text-white bg-black/40 rounded-full p-1.5 sm:p-2"
                                size={30}
                              />
                            </button>
                          </div>
                        ),
                      )}

                      {newProduct.imageUrls
                        .length < 5 && (
                        <div
                          className={cn(
                            "aspect-square bg-[#F8F6F0] rounded-xl",
                            "sm:rounded-2xl border-2 border-dashed",
                            "border-[#DDE2D6] flex flex-col",
                            "items-center justify-center relative",
                            "group cursor-pointer hover:border-[#4A7C59]",
                            "hover:bg-[#EEF2E6] transition-colors overflow-hidden",
                            "shadow-inner",
                          )}
                        >
                          {isAiProcessing &&
                          newProduct.category ===
                            "Daging" ? (
                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                              <Sparkles
                                className="animate-pulse text-[#F5990D]"
                                size={26}
                              />
                              <span
                                className={cn(
                                  "text-[10px] sm:text-[11px] font-black",
                                  "text-[#F5990D] uppercase tracking-widest",
                                  "text-center",
                                )}
                              >
                                AI Sedang
                                <br />
                                Bekerja
                              </span>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={
                                  handleImageUpload
                                }
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className={cn(
                                  "bg-white p-3 sm:p-4",
                                  "rounded-full shadow-sm group-hover:scale-110",
                                  "group-hover:shadow-md transition-all",
                                )}
                              >
                                <ImageIcon
                                  className={cn(
                                    "text-[#A4B0A7] group-hover:text-[#4A7C59] transition-colors",
                                  )}
                                  size={24}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {aiAnalysisResult &&
                      newProduct.category ===
                        "Daging" &&
                      (() => {
                        const isUnfit =
                          aiAnalysisResult.grade ===
                            "Tidak Layak" ||
                          aiAnalysisResult.grade ===
                            "Bukan Daging" ||
                          aiAnalysisResult.grade
                            ?.toLowerCase()
                            .includes(
                              "tidak layak",
                            ) ||
                          aiAnalysisResult.grade
                            ?.toLowerCase()
                            .includes(
                              "bukan daging",
                            );

                        const gradeStyle =
                          getGradeStyle(
                            aiAnalysisResult.grade,
                          );
                        const GradeIconComponent =
                          gradeStyle.icon;
                        return (
                          <motion.div
                            initial={{
                              opacity: 0,
                              scale: 0.95,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            className={`mt-4 p-4 rounded-2xl overflow-hidden shadow-sm border-2 ${isUnfit ? "bg-red-50 border-red-400" : `${gradeStyle.bg} ${gradeStyle.border}`}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3
                                className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${isUnfit ? "text-red-700" : gradeStyle.text}`}
                              >
                                <ShieldCheck
                                  size={16}
                                />
                                Quality
                                Grading
                              </h3>
                              <span
                                className={`text-[10px] sm:text-xs font-black uppercase ${isUnfit ? "bg-red-600 text-white" : `${gradeStyle.badgeBg} ${gradeStyle.badgeText}`} px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm flex items-center gap-1`}
                              >
                                {isUnfit ? (
                                  <XCircle
                                    size={12}
                                    fill="currentColor"
                                  />
                                ) : (
                                  <GradeIconComponent
                                    size={12}
                                    fill="currentColor"
                                  />
                                )}{" "}
                                {
                                  aiAnalysisResult.grade
                                }
                              </span>
                            </div>

                            <p
                              className={cn(
                                "text-xs font-semibold text-[#5A635B]",
                                "leading-relaxed",
                              )}
                            >
                              {aiAnalysisResult.analysis ||
                                "Produk ini telah melalui proses penilaian otomatis kualitas dan kesegaran berbasis visi AI."}
                            </p>
                            {isUnfit && (
                              <div
                                className={cn(
                                  "mt-3 p-3 bg-red-100/80",
                                  "border border-red-300 rounded-xl",
                                  "text-red-800 text-xs font-bold",
                                  "flex items-center gap-2",
                                )}
                              >
                                <XCircle
                                  size={16}
                                  className="shrink-0 text-red-600"
                                />
                                <span>
                                  Produk
                                  tidak dapat
                                  dipublish
                                  karena
                                  kualitas
                                  daging
                                  dinilai
                                  'Tidak
                                  Layak' /
                                  'Bukan
                                  Daging'.
                                </span>
                              </div>
                            )}

                            <div
                              className={cn(
                                "flex items-center gap-1.5",
                                "mt-3 pt-2 border-t",
                                "border-black/5 justify-start",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[10px] font-light tracking-tight",
                                  "text-[#2B4C3B] uppercase",
                                )}
                              >
                                Powered By
                              </span>
                              <img
                                src="/logos/intelligence/intelligence-black.webp"
                                alt="Pranata Intelligence"
                                className="h-5 drop-shadow-sm"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          </motion.div>
                        );
                      })()}
                  </div>

                  <div className="flex-1 space-y-4 sm:space-y-6">
                    <div>
                      <label
                        className={cn(
                          "block text-xs sm:text-sm",
                          "font-black mb-1.5 sm:mb-2",
                          "text-[#2B4C3B] uppercase tracking-wider",
                        )}
                      >
                        Nama Produk
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="misal: Telur Ayam Kampung Premium"
                        value={
                          newProduct.title
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            title:
                              e.target.value,
                          })
                        }
                        className={cn(
                          "w-full bg-[#F8F6F0] border",
                          "border-[#DDE2D6] rounded-xl sm:rounded-2xl",
                          "p-3.5 sm:p-4 focus:ring-4",
                          "focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none",
                          "transition-all text-[#1C241E] font-bold",
                          "text-base sm:text-lg",
                        )}
                      />
                    </div>
                    <div>
                      <label
                        className={cn(
                          "block text-xs sm:text-sm",
                          "font-black mb-1.5 sm:mb-2",
                          "text-[#2B4C3B] uppercase tracking-wider",
                        )}
                      >
                        Deskripsi (Opsional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Jelaskan kualitas, asal usul, atau kesegaran produk Anda..."
                        value={
                          newProduct.description
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            description:
                              e.target.value,
                          })
                        }
                        className={cn(
                          "w-full bg-[#F8F6F0] border",
                          "border-[#DDE2D6] rounded-xl sm:rounded-2xl",
                          "p-3.5 sm:p-4 focus:ring-4",
                          "focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none",
                          "transition-all text-[#1C241E] font-medium",
                          "text-xs sm:text-sm resize-none",
                          "leading-relaxed",
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "grid grid-cols-1 sm:grid-cols-2",
                        "gap-4 sm:gap-6 pt-1",
                        "sm:pt-2",
                      )}
                    >
                      <div className="sm:col-span-1">
                        <label
                          className={cn(
                            "block text-xs sm:text-sm",
                            "font-black mb-1.5 sm:mb-2",
                            "text-[#2B4C3B] uppercase tracking-wider",
                          )}
                        >
                          Kategori
                        </label>
                        <div
                          className={cn(
                            "w-full bg-[#E8E3D2] border",
                            "border-[#DDE2D6] rounded-xl sm:rounded-2xl",
                            "p-3.5 sm:p-4 text-[#7A8678]",
                            "font-bold text-sm sm:text-base",
                            "cursor-not-allowed opacity-80",
                          )}
                        >
                          {
                            newProduct.category
                          }
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <label
                          className={cn(
                            "block text-xs sm:text-sm",
                            "font-black mb-1.5 sm:mb-2",
                            "text-[#2B4C3B] uppercase tracking-wider",
                          )}
                        >
                          Jumlah Stok
                        </label>
                        <div
                          className={cn(
                            "flex items-center bg-[#F8F6F0]",
                            "border border-[#DDE2D6] rounded-xl",
                            "sm:rounded-2xl overflow-hidden focus-within:ring-4",
                            "focus-within:ring-[#4A7C59]/20 focus-within:border-[#4A7C59] relative",
                            "h-12 sm:h-14",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct(
                                (prev) => ({
                                  ...prev,
                                  stock:
                                    Math.max(
                                      0,
                                      (prev.stock ||
                                        0) -
                                        1,
                                    ),
                                }),
                              )
                            }
                            className={cn(
                              "w-12 sm:w-14 h-full",
                              "bg-white hover:bg-[#EEF2E6] active:scale-95",
                              "text-[#2B4C3B] font-black text-lg",
                              "sm:text-xl flex items-center",
                              "justify-center border-r border-[#DDE2D6]",
                              "transition-all shrink-0 z-10",
                              "cursor-pointer select-none",
                            )}
                          >
                            <Minus
                              size={18}
                              strokeWidth={3}
                            />
                          </button>

                          <div
                            className={cn(
                              "flex-1 relative h-full",
                              "flex items-center justify-center",
                              "min-w-0",
                            )}
                          >
                            <AnimatePresence
                              mode="popLayout"
                              initial={false}
                            >
                              <motion.div
                                key={
                                  newProduct.stock
                                }
                                initial={{
                                  y: 10,
                                  opacity: 0,
                                }}
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                }}
                                exit={{
                                  y: -10,
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: 0.15,
                                  ease: "easeOut",
                                }}
                                className="w-full h-full flex items-center justify-center"
                              >
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={
                                    newProduct.stock ===
                                    0
                                      ? "0"
                                      : newProduct.stock ||
                                        ""
                                  }
                                  onChange={(
                                    e,
                                  ) => {
                                    const rawVal =
                                      e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                    setNewProduct(
                                      (
                                        prev,
                                      ) => ({
                                        ...prev,
                                        stock:
                                          rawVal
                                            ? parseInt(
                                                rawVal,
                                                10,
                                              )
                                            : 0,
                                      }),
                                    );
                                  }}
                                  className={cn(
                                    "w-full bg-transparent text-center",
                                    "font-black text-lg sm:text-xl",
                                    "text-[#1C241E] h-full outline-none",
                                    "px-2 tracking-tight",
                                  )}
                                />
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct(
                                (prev) => ({
                                  ...prev,
                                  stock:
                                    (prev.stock ||
                                      0) + 1,
                                }),
                              )
                            }
                            className={cn(
                              "w-12 sm:w-14 h-full",
                              "bg-white hover:bg-[#EEF2E6] active:scale-95",
                              "text-[#2B4C3B] font-black text-lg",
                              "sm:text-xl flex items-center",
                              "justify-center border-l border-[#DDE2D6]",
                              "transition-all shrink-0 z-10",
                              "cursor-pointer select-none",
                            )}
                          >
                            <Plus
                              size={18}
                              strokeWidth={3}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="sm:col-span-1">
                        <label
                          className={cn(
                            "block text-xs sm:text-sm",
                            "font-black mb-1.5 sm:mb-2",
                            "text-[#2B4C3B] uppercase tracking-wider",
                          )}
                        >
                          Minimal Pesanan
                        </label>
                        <div
                          className={cn(
                            "flex items-center bg-[#F8F6F0]",
                            "border border-[#DDE2D6] rounded-xl",
                            "sm:rounded-2xl overflow-hidden focus-within:ring-4",
                            "focus-within:ring-[#4A7C59]/20 focus-within:border-[#4A7C59] relative",
                            "h-12 sm:h-14",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct(
                                (prev) => ({
                                  ...prev,
                                  minOrder:
                                    Math.max(
                                      1,
                                      (prev.minOrder ||
                                        1) -
                                        1,
                                    ),
                                }),
                              )
                            }
                            className={cn(
                              "w-12 sm:w-14 h-full",
                              "bg-white hover:bg-[#EEF2E6] active:scale-95",
                              "text-[#2B4C3B] font-black text-lg",
                              "sm:text-xl flex items-center",
                              "justify-center border-r border-[#DDE2D6]",
                              "transition-all shrink-0 z-10",
                              "cursor-pointer select-none",
                            )}
                          >
                            <Minus
                              size={18}
                              strokeWidth={3}
                            />
                          </button>

                          <div
                            className={cn(
                              "flex-1 relative h-full",
                              "flex items-center justify-center",
                              "min-w-0",
                            )}
                          >
                            <AnimatePresence
                              mode="popLayout"
                              initial={false}
                            >
                              <motion.div
                                key={
                                  newProduct.minOrder
                                }
                                initial={{
                                  y: 10,
                                  opacity: 0,
                                }}
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                }}
                                exit={{
                                  y: -10,
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: 0.15,
                                  ease: "easeOut",
                                }}
                                className="w-full h-full flex items-center justify-center"
                              >
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={
                                    newProduct.minOrder ||
                                    ""
                                  }
                                  onChange={(
                                    e,
                                  ) => {
                                    const rawVal =
                                      e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                    setNewProduct(
                                      (
                                        prev,
                                      ) => ({
                                        ...prev,
                                        minOrder:
                                          rawVal
                                            ? parseInt(
                                                rawVal,
                                                10,
                                              )
                                            : 1,
                                      }),
                                    );
                                  }}
                                  className={cn(
                                    "w-full bg-transparent text-center",
                                    "font-black text-lg sm:text-xl",
                                    "text-[#1C241E] h-full outline-none",
                                    "px-2 tracking-tight",
                                  )}
                                />
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct(
                                (prev) => ({
                                  ...prev,
                                  minOrder:
                                    (prev.minOrder ||
                                      1) + 1,
                                }),
                              )
                            }
                            className={cn(
                              "w-12 sm:w-14 h-full",
                              "bg-white hover:bg-[#EEF2E6] active:scale-95",
                              "text-[#2B4C3B] font-black text-lg",
                              "sm:text-xl flex items-center",
                              "justify-center border-l border-[#DDE2D6]",
                              "transition-all shrink-0 z-10",
                              "cursor-pointer select-none",
                            )}
                          >
                            <Plus
                              size={18}
                              strokeWidth={3}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <label
                          className={cn(
                            "block text-xs sm:text-sm",
                            "font-black mb-1.5 sm:mb-2",
                            "text-[#2B4C3B] uppercase tracking-wider",
                          )}
                        >
                          Satuan (Unit)
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowUnitDropdown(
                                !showUnitDropdown,
                              )
                            }
                            className={cn(
                              "w-full bg-[#F8F6F0] border",
                              "border-[#DDE2D6] rounded-xl sm:rounded-2xl",
                              "p-3.5 sm:p-4 focus:ring-4",
                              "focus:ring-[#4A7C59]/20 focus:border-[#4A7C59] outline-none",
                              "transition-all text-[#1C241E] font-bold",
                              "text-base sm:text-lg flex",
                              "justify-between items-center",
                            )}
                          >
                            <span>
                              {
                                newProduct.unit
                              }
                            </span>
                            <svg
                              className={`fill-current h-5 w-5 text-[#5A635B] transition-transform duration-200 ${showUnitDropdown ? "rotate-180" : ""}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </button>
                          <AnimatePresence>
                            {showUnitDropdown && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y: -10,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -10,
                                }}
                                className={cn(
                                  "absolute z-20 w-full",
                                  "mt-2 bg-white border",
                                  "border-[#DDE2D6] rounded-xl sm:rounded-2xl",
                                  "shadow-xl overflow-hidden py-2",
                                )}
                              >
                                {[
                                  "kg",
                                  "gram",
                                  "ekor",
                                  "butir",
                                  "pack",
                                  "liter",
                                  "botol",
                                ].map(
                                  (u) => (
                                    <button
                                      key={u}
                                      type="button"
                                      onClick={() => {
                                        setNewProduct(
                                          {
                                            ...newProduct,
                                            unit: u,
                                          },
                                        );
                                        setShowUnitDropdown(
                                          false,
                                        );
                                      }}
                                      className={`w-full text-left px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold hover:bg-[#F8F6F0] transition-colors ${newProduct.unit === u ? "text-[#2B4C3B] bg-[#EEF2E6]" : "text-[#5A635B]"}`}
                                    >
                                      {u}
                                    </button>
                                  ),
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "bg-[#F8F6F0] p-4 sm:p-8",
                        "rounded-2xl sm:rounded-3xl border",
                        "border-[#DDE2D6] mt-4 sm:mt-6",
                        "relative overflow-hidden group",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0 right-0",
                          "w-40 h-40 bg-[#B4C179]/10",
                          "rounded-full blur-3xl -mr-16",
                          "-mt-16 pointer-events-none group-hover:scale-150",
                          "transition-transform duration-700",
                        )}
                      />
                      <label
                        className={cn(
                          "block text-xs sm:text-sm",
                          "font-black mb-2 sm:mb-4",
                          "text-[#2B4C3B] uppercase tracking-widest",
                        )}
                      >
                        Harga per{" "}
                        {newProduct.unit}
                      </label>
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "text-xl sm:text-2xl font-black",
                            "text-[#5A635B] mr-2 sm:mr-4",
                          )}
                        >
                          Rp
                        </span>
                        <input
                          required
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={
                            newProduct.price >
                            0
                              ? newProduct.price.toLocaleString(
                                  "id-ID",
                                )
                              : ""
                          }
                          onChange={(e) => {
                            const rawVal =
                              e.target.value.replace(
                                /\D/g,
                                "",
                              );
                            setNewProduct({
                              ...newProduct,
                              price: rawVal
                                ? parseInt(
                                    rawVal,
                                    10,
                                  )
                                : 0,
                            });
                          }}
                          className={cn(
                            "w-full bg-white border-2",
                            "border-[#DDE2D6] rounded-xl sm:rounded-2xl",
                            "p-3.5 sm:p-5 focus:ring-0",
                            "focus:border-[#4A7C59] outline-none transition-all",
                            "text-xl sm:text-2xl md:text-3xl",
                            "font-black text-[#1C241E] shadow-inner",
                          )}
                        />
                      </div>


                      {benchmarkPrice &&
                        newProduct.price >
                          0 &&
                        newProduct.price <=
                          benchmarkPrice && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            className={cn(
                              "mt-4 sm:mt-5 flex",
                              "items-center gap-3 sm:gap-4",
                              "bg-emerald-50 text-emerald-800 p-3.5",
                              "sm:p-5 rounded-xl sm:rounded-2xl",
                              "border border-emerald-200",
                            )}
                          >
                            <CheckCircle
                              size={18}
                              className="text-emerald-600 shrink-0 sm:w-5 sm:h-5"
                            />
                            <p className="text-xs sm:text-sm font-bold">
                              Harga sangat
                              kompetitif!
                              Anda siap
                              bersaing di
                              pasar.
                            </p>
                          </motion.div>
                        )}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {stepperStep === 2 &&
            (() => {
              const isUnfit =
                newProduct.category ===
                  "Daging" &&
                aiAnalysisResult &&
                (aiAnalysisResult.grade ===
                  "Tidak Layak" ||
                  aiAnalysisResult.grade ===
                    "Bukan Daging" ||
                  aiAnalysisResult.grade
                    ?.toLowerCase()
                    .includes(
                      "tidak layak",
                    ) ||
                  aiAnalysisResult.grade
                    ?.toLowerCase()
                    .includes(
                      "bukan daging",
                    ));
              const isDisabled = Boolean(
                isSubmitting ||
                isAiProcessing ||
                (newProduct.category ===
                  "Daging" &&
                  newProduct.imageUrls
                    .length > 0 &&
                  (!aiAnalysisResult ||
                    isUnfit)),
              );

              return (
                <div
                  className={cn(
                    "px-4 py-4 sm:px-8",
                    "sm:py-6 md:px-12 md:py-8",
                    "border-t border-[#E8E3D2] bg-[#F8F6F0]",
                    "flex gap-4",
                  )}
                >
                  <button
                    type="submit"
                    form="productForm"
                    disabled={isDisabled}
                    className={`w-full py-4 sm:py-5 text-base sm:text-lg font-black text-white rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-3 ${
                      isDisabled
                        ? "bg-gray-400 opacity-60 cursor-not-allowed shadow-none"
                        : "bg-pranata hover:opacity-90 shadow-xl shadow-green-900/20 hover:-translate-y-1"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={22}
                          className="animate-spin text-white"
                        />
                        <span>
                          Memproses
                          Listing...
                        </span>
                      </>
                    ) : (
                      <span>
                        Publish Listing
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
