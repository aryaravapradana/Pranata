"use client";
import React from "react";

export function AnimatedDekorasi({
  className,
}: {
  className?: string;
}) {
  return (
    <img
      src="/icons/dekorasi.svg"
      alt="Dekorasi Background"
      className={className}
      loading="lazy"
      decoding="async"
      style={{ willChange: "transform" }}
    />
  );
}
