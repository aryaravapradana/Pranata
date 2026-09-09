"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HubIntelligenceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/intelligence");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center text-[#1C241E]">
      <Loader2 size={32} className="animate-spin text-[#2B4C3B] mb-3" />
      <p className="text-sm font-bold text-[#5A635B]">Membuka Pranata Intelligence...</p>
    </div>
  );
}
