import { Entity } from "./Entity";
import { IDomainEvent } from "./events/IDomainEvent";
import { DomainEvents } from "./events/DomainEvents"; 
import { UniqueEntityID } from "./UniqueEntityID";

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  // Olay Ekleme
  protected addDomainEvent(domainEvent: IDomainEvent): void {
    // 1. Olayı listeye ekle
    this._domainEvents.push(domainEvent);
    // 2. Bu aggregate'i "işlenecekler" listesine işaretle (Senin kodun burayı kullanıyor)
    DomainEvents.markAggregateForDispatch(this);
    // 3. Loglama (Opsiyonel)
    this.logDomainEventAdded(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  private logDomainEventAdded(domainEvent: IDomainEvent): void {
    const thisClass = Reflect.getPrototypeOf(this);
    const domainEventClass = Reflect.getPrototypeOf(domainEvent);
    console.info(`[Domain Event Created]:`, domainEventClass?.constructor.name, '==>', thisClass?.constructor.name);
  }
}