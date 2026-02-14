import { Result } from "../../logic/Result";
import { 
  IEventBus, 
  IEvent, 
  EventHandler, 
  IEventSubscription,
  EventBusOptions 
} from "./IEventBus";

/**
 * In-Memory Event Bus Implementation
 */
export class EventBus implements IEventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private onceListeners: Map<string, Set<EventHandler>> = new Map();
  private options: EventBusOptions;
  private subscriptionIdCounter = 0;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      maxListeners: 100,
      enableWildcard: false,
      ...options
    };
  }

  on<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription {
    this.validateMaxListeners(eventName);
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    
    this.listeners.get(eventName)!.add(handler);
    
    const subscriptionId = `sub_${++this.subscriptionIdCounter}`;
    
    return {
      id: subscriptionId,
      eventName,
      unsubscribe: () => this.off(eventName, handler)
    };
  }

  once<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription {
    this.validateMaxListeners(eventName);
    
    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, new Set());
    }
    
    this.onceListeners.get(eventName)!.add(handler);
    
    const subscriptionId = `sub_once_${++this.subscriptionIdCounter}`;
    
    return {
      id: subscriptionId,
      eventName,
      unsubscribe: () => this.off(eventName, handler)
    };
  }

  off(eventName: string, handler: EventHandler): void {
    // Regular listeners
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
    
    // Once listeners
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      onceListeners.delete(handler);
      if (onceListeners.size === 0) {
        this.onceListeners.delete(eventName);
      }
    }
  }

  offAll(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
      this.onceListeners.delete(eventName);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  async emit<T = any>(eventName: string, data?: T, source?: string): Promise<Result<void>> {
    const event: IEvent = {
      name: eventName,
      data: data,
      timestamp: new Date(),
      source
    };

    try {
      // Regular listeners
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        for (const handler of listeners) {
          try {
            const result = handler(event as any);
            if (result instanceof Promise) {
              await result;
            }
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error as Error, event);
            }
          }
        }
      }

      // Once listeners
      const onceListeners = this.onceListeners.get(eventName);
      if (onceListeners) {
        for (const handler of onceListeners) {
          try {
            const result = handler(event as any);
            if (result instanceof Promise) {
              await result;
            }
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error as Error, event);
            }
          }
        }
        
        // Clear once listeners
        this.onceListeners.delete(eventName);
      }

      return Result.ok();
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error, event);
      }
      return Result.fail(`Event emission failed: ${error}`);
    }
  }

  emitSync<T = any>(eventName: string, data?: T, source?: string): Result<void> {
    const event: IEvent = {
      name: eventName,
      data: data,
      timestamp: new Date(),
      source
    };

    try {
      // Regular listeners
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        for (const handler of listeners) {
          try {
            handler(event as any);
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error as Error, event);
            }
          }
        }
      }

      // Once listeners
      const onceListeners = this.onceListeners.get(eventName);
      if (onceListeners) {
        for (const handler of onceListeners) {
          try {
            handler(event as any);
          } catch (error) {
            if (this.options.onError) {
              this.options.onError(error as Error, event);
            }
          }
        }
        
        this.onceListeners.delete(eventName);
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Sync event emission failed: ${error}`);
    }
  }

  hasListeners(eventName: string): boolean {
    return (
      (this.listeners.has(eventName) && this.listeners.get(eventName)!.size > 0) ||
      (this.onceListeners.has(eventName) && this.onceListeners.get(eventName)!.size > 0)
    );
  }

  listenerCount(eventName: string): number {
    const regular = this.listeners.get(eventName)?.size || 0;
    const once = this.onceListeners.get(eventName)?.size || 0;
    return regular + once;
  }

  private validateMaxListeners(eventName: string): void {
    const count = this.listenerCount(eventName);
    if (count >= this.options.maxListeners!) {
      console.warn(
        `Max listeners (${this.options.maxListeners}) exceeded for event "${eventName}". ` +
        'Possible memory leak?'
      );
    }
  }

  /**
   * Debug: Tüm event'leri listele
   */
  getEventNames(): string[] {
    return [
      ...Array.from(this.listeners.keys()),
      ...Array.from(this.onceListeners.keys())
    ].filter((value, index, self) => self.indexOf(value) === index);
  }
}