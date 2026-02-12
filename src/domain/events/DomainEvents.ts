import { IDomainEvent } from "./IDomainEvent";
import { UniqueEntityID } from "../UniqueEntityID";

// Event Handler fonksiyon tipi
type EventHandler = (event: IDomainEvent) => void;

export class DomainEvents {
  // --------------------------------------------------------
  // YENİ YAPI: Map<EventAdı, Map<SubscriberId, Fonksiyon>>
  // --------------------------------------------------------
  // Burada EventHandler[] DEĞİL, Map<string, EventHandler> kullanıyoruz.
  private static handlersMap: Map<string, Map<string, EventHandler>> = new Map();
  
  private static markedAggregates: any[] = [];

  /**
   * Olay Dinleyici Kaydetme (Idempotent Registration)
   * Aynı subscriberId ile gelirse eskisini günceller (Array gibi eklemez).
   */
  public static register(callback: EventHandler, eventClassName: string, subscriberId: string): void {
    // 1. Eğer bu Event için henüz hiç kayıt yoksa, boş bir Map oluştur
    if (!this.handlersMap.has(eventClassName)) {
      this.handlersMap.set(eventClassName, new Map());
    }

    // 2. Bu Event'in dinleyicilerini al (Bu bir Map'tir, Array değil!)
    const subscribers = this.handlersMap.get(eventClassName)!;
    
    // 3. Map'e ekle veya güncelle
    subscribers.set(subscriberId, callback);

    console.log(`[DomainEvents]: '${subscriberId}' subscribed to '${eventClassName}'. Total subs: ${subscribers.size}`);
  }

  /**
   * Olay Fırlatma (Dispatch)
   */
  public static dispatch(event: IDomainEvent): void {
    const eventClassName = event.constructor.name;

    if (this.handlersMap.has(eventClassName)) {
      const subscribers = this.handlersMap.get(eventClassName)!;
      
      // Map üzerindeki değerleri (fonksiyonları) dönüyoruz
      for (const handler of subscribers.values()) {
        handler(event);
      }
    }
  }

  // --- Aggregate İşlemleri (Aynı kalıyor) ---

  public static markAggregateForDispatch(aggregate: any): void {
    const found = this.markedAggregates.find((a) => a.equals(aggregate));
    if (!found) {
      this.markedAggregates.push(aggregate);
    }
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = this.markedAggregates.find((a) => a._id.equals(id));

    if (aggregate) {
      aggregate.domainEvents.forEach((event: IDomainEvent) => {
        this.dispatch(event);
      });
      aggregate.clearEvents();
      this.markedAggregates = this.markedAggregates.filter((a) => !a.equals(aggregate));
    }
  }

  // --- Temizlik ---

  public static clearHandlers(): void {
    this.handlersMap.clear();
  }
}