import { Result } from "../../logic/Result";
import { 
  IRateLimiter, 
  RateLimitOptions, 
  RateLimitResult,
  RateLimitAlgorithm 
} from "./IRateLimiter";

/**
 * Simple Sliding Window Rate Limiter
 */
export class RateLimiter implements IRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private options: RateLimitOptions) {}

  async tryAcquire(key: string): Promise<Result<RateLimitResult>> {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove expired timestamps
    const validTimestamps = timestamps.filter(
      ts => now - ts < this.options.windowMs
    );

    // Check limit
    if (validTimestamps.length >= this.options.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const resetTime = new Date(oldestTimestamp + this.options.windowMs);
      const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);

      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter
      };

      return Result.ok(result);
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    const result: RateLimitResult = {
      allowed: true,
      remaining: this.options.maxRequests - validTimestamps.length,
      resetTime: new Date(now + this.options.windowMs)
    };

    return Result.ok(result);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  getStats(key: string): RateLimitResult {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      ts => now - ts < this.options.windowMs
    );

    return {
      allowed: validTimestamps.length < this.options.maxRequests,
      remaining: this.options.maxRequests - validTimestamps.length,
      resetTime: new Date(now + this.options.windowMs)
    };
  }
}

/**
 * Token Bucket Rate Limiter
 */
export class TokenBucketRateLimiter implements IRateLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  constructor(private options: RateLimitOptions) {}

  async tryAcquire(key: string): Promise<Result<RateLimitResult>> {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.options.maxRequests,
        lastRefill: now
      };
      this.buckets.set(key, bucket);
    }

    // Refill tokens
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed / this.options.windowMs) * this.options.maxRequests
    );

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(
        this.options.maxRequests,
        bucket.tokens + tokensToAdd
      );
      bucket.lastRefill = now;
    }

    // Try to consume token
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;

      return Result.ok({
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: new Date(now + this.options.windowMs)
      });
    }

    // No tokens available
    const refillTime = bucket.lastRefill + this.options.windowMs;
    const retryAfter = Math.ceil((refillTime - now) / 1000);

    return Result.ok({
      allowed: false,
      remaining: 0,
      resetTime: new Date(refillTime),
      retryAfter
    });
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  getStats(key: string): RateLimitResult {
    const bucket = this.buckets.get(key);
    const now = Date.now();

    if (!bucket) {
      return {
        allowed: true,
        remaining: this.options.maxRequests,
        resetTime: new Date(now + this.options.windowMs)
      };
    }

    return {
      allowed: bucket.tokens >= 1,
      remaining: Math.floor(bucket.tokens),
      resetTime: new Date(bucket.lastRefill + this.options.windowMs)
    };
  }
}