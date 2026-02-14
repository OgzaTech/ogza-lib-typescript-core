import { Result } from "../../logic/Result";

/**
 * Event Bus Interface
 * Uygulama içi event yayınlama/dinleme (Frontend & Backend)
 * 
 * Domain Events'den farkı: Application-level events
 * - Domain Events: Domain içinde (UserCreated, OrderPlaced)
 * - Event Bus: Application-level (UI events, system events)
 */

/**
 * Event Interface
 */
export interface IEvent {
  /**
   * Event adı (unique identifier)
   */
  name: string;
  
  /**
   * Event payload
   */
  data?: any;
  
  /**
   * Event zamanı
   */
  timestamp: Date;
  
  /**
   * Event source (hangi component/service)
   */
  source?: string;
}

/**
 * Event Handler Type
 */
export type EventHandler<T = any> = (event: IEvent & { data: T }) => void | Promise<void>;

/**
 * Event Subscription
 */
export interface IEventSubscription {
  /**
   * Subscription ID
   */
  id: string;
  
  /**
   * Event adı
   */
  eventName: string;
  
  /**
   * Unsubscribe
   */
  unsubscribe(): void;
}

/**
 * Event Bus Interface
 */
export interface IEventBus {
  /**
   * Event'e subscribe ol
   */
  on<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription;
  
  /**
   * Event'e bir kez subscribe ol (auto unsubscribe)
   */
  once<T = any>(eventName: string, handler: EventHandler<T>): IEventSubscription;
  
  /**
   * Event'ten unsubscribe ol
   */
  off(eventName: string, handler: EventHandler): void;
  
  /**
   * Tüm event'leri temizle
   */
  offAll(eventName?: string): void;
  
  /**
   * Event yayınla (async)
   */
  emit<T = any>(eventName: string, data?: T, source?: string): Promise<Result<void>>;
  
  /**
   * Event yayınla (sync)
   */
  emitSync<T = any>(eventName: string, data?: T, source?: string): Result<void>;
  
  /**
   * Event'in listener'ı var mı?
   */
  hasListeners(eventName: string): boolean;
  
  /**
   * Listener sayısını getir
   */
  listenerCount(eventName: string): number;
}

/**
 * Event Bus Options
 */
export interface EventBusOptions {
  /**
   * Max listener sayısı (memory leak önleme)
   */
  maxListeners?: number;
  
  /**
   * Error handler
   */
  onError?: (error: Error, event: IEvent) => void;
  
  /**
   * Wildcard destekle (* ile subscribe)
   */
  enableWildcard?: boolean;
}