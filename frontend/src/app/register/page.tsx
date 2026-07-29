"use client";
import { cn } from "@/lib/utils";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?mode=register");
  }, [router]);

  return (
    <div
      className={cn(
        "min-h-screen bg-[#F8F6F0] flex",
        "items-center justify-center",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 border-3",
          "border-[#2B4C3B] border-t-transparent rounded-full",
          "animate-spin",
        )}
      />
    </div>
  );
}
