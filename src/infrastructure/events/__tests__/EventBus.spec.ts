import { EventBus } from '../EventBus';
import { IEvent } from '../IEventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.offAll();
  });

  describe('Basic Event Subscription', () => {
    it('should subscribe to event and receive notification', async () => {
      const mockHandler = jest.fn();
      
      eventBus.on('test-event', mockHandler);
      
      await eventBus.emit('test-event', { message: 'Hello' });
      
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-event',
          data: { message: 'Hello' }
        })
      );
    });

    it('should call multiple subscribers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      eventBus.on('multi-event', handler1);
      eventBus.on('multi-event', handler2);
      eventBus.on('multi-event', handler3);

      await eventBus.emit('multi-event', { value: 42 });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should not call handler for different event', async () => {
      const mockHandler = jest.fn();
      
      eventBus.on('event-a', mockHandler);
      
      await eventBus.emit('event-b', {});
      
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Once Subscription', () => {
    it('should call once handler only one time', async () => {
      const mockHandler = jest.fn();
      
      eventBus.once('once-event', mockHandler);
      
      await eventBus.emit('once-event', { count: 1 });
      await eventBus.emit('once-event', { count: 2 });
      await eventBus.emit('once-event', { count: 3 });
      
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { count: 1 }
        })
      );
    });

    it('should auto-unsubscribe after first emission', async () => {
      const mockHandler = jest.fn();
      
      eventBus.once('cleanup-event', mockHandler);
      
      expect(eventBus.listenerCount('cleanup-event')).toBe(1);
      
      await eventBus.emit('cleanup-event', {});
      
      expect(eventBus.listenerCount('cleanup-event')).toBe(0);
    });
  });

  describe('Unsubscribe', () => {
    it('should unsubscribe specific handler', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('test', handler1);
      eventBus.on('test', handler2);

      eventBus.off('test', handler1);

      await eventBus.emit('test', {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe via subscription object', async () => {
      const mockHandler = jest.fn();
      
      const subscription = eventBus.on('sub-test', mockHandler);
      
      subscription.unsubscribe();
      
      await eventBus.emit('sub-test', {});
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should unsubscribe all listeners for event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('clear-event', handler1);
      eventBus.on('clear-event', handler2);

      eventBus.offAll('clear-event');

      await eventBus.emit('clear-event', {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should clear all events when no event name provided', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('event-1', handler1);
      eventBus.on('event-2', handler2);

      eventBus.offAll();

      await eventBus.emit('event-1', {});
      await eventBus.emit('event-2', {});

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Async Handlers', () => {
    it('should handle async event handlers', async () => {
      const mockHandler = jest.fn(async (event: IEvent) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return event.data;
      });

      eventBus.on('async-event', mockHandler);

      const result = await eventBus.emit('async-event', { value: 100 });

      expect(result.isSuccess).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should wait for all async handlers to complete', async () => {
      const order: number[] = [];

      const handler1 = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
        order.push(1);
      });

      const handler2 = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        order.push(2);
      });

      const handler3 = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
        order.push(3);
      });

      eventBus.on('parallel-event', handler1);
      eventBus.on('parallel-event', handler2);
      eventBus.on('parallel-event', handler3);

      await eventBus.emit('parallel-event', {});

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
      
    });
  });

  describe('Sync Emission', () => {
    it('should emit event synchronously', () => {
      const mockHandler = jest.fn();
      
      eventBus.on('sync-event', mockHandler);
      
      const result = eventBus.emitSync('sync-event', { sync: true });
      
      expect(result.isSuccess).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should not wait for async handlers in sync mode', () => {
      let asyncCompleted = false;

      const asyncHandler = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        asyncCompleted = true;
      });

      eventBus.on('sync-async', asyncHandler);

      eventBus.emitSync('sync-async', {});

      expect(asyncHandler).toHaveBeenCalled();
      expect(asyncCompleted).toBe(false); // Async not awaited
    });
  });

  describe('Error Handling', () => {
    it('should catch handler errors when error handler provided', async () => {
      const errorHandler = jest.fn();
      const eventBusWithError = new EventBus({
        maxListeners: 100,
        onError: errorHandler
      });

      const faultyHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      eventBusWithError.on('error-event', faultyHandler);

      await eventBusWithError.emit('error-event', {});

      expect(errorHandler).toHaveBeenCalled();
      expect(errorHandler.mock.calls[0][0].message).toBe('Handler error');
    });

    it('should continue execution even if one handler fails', async () => {
      const handler1 = jest.fn(() => {
        throw new Error('Fail');
      });
      const handler2 = jest.fn();

      const errorHandler = jest.fn();
      const bus = new EventBus({ onError: errorHandler });

      bus.on('mixed-event', handler1);
      bus.on('mixed-event', handler2);

      await bus.emit('mixed-event', {});

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Listener Management', () => {
    it('should report correct listener count', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      expect(eventBus.listenerCount('count-test')).toBe(0);

      eventBus.on('count-test', handler1);
      expect(eventBus.listenerCount('count-test')).toBe(1);

      eventBus.on('count-test', handler2);
      expect(eventBus.listenerCount('count-test')).toBe(2);

      eventBus.off('count-test', handler1);
      expect(eventBus.listenerCount('count-test')).toBe(1);
    });

    it('should check if event has listeners', () => {
      const handler = jest.fn();

      expect(eventBus.hasListeners('check-event')).toBe(false);

      eventBus.on('check-event', handler);
      expect(eventBus.hasListeners('check-event')).toBe(true);

      eventBus.off('check-event', handler);
      expect(eventBus.hasListeners('check-event')).toBe(false);
    });

    it('should warn when max listeners exceeded', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const bus = new EventBus({ maxListeners: 3 });

      bus.on('max-test', jest.fn());
      bus.on('max-test', jest.fn());
      bus.on('max-test', jest.fn());
      bus.on('max-test', jest.fn()); // 4th listener - should warn

      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('Max listeners');

      warnSpy.mockRestore();
    });
  });

  describe('Event Metadata', () => {
    it('should include timestamp in event', async () => {
      const beforeTime = new Date();
      
      const handler = jest.fn();
      eventBus.on('meta-event', handler);
      
      await eventBus.emit('meta-event', {});
      
      const afterTime = new Date();
      const eventArg = handler.mock.calls[0][0];
      
      expect(eventArg.timestamp).toBeInstanceOf(Date);
      expect(eventArg.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(eventArg.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should include source in event when provided', async () => {
      const handler = jest.fn();
      eventBus.on('source-event', handler);
      
      await eventBus.emit('source-event', { value: 1 }, 'UserService');
      
      const eventArg = handler.mock.calls[0][0];
      expect(eventArg.source).toBe('UserService');
    });

    it('should include event name in event object', async () => {
      const handler = jest.fn();
      eventBus.on('named-event', handler);
      
      await eventBus.emit('named-event', {});
      
      const eventArg = handler.mock.calls[0][0];
      expect(eventArg.name).toBe('named-event');
    });
  });

  describe('Debug Helpers', () => {
    it('should return list of event names', () => {
      eventBus.on('event-1', jest.fn());
      eventBus.on('event-2', jest.fn());
      eventBus.on('event-3', jest.fn());

      const names = eventBus.getEventNames();

      expect(names).toContain('event-1');
      expect(names).toContain('event-2');
      expect(names).toContain('event-3');
      expect(names).toHaveLength(3);
    });

    it('should not duplicate event names', () => {
      eventBus.on('dup-event', jest.fn());
      eventBus.on('dup-event', jest.fn());
      eventBus.once('dup-event', jest.fn());

      const names = eventBus.getEventNames();

      expect(names.filter(n => n === 'dup-event')).toHaveLength(1);
    });
  });

  describe('Integration Scenarios', () => {
    it('should support event-driven communication between modules', async () => {
      // Simulate user registration flow
      const emailService = {
        sendWelcome: jest.fn()
      };
      
      const analyticsService = {
        track: jest.fn()
      };

      eventBus.on('user.registered', async (event) => {
        await emailService.sendWelcome(event.data.email);
      });

      eventBus.on('user.registered', async (event) => {
        await analyticsService.track('user_registered', event.data);
      });

      // Emit user registration event
      await eventBus.emit('user.registered', {
        userId: '123',
        email: 'test@example.com',
        name: 'John Doe'
      });

      expect(emailService.sendWelcome).toHaveBeenCalledWith('test@example.com');
      expect(analyticsService.track).toHaveBeenCalledWith('user_registered', {
        userId: '123',
        email: 'test@example.com',
        name: 'John Doe'
      });
    });

    it('should cleanup subscriptions properly', async () => {
      const subscriptions: any[] = [];

      // Subscribe to multiple events
      subscriptions.push(eventBus.on('event-1', jest.fn()));
      subscriptions.push(eventBus.on('event-2', jest.fn()));
      subscriptions.push(eventBus.on('event-3', jest.fn()));

      expect(eventBus.getEventNames()).toHaveLength(3);

      // Cleanup all
      subscriptions.forEach(sub => sub.unsubscribe());

      expect(eventBus.getEventNames()).toHaveLength(0);
    });
  });
});