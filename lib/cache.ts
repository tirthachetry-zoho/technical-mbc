/**
 * Simple in-memory TTL cache for product data.
 *
 * - Each entry has a configurable TTL (time-to-live).
 * - `invalidateProducts()` clears all product-related entries.
 * - Safe for serverless / multi-instance: cache is per-process only.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

// Default TTLs (ms)
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  store.set(key, { data, expiresAt: Date.now() + ttl });
}

/**
 * Get from cache or fetch and cache.
 */
export async function cacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  setCached(key, data, ttl);
  return data;
}

/**
 * Remove all cached entries whose key starts with "product".
 * Call this after any admin create / update / delete.
 */
export function invalidateProducts(): void {
  for (const key of store.keys()) {
    if (key.startsWith("product")) {
      store.delete(key);
    }
  }
}

/**
 * Remove all cached entries whose key starts with "admin:orders".
 */
export function invalidateOrders(): void {
  for (const key of store.keys()) {
    if (key.startsWith("admin:orders")) {
      store.delete(key);
    }
  }
}

/**
 * Remove all cached entries whose key starts with "admin:products".
 */
export function invalidateAdminProducts(): void {
  for (const key of store.keys()) {
    if (key.startsWith("admin:products")) {
      store.delete(key);
    }
  }
}

/**
 * Remove all cached entries.
 */
export function invalidateAll(): void {
  store.clear();
}