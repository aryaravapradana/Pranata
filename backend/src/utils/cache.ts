import NodeCache from "node-cache";

// Standard TTL: 60 seconds.
// Checkperiod: 120 seconds for memory cleanup.
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

export const getCache = <T>(
  key: string,
): T | undefined => {
  return cache.get<T>(key);
};

export const setCache = <T>(
  key: string,
  value: T,
  ttl: number = 60,
): boolean => {
  return cache.set(key, value, ttl);
};

export const delCache = (
  key: string | string[],
) => {
  cache.del(key);
};

export const flushCache = () => {
  cache.flushAll();
};
