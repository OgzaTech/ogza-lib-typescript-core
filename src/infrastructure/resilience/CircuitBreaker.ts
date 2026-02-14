import { Result } from "../../logic/Result";
import { 
  ICircuitBreaker, 
  CircuitState, 
  CircuitBreakerOptions,
  CircuitBreakerStats 
} from "./ICircuitBreaker";

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker implements ICircuitBreaker {
  private state: CircuitState = CircuitState.Closed;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<Result<T>> {
    // Check if circuit is open
    if (this.state === CircuitState.Open) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HalfOpen;
        this.successes = 0;
      } else {
        return Result.fail('Circuit breaker is OPEN');
      }
    }

    try {
      // Execute function
      const result = await fn();
      
      // Success
      this.onSuccess();
      return Result.ok(result);
    } catch (error) {
      // Failure
      this.onFailure();
      return Result.fail(`Circuit breaker execution failed: ${error}`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  reset(): void {
    this.state = CircuitState.Closed;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HalfOpen) {
      this.successes++;
      
      if (this.successes >= this.options.successThreshold) {
        // Close circuit
        this.state = CircuitState.Closed;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HalfOpen) {
      // Immediately open
      this.openCircuit();
    } else if (this.failures >= this.options.failureThreshold) {
      // Open circuit
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = CircuitState.Open;
    this.nextAttemptTime = new Date(Date.now() + this.options.timeout);
  }

  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime.getTime();
  }
}