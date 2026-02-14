import { CircuitBreaker } from '../CircuitBreaker';
import { CircuitState } from '../ICircuitBreaker';

describe('CircuitBreaker', () => {
  
  describe('Initial State', () => {
    it('should start in CLOSED state', () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      expect(breaker.getState()).toBe(CircuitState.Closed);
    });

    it('should have zero failures initially', () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      const stats = breaker.getStats();
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
    });
  });

  describe('Success Flow', () => {
    it('should execute successful function', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      const mockFn = jest.fn(async () => 'success');

      const result = await breaker.execute(mockFn);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset failure count after success', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      // Fail twice
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      expect(breaker.getStats().failures).toBe(2);

      // Succeed
      await breaker.execute(async () => 'success');

      expect(breaker.getStats().failures).toBe(0);
    });
  });

  describe('Failure Flow', () => {
    it('should count failures', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      const failFn = jest.fn(async () => { throw new Error('fail'); });

      await breaker.execute(failFn);
      expect(breaker.getStats().failures).toBe(1);

      await breaker.execute(failFn);
      expect(breaker.getStats().failures).toBe(2);
    });

    it('should return failure result when function throws', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      const result = await breaker.execute(async () => {
        throw new Error('test error');
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('test error');
    });
  });

  describe('Circuit Opening', () => {
    it('should open circuit after reaching failure threshold', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      const failFn = async () => { throw new Error('fail'); };

      // Fail 3 times
      await breaker.execute(failFn);
      await breaker.execute(failFn);
      await breaker.execute(failFn);

      expect(breaker.getState()).toBe(CircuitState.Open);
    });

    it('should block requests when circuit is open', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 1000
      });

      const mockFn = jest.fn(async () => 'success');

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      expect(breaker.getState()).toBe(CircuitState.Open);

      // Try to execute - should be blocked
      const result = await breaker.execute(mockFn);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Circuit breaker is OPEN');
      expect(mockFn).not.toHaveBeenCalled(); // Function not executed
    });

    it('should set next attempt time when opening', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 1000
      });

      const beforeTime = Date.now();

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      const stats = breaker.getStats();
      const afterTime = Date.now();

      expect(stats.nextAttemptTime).toBeDefined();
      expect(stats.nextAttemptTime!.getTime()).toBeGreaterThanOrEqual(beforeTime + 1000);
      expect(stats.nextAttemptTime!.getTime()).toBeLessThanOrEqual(afterTime + 1000 + 50);
    });
  });

  describe('Half-Open State', () => {
    it('should transition to half-open after timeout', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 100 // Short timeout for testing
      });

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      expect(breaker.getState()).toBe(CircuitState.Open);

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Next attempt should trigger half-open
      await breaker.execute(async () => 'test');

      expect(breaker.getState()).toBe(CircuitState.HalfOpen);
    });

    it('should count successes in half-open state', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 100
      });

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      // Wait and transition to half-open
      await new Promise(resolve => setTimeout(resolve, 150));
      await breaker.execute(async () => 'success');

      expect(breaker.getState()).toBe(CircuitState.HalfOpen);
      expect(breaker.getStats().successes).toBe(1);
    });

    it('should close circuit after success threshold in half-open', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 100
      });

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      // Wait and succeed twice
      await new Promise(resolve => setTimeout(resolve, 150));
      await breaker.execute(async () => 'success1');
      await breaker.execute(async () => 'success2');

      expect(breaker.getState()).toBe(CircuitState.Closed);
    });

    it('should immediately reopen on failure in half-open', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 100
      });

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      // Wait and transition to half-open
      await new Promise(resolve => setTimeout(resolve, 150));
      await breaker.execute(async () => 'success');

      expect(breaker.getState()).toBe(CircuitState.HalfOpen);

      // Fail in half-open
      await breaker.execute(async () => { throw new Error('fail again'); });

      expect(breaker.getState()).toBe(CircuitState.Open);
    });
  });

  describe('Reset', () => {
    it('should reset circuit breaker to initial state', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 2,
        timeout: 1000
      });

      // Open circuit
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      expect(breaker.getState()).toBe(CircuitState.Open);

      // Reset
      breaker.reset();

      expect(breaker.getState()).toBe(CircuitState.Closed);
      expect(breaker.getStats().failures).toBe(0);
      expect(breaker.getStats().successes).toBe(0);
    });
  });

  describe('Stats', () => {
    it('should provide accurate stats', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 1000
      });

      await breaker.execute(async () => 'success');
      await breaker.execute(async () => { throw new Error('fail'); });

      const stats = breaker.getStats();

      expect(stats.state).toBe(CircuitState.Closed);
      expect(stats.failures).toBe(1);
      expect(stats.successes).toBe(0); // Reset after success
      expect(stats.lastFailureTime).toBeInstanceOf(Date);
    });
  });

  describe('Integration Scenarios', () => {
    it('should protect external API calls', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 500
      });

      const flakyAPI = jest.fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValue({ data: 'success' });

      // First 3 calls fail - circuit opens
      await breaker.execute(flakyAPI);
      await breaker.execute(flakyAPI);
      await breaker.execute(flakyAPI);

      expect(breaker.getState()).toBe(CircuitState.Open);

      // Next call blocked
      const blockedResult = await breaker.execute(flakyAPI);
      expect(blockedResult.isFailure).toBe(true);
      expect(flakyAPI).toHaveBeenCalledTimes(3); // Still 3, not 4

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 600));

      // Retry - should succeed
      const retryResult = await breaker.execute(flakyAPI);
      expect(retryResult.isSuccess).toBe(true);
    });

    it('should handle mixed success/failure patterns', async () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 100
      });

      // Pattern: S, F, S, F, F, F (should open)
      await breaker.execute(async () => 'success');
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => 'success');
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });
      await breaker.execute(async () => { throw new Error('fail'); });

      expect(breaker.getState()).toBe(CircuitState.Open);
    });
  });
});