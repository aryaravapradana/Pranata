"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const LoadingContext = createContext({
  isGlobalReady: false,
  isTransitioning: false,
  triggerTransition: () => {},
  navigateTo: (url: string) => {},
  registerBlocker: (id: string) => {},
  removeBlocker: (id: string) => {}
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [blockers, setBlockers] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'IDLE' | 'CLOSING' | 'LOADING_PAGE'>('IDLE');
  const pathname = usePathname();
  const router = useRouter();
  const [prevPath, setPrevPath] = useState(pathname);
  const closingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTransition = useCallback(() => {
    setPhase('CLOSING');
  }, []);

  const navigateTo = useCallback((url: string) => {
    const targetPath = url.split('?')[0].split('#')[0];
    const currentPath = window.location.pathname;
    const isInternalHub = currentPath.startsWith('/hub') && 
                          targetPath.startsWith('/hub') && 
                          !targetPath.includes('/intelligence') && 
                          !currentPath.includes('/intelligence');

    if (targetPath === currentPath || isInternalHub) {
      router.push(url);
      return;
    }

    setPhase('CLOSING');
    if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
    closingTimeoutRef.current = setTimeout(() => {
      setPhase('LOADING_PAGE');
      router.push(url);
    }, 520);
  }, [router]);

  // Global Click Interceptor: Catch link clicks at 0ms BEFORE Next.js fetches RSC payload
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest('a, [data-navigate]');
      if (!target) return;

      if (target.getAttribute('target') === '_blank') return;

      const href = target.getAttribute('href') || target.getAttribute('data-navigate');
      if (!href) return;

      if (href.startsWith('/') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        const targetPath = href.split('?')[0].split('#')[0];
        const currentPath = window.location.pathname;

        if (targetPath !== currentPath) {
          const isInternalHub = currentPath.startsWith('/hub') && 
                                targetPath.startsWith('/hub') && 
                                !targetPath.includes('/intelligence') && 
                                !currentPath.includes('/intelligence');
          if (!isInternalHub) {
            e.preventDefault();
            e.stopPropagation();
            setPhase('CLOSING');
            if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
            closingTimeoutRef.current = setTimeout(() => {
              setPhase('LOADING_PAGE');
              router.push(href);
            }, 520);
          }
        }
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [router]);

  // Listen to browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const isInternalHub = currentPath.startsWith('/hub') && !currentPath.includes('/intelligence');
      if (!isInternalHub) {
        setPhase('CLOSING');
        if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = setTimeout(() => {
          setPhase('LOADING_PAGE');
        }, 520);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronous route change detection during render tick
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    const isInternalHub = prevPath?.startsWith('/hub') && 
                          pathname?.startsWith('/hub') && 
                          !pathname?.includes('/intelligence') && 
                          !prevPath?.includes('/intelligence');
    if (!isInternalHub) {
      if (phase !== 'CLOSING') {
        setPhase('CLOSING');
        if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = setTimeout(() => {
          setPhase('LOADING_PAGE');
        }, 520);
      }
    }
  }

  // Phase transition to IDLE: Only when in LOADING_PAGE and blockers === 0
  useEffect(() => {
    if (phase === 'LOADING_PAGE' && blockers.size === 0) {
      const timer = setTimeout(() => {
        setPhase('IDLE');
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [phase, blockers.size]);

  // Fallback safety timer: If stuck in CLOSING or LOADING_PAGE for > 3.5s, force IDLE
  useEffect(() => {
    if (phase !== 'IDLE') {
      const safetyTimer = setTimeout(() => {
        setPhase('IDLE');
        setBlockers(new Set());
      }, 3500);
      return () => clearTimeout(safetyTimer);
    }
  }, [phase]);

  const registerBlocker = useCallback((id: string) => {
    setBlockers(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const removeBlocker = useCallback((id: string) => {
    setBlockers(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isGlobalReady = phase === 'IDLE';
  const isTransitioning = phase !== 'IDLE';

  return (
    <LoadingContext.Provider value={{ isGlobalReady, isTransitioning, triggerTransition, navigateTo, registerBlocker, removeBlocker }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);

// Custom hook for pages to signal when they are done fetching data
export const usePageLoading = (isLoading: boolean = false) => {
  const { registerBlocker, removeBlocker, isTransitioning } = useGlobalLoading();
  const pathname = usePathname();
  
  useEffect(() => {
    // If inside /hub sub-routes and NOT in an active transition from outside, don't block global splash
    if (pathname?.startsWith('/hub') && !isTransitioning) {
      return;
    }

    const id = 'page-load';
    if (isLoading) {
      registerBlocker(id);
      return () => {
        removeBlocker(id);
      };
    } else {
      removeBlocker(id);
    }
  }, [isLoading, pathname, isTransitioning, registerBlocker, removeBlocker]);
};
