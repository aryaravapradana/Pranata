import NodeCache from "node-cache";

// Standard TTL: 60 seconds.
// Checkperiod: 120 seconds for memory cleanup.
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

// Persistent in-memory fallback cache (Stale-While-Revalidate):
// Holds last-known successful data indefinitely so Wi-Fi drops never break reads.
const staleFallbackCache = new Map<string, any>();

export const getCache = <T>(
  key: string,
): T | undefined => {
  return cache.get<T>(key);
};

export const getStaleCache = <T>(
  key: string,
): T | undefined => {
  return (cache.get<T>(key) ?? staleFallbackCache.get(key)) as T | undefined;
};

export const setCache = <T>(
  key: string,
  value: T,
  ttl: number = 60,
): boolean => {
  staleFallbackCache.set(key, value);
  return cache.set(key, value, ttl);
};

export const delCache = (
  key: string | string[],
) => {
  cache.del(key);
  if (Array.isArray(key)) {
    key.forEach((k) => staleFallbackCache.delete(k));
  } else {
    staleFallbackCache.delete(key);
  }
};

export const delCacheByPrefix = (prefix: string) => {
  const allKeys = cache.keys();
  const matched = allKeys.filter((k) => k.startsWith(prefix));
  if (matched.length > 0) {
    cache.del(matched);
  }
  for (const k of staleFallbackCache.keys()) {
    if (k.startsWith(prefix)) {
      staleFallbackCache.delete(k);
    }
  }
};

export const flushCache = () => {
  cache.flushAll();
  staleFallbackCache.clear();
};

export const getCacheStats = () => {
  return {
    ...cache.getStats(),
    staleFallbackSize: staleFallbackCache.size,
  };
};

