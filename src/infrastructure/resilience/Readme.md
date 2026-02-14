Circuit Breaker:
import { CircuitBreaker } from '@ogza/core';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000 // 1 minute
});

// Use with API calls
async function callExternalAPI() {
  const result = await breaker.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    return response.json();
  });

  if (result.isSuccess) {
    console.log('Data:', result.getValue());
  } else {
    console.log('Circuit breaker prevented call or call failed');
  }
}

---

Rate Limiter:

import { RateLimiter, TokenBucketRateLimiter } from '@ogza/core';

// Sliding window
const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 100 requests per minute
});

// Token bucket
const tokenBucket = new TokenBucketRateLimiter({
  maxRequests: 10,
  windowMs: 1000 // 10 requests per second
});

// Use in middleware
const result = await limiter.tryAcquire(userId);
if (result.getValue().allowed) {
  // Process request
  console.log('Remaining:', result.getValue().remaining);
} else {
  console.log('Rate limited! Retry after:', result.getValue().retryAfter);
}