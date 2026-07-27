"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const LoadingContext = createContext({
  isGlobalReady: false,
  registerBlocker: (id: string) => {},
  removeBlocker: (id: string) => {}
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [blockers, setBlockers] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(true);
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);

  // Synchronous route change detection during render tick (0ms - zero blink/flicker)
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsTransitioning(true);
    setBlockers(new Set());
  }

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 750);
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
    <LoadingContext.Provider value={{ isGlobalReady, registerBlocker, removeBlocker }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);

// Custom hook for pages to signal when they are done fetching data
export const usePageLoading = (isLoading: boolean = false) => {
  const { registerBlocker, removeBlocker } = useGlobalLoading();
  const pathname = usePathname();
  
  useEffect(() => {
    // Sub-route navigation inside /hub should NOT trigger or block global splash screen
    if (pathname?.startsWith('/hub')) {
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
  }, [isLoading, pathname, registerBlocker, removeBlocker]);
};
