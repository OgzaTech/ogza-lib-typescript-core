import { Result } from "../../logic/Result";

/**
 * Circuit Breaker Pattern
 * Hatalı servisleri otomatik kapat/aç
 */

/**
 * Circuit State
 */
export enum CircuitState {
  Closed = 'CLOSED',      // Normal çalışma
  Open = 'OPEN',          // Devre açık (istekler bloke)
  HalfOpen = 'HALF_OPEN'  // Test aşaması
}

/**
 * Circuit Breaker Options
 */
export interface CircuitBreakerOptions {
  /**
   * Failure threshold (kaç hata sonra aç)
   */
  failureThreshold: number;
  
  /**
   * Success threshold (half-open'da kaç başarı sonra kapat)
   */
  successThreshold: number;
  
  /**
   * Timeout (ms) - devre açıldıktan sonra ne kadar bekle
   */
  timeout: number;
  
  /**
   * Rolling window (ms) - hataları say
   */
  rollingWindow?: number;
}

/**
 * Circuit Breaker Stats
 */
export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

/**
 * Circuit Breaker Interface
 */
export interface ICircuitBreaker {
  /**
   * Execute function with circuit breaker
   */
  execute<T>(fn: () => Promise<T>): Promise<Result<T>>;
  
  /**
   * Get current state
   */
  getState(): CircuitState;
  
  /**
   * Get stats
   */
  getStats(): CircuitBreakerStats;
  
  /**
   * Reset circuit breaker
   */
  reset(): void;
}