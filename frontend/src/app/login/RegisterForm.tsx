"use client";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  ShoppingCart,
  Beef,
  Bird,
  Tractor,
  Droplet,
  Circle,
  MoreHorizontal,
  ArrowRight,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useGlobalLoading } from "@/components/shared/loading-context";

const LIVESTOCK_OPTIONS = [
  { id: "SAPI", label: "Sapi", icon: Beef },
  { id: "AYAM", label: "Ayam", icon: Bird },
  {
    id: "KAMBING",
    label: "Kambing",
    icon: Tractor,
  },
  {
    id: "SUSU",
    label: "Susu",
    icon: Droplet,
  },
  {
    id: "TELUR",
    label: "Telur",
    icon: Circle,
  },
  {
    id: "BEBEK",
    label: "Bebek",
    icon: Bird,
  },
  {
    id: "LAINNYA",
    label: "Lainnya",
    icon: MoreHorizontal,
  },
];

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] =
    useState("");
  const [username, setUsername] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    usernameAvailable,
    setUsernameAvailable,
  ] = useState<boolean | null>(null);
  const [
    checkingUsername,
    setCheckingUsername,
  ] = useState(false);

  const [role, setRole] = useState<
    "PRODUCER" | "BUYER" | null
  >(null);
  const [livestock, setLivestock] = useState<
    string[]
  >([]);

  const [error, setError] = useState<
    string | null
  >(null);
  const [loading, setLoading] =
    useState(false);

  const router = useRouter();
  const { navigateTo } = useGlobalLoading();

  // Debounced Username Checker
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    if (username.includes(" ")) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    const timeoutId = setTimeout(
      async () => {
        try {
          const API_BASE = getApiBaseUrl();
          const res = await fetchApi(
            `${API_BASE}/api/profile/check-username?username=${encodeURIComponent(username.trim().toLowerCase())}`,
          );
          const data = await res.json();
          setUsernameAvailable(
            data.available,
          );
        } catch (err) {
          setUsernameAvailable(null);
        } finally {
          setCheckingUsername(false);
        }
      },
      500,
    );

    return () => clearTimeout(timeoutId);
  }, [username]);

  // Submit Registration directly as BUYER
  const handleRegisterSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    const cleanUsername = username
      .trim()
      .toLowerCase();

    if (
      !fullName.trim() ||
      fullName.trim().length < 2
    ) {
      setError(
        "Nama lengkap minimal 2 karakter.",
      );
      return;
    }
    if (
      !cleanUsername ||
      cleanUsername.length < 3
    ) {
      setError(
        "Username minimal 3 karakter.",
      );
      return;
    }
    if (
      !/^[a-z0-9_]+$/.test(cleanUsername)
    ) {
      setError(
        "Username hanya boleh huruf kecil, angka, dan underscore (_).",
      );
      return;
    }
    if (usernameAvailable === false) {
      setError(
        "Username sudah digunakan, silakan pilih username lain.",
      );
      return;
    }
    if (usernameAvailable !== true) {
      setError(
        "Mohon tunggu pengecekan username selesai.",
      );
      return;
    }
    if (!password || password.length < 8) {
      setError(
        "Password minimal 8 karakter.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(
        `${getApiBaseUrl()}/api/profile/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fullName,
            username: cleanUsername,
            password,
            role: "BUYER",
            livestockTypes: [],
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || "Gagal membuat akun",
        );

      localStorage.setItem(
        "pranata_session",
        JSON.stringify(data),
      );
      localStorage.setItem(
        "farmpro_session",
        JSON.stringify(data),
      );
      if (data.token) {
        Cookies.set(
          "auth-token",
          data.token,
          {
            expires: 7,
            path: "/",
          },
        );
      }
      navigateTo("/market");
    } catch (err: any) {
      setError(
        err.message ||
          "Gagal menyelesaikan pendaftaran",
      );
      setLoading(false);
    }
  };

  const isFormValid =
    fullName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    /^[a-z0-9_]+$/.test(
      username.trim().toLowerCase(),
    ) &&
    usernameAvailable === true &&
    password.length >= 8;

  return (
    <>
      <div className="mb-6 mt-1">
        <h1
          className={cn(
            "text-2xl font-black text-[#2B4C3B]",
            "mb-1 tracking-tight",
          )}
        >
          Daftar Akun Baru
        </h1>
        <p className="text-[#5A635B] text-xs sm:text-sm font-medium">
          Isi data diri & kredensial akun
          Pranata Anda untuk mulai menjelajah
          pasar.
        </p>
      </div>

      {error && (
        <div
          className={cn(
            "bg-red-50 border border-red-200",
            "text-red-600 rounded-2xl px-4",
            "py-3 mb-5 text-xs",
            "sm:text-sm font-bold text-center",
          )}
        >
          {error}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleRegisterSubmit}
        className="space-y-4"
      >
        <div>
          <label
            className={cn(
              "block text-xs sm:text-sm",
              "font-extrabold mb-1.5 text-[#2B4C3B]",
            )}
          >
            Nama Lengkap
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            className={cn(
              "w-full bg-[#F8F6F0] border",
              "border-[#DDE2D6] rounded-2xl px-4",
              "py-3.5 text-sm text-[#1C241E]",
              "font-medium focus:outline-none focus:ring-2",
              "focus:ring-[#3A6B49] focus:bg-white transition-all",
              "placeholder:text-[#9A9E96]",
            )}
            required
            placeholder="Contoh: Budi Santoso"
          />
        </div>

        <div>
          <label
            className={cn(
              "block text-xs sm:text-sm",
              "font-extrabold mb-1.5 text-[#2B4C3B]",
            )}
          >
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase(),
                )
              }
              className={`w-full bg-[#F8F6F0] border ${
                usernameAvailable ===
                  false ||
                (username.trim() &&
                  !/^[a-z0-9_]+$/.test(
                    username.trim(),
                  ))
                  ? "border-red-400 focus:ring-red-400"
                  : usernameAvailable ===
                      true
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : "border-[#DDE2D6] focus:ring-[#3A6B49]"
              } rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 transition-all pr-12 placeholder:text-[#9A9E96]`}
              required
              placeholder="budi_farm"
            />

            {username.trim() && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checkingUsername ? (
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full",
                      "border-2 border-[#DDE2D6] border-t-[#2B4C3B]",
                      "animate-spin",
                    )}
                  />
                ) : usernameAvailable &&
                  /^[a-z0-9_]+$/.test(
                    username.trim(),
                  ) ? (
                  <Check
                    size={18}
                    className="text-emerald-600"
                  />
                ) : usernameAvailable ===
                    false ||
                  !/^[a-z0-9_]+$/.test(
                    username.trim(),
                  ) ? (
                  <X
                    size={18}
                    className="text-red-500"
                  />
                ) : null}
              </div>
            )}
          </div>

          {username.trim() &&
            !checkingUsername && (
              <div className="mt-1.5 ml-1 text-xs font-bold">
                {!/^[a-z0-9_]+$/.test(
                  username.trim(),
                ) ? (
                  <p className="text-red-500">
                    Username hanya boleh
                    huruf kecil, angka, dan
                    underscore (_)
                  </p>
                ) : username.trim().length <
                  3 ? (
                  <p className="text-amber-600">
                    Username minimal 3
                    karakter
                  </p>
                ) : usernameAvailable ===
                  false ? (
                  <p className="text-red-500">
                    Username sudah terpakai,
                    gunakan username lain
                  </p>
                ) : usernameAvailable ===
                  true ? (
                  <p className="text-emerald-600 flex items-center gap-1">
                    <Check size={14} />{" "}
                    Username tersedia
                  </p>
                ) : null}
              </div>
            )}
        </div>

        <div>
          <label
            className={cn(
              "block text-xs sm:text-sm",
              "font-extrabold mb-1.5 text-[#2B4C3B]",
            )}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className={`w-full bg-[#F8F6F0] border ${
                password.length > 0 &&
                password.length < 8
                  ? "border-amber-400 focus:ring-amber-400"
                  : password.length >= 8
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : "border-[#DDE2D6] focus:ring-[#3A6B49]"
              } rounded-2xl px-4 py-3.5 text-sm text-[#1C241E] font-medium focus:outline-none focus:ring-2 transition-all pr-12 placeholder:text-[#9A9E96]`}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
            />
            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              className={cn(
                "absolute right-4 top-1/2",
                "-translate-y-1/2 text-[#7A8678] hover:text-[#2B4C3B]",
                "transition-colors p-1",
              )}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-1.5 ml-1 text-xs font-bold">
              {password.length < 8 ? (
                <p className="text-amber-600">
                  Password minimal 8 karakter
                  (kurang{" "}
                  {8 - password.length}{" "}
                  karakter lagi)
                </p>
              ) : (
                <p className="text-emerald-600 flex items-center gap-1">
                  <Check size={14} />{" "}
                  Password memenuhi syarat
                  (minimal 8 karakter)
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            checkingUsername ||
            !isFormValid
          }
          className={cn(
            "w-full bg-[#2B4C3B] hover:bg-[#1E362A]",
            "active:scale-[0.99] text-white rounded-2xl",
            "font-extrabold text-sm sm:text-base",
            "py-3.5 shadow-md shadow-[#2B4C3B]/20",
            "transition-all flex justify-center",
            "items-center gap-2 mt-4",
            "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          )}
        >
          <span>
            {loading
              ? "Mendaftarkan..."
              : "Daftar Akun Baru"}
          </span>
          <ArrowRight size={18} />
        </button>

        <div
          className={cn(
            "mt-5 text-center text-xs",
            "font-semibold text-[#5A635B]",
          )}
        >
          Sudah memiliki akun?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={cn(
              "text-[#C25939] font-extrabold hover:underline",
              "cursor-pointer",
            )}
          >
            Masuk
          </button>
        </div>
      </motion.form>
    </>
  );
}
