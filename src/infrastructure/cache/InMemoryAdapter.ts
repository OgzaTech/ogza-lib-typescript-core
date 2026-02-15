import { Result } from "../../logic/Result";
import { ICache, CacheEntry, CacheStats } from "./ICache";

/**
 * In-Memory Cache Adapter
 * Test ve development için
 */
export class InMemoryAdapter implements ICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private prefix: string;
  private defaultTTL: number;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(prefix: string = 'cache:', defaultTTL: number = 3600) {
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;

    // Auto cleanup expired entries every 60 seconds
    setInterval(() => this.cleanup(), 60000);
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.expiresAt) return false;
    return new Date() > entry.expiresAt;
  }

  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<Result<T | null>> {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) {
        this.missCount++;
        return Result.ok(null);
      }

      if (this.isExpired(entry)) {
        this.cache.delete(fullKey);
        this.missCount++;
        return Result.ok(null);
      }

      this.hitCount++;
      return Result.ok(entry.value as T);
    } catch (error) {
      return Result.fail(`Cache get failed: ${error}`);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<Result<void>> {
    try {
      const fullKey = this.getKey(key);
      const expiry = ttl || this.defaultTTL;

      const entry: CacheEntry<T> = {
        value,
        createdAt: new Date(),
        expiresAt: expiry > 0 ? new Date(Date.now() + expiry * 1000) : undefined
      };

      this.cache.set(fullKey, entry);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache set failed: ${error}`);
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      const fullKey = this.getKey(key);
      this.cache.delete(fullKey);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache delete failed: ${error}`);
    }
  }

  async has(key: string): Promise<Result<boolean>> {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) return Result.ok(false);
      if (this.isExpired(entry)) {
        this.cache.delete(fullKey);
        return Result.ok(false);
      }

      return Result.ok(true);
    } catch (error) {
      return Result.fail(`Cache has failed: ${error}`);
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      // Clear only keys with prefix
      for (const key of this.cache.keys()) {
        if (key.startsWith(this.prefix)) {
          this.cache.delete(key);
        }
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache clear failed: ${error}`);
    }
  }

  async mget<T>(keys: string[]): Promise<Result<(T | null)[]>> {
    try {
      const results = await Promise.all(
        keys.map(key => this.get<T>(key))
      );

      const values = results.map(r => r.isSuccess ? r.getValue() : null);
      return Result.ok(values);
    } catch (error) {
      return Result.fail(`Cache mget failed: ${error}`);
    }
  }

  async mset<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>> {
    try {
      await Promise.all(
        Object.entries(entries).map(([key, value]) => 
          this.set(key, value, ttl)
        )
      );
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache mset failed: ${error}`);
    }
  }

  async increment(key: string, amount: number = 1): Promise<Result<number>> {
    try {
      const current = await this.get<number>(key);
      const value = (current.getValue() || 0) + amount;
      await this.set(key, value);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache increment failed: ${error}`);
    }
  }

  async decrement(key: string, amount: number = 1): Promise<Result<number>> {
    try {
      const current = await this.get<number>(key);
      const value = (current.getValue() || 0) - amount;
      await this.set(key, value);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache decrement failed: ${error}`);
    }
  }

  async ttl(key: string): Promise<Result<number>> {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry || !entry.expiresAt) {
        return Result.ok(-1);
      }

      const remaining = Math.floor((entry.expiresAt.getTime() - Date.now()) / 1000);
      return Result.ok(remaining > 0 ? remaining : -2);
    } catch (error) {
      return Result.fail(`Cache ttl failed: ${error}`);
    }
  }

  async expire(key: string, seconds: number): Promise<Result<boolean>> {
    try {
      const fullKey = this.getKey(key);
      const entry = this.cache.get(fullKey);

      if (!entry) return Result.ok(false);

      entry.expiresAt = new Date(Date.now() + seconds * 1000);
      return Result.ok(true);
    } catch (error) {
      return Result.fail(`Cache expire failed: ${error}`);
    }
  }

  async keys(pattern: string): Promise<Result<string[]>> {
    try {
      const regex = new RegExp(pattern.replace('*', '.*'));
      const matchingKeys: string[] = [];

      for (const key of this.cache.keys()) {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.substring(this.prefix.length);
          if (regex.test(cleanKey)) {
            matchingKeys.push(cleanKey);
          }
        }
      }

      return Result.ok(matchingKeys);
    } catch (error) {
      return Result.fail(`Cache keys failed: ${error}`);
    }
  }

  async stats(): Promise<Result<CacheStats>> {
    try {
      let totalSize = 0;
      for (const entry of this.cache.values()) {
        totalSize += JSON.stringify(entry).length;
      }

      const stats: CacheStats = {
        hits: this.hitCount,
        misses: this.missCount,
        keys: this.cache.size,
        memory: `${(totalSize / 1024).toFixed(2)} KB`
      };

      return Result.ok(stats);
    } catch (error) {
      return Result.fail(`Cache stats failed: ${error}`);
    }
  }

  async disconnect(): Promise<Result<void>> {
    this.cache.clear();
    return Result.ok();
  }

  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }

  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}