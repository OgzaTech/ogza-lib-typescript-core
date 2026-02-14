import { IDomainEvent } from "./IDomainEvent";
import { UniqueEntityID } from "../UniqueEntityID";
import { AggregateRoot } from "../AggregateRoot";

type EventHandler = (event: IDomainEvent) => void;

/**
 * Domain Event Dispatcher
 * NOT: Global static state kullanır, test ortamlarında dikkatli kullanılmalı
 */
export class DomainEvents {
  // Event adı -> (Subscriber ID -> Handler fonksiyonu)
  private static handlersMap: Map<string, Map<string, EventHandler>> = new Map();
  
  // Dispatch bekleyen aggregate'ler
  private static markedAggregates: AggregateRoot<any>[] = [];

  /**
   * Event dinleyici kaydeder (Idempotent)
   * Aynı subscriberId ile tekrar kayıt yapılırsa güncellenir
   */
  public static register(
    callback: EventHandler, 
    eventClassName: string, 
    subscriberId: string
  ): void {
    if (!this.handlersMap.has(eventClassName)) {
      this.handlersMap.set(eventClassName, new Map());
    }

    const subscribers = this.handlersMap.get(eventClassName)!;
    subscribers.set(subscriberId, callback);

    console.log(
      `[DomainEvents] '${subscriberId}' subscribed to '${eventClassName}'. Total: ${subscribers.size}`
    );
  }

  /**
   * Event dinleyici kaydını siler
   */
  public static unregister(eventClassName: string, subscriberId: string): void {
    if (this.handlersMap.has(eventClassName)) {
      const subscribers = this.handlersMap.get(eventClassName)!;
      const deleted = subscribers.delete(subscriberId);
      
      if (deleted) {
        console.log(`[DomainEvents] '${subscriberId}' unsubscribed from '${eventClassName}'`);
      }
      
      // Event için dinleyici kalmadıysa map'ten de sil
      if (subscribers.size === 0) {
        this.handlersMap.delete(eventClassName);
      }
    }
  }

  /**
   * Event'i hemen dispatch eder
   */
  public static dispatch(event: IDomainEvent): void {
    const eventClassName = event.constructor.name;

    if (this.handlersMap.has(eventClassName)) {
      const subscribers = this.handlersMap.get(eventClassName)!;
      
      for (const [subscriberId, handler] of subscribers.entries()) {
        try {
          handler(event);
        } catch (error) {
          console.error(
            `[DomainEvents] Handler '${subscriberId}' failed for '${eventClassName}':`, 
            error
          );
        }
      }
    }
  }

  /**
   * Aggregate'i dispatch listesine ekler
   */
  public static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const found = this.markedAggregates.find((a) => a.equals(aggregate));
    if (!found) {
      this.markedAggregates.push(aggregate);
    }
  }

  /**
   * Belirli bir aggregate'in tüm event'lerini dispatch eder
   */
  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = this.markedAggregates.find((a) => a['_id'].equals(id));

    if (aggregate) {
      // Event'leri dispatch et
      aggregate.domainEvents.forEach((event: IDomainEvent) => {
        this.dispatch(event);
      });
      
      // Aggregate'i temizle
      aggregate.clearEvents();
      
      // Listeden kaldır
      this.markedAggregates = this.markedAggregates.filter((a) => !a.equals(aggregate));
    }
  }

  /**
   * Tüm handler'ları temizler (Test için)
   */
  public static clearHandlers(): void {
    this.handlersMap.clear();
    console.log('[DomainEvents] All handlers cleared');
  }

  /**
   * Bekleyen aggregate'leri temizler (Test için)
   */
  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
    console.log('[DomainEvents] All marked aggregates cleared');
  }

  /**
   * Hem handler'ları hem aggregate'leri temizler (Test için)
   */
  public static clearAll(): void {
    this.clearHandlers();
    this.clearMarkedAggregates();
  }

  /**
   * Debug için mevcut durumu gösterir
   */
  public static getState() {
    return {
      registeredEvents: Array.from(this.handlersMap.keys()),
      subscriberCounts: Array.from(this.handlersMap.entries()).map(([event, subs]) => ({
        event,
        count: subs.size
      })),
      markedAggregatesCount: this.markedAggregates.length
    };
  }
}