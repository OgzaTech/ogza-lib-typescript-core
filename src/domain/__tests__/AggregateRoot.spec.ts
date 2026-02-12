import { AggregateRoot } from '../AggregateRoot';
import { DomainEvents } from '../events/DomainEvents';
import { IDomainEvent } from '../events/IDomainEvent';
import { UniqueEntityID } from '../UniqueEntityID';

// 1. Mock Event
class UserCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public user: MockUserAggregate;

  constructor(user: MockUserAggregate) {
    this.dateTimeOccurred = new Date();
    this.user = user;
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id;
  }
}

// 2. Mock Aggregate
class MockUserAggregate extends AggregateRoot<{ name: string }> {
  get id(): UniqueEntityID { return this._id; }

  private constructor(props: { name: string }, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(name: string): MockUserAggregate {
    const user = new MockUserAggregate({ name });
    // Event ekliyoruz
    user.addDomainEvent(new UserCreatedEvent(user));
    return user;
  }
}

// 3. Test
describe('AggregateRoot & DomainEvents', () => {
  
  beforeEach(() => {
    DomainEvents.clearHandlers();
  });

  it('should dispatch event when marked and dispatched', () => {
    // A. Handler (Dinleyici) DÜZELTME:
    // Parametre olarak 'UserCreatedEvent' değil, genel 'IDomainEvent' almalı.
    const handlerMock = jest.fn((event: IDomainEvent) => {
      // İçeride güvenli dönüşüm (casting) yapıyoruz
      const userEvent = event as UserCreatedEvent;
      console.log(`[Event Handled]: User created -> ${userEvent.user.props.name}`);
    });

    // B. Dinleyiciyi sisteme kaydet
    DomainEvents.register(handlerMock, UserCreatedEvent.name,"UserEvent");

    // C. Aggregate oluştur
    const user = MockUserAggregate.create("Oğuzhan");

    // D. Henüz dispatch edilmediği için çalışmamalı
    expect(handlerMock).not.toHaveBeenCalled();

    // E. Veritabanına kaydetmiş gibi Dispatch et
    DomainEvents.dispatchEventsForAggregate(user.id);

    // F. Şimdi çalışmalı
    expect(handlerMock).toHaveBeenCalled();
    expect(user.domainEvents.length).toBe(0); 
  });
});