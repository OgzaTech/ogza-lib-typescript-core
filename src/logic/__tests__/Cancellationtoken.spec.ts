import { CancellationToken } from '../../logic/CancellationToken';

describe('CancellationToken', () => {

  describe('CancellationToken.None', () => {
    it('should never be cancelled', () => {
      const token = CancellationToken.None;
      expect(token.isCancellationRequested).toBe(false);
    });

    it('should not throw when checked', () => {
      const token = CancellationToken.None;
      expect(() => token.throwIfCancellationRequested()).not.toThrow();
    });
  });

  describe('fromAbortSignal', () => {
    it('should not be cancelled initially', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      expect(token.isCancellationRequested).toBe(false);
    });

    it('should be cancelled after abort', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      controller.abort();
      
      expect(token.isCancellationRequested).toBe(true);
    });

    it('should throw after cancellation', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      controller.abort();
      
      expect(() => token.throwIfCancellationRequested()).toThrow('OperationCanceled');
    });

    it('should not throw before cancellation', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      expect(() => token.throwIfCancellationRequested()).not.toThrow();
    });
  });

  describe('Use in async operations', () => {
    it('should allow cancellation of long-running operation', async () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);

      const longRunningTask = async () => {
        for (let i = 0; i < 100; i++) {
          token.throwIfCancellationRequested();
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        return 'completed';
      };

      // Start task
      const taskPromise = longRunningTask();
      
      // Cancel after 50ms
      setTimeout(() => controller.abort(), 50);

      // Should throw OperationCanceled
      await expect(taskPromise).rejects.toThrow('OperationCanceled');
    });

    it('should complete if not cancelled', async () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);

      const quickTask = async () => {
        for (let i = 0; i < 5; i++) {
          token.throwIfCancellationRequested();
        }
        return 'completed';
      };

      const result = await quickTask();
      expect(result).toBe('completed');
    });
  });

  describe('Integration with fetch/axios patterns', () => {
    it('should have signal property for native APIs', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      // Token should expose the underlying signal (artık public getter var)
      expect(token.signal).toBeDefined();
      expect(token.signal).toBe(controller.signal);
    });

    it('should work with AbortController pattern', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      // Simulate cancellation
      controller.abort();
      
      // Native signal should also be aborted
      expect(controller.signal.aborted).toBe(true);
      expect(token.isCancellationRequested).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle token without signal', () => {
      const token = new CancellationToken();
      expect(token.isCancellationRequested).toBe(false);
      expect(() => token.throwIfCancellationRequested()).not.toThrow();
    });

    it('should be immutable after cancellation', () => {
      const controller = new AbortController();
      const token = CancellationToken.fromAbortSignal(controller.signal);
      
      controller.abort();
      expect(token.isCancellationRequested).toBe(true);
      
      // Should stay cancelled
      expect(token.isCancellationRequested).toBe(true);
    });
  });
});