"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

export interface PlusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual theme variant:
   * "white" | "dark": Emerald foil with gold text (for dark/navbar surfaces)
   * "black" | "gold": Rich metallic gold with dark text (for light/card surfaces)
   * "subtle": Soft amber tint
   */
  variant?: "white" | "black" | "dark" | "gold" | "subtle";
  /**
   * Preset sizes:
   * "xs": Very compact (height ~18px), perfect for tight seller cards & lists
   * "sm": Standard compact (height ~22px), perfect for dropdowns & headers
   * "md": Prominent (height ~26px), for navbar & hero
   * "lg": Large badge (height ~32px), for profile main card
   */
  size?: "xs" | "sm" | "md" | "lg";
  /**
   * Icon prefix:
   * "sparkle": 4-point star sparkles (default)
   * "crown": Imperial mini crown
   * "none": Text only
   */
  icon?: "sparkle" | "crown" | "none";
  /**
   * Optional wrapper style:
   * "pill": Full pill badge with border and shadow (default)
   * "none": Simple text + icon inline
   */
  wrapper?: "pill" | "none" | "glow";
  imgClassName?: string; // Kept for backward compatibility
}

export function PlusBadge({
  variant = "white",
  size = "sm",
  icon = "none",
  wrapper = "pill",
  className,
  ...props
}: PlusBadgeProps) {
  const isDarkTheme = variant === "white" || variant === "dark";
  const isGoldTheme = variant === "black" || variant === "gold";

  // Size configurations (tight, balanced padding for pure text badge)
  const sizeConfig = {
    xs: {
      pill: "px-2 py-0.5 text-[8.5px]",
      icon: 9,
      text: "text-[8.5px]",
    },
    sm: {
      pill: "px-2.5 py-0.5 text-[9.5px]",
      icon: 11,
      text: "text-[9.5px]",
    },
    md: {
      pill: "px-3 py-1 text-[11px]",
      icon: 13,
      text: "text-[11px]",
    },
    lg: {
      pill: "px-4 py-1.5 text-xs",
      icon: 15,
      text: "text-xs",
    },
  }[size] || {
    pill: "px-2.5 py-0.5 text-[9.5px]",
    icon: 11,
    text: "text-[9.5px]",
  };

  // Color theme styles: dark obsidian-emerald with gold border for contrast
  let themeStyle = "";
  const textStyle = "text-white font-black tracking-widest";

  if (isDarkTheme) {
    themeStyle =
      "bg-linear-to-r from-[#1C2E24] via-[#243E30] to-[#1C2E24] border border-[#D4AF37]/60 shadow-[0_2px_8px_-2px_rgba(212,175,55,0.35)]";
  } else if (isGoldTheme) {
    themeStyle =
      "bg-linear-to-r from-[#1A2E22] via-[#223A2C] to-[#1A2E22] border border-[#D4AF37]/50 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]";
  } else {
    // subtle
    themeStyle = "bg-[#243E30] border border-[#D4AF37]/40 shadow-2xs";
  }

  const renderIcon = () => {
    if (icon === "crown") {
      return (
        <Crown
          size={sizeConfig.icon}
          className="shrink-0 mr-1 text-white"
        />
      );
    }
    return null;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none align-middle transition-transform duration-200",
        wrapper === "pill" && "rounded-full",
        wrapper === "pill" && sizeConfig.pill,
        wrapper === "pill" && themeStyle,
        wrapper === "glow" && "drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]",
        className,
      )}
      title="Member Pranata Plus"
      {...props}
    >
      {renderIcon()}
      <span className={cn("uppercase leading-none", sizeConfig.text, textStyle)}>
        PLUS
      </span>
    </span>
  );
}

export default PlusBadge;
