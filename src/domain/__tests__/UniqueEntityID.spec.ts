import { UniqueEntityID } from '../UniqueEntityID';

describe('UniqueEntityID', () => {
  
  it('should generate a unique ID if no argument is provided', () => {
    const id1 = new UniqueEntityID();
    const id2 = new UniqueEntityID();

    expect(id1.getValue()).toBeDefined();
    expect(id1.toString().length).toBeGreaterThan(0);
    // İki rastgele ID'nin eşit olmaması gerekir
    expect(id1.equals(id2)).toBe(false);
  });

  it('should use the provided value if argument is provided', () => {
    const constantId = '12345-uuid';
    const id = new UniqueEntityID(constantId);

    expect(id.getValue()).toBe(constantId);
    expect(id.toString()).toBe(constantId);
  });

  it('should be equal to another UniqueEntityID with the same value', () => {
    const idString = 'same-id';
    const id1 = new UniqueEntityID(idString);
    const id2 = new UniqueEntityID(idString);

    expect(id1.equals(id2)).toBe(true);
  });
});