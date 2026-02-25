export abstract class CacheService {
  abstract getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T>;

  abstract get<T>(key: string): Promise<T | undefined>;
  abstract set(key: string, value: unknown, ttlMs?: number): Promise<void>;
}