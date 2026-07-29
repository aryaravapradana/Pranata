"use client";
import { cn } from "@/lib/utils";

import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  Store,
  MapPin,
  Phone,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Building2,
  Locate,
} from "lucide-react";
import {
  fetchApi,
  getApiBaseUrl,
} from "@/lib/apiClient";
import { useGlobalLoading } from "@/components/shared/loading-context";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  type MapRef,
} from "@/components/ui/map";
import Cookies from "js-cookie";

interface SellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SellerOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
}: SellerOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] =
    useState("");
  const [capacity, setCapacity] =
    useState("");

  // Coordinates State (Default center around DI Yogyakarta / Indonesia)
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: -7.797,
    lng: 110.37,
  });
  const [
    isDetectingLocation,
    setIsDetectingLocation,
  ] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState<
    string | null
  >(null);
  const [mounted, setMounted] =
    useState(false);

  const { navigateTo } = useGlobalLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow =
        "hidden";
      document.documentElement.style.overflow =
        "hidden";
      document.body.style.touchAction =
        "none";
      if (
        typeof window !== "undefined" &&
        (window as any).__lenis
      ) {
        (window as any).__lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
      document.body.style.touchAction = "";
      if (
        typeof window !== "undefined" &&
        (window as any).__lenis
      ) {
        (window as any).__lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
      document.body.style.touchAction = "";
      if (
        typeof window !== "undefined" &&
        (window as any).__lenis
      ) {
        (window as any).__lenis.start();
      }
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // Reverse Geocoding helper with Nominatim OpenStreetMap + BigDataCloud fallback
  const reverseGeocode = async (
    lat: number,
    lng: number,
  ): Promise<string | null> => {
    // Provider 1: OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const district =
            addr.subdistrict ||
            addr.district ||
            addr.suburb ||
            addr.village ||
            addr.town ||
            addr.city_district;
          const regency =
            addr.city ||
            addr.regency ||
            addr.county ||
            addr.municipality ||
            addr.state_district;
          const province = addr.state;

          const parts: string[] = [];
          if (district) parts.push(district);
          if (
            regency &&
            regency !== district
          )
            parts.push(regency);
          else if (
            province &&
            !parts.includes(province)
          )
            parts.push(province);

          if (parts.length > 0) {
            return parts.join(", ");
          }
          if (data.display_name) {
            const split =
              data.display_name.split(",");
            return split
              .slice(0, 2)
              .map((s: string) => s.trim())
              .join(", ");
          }
        }
      }
    } catch (err) {
      console.warn(
        "Nominatim reverse geocode error:",
        err,
      );
    }

    // Provider 2: BigDataCloud fallback
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
      );
      if (res.ok) {
        const data = await res.json();
        const locality =
          data.locality || data.city;
        const admin =
          data.principalSubdivision;
        if (
          locality &&
          admin &&
          locality !== admin
        ) {
          return `${locality}, ${admin}`;
        } else if (locality || admin) {
          return locality || admin;
        }
      }
    } catch (err) {
      console.warn(
        "BigDataCloud reverse geocode error:",
        err,
      );
    }

    return null;
  };

  // Get current device location via browser Geolocation API
  const handleDetectCurrentLocation = () => {
    if (
      typeof window === "undefined" ||
      !("geolocation" in navigator)
    ) {
      setError(
        "Browser Anda tidak mendukung deteksi lokasi otomatis.",
      );
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } =
          pos.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
        });

        // Fly and zoom in smoothly to user's location
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 17.5,
            duration: 2200,
            essential: true,
          });
        }

        const address = await reverseGeocode(
          latitude,
          longitude,
        );
        if (address) {
          setLocation(address);
        }
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn(
          "Geolocation error:",
          err,
        );
        setError(
          "Gagal mendeteksi lokasi. Silakan geser penanda di peta atau ketik manual.",
        );
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const handleMarkerDragEnd =
    async (lngLat: {
      lng: number;
      lat: number;
    }) => {
      setCoords({
        lat: lngLat.lat,
        lng: lngLat.lng,
      });
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: [lngLat.lng, lngLat.lat],
          duration: 500,
        });
      }
      const address = await reverseGeocode(
        lngLat.lat,
        lngLat.lng,
      );
      if (address) {
        setLocation(address);
      }
    };

  const handleStep1Next = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    if (
      !farmName.trim() ||
      farmName.trim().length < 3
    ) {
      setError(
        "Nama peternakan / toko minimal 3 karakter.",
      );
      return;
    }
    if (!location.trim()) {
      setError(
        "Kota / Wilayah peternakan wajib diisi.",
      );
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const sessionStr =
      localStorage.getItem(
        "pranata_session",
      ) ||
      localStorage.getItem(
        "farmpro_session",
      );
    if (!sessionStr) {
      setError(
        "Sesi pengguna tidak ditemukan. Silakan login kembali.",
      );
      setLoading(false);
      return;
    }
    const session = JSON.parse(sessionStr);

    try {
      const res = await fetchApi(
        `${getApiBaseUrl()}/api/profile/upgrade-seller`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId: session.id,
            farmName: farmName.trim(),
            location: location.trim(),
            contact: contact.trim() || null,
            description:
              description.trim() || null,
            capacity:
              capacity.trim() || null,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error ||
            "Gagal melakukan upgrade toko",
        );

      // Update session locally & in cookies
      const updatedSession = {
        ...session,
        ...data,
        role: "PRODUCER",
      };
      localStorage.setItem(
        "pranata_session",
        JSON.stringify(updatedSession),
      );
      localStorage.setItem(
        "farmpro_session",
        JSON.stringify(updatedSession),
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
      window.dispatchEvent(
        new Event("storage"),
      );

      onClose();
      if (onSuccess) onSuccess();
      navigateTo("/hub");
    } catch (err: any) {
      setError(
        err?.message ||
          "Terjadi kesalahan saat upgrade akun.",
      );
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[99999]",
            "flex items-center justify-center",
            "p-3 sm:p-5 overflow-y-auto",
          )}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchMove={(e) =>
              e.preventDefault()
            }
            onWheel={(e) =>
              e.preventDefault()
            }
            className={cn(
              "fixed inset-0 bg-black/60",
              "backdrop-blur-sm touch-none",
            )}
          />

          {/* Modal Container - Fits cleanly on tablet & desktop without scrolling */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            className={cn(
              "relative w-full max-w-[480px]",
              "bg-white rounded-3xl sm:rounded-[2rem]",
              "p-5 sm:p-6 border",
              "border-[#E8E3D2] shadow-2xl z-10",
              "flex flex-col my-auto",
              "max-sm:max-h-[90vh] overflow-hidden",
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4",
                "sm:top-5 sm:right-5 p-1.5",
                "rounded-full text-[#7A8678] hover:text-[#1C241E]",
                "hover:bg-[#F8F6F0] transition-colors cursor-pointer",
                "z-20",
              )}
            >
              <X size={18} />
            </button>

            {/* Content Wrapper */}
            <div
              className={cn(
                "max-sm:overflow-y-auto space-y-3.5 custom-scrollbar",
                "flex-1",
              )}
            >
              {/* Header Badge */}
              <div className="flex items-center gap-2 pr-6">
                <span
                  className={cn(
                    "bg-[#EEF2E6] text-[#2B4C3B] text-xs",
                    "font-black px-2.5 py-1",
                    "rounded-full flex items-center",
                    "gap-1.5 shadow-xs",
                  )}
                >
                  <img
                    src="/logos/hub/hub-black.webp?v=2"
                    alt="Pranata Hub"
                    className="h-4 w-auto object-contain inline-block"
                    decoding="async"
                  />
                </span>
                <span className="text-[11px] font-extrabold text-[#7A8678]">
                  Langkah {step} dari 2
                </span>
              </div>

              <div>
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-black",
                    "text-[#1C241E] tracking-tight",
                  )}
                >
                  {step === 1
                    ? "Informasi Peternakan / Toko"
                    : "Profil & Operasional Usaha"}
                </h2>
                <p className="text-xs text-[#5A635B] font-medium mt-0.5">
                  {step === 1
                    ? "Lengkapi identitas toko peternakan Anda untuk mulai berjualan."
                    : "Tambahkan deskripsi singkat dan informasi operasional peternakan Anda."}
                </p>
              </div>

              {/* Stepper Progress Bar */}
              <div
                className={cn(
                  "w-full bg-[#F8F6F0] h-1.5",
                  "rounded-full overflow-hidden border",
                  "border-[#E8E3D2] shrink-0",
                )}
              >
                <div
                  className={cn(
                    "bg-[#2B4C3B] h-full transition-all",
                    "duration-300 rounded-full",
                  )}
                  style={{
                    width:
                      step === 1
                        ? "50%"
                        : "100%",
                  }}
                />
              </div>

              {error && (
                <div
                  className={cn(
                    "bg-red-50 border border-red-200",
                    "text-red-600 rounded-xl px-3.5",
                    "py-2 text-xs font-bold",
                    "text-center",
                  )}
                >
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="modalStep1"
                    initial={{
                      opacity: 0,
                      x: -12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 12,
                    }}
                    onSubmit={
                      handleStep1Next
                    }
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-extrabold mb-1 text-[#2B4C3B]">
                        Nama Peternakan /
                        Toko{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={farmName}
                          onChange={(e) =>
                            setFarmName(
                              e.target.value,
                            )
                          }
                          className={cn(
                            "w-full bg-[#F8F6F0] border",
                            "border-[#DDE2D6] rounded-xl px-3.5",
                            "py-2.5 text-xs sm:text-sm",
                            "text-[#1C241E] font-medium focus:outline-none",
                            "focus:ring-2 focus:ring-[#3A6B49] focus:bg-white",
                            "transition-all pl-9 placeholder:text-[#9A9E96]",
                          )}
                          required
                          placeholder="Contoh: Berkah Farm Sleman"
                        />
                        <Building2
                          size={16}
                          className={cn(
                            "absolute left-3 top-1/2",
                            "-translate-y-1/2 text-[#7A8678]",
                          )}
                        />
                      </div>
                    </div>

                    {/* Kota / Wilayah dengan Peta Interaktif */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-extrabold text-[#2B4C3B]">
                          Kota / Wilayah
                          Peternakan{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={
                            handleDetectCurrentLocation
                          }
                          disabled={
                            isDetectingLocation
                          }
                          className={cn(
                            "text-[10px] font-bold text-[#2B4C3B]",
                            "hover:text-[#1E362A] bg-[#EEF2E6] hover:bg-[#DDE2D6]",
                            "px-2 py-0.5 rounded-full",
                            "flex items-center gap-1",
                            "cursor-pointer disabled:opacity-50 transition-colors",
                            "shadow-2xs",
                          )}
                        >
                          {isDetectingLocation ? (
                            <Loader2
                              size={11}
                              className="animate-spin text-[#2B4C3B]"
                            />
                          ) : (
                            <Locate
                              size={11}
                            />
                          )}
                          <span>
                            {isDetectingLocation
                              ? "Mendeteksi..."
                              : "Lokasi Saat Ini"}
                          </span>
                        </button>
                      </div>

                      <div className="relative mb-1.5">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) =>
                            setLocation(
                              e.target.value,
                            )
                          }
                          className={cn(
                            "w-full bg-[#F8F6F0] border",
                            "border-[#DDE2D6] rounded-xl px-3.5",
                            "py-2.5 text-xs sm:text-sm",
                            "text-[#1C241E] font-medium focus:outline-none",
                            "focus:ring-2 focus:ring-[#3A6B49] focus:bg-white",
                            "transition-all pl-9 placeholder:text-[#9A9E96]",
                          )}
                          required
                          placeholder="Contoh: Sleman, DI Yogyakarta"
                        />
                        <MapPin
                          size={16}
                          className={cn(
                            "absolute left-3 top-1/2",
                            "-translate-y-1/2 text-[#2B4C3B]",
                          )}
                        />
                      </div>

                      {/* Map Box Container Compact Height for Zero Overflow */}
                      <div
                        className={cn(
                          "w-full h-32 sm:h-36",
                          "rounded-xl overflow-hidden border",
                          "border-[#DDE2D6] shadow-2xs relative",
                          "z-0 group",
                        )}
                      >
                        <Map
                          ref={mapRef}
                          theme="light"
                          viewport={{
                            center: [
                              coords.lng,
                              coords.lat,
                            ],
                            zoom: 12,
                          }}
                          className={cn(
                            "[&_.maplibregl-canvas]:filter [&_.maplibregl-canvas]:sepia-[0.12] [&_.maplibregl-canvas]:saturate-[0.9]",
                          )}
                        >
                          <MapMarker
                            longitude={
                              coords.lng
                            }
                            latitude={
                              coords.lat
                            }
                            draggable={true}
                            onDragEnd={
                              handleMarkerDragEnd
                            }
                          >
                            <MarkerContent>
                              <div className="relative flex items-center justify-center">
                                <span
                                  className={cn(
                                    "absolute w-8 h-8",
                                    "rounded-full bg-[#2B4C3B]/30 animate-ping",
                                  )}
                                />
                                <div
                                  className={cn(
                                    "relative w-8 h-8",
                                    "rounded-full bg-gradient-to-br from-[#3A6B49]",
                                    "to-[#1E362A] text-[#F8F6F0] flex",
                                    "items-center justify-center border-2",
                                    "border-white shadow-lg cursor-grab",
                                    "active:cursor-grabbing hover:scale-110 transition-transform",
                                  )}
                                >
                                  <MapPin
                                    size={16}
                                    className="text-[#F8F6F0] fill-[#F8F6F0]/20"
                                  />
                                </div>
                              </div>
                            </MarkerContent>
                          </MapMarker>
                          <MapControls position="bottom-right" />
                        </Map>
                      </div>
                      <p
                        className={cn(
                          "text-[9px] text-[#5A635B] font-extrabold",
                          "mt-1 flex items-center",
                          "gap-1",
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            "bg-[#2B4C3B] inline-block shrink-0",
                          )}
                        />
                        <span>
                          Geser penanda hijau
                          pada peta untuk
                          menentukan titik
                          lokasi tepat.
                        </span>
                      </p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        className={cn(
                          "w-full bg-[#2B4C3B] hover:bg-[#1E362A]",
                          "text-white rounded-xl font-extrabold",
                          "text-xs sm:text-sm py-3",
                          "shadow-md shadow-[#2B4C3B]/20 transition-all",
                          "flex items-center justify-center",
                          "gap-2 cursor-pointer active:scale-98",
                        )}
                      >
                        <span>
                          Lanjut Ke Langkah 2
                        </span>
                        <ArrowRight
                          size={16}
                        />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="modalStep2"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    onSubmit={
                      handleFinalSubmit
                    }
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-extrabold mb-1 text-[#2B4C3B]">
                        Nomor WhatsApp /
                        Kontak Usaha
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={contact}
                          onChange={(e) =>
                            setContact(
                              e.target.value,
                            )
                          }
                          className={cn(
                            "w-full bg-[#F8F6F0] border",
                            "border-[#DDE2D6] rounded-xl px-3.5",
                            "py-2.5 text-xs sm:text-sm",
                            "text-[#1C241E] font-medium focus:outline-none",
                            "focus:ring-2 focus:ring-[#3A6B49] focus:bg-white",
                            "transition-all pl-9 placeholder:text-[#9A9E96]",
                          )}
                          placeholder="Contoh: 081234567890"
                        />
                        <Phone
                          size={16}
                          className={cn(
                            "absolute left-3 top-1/2",
                            "-translate-y-1/2 text-[#7A8678]",
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold mb-1 text-[#2B4C3B]">
                        Bio / Deskripsi
                        Peternakan
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) =>
                          setDescription(
                            e.target.value,
                          )
                        }
                        rows={2}
                        className={cn(
                          "w-full bg-[#F8F6F0] border",
                          "border-[#DDE2D6] rounded-xl p-3",
                          "text-xs sm:text-sm text-[#1C241E]",
                          "font-medium focus:outline-none focus:ring-2",
                          "focus:ring-[#3A6B49] focus:bg-white transition-all",
                          "placeholder:text-[#9A9E96]",
                        )}
                        placeholder="Ceritakan tentang peternakan Anda, keunggulan pakan, atau kualitas hasil ternak..."
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setStep(1)
                        }
                        disabled={loading}
                        className={cn(
                          "px-3.5 py-3 border",
                          "border-[#DDE2D6] text-[#1C241E] font-bold",
                          "text-xs sm:text-sm rounded-xl",
                          "hover:bg-[#F8F6F0] transition-colors flex",
                          "items-center gap-1.5 cursor-pointer",
                        )}
                      >
                        <ArrowLeft
                          size={16}
                        />
                        <span>Kembali</span>
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                          "flex-1 bg-[#2B4C3B] hover:bg-[#1E362A]",
                          "text-white rounded-xl font-extrabold",
                          "text-xs sm:text-sm py-3",
                          "shadow-md shadow-[#2B4C3B]/20 transition-all",
                          "flex items-center justify-center",
                          "gap-2 cursor-pointer active:scale-98",
                          "disabled:opacity-50",
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin text-white"
                            />
                            <span>
                              Mengaktifkan
                              Toko...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5">
                              Aktifkan
                              <img
                                src="/logos/hub/hub-white.webp"
                                alt="Pranata Hub"
                                className="h-4.5 w-auto object-contain inline-block"
                                decoding="async"
                              />
                            </span>
                            <Check
                              size={16}
                            />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
