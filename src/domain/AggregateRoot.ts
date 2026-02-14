import { Entity } from "./Entity";
import { IDomainEvent } from "./events/IDomainEvent";
import { DomainEvents } from "./events/DomainEvents"; 
import { UniqueEntityID } from "./UniqueEntityID";
import { ILogger } from "../infrastructure/ILogger";

/**
 * Aggregate Root - Domain Event yönetimi yapan Entity
 * 
 * DDD'de Aggregate Root, transaction boundary'si ve consistency garantisi sağlar.
 * Tüm domain event'leri aggregate root üzerinden yönetilir.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = [];
  private static _logger?: ILogger;

  /**
   * Logger instance'ını static olarak set eder
   * Application başlangıcında bir kez çağrılmalı
   */
  public static setLogger(logger: ILogger): void {
    AggregateRoot._logger = logger;
  }

  /**
   * Domain event listesini döndürür
   */
  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  /**
   * Aggregate'e yeni bir domain event ekler
   * Event otomatik olarak dispatch için işaretlenir
   */
  protected addDomainEvent(domainEvent: IDomainEvent): void {
    // 1. Event'i listeye ekle
    this._domainEvents.push(domainEvent);
    
    // 2. Aggregate'i dispatch listesine işaretle
    DomainEvents.markAggregateForDispatch(this);
    
    // 3. Opsiyonel loglama (production-safe)
    this.logDomainEventAdded(domainEvent);
  }

  /**
   * Tüm domain event'leri temizler
   * Genelde dispatch sonrası çağrılır
   */
  public clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Domain event ekleme loglaması (opsiyonel)
   * Logger inject edilmişse çalışır, yoksa sessiz kalır
   */
  private logDomainEventAdded(domainEvent: IDomainEvent): void {
    if (AggregateRoot._logger) {
      const aggregateName = this.constructor.name;
      const eventName = domainEvent.constructor.name;
      
      AggregateRoot._logger.debug('Domain event added', {
        aggregate: aggregateName,
        event: eventName,
        aggregateId: this.id.toString()
      });
    }
  }
}