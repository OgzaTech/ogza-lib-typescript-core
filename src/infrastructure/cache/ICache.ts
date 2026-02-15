import { Result } from "../../logic/Result";

/**
 * Cache Interface
 * Redis, Memcached, In-Memory için generic interface
 */

/**
 * Cache Entry with metadata
 */
export interface CacheEntry<T> {
  value: T;
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Cache Options
 */
export interface CacheOptions {
  /**
   * TTL in seconds
   */
  ttl?: number;
  
  /**
   * Namespace/Prefix for keys
   */
  prefix?: string;
  
  /**
   * Serialize to JSON
   */
  serialize?: boolean;
}

/**
 * Cache Statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory?: string;
}

/**
 * Cache Interface
 */
export interface ICache {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<Result<T | null>>;
  
  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;
  
  /**
   * Delete key from cache
   */
  delete(key: string): Promise<Result<void>>;
  
  /**
   * Check if key exists
   */
  has(key: string): Promise<Result<boolean>>;
  
  /**
   * Clear all cache
   */
  clear(): Promise<Result<void>>;
  
  /**
   * Get multiple keys
   */
  mget<T>(keys: string[]): Promise<Result<(T | null)[]>>;
  
  /**
   * Set multiple keys
   */
  mset<T>(entries: Record<string, T>, ttl?: number): Promise<Result<void>>;
  
  /**
   * Increment value
   */
  increment(key: string, amount?: number): Promise<Result<number>>;
  
  /**
   * Decrement value
   */
  decrement(key: string, amount?: number): Promise<Result<number>>;
  
  /**
   * Get TTL for key
   */
  ttl(key: string): Promise<Result<number>>;
  
  /**
   * Set expiration for key
   */
  expire(key: string, seconds: number): Promise<Result<boolean>>;
  
  /**
   * Get all keys matching pattern
   */
  keys(pattern: string): Promise<Result<string[]>>;
  
  /**
   * Get cache statistics
   */
  stats(): Promise<Result<CacheStats>>;
  
  /**
   * Disconnect/Close
   */
  disconnect(): Promise<Result<void>>;
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
  /**
   * Default TTL in seconds
   */
  defaultTTL?: number;
  
  /**
   * Key prefix
   */
  prefix?: string;
  
  /**
   * Enable compression
   */
  compress?: boolean;
  
  /**
   * Max memory (MB)
   */
  maxMemory?: number;
}