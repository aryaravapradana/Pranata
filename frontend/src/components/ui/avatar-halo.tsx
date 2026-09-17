"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export interface AvatarHaloProps {
  isPlus?: boolean;
  avatarUrl?: string | null;
  name?: string | null;
  initials?: string;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  shape?: "circle" | "rounded";
  className?: string;
  avatarClassName?: string;
  showCornerEmblem?: boolean;
}

const sizeConfig = {
  sm: {
    box: "w-8 h-8 sm:w-9 sm:h-9",
    rounded: "rounded-lg sm:rounded-xl",
    text: "text-xs font-bold",
    emblem: "w-3.5 h-3.5 -bottom-0.5 -right-0.5 border",
    icon: 7,
    haloPad: "p-[2px]",
  },
  md: {
    box: "w-10 h-10 sm:w-11 sm:h-11",
    rounded: "rounded-xl sm:rounded-2xl",
    text: "text-sm font-bold",
    emblem: "w-4.5 h-4.5 -bottom-1 -right-1 border-1.5",
    icon: 9,
    haloPad: "p-[2.5px]",
  },
  lg: {
    box: "w-14 h-14 sm:w-16 sm:h-16",
    rounded: "rounded-2xl sm:rounded-[1.25rem]",
    text: "text-lg font-black",
    emblem: "w-6 h-6 -bottom-1 -right-1 border-2",
    icon: 12,
    haloPad: "p-[3px]",
  },
  xl: {
    box: "w-20 h-20 sm:w-28 sm:h-28",
    rounded: "rounded-full",
    text: "text-2xl sm:text-4xl font-black",
    emblem: "w-7 h-7 sm:w-8 sm:h-8 -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 border-2",
    icon: 14,
    haloPad: "p-[3.5px]",
  },
  custom: {
    box: "",
    rounded: "rounded-full",
    text: "text-sm font-bold",
    emblem: "w-4 h-4 -bottom-1 -right-1 border-1.5",
    icon: 9,
    haloPad: "p-[2px]",
  },
};

export function AvatarHalo({
  isPlus = false,
  avatarUrl,
  name,
  initials,
  size = "md",
  shape,
  className,
  avatarClassName,
  showCornerEmblem = true,
}: AvatarHaloProps) {
  const conf = sizeConfig[size] || sizeConfig.md;
  const resolvedRounded =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-xl"
        : conf.rounded;

  const displayInitials =
    initials ||
    (name || "User")
      .split(" ")
      .map((w) => w.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0 select-none inline-flex items-center justify-center transition-all duration-300",
        conf.box,
        className,
      )}
    >
      {/* Outer Halo Ring (Golden Laurel Gradient for Plus Users) */}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center transition-all duration-300",
          resolvedRounded,
          isPlus
            ? cn(
                conf.haloPad,
                "bg-linear-to-tr from-[#D4AF37] via-[#FDE68A] to-[#2B4C3B]",
                "shadow-[0_0_12px_rgba(212,175,55,0.35)]",
              )
            : "p-0",
        )}
      >
        {/* Core Avatar Box */}
        <div
          className={cn(
            "w-full h-full overflow-hidden flex items-center justify-center transition-all duration-200",
            resolvedRounded,
            isPlus
              ? "bg-[#1C2E24] border border-white/80"
              : "bg-[#E8E3D2] border-2 border-white shadow-2xs",
            avatarClassName,
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || "Avatar"}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full flex items-center justify-center text-white",
                isPlus ? "bg-[#1C2E24] text-white font-black" : "bg-[#2B4C3B] font-bold",
                conf.text,
              )}
            >
              {displayInitials}
            </div>
          )}
        </div>
      </div>

      {/* Floating Corner Emblem for Plus Users */}
      {isPlus && showCornerEmblem && (
        <span
          className={cn(
            "absolute rounded-full bg-[#1C2E24] border-[#D4AF37] flex items-center justify-center text-white shadow-md z-10 animate-in fade-in zoom-in duration-200",
            conf.emblem,
          )}
          title="Pranata Plus Member"
        >
          <Plus
            size={conf.icon}
            className="text-white stroke-[3.5]"
          />
        </span>
      )}
    </div>
  );
}

export default AvatarHalo;
