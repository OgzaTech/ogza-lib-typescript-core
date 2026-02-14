import { shallowEqual } from '../shallowEqual';

describe('shallowEqual', () => {
  it('should return true for identical objects', () => {
    const obj1 = { a: 1, b: 'test' };
    const obj2 = { a: 1, b: 'test' };
    expect(shallowEqual(obj1, obj2)).toBe(true);
  });

  it('should return false if keys length differs', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(shallowEqual(obj1, obj2)).toBe(false);
  });

  it('should return false if values differ', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    expect(shallowEqual(obj1, obj2)).toBe(false);
  });

  it('should return false for different object references in nested properties (Shallow)', () => {
    const obj1 = { a: { nested: true } };
    const obj2 = { a: { nested: true } };
    // Referanslar farklı olduğu için shallow equal false döner
    expect(shallowEqual(obj1, obj2)).toBe(false);
  });
  
  it('should return true for same object references in nested properties', () => {
    const nested = { nested: true };
    const obj1 = { a: nested };
    const obj2 = { a: nested };
    expect(shallowEqual(obj1, obj2)).toBe(true);
  });
});