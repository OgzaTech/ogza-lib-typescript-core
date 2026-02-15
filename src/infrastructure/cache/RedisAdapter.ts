import { Result } from "../../logic/Result";
import { ICache, CacheStats } from "./ICache";

/**
 * Redis Configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  prefix?: string;
  defaultTTL?: number;
  connectTimeout?: number;
  maxRetriesPerRequest?: number;
}

/**
 * Redis Adapter
 * 
 * IMPORTANT: Requires 'ioredis' package
 * Install: npm install ioredis @types/ioredis
 * 
 * This is an interface adapter - actual Redis client must be injected
 */
export class RedisAdapter implements ICache {
  private client: any; // Redis client (ioredis)
  private prefix: string;
  private defaultTTL: number;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(client: any, config?: Partial<RedisConfig>) {
    this.client = client;
    this.prefix = config?.prefix || 'cache:';
    this.defaultTTL = config?.defaultTTL || 3600; // 1 hour default
  }

  /**
   * Get full key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Serialize value to string
   */
  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  /**
   * Deserialize string to value
   */
  private deserialize<T>(value: string): T {
    return JSON.parse(value);
  }

  async get<T>(key: string): Promise<Result<T | null>> {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.get(fullKey);

      if (value === null) {
        this.missCount++;
        return Result.ok(null);
      }

      this.hitCount++;
      const deserialized = this.deserialize<T>(value);
      return Result.ok(deserialized);
    } catch (error) {
      return Result.fail(`Cache get failed: ${error}`);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<Result<void>> {
    try {
      const fullKey = this.getKey(key);
      const serialized = this.serialize(value);
      const expiry = ttl || this.defaultTTL;

      if (expiry > 0) {
        await this.client.setex(fullKey, expiry, serialized);
      } else {
        await this.client.set(fullKey, serialized);
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache set failed: ${error}`);
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      const fullKey = this.getKey(key);
      await this.client.del(fullKey);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache delete failed: ${error}`);
    }
  }

  async has(key: string): Promise<Result<boolean>> {
    try {
      const fullKey = this.getKey(key);
      const exists = await this.client.exists(fullKey);
      return Result.ok(exists === 1);
    } catch (error) {
      return Result.fail(`Cache has failed: ${error}`);
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      const pattern = `${this.prefix}*`;
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(...keys);
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache clear failed: ${error}`);
    }
  }

  async mget<T>(keys: string[]): Promise<Result<(T | null)[]>> {
    try {
      const fullKeys = keys.map(k => this.getKey(k));
      const values = await this.client.mget(...fullKeys);

      const results = values.map((value: string | null) => {
        if (value === null) {
          this.missCount++;
          return null;
        }
        this.hitCount++;
        return this.deserialize<T>(value);
      });

      return Result.ok(results);
    } catch (error) {
      return Result.fail(`Cache mget failed: ${error}`);
    }
  }

  async mset<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>> {
    try {
      const pipeline = this.client.pipeline();
      const expiry = ttl || this.defaultTTL;

      for (const [key, value] of Object.entries(entries)) {
        const fullKey = this.getKey(key);
        const serialized = this.serialize(value);

        if (expiry > 0) {
          pipeline.setex(fullKey, expiry, serialized);
        } else {
          pipeline.set(fullKey, serialized);
        }
      }

      await pipeline.exec();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache mset failed: ${error}`);
    }
  }

  async increment(key: string, amount: number = 1): Promise<Result<number>> {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.incrby(fullKey, amount);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache increment failed: ${error}`);
    }
  }

  async decrement(key: string, amount: number = 1): Promise<Result<number>> {
    try {
      const fullKey = this.getKey(key);
      const value = await this.client.decrby(fullKey, amount);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(`Cache decrement failed: ${error}`);
    }
  }

  async ttl(key: string): Promise<Result<number>> {
    try {
      const fullKey = this.getKey(key);
      const seconds = await this.client.ttl(fullKey);
      return Result.ok(seconds);
    } catch (error) {
      return Result.fail(`Cache ttl failed: ${error}`);
    }
  }

  async expire(key: string, seconds: number): Promise<Result<boolean>> {
    try {
      const fullKey = this.getKey(key);
      const result = await this.client.expire(fullKey, seconds);
      return Result.ok(result === 1);
    } catch (error) {
      return Result.fail(`Cache expire failed: ${error}`);
    }
  }

  async keys(pattern: string): Promise<Result<string[]>> {
    try {
      const fullPattern = this.getKey(pattern);
      const keys = await this.client.keys(fullPattern);
      
      // Remove prefix from keys
      const cleanKeys = keys.map((k: string) => 
        k.startsWith(this.prefix) ? k.substring(this.prefix.length) : k
      );

      return Result.ok(cleanKeys);
    } catch (error) {
      return Result.fail(`Cache keys failed: ${error}`);
    }
  }

  async stats(): Promise<Result<CacheStats>> {
    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbsize();

      // Parse memory info
      let memory = 'N/A';
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      if (memoryMatch) {
        memory = memoryMatch[1];
      }

      const stats: CacheStats = {
        hits: this.hitCount,
        misses: this.missCount,
        keys: dbSize,
        memory
      };

      return Result.ok(stats);
    } catch (error) {
      return Result.fail(`Cache stats failed: ${error}`);
    }
  }

  async disconnect(): Promise<Result<void>> {
    try {
      await this.client.quit();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Cache disconnect failed: ${error}`);
    }
  }

  /**
   * Get hit rate
   */
  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}