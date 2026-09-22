"use client";
import { cn } from "@/lib/utils";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  User,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Store,
  MapPin,
  Phone,
  ImageIcon,
  AlertTriangle,
  X,
  Crown,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  usePageLoading,
  useGlobalLoading,
  useAppRouter as useRouter,
} from "@/components/shared/loading-context";
import Cookies from "js-cookie";

import { uploadImage } from "@/lib/supabaseStorage";
import { UpgradePlusModal } from "@/components/modals/UpgradePlusModal";
import { CancelPlusModal } from "@/components/modals/CancelPlusModal";
import { PlusBadge } from "@/components/ui/plus-badge";
import { AvatarHalo } from "@/components/ui/avatar-halo";

const API_BASE = getApiBaseUrl();


type Toast = {
  type: "success" | "error";
  message: string;
};

function compressImage(
  file: File,
  maxPx = 400,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas =
          document.createElement("canvas");
        const ratio = Math.min(
          maxPx / img.width,
          maxPx / img.height,
          1,
        );
        canvas.width = Math.round(
          img.width * ratio,
        );
        canvas.height = Math.round(
          img.height * ratio,
        );
        canvas
          .getContext("2d")!
          .drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        resolve(
          canvas.toDataURL(
            "image/webp",
            quality,
          ),
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Reusable file drop zone ──────────────────────────────────────────────────
function UploadZone({
  label,
  hint,
  onFile,
  inline = false,
  children,
}: {
  label: string;
  hint: string;
  onFile: (f: File) => void;
  inline?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] =
    useState(false);

  const handle = (
    file: File | undefined,
  ) => {
    if (
      file &&
      file.type.startsWith("image/")
    )
      onFile(file);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={`w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center ${
          dragging
            ? "border-[#2B4C3B] bg-[#EEF2E6] scale-[1.01]"
            : "border-[#DDE2D6] hover:border-[#2B4C3B] hover:bg-[#F8FAF6]"
        } ${inline ? "p-4" : "p-7"}`}
      >
        {children ?? (
          <>
            <div
              className={cn(
                "w-10 h-10 bg-[#F1EBE1]",
                "rounded-xl flex items-center",
                "justify-center",
              )}
            >
              <ImageIcon
                size={20}
                className="text-[#7A8678]"
              />
            </div>
            <p className="font-black text-[#1C241E] text-sm">
              {label}
            </p>
            <p className="text-xs text-[#7A8678] font-medium">
              {hint}
            </p>
          </>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) =>
          handle(e.target.files?.[0])
        }
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AccountSettingsPage() {
  const router = useRouter();
  const { navigateTo } = useGlobalLoading();

  const [profile, setProfile] =
    useState<any>(null);
  const [loading, setLoading] =
    useState(true);
  usePageLoading(loading);

  // Form state
  const [username, setUsername] =
    useState("");
  const [fullName, setFullName] =
    useState("");
  const [farmName, setFarmName] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [contact, setContact] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<
    string | null
  >(null);
  const [bannerUrl, setBannerUrl] = useState<
    string | null
  >(null);

  // Password form
  const [currentPw, setCurrentPw] =
    useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] =
    useState("");
  const [showCur, setShowCur] =
    useState(false);
  const [showNew, setShowNew] =
    useState(false);
  const [showConf, setShowConf] =
    useState(false);

  const [saving, setSaving] =
    useState(false);
  const [savingPw, setSavingPw] =
    useState(false);
  const [toast, setToast] =
    useState<Toast | null>(null);
  const [usernameAvail, setUsernameAvail] =
    useState<boolean | null>(null);
  const [
    checkingUsername,
    setCheckingUsername,
  ] = useState(false);

  const [sessionRole, setSessionRole] =
    useState<string | null>(null);
  const [
    showLogoutModal,
    setShowLogoutModal,
  ] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] =
    useState(false);
  const [showCancelPlusModal, setShowCancelPlusModal] =
    useState(false);

  const fetchProfileData = useCallback(async (userId: string) => {
    try {
      const res = await fetchApi(`${API_BASE}/api/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile((prev: any) => ({ ...prev, ...data }));
        const sessionStr = localStorage.getItem("farmpro_session") || localStorage.getItem("pranata_session");
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          const updated = { ...parsed, ...data };
          localStorage.setItem("farmpro_session", JSON.stringify(updated));
          localStorage.setItem("pranata_session", JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  }, []);


  useEffect(() => {
    const sessionStr =
      localStorage.getItem("pranata_session") ||
      localStorage.getItem("farmpro_session");
    if (!sessionStr) {
      setLoading(false);
      router.push("/login");
      return;
    }
    try {
      const session = JSON.parse(sessionStr);
      if (session.role) {
        setSessionRole(session.role);
      }
      const id =
        session.id || session.userId;
      if (!id) {
        setLoading(false);
        router.push("/login");
        return;
      }
      fetchProfile(id);
    } catch (e) {
      setLoading(false);
      router.push("/login");
    }

    const handleSessionUpdate = () => {
      const sStr =
        localStorage.getItem("pranata_session") ||
        localStorage.getItem("farmpro_session");
      if (sStr) {
        try {
          const parsed = JSON.parse(sStr);
          setProfile((prev: any) => ({ ...prev, ...parsed }));
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

  const fetchProfile = async (
    id: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetchApi(
        `${API_BASE}/api/profile/${id}`,
      );
      if (res.ok) {
        const d = await res.json();
        setProfile(d);
        if (d.role) setSessionRole(d.role);
        setUsername(d.username || "");
        setFullName(d.fullName || "");
        setFarmName(d.farmName || "");
        setLocation(d.location || "");
        setContact(d.contact || "");
        setAvatarUrl(d.avatarUrl || null);
        setBannerUrl(d.bannerUrl || null);
      } else if (
        res.status === 401 ||
        res.status === 403 ||
        res.status === 404
      ) {
        localStorage.removeItem(
          "farmpro_session",
        );
        router.push("/login");
      }
    } catch (err) {
      console.warn(
        "Failed to fetch profile:",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  const showToast = (
    type: "success" | "error",
    message: string,
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounced username check
  useEffect(() => {
    if (
      !profile ||
      username === profile.username ||
      username.length < 3
    ) {
      setUsernameAvail(null);
      return;
    }
    setCheckingUsername(true);
    const t = setTimeout(async () => {
      const res = await fetchApi(
        `${API_BASE}/api/profile/check-username?username=${encodeURIComponent(username)}`,
      );
      setUsernameAvail(
        (await res.json()).available,
      );
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(t);
  }, [username, profile]);

  const handleSaveProfile = async () => {
    if (usernameAvail === false) {
      showToast(
        "error",
        "Username sudah dipakai.",
      );
      return;
    }
    setSaving(true);
    const res = await fetchApi(
      `${API_BASE}/api/profile/${profile.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          fullName,
          farmName,
          location,
          contact,
          avatarUrl,
          bannerUrl,
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      showToast(
        "error",
        data.error || "Gagal menyimpan.",
      );
    } else {
      const updated = {
        ...profile,
        ...data,
      };
      setProfile(updated);
      localStorage.setItem(
        "farmpro_session",
        JSON.stringify(updated),
      );
      showToast(
        "success",
        "Profil berhasil diperbarui!",
      );
    }
    setSaving(false);
  };

  const handleChangePw = async () => {
    if (newPw.length < 6) {
      showToast(
        "error",
        "Password baru minimal 6 karakter.",
      );
      return;
    }
    if (newPw !== confirmPw) {
      showToast(
        "error",
        "Konfirmasi password tidak cocok.",
      );
      return;
    }
    setSavingPw(true);
    const res = await fetchApi(
      `${API_BASE}/api/profile/${profile.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      showToast(
        "error",
        data.error ||
          "Gagal mengubah password.",
      );
    } else {
      showToast(
        "success",
        "Password berhasil diubah!",
      );
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
    setSavingPw(false);
  };

  const effectiveRole = (
    profile?.role ||
    sessionRole ||
    ""
  ).toUpperCase();
  const isProducer =
    effectiveRole === "PRODUCER";
  const backPath = isProducer
    ? "/hub"
    : "/market";
  const backLabel = isProducer
    ? "Dashboard"
    : "Marketplace";
  const initials = (
    profile?.fullName ||
    profile?.username ||
    "?"
  )
    .charAt(0)
    .toUpperCase();

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#1C241E]">
        <div className="sticky top-0 z-40 px-3.5 sm:px-4 pt-3.5 sm:pt-4">
          <div
            className={cn(
              "max-w-7xl mx-auto bg-white",
              "border border-[#E8E3D2] rounded-2xl",
              "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-12 sm:h-14",
              "flex items-center justify-between",
              "px-3.5 sm:px-6 md:px-8",
              "lg:px-12",
            )}
          >
            <button
              data-back="true"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  navigateTo(backPath);
                }
              }}
              className={cn(
                "flex items-center gap-1.5",
                "sm:gap-2 text-[#5A635B] hover:text-[#2B4C3B]",
                "font-extrabold text-xs sm:text-sm",
                "transition-colors shrink-0 active:scale-95 cursor-pointer",
              )}
              title="Kembali ke halaman sebelumnya"
            >
              <ChevronLeft
                size={18}
                className="shrink-0"
              />
              <span className="truncate">
                Kembali
              </span>
            </button>
            <div
              className={cn(
                "w-24 sm:w-32 h-4",
                "sm:h-5 rounded-md skeleton-shimmer",
                "bg-[#E8E3D2]",
              )}
            />
            <div className="w-16 sm:w-28 shrink-0" />
          </div>
        </div>
        <main
          className={cn(
            "max-w-7xl mx-auto pt-4",
            "sm:pt-6 pb-20 sm:pb-28",
            "space-y-6 px-3.5 sm:px-6",
            "md:px-8 lg:px-12",
          )}
        >
          <div
            className={cn(
              "bg-white border border-[#E8E3D2]",
              "rounded-2xl sm:rounded-[2rem] overflow-hidden",
              "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
            )}
          >
            <div
              className={cn(
                "relative h-32 sm:h-40",
                "md:h-52 skeleton-shimmer bg-[#E8E3D2]",
              )}
            />
            <div className="px-4 sm:px-6 pb-6">
              <div
                className={cn(
                  "flex items-end justify-between",
                  "-mt-10 sm:-mt-12 mb-4",
                )}
              >
                <div
                  className={cn(
                    "w-20 h-20 sm:w-28",
                    "sm:h-28 rounded-full border-4",
                    "border-white skeleton-shimmer bg-[#E8E3D2]",
                    "shrink-0",
                  )}
                />
                <div
                  className={cn(
                    "w-24 sm:w-32 h-8",
                    "sm:h-10 rounded-full skeleton-shimmer",
                    "bg-[#E8E3D2]",
                  )}
                />
              </div>
              <div
                className={cn(
                  "w-40 sm:w-48 h-7",
                  "sm:h-8 rounded-xl skeleton-shimmer",
                  "bg-[#E8E3D2] mb-2",
                )}
              />
              <div
                className={cn(
                  "w-28 sm:w-32 h-4",
                  "rounded-md skeleton-shimmer bg-[#E8E3D2]",
                  "mb-4",
                )}
              />
              <div className="flex gap-2">
                <div
                  className={cn(
                    "w-20 sm:w-24 h-6",
                    "rounded-full skeleton-shimmer bg-[#E8E3D2]",
                  )}
                />
                <div
                  className={cn(
                    "w-28 sm:w-32 h-6",
                    "rounded-full skeleton-shimmer bg-[#E8E3D2]",
                  )}
                />
              </div>
            </div>
          </div>
          {[1, 2].map((section) => (
            <div
              key={section}
              className={cn(
                "bg-white border border-[#E8E3D2]",
                "rounded-2xl sm:rounded-[2rem] p-4",
                "sm:p-7 shadow-[0_4px_24px_-8px_rgba(43,76,59,0.08)]",
              )}
            >
              <div
                className={cn(
                  "w-40 sm:w-48 h-5",
                  "sm:h-6 rounded-md skeleton-shimmer",
                  "bg-[#E8E3D2] mb-4 sm:mb-6",
                )}
              />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        "w-20 sm:w-24 h-3",
                        "rounded-md skeleton-shimmer bg-[#E8E3D2]",
                        "mb-2",
                      )}
                    />
                    <div
                      className={cn(
                        "w-full h-10 sm:h-12",
                        "rounded-xl skeleton-shimmer bg-[#E8E3D2]",
                      )}
                    />
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "w-full h-12 sm:h-14",
                  "rounded-xl sm:rounded-2xl skeleton-shimmer",
                  "bg-[#E8E3D2] mt-5 sm:mt-6",
                )}
              />
            </div>
          ))}
          <div
            className={cn(
              "border-2 border-dashed border-[#E8E3D2]",
              "rounded-2xl sm:rounded-[2rem] p-4",
              "sm:p-7",
            )}
          >
            <div
              className={cn(
                "w-28 sm:w-32 h-4",
                "rounded-md skeleton-shimmer bg-[#E8E3D2]",
                "mb-4",
              )}
            />
            <div
              className={cn(
                "w-full h-10 sm:h-12",
                "rounded-xl sm:rounded-2xl skeleton-shimmer",
                "bg-[#E8E3D2]",
              )}
            />
          </div>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#18181B]">
      {/* ── Back Navbar ── */}
      <div className="sticky top-0 z-40 px-3.5 sm:px-4 pt-3.5 sm:pt-4">
        <div
          className={cn(
            "max-w-7xl mx-auto bg-white",
            "border border-[#E8E3D2] rounded-2xl",
            "shadow-[0_4px_24px_-8px_rgba(43,76,59,0.1)] h-12 sm:h-14",
            "flex items-center justify-between",
            "px-3.5 sm:px-6 md:px-8",
            "lg:px-12",
          )}
        >
          <button
            data-back="true"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                navigateTo(backPath);
              }
            }}
            className={cn(
              "flex items-center gap-1.5",
              "sm:gap-2 text-[#5A635B] hover:text-[#2B4C3B]",
              "font-extrabold text-xs sm:text-sm",
              "transition-colors shrink-0 active:scale-95 cursor-pointer",
            )}
            title="Kembali ke halaman sebelumnya"
          >
            <ChevronLeft
              size={18}
              className="shrink-0"
            />
            <span className="truncate">
              Kembali
            </span>
          </button>
          <h2
            className={cn(
              "font-black text-xs sm:text-sm",
              "text-[#1C241E] m-0 text-center",
              "truncate px-2",
            )}
          >
            Profil
          </h2>
          <div className="w-16 sm:w-28 shrink-0" />
        </div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl font-bold text-sm whitespace-nowrap ${
              toast.type === "success"
                ? "bg-pranata text-white"
                : "bg-[#C25939] text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={17} />
            ) : (
              <AlertCircle size={17} />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={cn(
          "max-w-7xl mx-auto pt-4",
          "sm:pt-6 pb-20 sm:pb-28",
          "px-3.5 sm:px-6 md:px-8",
          "lg:px-12",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-3",
            "gap-5 sm:gap-6 lg:gap-8",
          )}
        >
          {/* ══════════════════════════════════════════════════════
            TWITTER / FB STYLE PROFILE CARD
        ══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.1,
            }}
            className={cn(
              "lg:col-span-3 bg-white border",
              "border-[#E2E8F0]/50 rounded-2xl sm:rounded-3xl",
              "lg:rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]",
            )}
          >
            {/* Banner */}
            <div className="relative h-32 sm:h-44 md:h-52 bg-pranata group">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                /* Default earthy pattern */
                <div className="w-full h-full overflow-hidden">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 200"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="800"
                      height="200"
                      fill="#2B4C3B"
                    />
                    <circle
                      cx="100"
                      cy="-20"
                      r="150"
                      fill="#3A6B49"
                      opacity="0.5"
                    />
                    <circle
                      cx="700"
                      cy="220"
                      r="180"
                      fill="#1E362A"
                      opacity="0.6"
                    />
                    <circle
                      cx="400"
                      cy="100"
                      r="120"
                      fill="#4A7C59"
                      opacity="0.25"
                    />
                    <circle
                      cx="650"
                      cy="20"
                      r="90"
                      fill="#F5990D"
                      opacity="0.08"
                    />
                  </svg>
                </div>
              )}

              {/* Banner upload button / overlay */}
              <label
                className={cn(
                  "absolute bottom-3 right-3",
                  "sm:inset-0 sm:flex sm:items-center",
                  "sm:justify-center bg-black/40 sm:opacity-0",
                  "group-hover:opacity-100 transition-opacity cursor-pointer",
                  "gap-2",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    "sm:gap-2 bg-white/90 text-[#1C241E]",
                    "font-black text-[11px] sm:text-xs",
                    "px-3 py-1.5 sm:px-4",
                    "sm:py-2.5 rounded-xl shadow-lg",
                  )}
                >
                  <Camera
                    size={14}
                    className="sm:w-3.75 sm:h-3.75"
                  />{" "}
                  <span>Ganti Sampul</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const f =
                      e.target.files?.[0];
                    if (f) {
                      const url =
                        await uploadImage(
                          f,
                          "banners",
                          1200,
                        );
                      setBannerUrl(url);
                    }
                  }}
                />
              </label>
            </div>

            {/* Avatar + action row */}
            <div className="px-4 sm:px-6 pb-5 sm:pb-6">
              <div
                className={cn(
                  "flex items-end justify-between",
                  "-mt-8 sm:-mt-12 mb-3",
                  "sm:mb-4 gap-2",
                )}
              >
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <AvatarHalo
                    isPlus={Boolean(profile?.subscriptionTier && profile.subscriptionTier !== "FREE")}
                    avatarUrl={avatarUrl}
                    initials={initials}
                    size="xl"
                    shape="circle"
                  />
                  <label
                    className={cn(
                      "absolute inset-0 flex",
                      "items-center justify-center rounded-full",
                      "bg-black/40 opacity-0 group-hover:opacity-100",
                      "transition-opacity cursor-pointer z-20",
                    )}
                  >
                    <Camera
                      size={18}
                      className="text-white sm:w-5 sm:h-5"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (
                        e,
                      ) => {
                        const f =
                          e.target
                            .files?.[0];
                        if (f) {
                          const url =
                            await uploadImage(
                              f,
                              "avatars",
                              400,
                            );
                          setAvatarUrl(url);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Edit profile button (triggers save) */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveProfile}
                  disabled={
                    saving ||
                    usernameAvail === false
                  }
                  className={cn(
                    "flex items-center gap-1.5",
                    "sm:gap-2 border-2 border-[#2B4C3B]",
                    "text-[#2B4C3B] font-black text-xs",
                    "sm:text-sm px-3.5 py-2",
                    "sm:px-5 sm:py-2.5 rounded-full",
                    "hover:bg-pranata hover:text-white transition-all",
                    "disabled:opacity-40 shrink-0",
                  )}
                >
                  {saving ? (
                    <Loader2
                      size={14}
                      className="animate-spin sm:w-3.75 sm:h-3.75"
                    />
                  ) : (
                    <Save
                      size={14}
                      className="sm:w-3.75 sm:h-3.75"
                    />
                  )}
                  <span>
                    {saving
                      ? "Menyimpan…"
                      : "Simpan Profil"}
                  </span>
                </motion.button>
              </div>

              {/* Name / username */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className={cn(
                    "text-xl sm:text-2xl font-black",
                    "text-[#1C241E] leading-tight",
                  )}
                >
                  {profile?.fullName ||
                    profile?.username}
                </h1>
                {profile?.subscriptionTier && profile.subscriptionTier !== "FREE" && (
                  <PlusBadge
                    variant="black"
                    size="sm"
                  />
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#7A8678]">
                @{profile?.username}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {profile?.location && (
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      "text-xs text-[#7A8678] font-semibold",
                    )}
                  >
                    <MapPin
                      size={13}
                      className="text-[#C25939]"
                    />{" "}
                    {profile.location}
                  </span>
                )}
                {profile?.contact && (
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      "text-xs text-[#7A8678] font-semibold",
                    )}
                  >
                    <Phone
                      size={13}
                      className="text-[#2B4C3B]"
                    />{" "}
                    {profile.contact}
                  </span>
                )}
                <span
                  className={`text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-full ${
                    profile?.role ===
                    "PRODUCER"
                      ? "bg-[#EEF2E6] text-[#2B4C3B]"
                      : "bg-[#FFF3E0] text-[#C25939]"
                  }`}
                >
                  {profile?.role ===
                  "PRODUCER"
                    ? "Pedagang / Peternak"
                    : "Pembeli"}
                </span>
              </div>

              {/* Hint */}
              <p
                className={cn(
                  "text-[11px] sm:text-xs text-[#A4B0A7]",
                  "font-semibold mt-3 sm:mt-4",
                )}
              >
                Ketuk foto atau sampul untuk
                mengunggah gambar baru.
              </p>
            </div>
          </motion.div>

          {/* ── Keanggotaan Pranata Plus (Redesigned) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.15,
            }}
            className="lg:col-span-1"
          >
            <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-linear-to-br from-[#12231A] via-[#1A3125] to-[#0E1A13] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 shadow-xl shadow-[#12231A]/20 p-6 sm:p-7 flex flex-col justify-between h-full min-h-115 text-white transition-all">
              {/* Glowing decorative ambient light */}
              <div className="absolute -top-14 -right-14 w-44 h-44 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#2B4C3B]/50 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Header: Logo & Status Badge */}
                <div className="flex items-center justify-between gap-3 relative z-10">
                  {profile?.subscriptionTier && profile.subscriptionTier !== "FREE" ? (
                    <PlusBadge
                      variant="white"
                      size="lg"
                    />
                  ) : (
                    <img
                      src="/logos/plus/plus-white.webp"
                      alt="Pranata Plus"
                      className="h-7 sm:h-8 w-auto object-contain drop-shadow-sm"
                    />
                  )}
                  {profile?.subscriptionTier && profile.subscriptionTier !== "FREE" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#FDE68A] text-[10px] font-black tracking-wider uppercase shadow-xs">
                      <Crown size={12} className="text-[#FDE68A] fill-[#FDE68A]" />
                      <span>{profile.subscriptionTier === "CUSTOMER_PLUS" ? "CUSTOMER PLUS" : "SELLER PLUS"}</span>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                      Tier Gratis
                    </span>
                  )}
                </div>

                {/* Main Heading & Subtitle */}
                <div className="my-5 relative z-10">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {profile?.subscriptionTier === "CUSTOMER_PLUS"
                      ? "Member Pranata Plus Customer"
                      : profile?.subscriptionTier === "SELLER_PLUS" || profile?.subscriptionTier === "PLUS"
                      ? "Member Pranata Plus Seller"
                      : "Buka Potensi Pranata Plus"}
                  </h3>
                  <p className="text-xs text-[#A4C4A8] mt-1.5 leading-relaxed font-medium">
                    {profile?.subscriptionTier === "CUSTOMER_PLUS"
                      ? "Nikmati akses tak terbatas ke AI Chef, 1-Click Smart Cart, bebas biaya layanan checkout, dan garansi cold-chain segar."
                      : profile?.subscriptionTier === "SELLER_PLUS" || profile?.subscriptionTier === "PLUS"
                      ? "Nikmati akses tak terbatas ke etalase prioritas teratas, slot sponsor produk, Farm Copilot kandang, dan tender B2B."
                      : profile?.role === "PRODUCER"
                      ? "Tingkatkan akun peternakan Anda ke tier seller pro untuk melipatgandakan omzet penjualan ternak dan tender B2B."
                      : "Tingkatkan akun belanja Anda ke tier customer plus untuk kemudahan asisten masak resep & bebas biaya layanan."}
                  </p>
                </div>

                {/* Feature Highlights / Active Perks */}
                {profile?.subscriptionTier && profile.subscriptionTier !== "FREE" ? (
                  <div className="space-y-3 my-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs relative z-10">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Calendar size={13} className="text-[#D4AF37]" />
                      <span>Masa Berlaku Langganan:</span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-[#FDE68A]">
                      {profile?.subscriptionExpiresAt
                        ? new Date(profile.subscriptionExpiresAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "30 Hari Kedepan"}
                    </div>
                    <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-white/85">
                      {profile?.subscriptionTier === "CUSTOMER_PLUS" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Agentic AI Chef & Nutrisi (Tanpa Batas)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>1-Click Agentic Smart Cart resep masakan</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Bebas Biaya Layanan Platform (Hemat Rp 2.500)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Garansi Kesegaran Rantai Dingin Prioritas</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Top Placement Prioritas Katalog Teratas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Slot Sponsor 1 Produk ke radar pembeli</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Farm Copilot terhubung kandang & FCR</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                            <span>Akses kirim tender pasokan B2B restoran</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 my-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs relative z-10">
                    {profile?.role === "PRODUCER" ? (
                      <>
                        <div className="flex items-start gap-3 text-xs text-white/90">
                          <div className="w-5 h-5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Crown size={11} className="text-[#FDE68A]" />
                          </div>
                          <span className="leading-tight">
                            <strong className="text-white font-bold">Top Placement Prioritas:</strong> Produk ternak tampil paling atas di katalog pasar.
                          </span>
                        </div>
                        <div className="flex items-start gap-3 text-xs text-white/90">
                          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={11} className="text-emerald-300" />
                          </div>
                          <span className="leading-tight">
                            <strong className="text-white font-bold">Farm AI Copilot:</strong> Analisis riil pakan, FCR & simulasi margin laba kandang.
                          </span>
                        </div>
                        <div className="flex items-start gap-3 text-white/90">
                          <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle size={11} className="text-[#FDE68A]" />
                          </div>
                          <span className="leading-tight">
                            <strong className="text-white font-bold">Tender Pasokan B2B:</strong> Kontrak rutin pasokan restoran, hotel & katering.
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 text-xs text-white/90">
                          <div className="w-5 h-5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={11} className="text-[#FDE68A]" />
                          </div>
                          <span className="leading-tight">
                            <strong className="text-white font-bold">1-Click Smart Cart:</strong> Auto-isi bahan resep masakan dari pedagang terdekat.
                          </span>
                        </div>
                        <div className="flex items-start gap-3 text-xs text-white/90">
                          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle size={11} className="text-emerald-300" />
                          </div>
                          <span className="leading-tight">
                            <strong className="text-white font-bold">Agentic AI Chef 24/7:</strong> Konsultasi resep ternak & asisten gizi keluarga tanpa batas.
                          </span>
                        </div>
                        <div className="flex items-start gap-3 text-xs text-white/90">
                          <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Crown size={11} className="text-[#FDE68A]" />
                          </div>
                          <span className="leading-tight">
                            <strong className="text-white font-bold">Bebas Biaya Layanan:</strong> Bebas fee Rp 2.500 di setiap checkout belanja pasar.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons & Pricing */}
              <div className="pt-4 border-t border-white/10 relative z-10">
                {profile?.subscriptionTier && profile.subscriptionTier !== "FREE" ? (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#D4AF37] via-[#F3C04D] to-[#AA820A] hover:opacity-95 text-[#132219] font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Crown size={15} className="text-[#132219] fill-[#132219]" />
                      <span>Perpanjang Masa Aktif Plus</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelPlusModal(true)}
                      className="w-full py-2 px-3 rounded-xl hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Batalkan Langganan Plus</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-between mb-3 px-1">
                      <span className="text-xs font-semibold text-white/60">
                        {profile?.role === "PRODUCER" ? "Membership Seller" : "Membership Customer"}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#FDE68A]">
                          {profile?.role === "PRODUCER" ? "Rp 79.000" : "Rp 39.000"}
                        </span>
                        <span className="text-[11px] text-white/60 font-semibold"> / bulan</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-[#D4AF37] via-[#F3C04D] to-[#AA820A] hover:opacity-95 text-[#132219] font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 group"
                    >
                      <Crown size={16} className="text-[#132219] fill-[#132219] group-hover:rotate-12 transition-transform" />
                      <span>Upgrade ke Pranata Plus</span>
                    </button>
                    <p className="text-[10px] text-center text-white/50 font-medium mt-2">
                      Dapat dibatalkan kapan saja melalui profil
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Profile Info Form ── */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.2,
            }}
            className={cn(
              "lg:col-span-2 bg-white border",
              "border-[#E2E8F0]/50 rounded-2xl sm:rounded-3xl",
              "lg:rounded-[2.5rem] p-4 sm:p-8",
              "md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex",
              "flex-col",
            )}
          >
            <h2
              className={cn(
                "text-base sm:text-lg font-black",
                "text-[#1C241E] flex items-center",
                "gap-2 mb-4 sm:mb-6",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 bg-[#EEF2E6]",
                  "rounded-lg flex items-center",
                  "justify-center",
                )}
              >
                <User
                  size={14}
                  className="text-[#2B4C3B]"
                />
              </div>
              Informasi Profil
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Username */}
              <div>
                <label
                  className={cn(
                    "block text-xs sm:text-sm",
                    "font-bold text-[#71717A] mb-1.5",
                    "sm:mb-2",
                  )}
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(
                            /\s/g,
                            "",
                          ),
                      )
                    }
                    className={cn(
                      "w-full bg-[#F9FAFB] border",
                      "border-[#E2E8F0]/80 rounded-xl sm:rounded-2xl",
                      "px-3.5 sm:px-4 py-3",
                      "sm:py-3.5 font-bold text-xs",
                      "sm:text-sm text-[#18181B] focus:outline-none",
                      "focus:ring-2 focus:ring-[#2B4C3B] focus:border-transparent",
                      "transition-all",
                    )}
                    placeholder="username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && (
                      <Loader2
                        size={15}
                        className="text-[#A4B0A7] animate-spin"
                      />
                    )}
                    {!checkingUsername &&
                      usernameAvail ===
                        true && (
                        <CheckCircle
                          size={15}
                          className="text-emerald-500"
                        />
                      )}
                    {!checkingUsername &&
                      usernameAvail ===
                        false && (
                        <AlertCircle
                          size={15}
                          className="text-[#C25939]"
                        />
                      )}
                  </div>
                </div>
                {usernameAvail === false && (
                  <p className="text-xs text-[#C25939] font-bold mt-1">
                    Username sudah dipakai.
                  </p>
                )}
                {usernameAvail === true && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    Username tersedia!
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label
                  className={cn(
                    "block text-xs sm:text-sm",
                    "font-bold text-[#71717A] mb-1.5",
                    "sm:mb-2",
                  )}
                >
                  Nama Lengkap
                </label>
                <input
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value,
                    )
                  }
                  className={cn(
                    "w-full bg-[#F9FAFB] border",
                    "border-[#E2E8F0]/80 rounded-xl sm:rounded-2xl",
                    "px-3.5 sm:px-4 py-3",
                    "sm:py-3.5 font-bold text-xs",
                    "sm:text-sm text-[#18181B] focus:outline-none",
                    "focus:ring-2 focus:ring-[#2B4C3B] focus:border-transparent",
                    "transition-all",
                  )}
                  placeholder="Nama lengkap"
                />
              </div>

              {/* Farm Name — PRODUCER only */}
              {profile?.role ===
                "PRODUCER" && (
                <div>
                  <label
                    className={cn(
                      "block text-xs sm:text-sm",
                      "font-bold text-[#71717A] mb-1.5",
                      "sm:mb-2",
                    )}
                  >
                    Nama Usaha / Farm
                  </label>
                  <div className="relative">
                    <Store
                      size={18}
                      className={cn(
                        "absolute left-3.5 sm:left-4",
                        "top-1/2 -translate-y-1/2 text-[#94A3B8]",
                      )}
                    />
                    <input
                      value={farmName}
                      onChange={(e) =>
                        setFarmName(
                          e.target.value,
                        )
                      }
                      className={cn(
                        "w-full bg-[#F9FAFB] border",
                        "border-[#E2E8F0]/80 rounded-xl sm:rounded-2xl",
                        "pl-11 sm:pl-12 pr-4",
                        "py-3 sm:py-3.5 font-bold",
                        "text-xs sm:text-sm text-[#18181B]",
                        "focus:outline-none focus:ring-2 focus:ring-[#2B4C3B]",
                        "focus:border-transparent transition-all",
                      )}
                      placeholder="Nama toko / farm"
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label
                  className={cn(
                    "block text-xs sm:text-sm",
                    "font-bold text-[#71717A] mb-1.5",
                    "sm:mb-2",
                  )}
                >
                  Lokasi
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className={cn(
                      "absolute left-3.5 sm:left-4",
                      "top-1/2 -translate-y-1/2 text-[#94A3B8]",
                    )}
                  />
                  <input
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value,
                      )
                    }
                    className={cn(
                      "w-full bg-[#F9FAFB] border",
                      "border-[#E2E8F0]/80 rounded-xl sm:rounded-2xl",
                      "pl-11 sm:pl-12 pr-4",
                      "py-3 sm:py-3.5 font-bold",
                      "text-xs sm:text-sm text-[#18181B]",
                      "focus:outline-none focus:ring-2 focus:ring-[#2B4C3B]",
                      "focus:border-transparent transition-all",
                    )}
                    placeholder="Kota, Provinsi"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="col-span-1 sm:col-span-2">
                <label
                  className={cn(
                    "block text-xs sm:text-sm",
                    "font-bold text-[#71717A] mb-1.5",
                    "sm:mb-2",
                  )}
                >
                  Kontak / WhatsApp
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className={cn(
                      "absolute left-3.5 sm:left-4",
                      "top-1/2 -translate-y-1/2 text-[#94A3B8]",
                    )}
                  />
                  <input
                    value={contact}
                    onChange={(e) =>
                      setContact(
                        e.target.value,
                      )
                    }
                    className={cn(
                      "w-full bg-[#F9FAFB] border",
                      "border-[#E2E8F0]/80 rounded-xl sm:rounded-2xl",
                      "pl-11 sm:pl-12 pr-4",
                      "py-3 sm:py-3.5 font-bold",
                      "text-xs sm:text-sm text-[#18181B]",
                      "focus:outline-none focus:ring-2 focus:ring-[#2B4C3B]",
                      "focus:border-transparent transition-all",
                    )}
                    placeholder="+62 812 xxxx xxxx"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 sm:pt-8">
              <motion.button
                whileHover={
                  !(
                    saving ||
                    usernameAvail === false
                  )
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !(
                    saving ||
                    usernameAvail === false
                  )
                    ? { scale: 0.97 }
                    : {}
                }
                onClick={handleSaveProfile}
                disabled={
                  saving ||
                  usernameAvail === false
                }
                className={cn(
                  "w-full py-3.5 sm:py-4",
                  "bg-pranata hover:bg-[#1E362A] disabled:opacity-50",
                  "text-[#F8F6F0] font-bold text-xs",
                  "sm:text-sm rounded-full",
                  "shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)]",
                  "transition-all duration-200 transform-gpu flex",
                  "items-center justify-center gap-2",
                  "cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-white/10",
                )}
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}
                {saving
                  ? "Menyimpan…"
                  : "Simpan Perubahan"}
              </motion.button>
            </div>
          </motion.div>

          {/* ── Password Change Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.3,
            }}
            className={cn(
              "lg:col-span-3 bg-white border",
              "border-[#E2E8F0]/50 rounded-2xl sm:rounded-3xl",
              "lg:rounded-[2.5rem] p-5 sm:p-8",
              "md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]",
            )}
          >
            <h2
              className={cn(
                "text-base sm:text-lg font-black",
                "text-[#1C241E] flex items-center",
                "gap-2 mb-4 sm:mb-6",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 bg-[#FFF3E0]",
                  "rounded-lg flex items-center",
                  "justify-center",
                )}
              >
                <Lock
                  size={14}
                  className="text-[#C25939]"
                />
              </div>
              Keamanan & Ubah Password
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {[
                {
                  label: "Password Saat Ini",
                  val: currentPw,
                  set: setCurrentPw,
                  show: showCur,
                  toggle: () =>
                    setShowCur((v) => !v),
                },
                {
                  label: "Password Baru",
                  val: newPw,
                  set: setNewPw,
                  show: showNew,
                  toggle: () =>
                    setShowNew((v) => !v),
                },
                {
                  label:
                    "Konfirmasi Password Baru",
                  val: confirmPw,
                  set: setConfirmPw,
                  show: showConf,
                  toggle: () =>
                    setShowConf((v) => !v),
                },
              ].map((f) => (
                <div key={f.label}>
                  <label
                    className={cn(
                      "block text-xs sm:text-sm",
                      "font-bold text-[#71717A] mb-1.5",
                      "sm:mb-2",
                    )}
                  >
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      type={
                        f.show
                          ? "text"
                          : "password"
                      }
                      value={f.val}
                      onChange={(e) =>
                        f.set(e.target.value)
                      }
                      className={cn(
                        "w-full bg-[#F9FAFB] border",
                        "border-[#E2E8F0]/80 rounded-xl sm:rounded-2xl",
                        "px-3.5 sm:px-4 py-3",
                        "sm:py-3.5 pr-12 font-bold",
                        "text-xs sm:text-sm text-[#18181B]",
                        "focus:outline-none focus:ring-2 focus:ring-[#2B4C3B]",
                        "focus:border-transparent transition-all",
                      )}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={f.toggle}
                      className={cn(
                        "absolute right-3.5 sm:right-4",
                        "top-1/2 -translate-y-1/2 text-[#94A3B8]",
                        "hover:text-[#18181B] transition-colors",
                      )}
                    >
                      {f.show ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Validation & Submit Button Row */}
            <div className="mt-5 pt-5 border-t border-[#E8E3D2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[#7A8678] font-semibold">
                {newPw && newPw.length < 6 ? (
                  <p className="text-xs text-[#C25939] font-bold flex items-center gap-1.5">
                    <AlertCircle size={13} /> Minimal 6 karakter.
                  </p>
                ) : newPw && confirmPw && newPw !== confirmPw ? (
                  <p className="text-xs text-[#C25939] font-bold flex items-center gap-1.5">
                    <AlertCircle size={13} /> Password baru dan konfirmasi tidak cocok.
                  </p>
                ) : (
                  <span className="text-[#A4B0A7]">Gunakan kombinasi password yang kuat untuk menjaga keamanan akun Anda.</span>
                )}
              </div>

              <motion.button
                whileHover={
                  !(
                    savingPw ||
                    !currentPw ||
                    !newPw ||
                    newPw !== confirmPw ||
                    newPw.length < 6
                  )
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !(
                    savingPw ||
                    !currentPw ||
                    !newPw ||
                    newPw !== confirmPw ||
                    newPw.length < 6
                  )
                    ? { scale: 0.97 }
                    : {}
                }
                onClick={handleChangePw}
                disabled={
                  savingPw ||
                  !currentPw ||
                  !newPw ||
                  newPw !== confirmPw ||
                  newPw.length < 6
                }
                className={cn(
                  "w-full sm:w-auto px-7 py-3.5",
                  "bg-pranata hover:bg-[#1E362A] disabled:opacity-40",
                  "text-[#F8F6F0] font-bold text-xs",
                  "sm:text-sm rounded-full",
                  "shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)]",
                  "transition-all duration-200 transform-gpu flex",
                  "items-center justify-center gap-2",
                  "cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 border border-white/10",
                )}
              >
                {savingPw ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Lock size={17} />
                )}
                <span>
                  {savingPw
                    ? "Menyimpan…"
                    : "Perbarui Password"}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* ── Danger Zone ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.4,
            }}
            className={cn(
              "lg:col-span-3 border-2 border-dashed",
              "border-[#E11D48]/30 bg-[#FFF1F2] rounded-2xl",
              "sm:rounded-3xl lg:rounded-[2.5rem] p-4",
              "sm:p-8 md:p-10 flex",
              "flex-col sm:flex-row sm:items-center",
              "justify-between gap-4 sm:gap-6",
            )}
          >
            <div>
              <h3
                className={cn(
                  "font-black text-[#E11D48] text-base",
                  "sm:text-lg mb-1 sm:mb-2",
                )}
              >
                Keluar dari Perangkat
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#E11D48]/70">
                Akhiri sesi di perangkat ini
                untuk menjaga keamanan akun
                Anda.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setShowLogoutModal(true)
              }
              className={cn(
                "w-full sm:w-auto px-6",
                "sm:px-8 py-3 sm:py-3.5",
                "bg-white text-[#E11D48] font-black",
                "text-xs sm:text-sm rounded-xl",
                "sm:rounded-2xl border border-[#E11D48]/20",
                "hover:bg-[#E11D48] hover:text-white transition-colors",
                "shadow-sm cursor-pointer text-center",
                "active:scale-95",
              )}
            >
              Keluar dari Akun
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div
            className={cn(
              "fixed inset-0 z-99999",
              "flex items-center justify-center",
              "p-4",
            )}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setShowLogoutModal(false)
              }
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              className={cn(
                "relative w-full max-w-sm",
                "bg-white rounded-2xl sm:rounded-[2rem]",
                "p-6 sm:p-8 border",
                "border-[#E8E3D2] shadow-2xl z-10",
                "text-center space-y-4",
              )}
            >
              <button
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className={cn(
                  "absolute top-4 right-4",
                  "p-2 rounded-full text-[#7A8678]",
                  "hover:text-[#1C241E] hover:bg-[#F8F6F0] transition-colors",
                  "cursor-pointer",
                )}
              >
                <X size={18} />
              </button>

              <div
                className={cn(
                  "w-14 h-14 bg-red-100",
                  "text-red-600 rounded-full flex",
                  "items-center justify-center mx-auto",
                  "shadow-inner",
                )}
              >
                <AlertTriangle size={28} />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#1C241E] mb-2">
                  Keluar dari Akun?
                </h3>
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium",
                    "text-[#5A635B] leading-relaxed",
                  )}
                >
                  Apakah Anda yakin ingin
                  keluar dari akun ini? Sesi
                  Anda di perangkat ini akan
                  diakhiri.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowLogoutModal(false)
                  }
                  className={cn(
                    "flex-1 py-3 px-4",
                    "rounded-xl border-2 border-[#DDE2D6]",
                    "text-[#1C241E] font-bold text-xs",
                    "sm:text-sm hover:bg-[#F8F6F0] transition-colors",
                    "cursor-pointer",
                  )}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    Cookies.remove(
                      "auth-token",
                    );
                    localStorage.removeItem(
                      "farmpro_session",
                    );
                    window.location.href =
                      "/";
                  }}
                  className={cn(
                    "flex-1 py-3 px-4",
                    "rounded-xl bg-red-600 hover:bg-red-700",
                    "text-white font-bold text-xs",
                    "sm:text-sm transition-all shadow-lg",
                    "shadow-red-600/30 cursor-pointer active:scale-95",
                  )}
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Upgrade Plus Modal */}
      <UpgradePlusModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        initialPlan={profile?.role === "PRODUCER" ? "seller" : "customer"}
        onSuccess={() => {
          if (profile?.id) {
            fetchProfileData(profile.id);
          }
        }}
      />

      {/* Cancel Plus Modal */}
      <CancelPlusModal
        isOpen={showCancelPlusModal}
        onClose={() => setShowCancelPlusModal(false)}
        onSuccess={() => {
          if (profile?.id) {
            fetchProfileData(profile.id);
          }
        }}
      />
    </div>
  );
}

