"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type LoadingContextValue = {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
  startNavigation: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

const LOADING_TIMEOUT_MS = 15_000;

function LoadingProviderInner({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadingCount, setLoadingCount] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [message, setMessage] = useState("Cargando…");
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNavTimeout = useCallback(() => {
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
  }, []);

  const startLoading = useCallback((nextMessage = "Cargando…") => {
    setMessage(nextMessage);
    setLoadingCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((count) => Math.max(0, count - 1));
  }, []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>, nextMessage = "Cargando…"): Promise<T> => {
      startLoading(nextMessage);
      try {
        return await fn();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  const startNavigation = useCallback(() => {
    clearNavTimeout();
    setIsNavigating(true);
    navTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, LOADING_TIMEOUT_MS);
  }, [clearNavTimeout]);

  useEffect(() => {
    setIsNavigating(false);
    clearNavTimeout();
  }, [pathname, searchParams, clearNavTimeout]);

  useEffect(() => clearNavTimeout, [clearNavTimeout]);

  const showOverlay = loadingCount > 0 || isNavigating;

  return (
    <LoadingContext.Provider
      value={{ startLoading, stopLoading, withLoading, startNavigation }}
    >
      {children}
      {showOverlay && <LoadingOverlay message={message} />}
    </LoadingContext.Provider>
  );
}

export function LoadingProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <LoadingProviderInner>{children}</LoadingProviderInner>
    </Suspense>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}

/** @deprecated Use useLoading().startNavigation instead */
export function useNavigationLoading() {
  const { startNavigation } = useLoading();
  return { startNavigation, isNavigating: false };
}
