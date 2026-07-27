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

  // On route change, clear blockers and enter a brief transition state
  // to give the new page's useEffect time to register its blockers.
  useEffect(() => {
     
    setBlockers(new Set());
     
    setIsTransitioning(true);
    
    // Give the new page 50ms to register blockers before we declare it "Ready"
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);

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
