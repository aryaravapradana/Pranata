"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Mobile/touch devices use native compositor-thread scroll which is already
    // buttery smooth. Lenis on touch intercepts native events and forces a
    // JS main-thread scroll loop — combined with GSAP ScrollTrigger callbacks
    // this is the primary cause of stutter. Disable on touch devices entirely.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) {
      // Sync GSAP ScrollTrigger with native scroll directly (passive listener)
      window.addEventListener("scroll", () => ScrollTrigger.update(), { passive: true });
      return () => {
        window.removeEventListener("scroll", () => ScrollTrigger.update());
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    })

    lenis.on("scroll", ScrollTrigger.update)

    // Synchronize Lenis raf loop directly with GSAP's high-precision ticker
    const update = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
