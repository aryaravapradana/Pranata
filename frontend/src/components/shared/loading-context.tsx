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
  registerBlocker: (id: string) => {},
  removeBlocker: (id: string) => {},
});

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

        // Skip splash screen for in-app tab switching within /hub/* or /market/*
        const isBothHub = currentPath.startsWith("/hub") && url.startsWith("/hub");
        const isBothMarket = currentPath.startsWith("/market") && url.startsWith("/market");

        if (isBothHub || isBothMarket) {
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
          }, 550);
      },
      [
        router,
        registerBlocker,
      ],
    );

  const navigateTo = useCallback(
    (url: string) => {
      startNavigationSequence(url);
    },
    [startNavigationSequence],
  );

  const triggerTransition =
    useCallback(() => {
      clearPendingTimeout();
      registerBlocker("nav-lock");
      setPhase("CLOSING");
      transitionTimeoutRef.current =
        setTimeout(() => {
          setPhase("COVERED");
        }, 550);
    }, [registerBlocker]);

  // Initial mount: Release initial nav-lock after mount tick
  useEffect(() => {
    const timer = setTimeout(() => {
      removeBlocker("nav-lock");
    }, 150);
    return () => clearTimeout(timer);
  }, [removeBlocker]);

  // Release nav-lock ONLY AFTER Next.js DOM route swap has actually completed (pathname changed)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (
      phase === "COVERED" ||
      phase === "CLOSING"
    ) {
      // 120ms tick allows new route component to mount and invoke usePageLoading(true) before nav-lock is released
      const timer = setTimeout(() => {
        removeBlocker("nav-lock");
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [pathname, removeBlocker]);

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
  }, [startNavigationSequence]);

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
  }, [
    isLoading,
    isTransitioning,
    registerBlocker,
    removeBlocker,
  ]);
};
