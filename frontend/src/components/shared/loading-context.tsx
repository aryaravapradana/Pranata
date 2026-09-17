"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

const LoadingContext = createContext({
  isGlobalReady: true,
  isTransitioning: false,
  phase: "IDLE" as TransitionPhase,
  triggerTransition: () => {},
  navigateTo: (url: string) => {},
  goBack: () => {},
  registerBlocker: (id: string) => {},
  removeBlocker: (id: string) => {},
});

// Helper: Internal Hub tab switching (/hub, /hub/calendar, /hub/store, /hub/orders) should skip splash screen for smooth tab pill animation
const isInternalHubRoute = (currentPath: string, targetUrl: string) => {
  const targetPath = targetUrl.split("?")[0];
  return (
    currentPath.startsWith("/hub") &&
    targetPath.startsWith("/hub") &&
    !currentPath.includes("/intelligence") &&
    !targetPath.includes("/intelligence")
  );
};

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [blockers, setBlockers] = useState<
    Set<string>
  >(new Set(["nav-lock"]));
  const [phase, setPhase] =
    useState<TransitionPhase>("INITIAL");
  const pathname = usePathname();
  const router = useRouter();
  const transitionTimeoutRef =
    useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  const clearPendingTimeout = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(
        transitionTimeoutRef.current,
      );
      transitionTimeoutRef.current = null;
    }
  };

  const registerBlocker = useCallback(
    (id: string) => {
      setBlockers((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [],
  );

  const removeBlocker = useCallback(
    (id: string) => {
      setBlockers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [],
  );

  // STEP 1: TUTUP DULU (550ms) -> STEP 2: GANTI (router.push) -> STAY COVERED UNTIL DATA IS LOADED (blockers.size === 0)
  const startNavigationSequence =
    useCallback(
      (url: string) => {
        const currentPath = window.location.pathname;
        const fullCurrentUrl =
          currentPath +
          window.location.search;
        if (url === fullCurrentUrl) return;

        const targetPath = url.split("?")[0];
        // 1. Skip splash screen if navigating to exact same pathname (e.g. query filter)
        if (targetPath === currentPath) {
          router.push(url);
          return;
        }

        // 2. Skip splash screen for in-app Hub tab switching (/hub, /hub/calendar, /hub/store, /hub/orders)
        if (isInternalHubRoute(currentPath, url)) {
          router.push(url);
          return;
        }

        clearPendingTimeout();
        // Lock navigation immediately BEFORE animation starts so blockers.size is NEVER 0 during transition
        registerBlocker("nav-lock");

        // 1. TUTUP DULU: Animate splash screen hole to r=0 (solid white screen + logo)
        setPhase("CLOSING");

        // 2. GANTI: At 550ms, screen is 100% solid white. NOW swap route in DOM.
        transitionTimeoutRef.current =
          setTimeout(() => {
            setPhase("COVERED");
            router.push(url);
            // Guaranteed release of nav-lock after route swap initiation
            setTimeout(() => {
              removeBlocker("nav-lock");
            }, 180);
          }, 550);
      },
      [
        router,
        registerBlocker,
        removeBlocker,
      ],
    );

  const navigateTo = useCallback(
    (url: string) => {
      startNavigationSequence(url);
    },
    [startNavigationSequence],
  );

  const goBack = useCallback(() => {
    clearPendingTimeout();
    registerBlocker("nav-lock");
    setPhase("CLOSING");
    transitionTimeoutRef.current = setTimeout(() => {
      setPhase("COVERED");
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/market");
      }
      // Guaranteed release of nav-lock after route swap initiation
      setTimeout(() => {
        removeBlocker("nav-lock");
      }, 180);
    }, 550);
  }, [router, registerBlocker, removeBlocker]);

  const triggerTransition =
    useCallback(() => {
      clearPendingTimeout();
      registerBlocker("nav-lock");
      setPhase("CLOSING");
      transitionTimeoutRef.current =
        setTimeout(() => {
          setPhase("COVERED");
          setTimeout(() => {
            removeBlocker("nav-lock");
          }, 180);
        }, 550);
    }, [registerBlocker, removeBlocker]);

  // Initial mount: Release initial nav-lock after mount tick
  useEffect(() => {
    const timer = setTimeout(() => {
      removeBlocker("nav-lock");
    }, 150);
    return () => clearTimeout(timer);
  }, [removeBlocker]);

  // Failsafe Watchdog: under NO circumstances should the screen be stuck in COVERED or CLOSING for > 2.5s
  useEffect(() => {
    if (phase === "CLOSING" || phase === "COVERED") {
      const watchdog = setTimeout(() => {
        setBlockers(new Set());
        setPhase("OPENING");
        setTimeout(() => {
          setPhase("IDLE");
        }, 950);
      }, 2500);
      return () => clearTimeout(watchdog);
    }
  }, [phase]);

  // Browser Back/Forward (popstate):
  // Native browser back is managed by the browser engine (instant bfcache/DOM swap).
  // If a transition was pending or active, gracefully open and clear locks so it NEVER hangs.
  useEffect(() => {
    const handlePopState = () => {
      clearPendingTimeout();
      removeBlocker("nav-lock");
      if (phase === "CLOSING" || phase === "COVERED") {
        setPhase("OPENING");
        setTimeout(() => {
          setPhase("IDLE");
        }, 950);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [phase, removeBlocker]);

  // Release nav-lock when Next.js DOM route swap has completed (pathname changed)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (
      phase === "COVERED" ||
      phase === "CLOSING"
    ) {
      const timer = setTimeout(() => {
        removeBlocker("nav-lock");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, phase, removeBlocker]);

  // Global Click Interceptor: Catch link & navigate clicks BEFORE Next.js page swap
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      // Check for back button triggers first
      const backTarget = (
        e.target as HTMLElement
      ).closest(
        "[data-back], [data-navigate='back'], [data-navigate-back], [data-action='back']",
      );
      if (backTarget) {
        e.preventDefault();
        e.stopPropagation();
        goBack();
        return;
      }

      const target = (
        e.target as HTMLElement
      ).closest(
        "a, [data-navigate], [href]",
      );
      if (!target) return;

      if (
        target.getAttribute("target") ===
        "_blank"
      )
        return;

      const href =
        target.getAttribute("href") ||
        target.getAttribute("data-navigate");
      if (!href) return;

      if (
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:")
      ) {
        const fullCurrentUrl =
          window.location.pathname +
          window.location.search;
        if (href !== fullCurrentUrl) {
          if (isInternalHubRoute(window.location.pathname, href)) {
            return; // Allow Next.js native smooth tab navigation without splash screen interceptor
          }
          e.preventDefault();
          e.stopPropagation();
          startNavigationSequence(href);
        }
      }
    };

    document.addEventListener(
      "click",
      handleClick,
      {
        capture: true,
      },
    );
    return () =>
      document.removeEventListener(
        "click",
        handleClick,
        {
          capture: true,
        },
      );
  }, [startNavigationSequence, goBack]);

  // STEP 3: BARU BUKA -> ONLY OPEN Splash Screen WHEN ALL DATA IS 100% LOADED (blockers.size === 0)
  useEffect(() => {
    if (
      (phase === "INITIAL" ||
        phase === "COVERED") &&
      blockers.size === 0
    ) {
      clearPendingTimeout();
      // 80ms tick allows React DOM to paint the real UI underneath the white splash cover
      transitionTimeoutRef.current =
        setTimeout(() => {
          setPhase("OPENING");
          transitionTimeoutRef.current =
            setTimeout(() => {
              setPhase("IDLE");
            }, 950);
        }, 80);
      return () => clearPendingTimeout();
    }
  }, [phase, blockers.size]);

  const isGlobalReady = phase === "IDLE";
  const isTransitioning = phase !== "IDLE";

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
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () =>
  useContext(LoadingContext);

// Custom hook for pages to signal when they are done fetching data
export const usePageLoading = (
  isLoading: boolean = false,
) => {
  const {
    registerBlocker,
    removeBlocker,
    isTransitioning,
  } = useGlobalLoading();
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname?.startsWith("/hub") &&
      !pathname?.includes("/intelligence") &&
      !isTransitioning
    ) {
      return;
    }

    const id = "page-load";
    if (isLoading) {
      registerBlocker(id);
      return () => {
        removeBlocker(id);
      };
    } else {
      removeBlocker(id);
    }
  }, [
    isLoading,
    pathname,
    isTransitioning,
    registerBlocker,
    removeBlocker,
  ]);
};
