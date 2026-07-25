"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      // Native scroll on touch — compositor already handles it
      const onScroll = () => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    // Lenis active universally across ALL pages
    const lenis = new Lenis({
      lerp: 0.1,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // KEY FIX: Whenever ScrollTrigger refreshes (e.g. after adding a pin spacer),
    // tell Lenis to recalculate its scroll limits so it knows about the new height.
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());

    // Continuous Height & Layout Sync Observer
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Sync GSAP ticker with Lenis RAF loop (Lenis docs standard integration)
    lenis.on("scroll", ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); // Must be 0 when using Lenis — per Lenis docs

    // Force a refresh so Lenis immediately knows about all pin spacers and section heights
    setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      if (document.body) resizeObserver.unobserve(document.body);
      resizeObserver.disconnect();
      ScrollTrigger.removeEventListener("refresh", () => lenis.resize());
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
