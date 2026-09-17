"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "gold"
    | "destructive"
    | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isAnimated?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-pranata hover:bg-[#1E362A] text-[#F8F6F0] shadow-[0_10px_20px_-8px_rgba(43,76,59,0.4)] hover:shadow-[0_14px_26px_-8px_rgba(43,76,59,0.5)] border border-white/10",
  secondary:
    "bg-white/65 hover:bg-white text-[#3F4841] hover:text-[#1C241E] border border-[#D5D0C5] hover:border-[#1C241E]/40 backdrop-blur-md shadow-xs",
  outline:
    "bg-transparent hover:bg-[#2B4C3B] text-[#2B4C3B] hover:text-[#F8F6F0] border-2 border-[#2B4C3B] shadow-xs",
  gold:
    "bg-linear-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#1C2E24] shadow-[0_10px_20px_-8px_rgba(212,175,55,0.4)] hover:brightness-105 border border-amber-300/30",
  destructive:
    "bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_20px_-8px_rgba(220,38,38,0.4)] border border-red-400/20",
  ghost:
    "bg-transparent hover:bg-[#E8E3D2]/40 text-[#3F4841] hover:text-[#1C241E]",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3.5 py-1.5 text-xs font-bold gap-1.5",
  md: "px-5 py-2.5 text-xs sm:text-sm font-bold gap-2",
  lg: "px-6 py-3.5 text-sm sm:text-base font-extrabold gap-2.5",
  icon: "w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center shrink-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      isAnimated = true,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses = cn(
      "relative inline-flex items-center justify-center rounded-full font-bold",
      "transition-all duration-200 transform-gpu cursor-pointer select-none",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group",
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    const content = (
      <>
        {isLoading ? (
          <Loader2
            size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
            className="animate-spin shrink-0"
          />
        ) : (
          leftIcon
        )}
        {children && <span className="inline-flex items-center gap-1.5">{children}</span>}
        {!isLoading && rightIcon}
      </>
    );

    if (isAnimated) {
      return (
        <motion.button
          ref={ref as any}
          whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
          whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
          disabled={disabled || isLoading}
          className={baseClasses}
          {...(props as HTMLMotionProps<"button">)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, "active:scale-[0.98] hover:scale-[1.02]")}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
