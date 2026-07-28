"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [isTransitioning, setIsTransitioning] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [prevPath, setPrevPath] = useState(pathname);

  const triggerTransition = useCallback(() => {
    setIsTransitioning(true);
    setBlockers(new Set());
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

    triggerTransition();
    setTimeout(() => {
      router.push(url);
    }, 650);
  }, [router, triggerTransition]);

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
            triggerTransition();
            setTimeout(() => {
              router.push(href);
            }, 650);
          }
        }
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [router, triggerTransition]);

  // Synchronous route change detection during render tick (0ms - zero blink/flicker)
  if (prevPath !== pathname) {
    const isInternalHub = prevPath?.startsWith('/hub') && 
                          pathname?.startsWith('/hub') && 
                          !pathname?.includes('/intelligence') && 
                          !prevPath?.includes('/intelligence');
    setPrevPath(pathname);
    if (!isInternalHub) {
      setIsTransitioning(true);
      setBlockers(new Set());
    }
  }

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [pathname, isTransitioning]);

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

  const isGlobalReady = !isTransitioning && blockers.size === 0;

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
    } else {
      // Small delay to ensure DOM is painted before splash screen opens
      const timer = setTimeout(() => removeBlocker(id), 100);
      return () => clearTimeout(timer);
    }
    
    // Cleanup on unmount
    return () => removeBlocker(id);
  }, [isLoading, pathname, isTransitioning, registerBlocker, removeBlocker]);
};
