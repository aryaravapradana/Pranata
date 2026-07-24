"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?mode=register");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#2B4C3B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
