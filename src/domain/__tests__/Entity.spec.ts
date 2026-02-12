import { Entity } from '../Entity';
import { UniqueEntityID } from '../UniqueEntityID';

// Test edebilmek için soyut (abstract) sınıfı miras alan sahte bir sınıf oluşturuyoruz.
interface MockEntityProps {
  name: string;
}

class MockEntity extends Entity<MockEntityProps> {
  // Public yaparak testte erişilebilir kılıyoruz
  constructor(props: MockEntityProps, id?: UniqueEntityID) {
    super(props, id);
  }
}

describe('Entity', () => {
  
  it('should be equal if IDs are the same (even if objects are different instances)', () => {
    const id = new UniqueEntityID('123');
    const entity1 = new MockEntity({ name: 'Test 1' }, id);
    const entity2 = new MockEntity({ name: 'Test 1' }, id);

    expect(entity1.equals(entity2)).toBe(true);
  });

  it('should not be equal if IDs are different', () => {
    const entity1 = new MockEntity({ name: 'Test' }, new UniqueEntityID('1'));
    const entity2 = new MockEntity({ name: 'Test' }, new UniqueEntityID('2'));

    expect(entity1.equals(entity2)).toBe(false);
  });

  it('should not be equal to null or undefined', () => {
    const entity = new MockEntity({ name: 'Test' });
    expect(entity.equals(undefined)).toBe(false);
    // @ts-ignore
    expect(entity.equals(null)).toBe(false);
  });

  it('should not be equal to a non-entity object', () => {
    const entity = new MockEntity({ name: 'Test' });
    const plainObject = { name: 'Test' };
    
    // @ts-ignore
    expect(entity.equals(plainObject)).toBe(false);
  });

  it('should be equal to itself', () => {
    const entity = new MockEntity({ name: 'Test' });
    expect(entity.equals(entity)).toBe(true);
  });
});