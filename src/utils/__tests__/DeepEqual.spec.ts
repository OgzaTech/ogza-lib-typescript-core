import { deepEqual } from '../deepEqual';

describe('deepEqual', () => {

  describe('Primitive values', () => {
    it('should return true for same numbers', () => {
      expect(deepEqual(5, 5)).toBe(true);
      expect(deepEqual(0, 0)).toBe(true);
      expect(deepEqual(-1, -1)).toBe(true);
    });

    it('should return false for different numbers', () => {
      expect(deepEqual(5, 10)).toBe(false);
      expect(deepEqual(0, 1)).toBe(false);
    });

    it('should return true for same strings', () => {
      expect(deepEqual('hello', 'hello')).toBe(true);
      expect(deepEqual('', '')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(deepEqual('hello', 'world')).toBe(false);
    });

    it('should return true for same booleans', () => {
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
    });

    it('should return false for different booleans', () => {
      expect(deepEqual(true, false)).toBe(false);
    });
  });

  describe('Null and undefined', () => {
    it('should return true for null === null', () => {
      expect(deepEqual(null, null)).toBe(true);
    });

    it('should return true for undefined === undefined', () => {
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for null vs undefined', () => {
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it('should return false for null vs value', () => {
      expect(deepEqual(null, 5)).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
    });
  });

  describe('Simple objects', () => {
    it('should return true for same flat objects', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test' };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should return true for same object reference', () => {
      const obj = { a: 1 };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it('should return false for different values', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'different' };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for different keys', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 1 };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for different number of keys', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 2 };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('Nested objects', () => {
    it('should return true for same nested objects', () => {
      const obj1 = {
        a: 1,
        b: {
          c: 2,
          d: 'test'
        }
      };
      const obj2 = {
        a: 1,
        b: {
          c: 2,
          d: 'test'
        }
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for different nested values', () => {
      const obj1 = {
        a: 1,
        b: { c: 2 }
      };
      const obj2 = {
        a: 1,
        b: { c: 3 }
      };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle deeply nested objects', () => {
      const obj1 = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };
      const obj2 = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });

  describe('Arrays', () => {
    it('should return true for same arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    });

    it('should return false for different array values', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should return false for different array lengths', () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should return false for different array order', () => {
      expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    });

    it('should handle nested arrays', () => {
      const arr1 = [[1, 2], [3, 4]];
      const arr2 = [[1, 2], [3, 4]];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it('should handle arrays of objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it('should return false for array vs non-array', () => {
      expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });
  });

  describe('Dates', () => {
    it('should return true for same dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');
      expect(deepEqual(date1, date2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      expect(deepEqual(date1, date2)).toBe(false);
    });

    it('should return true for same date reference', () => {
      const date = new Date();
      expect(deepEqual(date, date)).toBe(true);
    });
  });

  describe('RegExp', () => {
    it('should return true for same regex', () => {
      const regex1 = /test/gi;
      const regex2 = /test/gi;
      expect(deepEqual(regex1, regex2)).toBe(true);
    });

    it('should return false for different regex pattern', () => {
      const regex1 = /test/;
      const regex2 = /different/;
      expect(deepEqual(regex1, regex2)).toBe(false);
    });

    it('should return false for different regex flags', () => {
      const regex1 = /test/i;
      const regex2 = /test/g;
      expect(deepEqual(regex1, regex2)).toBe(false);
    });
  });

  describe('Mixed types', () => {
    it('should return false for different types', () => {
      expect(deepEqual(5, '5')).toBe(false);
      expect(deepEqual(true, 1)).toBe(false);
      expect(deepEqual({}, [])).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
    });
  });

  describe('Complex real-world scenarios', () => {
    it('should compare complex ValueObject props', () => {
      // Address ValueObject örneği
      const addr1 = {
        street: 'Main Street',
        city: 'New York',
        country: {
          code: 'US',
          name: 'United States'
        },
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      };

      const addr2 = {
        street: 'Main Street',
        city: 'New York',
        country: {
          code: 'US',
          name: 'United States'
        },
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      };

      expect(deepEqual(addr1, addr2)).toBe(true);
    });

    it('should detect difference in nested complex objects', () => {
      const obj1 = {
        user: {
          profile: {
            name: 'John',
            address: {
              city: 'NYC'
            }
          }
        }
      };

      const obj2 = {
        user: {
          profile: {
            name: 'John',
            address: {
              city: 'LA'  // Different!
            }
          }
        }
      };

      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle arrays with nested objects', () => {
      const data1 = {
        items: [
          { id: 1, meta: { tag: 'important' } },
          { id: 2, meta: { tag: 'normal' } }
        ]
      };

      const data2 = {
        items: [
          { id: 1, meta: { tag: 'important' } },
          { id: 2, meta: { tag: 'normal' } }
        ]
      };

      expect(deepEqual(data1, data2)).toBe(true);
    });
  });
});