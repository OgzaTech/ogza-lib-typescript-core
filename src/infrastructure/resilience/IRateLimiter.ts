import { Result } from "../../logic/Result";

/**
 * Rate Limiter Algorithms
 */
export enum RateLimitAlgorithm {
  FixedWindow = 'FIXED_WINDOW',
  SlidingWindow = 'SLIDING_WINDOW',
  TokenBucket = 'TOKEN_BUCKET',
  LeakyBucket = 'LEAKY_BUCKET'
}

/**
 * Rate Limit Options
 */
export interface RateLimitOptions {
  /**
   * Max requests
   */
  maxRequests: number;
  
  /**
   * Window size (ms)
   */
  windowMs: number;
  
  /**
   * Algorithm
   */
  algorithm?: RateLimitAlgorithm;
}

/**
 * Rate Limit Result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

/**
 * Rate Limiter Interface
 */
export interface IRateLimiter {
  /**
   * Check if request is allowed
   */
  tryAcquire(key: string): Promise<Result<RateLimitResult>>;
  
  /**
   * Reset rate limit for key
   */
  reset(key: string): void;
  
  /**
   * Get current stats
   */
  getStats(key: string): RateLimitResult;
}