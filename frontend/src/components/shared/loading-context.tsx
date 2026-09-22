"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

export type TransitionPhase =
  | "INITIAL"
  | "IDLE"
  | "CLOSING"
  | "COVERED"
  | "OPENING";

export const SPLASH_CLOSE_DURATION = 0.45; // 450ms close animation
export const SPLASH_OPEN_DURATION = 0.65;  // 650ms open animation
export const SPLASH_SETTLE_MS = 300;       // Settle time for DOM paint & initial data fetch

interface LoadingContextType {
  isGlobalReady: boolean;
  isTransitioning: boolean;
  phase: TransitionPhase;
  triggerTransition: () => void;
  navigateTo: (url: string) => void;
  goBack: () => void;
  registerBlocker: (id: string) => void;
  removeBlocker: (id: string) => void;
  router: {
    push: (url: string, options?: any) => void;
    replace: (url: string, options?: any) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (url: string, options?: any) => void;
  };
}

const LoadingContext = createContext<LoadingContextType>({
  isGlobalReady: true,
  isTransitioning: false,
  phase: "IDLE",
  triggerTransition: () => {},
  navigateTo: () => {},
  goBack: () => {},
  registerBlocker: () => {},
  removeBlocker: () => {},
  router: {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  },
});

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [blockers, setBlockers] = useState<Set<string>>(
    new Set(["nav-initial"]),
  );
  const [phase, setPhase] = useState<TransitionPhase>("INITIAL");
  const pathname = usePathname();
  const nextRouter = useRouter();
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetUrlRef = useRef<string | null>(null);
  const targetPathRef = useRef<string | null>(null);
  const isFirstMount = useRef(true);

  const clearPendingTimeout = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  const registerBlocker = useCallback((id: string) => {
    setBlockers((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const removeBlocker = useCallback((id: string) => {
    setBlockers((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * CORE SPECIFICATION:
   * 1. splash screen nutup (CLOSING 450ms, old page stays visible underneath)
   * 2. setelah fully close (COVERED), page ganti (router.push) dan load
   * 3. setelah selesai load (blockers cleared + DOM painted), baru di buka (OPENING 650ms)
   */
  const startNavigationSequence = useCallback(
    (url: string) => {
      const currentPath = window.location.pathname;
      const fullCurrentUrl = currentPath + window.location.search;
      if (url === fullCurrentUrl) return;

      const urlPath = url.split("?")[0].split("#")[0];

      // If already transitioning, don't restart; redirect target destination
      if (phase === "CLOSING" || phase === "COVERED") {
        targetUrlRef.current = url;
        targetPathRef.current = urlPath;
        return;
      }

      clearPendingTimeout();
      targetUrlRef.current = url;
      targetPathRef.current = urlPath;

      // STEP 1: SPLASH SCREEN NUTUP
      // Lock navigation so screen stays closed until route loads
      registerBlocker("nav-transition");
      setPhase("CLOSING");

      // STEP 2: SETELAH FULLY CLOSE (450ms), BARU GANTI PAGE
      transitionTimeoutRef.current = setTimeout(() => {
        setPhase("COVERED");
        const dest = targetUrlRef.current || url;
        nextRouter.push(dest);
      }, SPLASH_CLOSE_DURATION * 1000);
    },
    [phase, nextRouter, registerBlocker],
  );

  const navigateTo = useCallback(
    (url: string) => {
      startNavigationSequence(url);
    },
    [startNavigationSequence],
  );

  const goBack = useCallback(() => {
    if (phase === "CLOSING" || phase === "COVERED") return;
    clearPendingTimeout();
    targetPathRef.current = null;
    registerBlocker("nav-transition");
    setPhase("CLOSING");

    transitionTimeoutRef.current = setTimeout(() => {
      setPhase("COVERED");
      if (typeof window !== "undefined" && window.history.length > 1) {
        nextRouter.back();
      } else {
        nextRouter.push("/market");
      }
    }, SPLASH_CLOSE_DURATION * 1000);
  }, [phase, nextRouter, registerBlocker]);

  const triggerTransition = useCallback(() => {
    clearPendingTimeout();
    registerBlocker("nav-transition");
    setPhase("CLOSING");
    transitionTimeoutRef.current = setTimeout(() => {
      setPhase("COVERED");
      setTimeout(() => {
        removeBlocker("nav-transition");
      }, SPLASH_SETTLE_MS);
    }, SPLASH_CLOSE_DURATION * 1000);
  }, [registerBlocker, removeBlocker]);

  // Initial app load: release initial lock once mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      removeBlocker("nav-initial");
    }, 200);
    return () => clearTimeout(timer);
  }, [removeBlocker]);

  // STEP 2 (continuation): When pathname changes while COVERED, wait for DOM & initial data settle
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (phase === "COVERED") {
      // If we are waiting for a specific destination path, hold until pathname matches
      if (targetPathRef.current && pathname !== targetPathRef.current) {
        return;
      }

      const timer = setTimeout(() => {
        targetPathRef.current = null;
        removeBlocker("nav-transition");
      }, SPLASH_SETTLE_MS);
      return () => clearTimeout(timer);
    }
  }, [pathname, phase, removeBlocker]);

  // STEP 3: SETELAH SELESAI LOAD (blockers.size === 0), BARU DI BUKA
  useEffect(() => {
    if (
      (phase === "INITIAL" || phase === "COVERED") &&
      blockers.size === 0
    ) {
      clearPendingTimeout();
      // Brief 60ms paint tick so the browser paints the real UI under the solid cover
      transitionTimeoutRef.current = setTimeout(() => {
        setPhase("OPENING");
        transitionTimeoutRef.current = setTimeout(() => {
          setPhase("IDLE");
          targetUrlRef.current = null;
        }, SPLASH_OPEN_DURATION * 1000);
      }, 60);

      return () => clearPendingTimeout();
    }
  }, [phase, blockers.size]);

  // Failsafe Watchdog: Under no circumstances should the screen be stuck covered for > 3.0s
  useEffect(() => {
    if (phase === "CLOSING" || phase === "COVERED") {
      const watchdog = setTimeout(() => {
        setBlockers(new Set());
        setPhase("OPENING");
        setTimeout(() => {
          setPhase("IDLE");
          targetUrlRef.current = null;
        }, SPLASH_OPEN_DURATION * 1000);
      }, 3000);
      return () => clearTimeout(watchdog);
    }
  }, [phase]);

  // Browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      clearPendingTimeout();
      removeBlocker("nav-transition");
      if (phase === "CLOSING" || phase === "COVERED") {
        setPhase("OPENING");
        setTimeout(() => {
          setPhase("IDLE");
        }, SPLASH_OPEN_DURATION * 1000);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [phase, removeBlocker]);

  // Global Click Interceptor: Catch all internal link clicks before Next.js swaps the page
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      )
        return;

      // Check for back button triggers first
      const backTarget = (e.target as HTMLElement).closest(
        "[data-back], [data-navigate='back'], [data-navigate-back], [data-action='back']",
      );
      if (backTarget) {
        e.preventDefault();
        e.stopPropagation();
        goBack();
        return;
      }

      const target = (e.target as HTMLElement).closest(
        "a[href], [data-navigate], [data-href]",
      );
      if (!target) return;

      if (target.getAttribute("target") === "_blank") return;

      const href =
        target.getAttribute("href") ||
        target.getAttribute("data-navigate") ||
        target.getAttribute("data-href");
      if (!href) return;

      if (
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:")
      ) {
        const fullCurrentUrl =
          window.location.pathname + window.location.search;
        if (href !== fullCurrentUrl) {
          e.preventDefault();
          e.stopPropagation();
          startNavigationSequence(href);
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [startNavigationSequence, goBack]);

  const isGlobalReady = phase === "IDLE";
  const isTransitioning = phase !== "IDLE";

  const appRouter = useMemo(
    () => ({
      ...nextRouter,
      push: (url: string, _options?: any) => navigateTo(url),
      replace: (url: string, _options?: any) => navigateTo(url),
      back: () => goBack(),
      forward: () => nextRouter.forward(),
      refresh: () => nextRouter.refresh(),
      prefetch: (url: string, options?: any) => nextRouter.prefetch(url, options),
    }),
    [nextRouter, navigateTo, goBack],
  );

  return (
    <LoadingContext.Provider
      value={{
        isGlobalReady,
        isTransitioning,
        phase,
        triggerTransition,
        navigateTo,
        goBack,
        registerBlocker,
        removeBlocker,
        router: appRouter,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);

// Custom hook to replace useRouter for seamless splash transitions
export const useAppRouter = () => {
  const { router } = useGlobalLoading();
  return router;
};

// Custom hook for pages to signal when their async data has finished loading
export const usePageLoading = (isLoading: boolean = false) => {
  const { registerBlocker, removeBlocker } = useGlobalLoading();

  useEffect(() => {
    const id = "page-load";
    if (isLoading) {
      registerBlocker(id);
      return () => {
        removeBlocker(id);
      };
    } else {
      removeBlocker(id);
    }
  }, [isLoading, registerBlocker, removeBlocker]);
};
