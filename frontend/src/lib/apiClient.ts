import Cookies from "js-cookie";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location?.hostname
  ) {
    return `http://${window.location.hostname}:4000`;
  }
  return "http://localhost:4000";
}

// Micro-cache for idempotent GET requests
interface CacheEntry {
  response: Response;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15_000; // 15s micro-cache for fast navigation and instant re-renders

// In-flight deduplication map to prevent redundant concurrent network calls
const inFlightRequests = new Map<string, Promise<Response>>();

export const clearApiCache = (urlPrefix?: string): void => {
  if (!urlPrefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(urlPrefix)) {
      apiCache.delete(key);
    }
  }
};

export const fetchApi = async (
  url: string,
  options: RequestInit = {},
  retries: number = 2,
): Promise<Response> => {
  const method = (options.method || "GET").toUpperCase();
  const token = Cookies.get("auth-token");
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Clean any accidental double slashes (e.g. https://domain.com//api -> https://domain.com/api)
  const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");

  // Invalidate cache on mutations (POST, PUT, PATCH, DELETE) to guarantee data freshness
  if (method !== "GET" && method !== "HEAD") {
    clearApiCache();
  }

  const cacheKey = `${method}:${cleanUrl}:${token || "anon"}`;
  const isCacheable = method === "GET" && options.cache !== "no-store";

  // Check micro-cache
  if (isCacheable) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.response.clone();
    }
  }

  // In-flight deduplication for concurrent identical GET requests
  if (isCacheable && inFlightRequests.has(cacheKey)) {
    const pending = inFlightRequests.get(cacheKey)!;
    const res = await pending;
    return res.clone();
  }

  // Create an internal timeout controller if caller didn't provide their own signal
  let timeoutId: any;
  let signal = options.signal;
  if (!signal && typeof AbortController !== "undefined") {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds safe timeout
    signal = controller.signal;
  }

  const executeFetch = async (): Promise<Response> => {
    try {
      const res = await fetch(cleanUrl, {
        ...options,
        headers,
        signal,
      });
      if (timeoutId) clearTimeout(timeoutId);

      // Auto-retry on transient 502/503/504 gateway hiccups on flaky connections
      if (
        (res.status === 502 || res.status === 503 || res.status === 504) &&
        retries > 0 &&
        method === "GET"
      ) {
        await new Promise((r) => setTimeout(r, 350));
        return fetchApi(url, options, retries - 1);
      }

      // Store in micro-cache if successful GET
      if (isCacheable && res.ok) {
        apiCache.set(cacheKey, {
          response: res.clone(),
          timestamp: Date.now(),
        });
      }

      return res;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      // Auto-retry once on transient network errors (e.g. Wi-Fi glitch or packet drop)
      const isNetworkError =
        error?.name === "TypeError" ||
        error?.name === "AbortError" ||
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("network");

      if (isNetworkError && retries > 0) {
        await new Promise((r) => setTimeout(r, 400));
        return fetchApi(url, options, retries - 1);
      }
      throw error;
    } finally {
      if (isCacheable) {
        inFlightRequests.delete(cacheKey);
      }
    }
  };

  if (isCacheable) {
    const promise = executeFetch();
    inFlightRequests.set(cacheKey, promise);
    const res = await promise;
    return res.clone();
  }

  return executeFetch();
};
