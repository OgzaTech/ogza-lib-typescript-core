import { AggregateRoot } from '../../domain/AggregateRoot';
import { DomainEvents } from '../../domain/events/DomainEvents';
import { IDomainEvent } from '../../domain/events/IDomainEvent';
import { UniqueEntityID } from '../../domain/UniqueEntityID';

// Mock Event
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

class UserUpdatedEvent implements IDomainEvent {
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

// Mock Aggregate
class MockUserAggregate extends AggregateRoot<{ name: string }> {
  get id(): UniqueEntityID { return this._id; }

  private constructor(props: { name: string }, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(name: string): MockUserAggregate {
    const user = new MockUserAggregate({ name });
    user.addDomainEvent(new UserCreatedEvent(user));
    return user;
  }

  public updateName(newName: string): void {
    this.props.name = newName;
    this.addDomainEvent(new UserUpdatedEvent(this));
  }
}

describe('AggregateRoot & DomainEvents', () => {
  
  beforeEach(() => {
    // Her testten önce state'i tamamen temizle
    DomainEvents.clearAll();
  });

  afterEach(() => {
    // Her testten sonra da temizle (double safety)
    DomainEvents.clearAll();
  });

  describe('Event Registration', () => {
    it('should register event handler', () => {
      const handler = jest.fn();
      DomainEvents.register(handler, UserCreatedEvent.name, 'test-handler');

      const state = DomainEvents.getState();
      expect(state.registeredEvents).toContain(UserCreatedEvent.name);
    });

    it('should replace handler with same subscriberId (idempotent)', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      DomainEvents.register(handler1, UserCreatedEvent.name, 'same-id');
      DomainEvents.register(handler2, UserCreatedEvent.name, 'same-id');

      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple handlers for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      DomainEvents.register(handler1, UserCreatedEvent.name, 'handler-1');
      DomainEvents.register(handler2, UserCreatedEvent.name, 'handler-2');

      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Unregistration', () => {
    it('should unregister handler', () => {
      const handler = jest.fn();
      DomainEvents.register(handler, UserCreatedEvent.name, 'test-handler');
      DomainEvents.unregister(UserCreatedEvent.name, 'test-handler');

      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not affect other handlers when unregistering one', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      DomainEvents.register(handler1, UserCreatedEvent.name, 'handler-1');
      DomainEvents.register(handler2, UserCreatedEvent.name, 'handler-2');
      
      DomainEvents.unregister(UserCreatedEvent.name, 'handler-1');

      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Dispatch', () => {
    it('should dispatch event when aggregate is saved', () => {
      const handler = jest.fn();
      DomainEvents.register(handler, UserCreatedEvent.name, 'test-handler');

      const user = MockUserAggregate.create('Oğuzhan');
      
      // Henüz dispatch edilmedi
      expect(handler).not.toHaveBeenCalled();

      // Veritabanına kaydetmiş gibi dispatch
      DomainEvents.dispatchEventsForAggregate(user.id);

      // Şimdi çalışmalı
      expect(handler).toHaveBeenCalledTimes(1);
      expect(user.domainEvents.length).toBe(0); // Event'ler temizlendi mi?
    });

    it('should dispatch multiple events from same aggregate', () => {
      const createHandler = jest.fn();
      const updateHandler = jest.fn();

      DomainEvents.register(createHandler, UserCreatedEvent.name, 'create-handler');
      DomainEvents.register(updateHandler, UserUpdatedEvent.name, 'update-handler');

      const user = MockUserAggregate.create('John');
      user.updateName('Jane');

      DomainEvents.dispatchEventsForAggregate(user.id);

      expect(createHandler).toHaveBeenCalledTimes(1);
      expect(updateHandler).toHaveBeenCalledTimes(1);
    });

    it('should pass event to handler', () => {
      const handler = jest.fn();
      DomainEvents.register(handler, UserCreatedEvent.name, 'test-handler');

      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      const event = handler.mock.calls[0][0] as UserCreatedEvent;
      expect(event).toBeInstanceOf(UserCreatedEvent);
      expect(event.user.props.name).toBe('Test');
    });
  });

  describe('Marked Aggregates Management', () => {
    it('should mark aggregate for dispatch', () => {
      const user = MockUserAggregate.create('Test');
      
      const stateBefore = DomainEvents.getState();
      expect(stateBefore.markedAggregatesCount).toBe(1);
    });

    it('should clear marked aggregates after dispatch', () => {
      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      const state = DomainEvents.getState();
      expect(state.markedAggregatesCount).toBe(0);
    });

    it('should not mark same aggregate twice', () => {
      const user = MockUserAggregate.create('Test');
      user.updateName('Updated');

      // Aynı aggregate 2 event ekledi ama sadece 1 kez marklı olmalı
      const state = DomainEvents.getState();
      expect(state.markedAggregatesCount).toBe(1);
    });

    it('should clear marked aggregates manually', () => {
      MockUserAggregate.create('Test1');
      MockUserAggregate.create('Test2');

      expect(DomainEvents.getState().markedAggregatesCount).toBe(2);

      DomainEvents.clearMarkedAggregates();

      expect(DomainEvents.getState().markedAggregatesCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should continue dispatching even if handler throws', () => {
      const errorHandler = jest.fn(() => { throw new Error('Handler error'); });
      const successHandler = jest.fn();

      // Konsol hatası mockla
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      DomainEvents.register(errorHandler, UserCreatedEvent.name, 'error-handler');
      DomainEvents.register(successHandler, UserCreatedEvent.name, 'success-handler');

      const user = MockUserAggregate.create('Test');
      DomainEvents.dispatchEventsForAggregate(user.id);

      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled(); // İkinci handler çalışmalı
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should clear all handlers', () => {
      DomainEvents.register(jest.fn(), UserCreatedEvent.name, 'handler1');
      DomainEvents.register(jest.fn(), UserUpdatedEvent.name, 'handler2');

      DomainEvents.clearHandlers();

      const state = DomainEvents.getState();
      expect(state.registeredEvents.length).toBe(0);
    });

    it('should clear both handlers and aggregates', () => {
      DomainEvents.register(jest.fn(), UserCreatedEvent.name, 'handler');
      MockUserAggregate.create('Test');

      DomainEvents.clearAll();

      const state = DomainEvents.getState();
      expect(state.registeredEvents.length).toBe(0);
      expect(state.markedAggregatesCount).toBe(0);
    });
  });
});