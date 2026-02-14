import { UniqueEntityID } from '../../domain/UniqueEntityID';

describe('UniqueEntityID', () => {

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = new UniqueEntityID();
      const id2 = new UniqueEntityID();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });

    it('should generate valid UUID v4 format', () => {
      const id = new UniqueEntityID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuidRegex.test(id.toString())).toBe(true);
    });

    it('should generate cryptographically strong IDs', () => {
      const ids = new Set<string>();
      const count = 1000;

      // 1000 ID oluştur, collision olmamalı
      for (let i = 0; i < count; i++) {
        ids.add(new UniqueEntityID().toString());
      }

      expect(ids.size).toBe(count);
    });
  });

  describe('ID from Value', () => {
    it('should accept string ID', () => {
      const customId = 'custom-id-123';
      const id = new UniqueEntityID(customId);

      expect(id.getValue()).toBe(customId);
    });

    it('should accept number ID', () => {
      const customId = 12345;
      const id = new UniqueEntityID(customId);

      expect(id.getValue()).toBe(customId);
    });

    it('should accept UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = new UniqueEntityID(uuid);

      expect(id.getValue()).toBe(uuid);
    });
  });

  describe('Equality', () => {
    it('should be equal with same value', () => {
      const id1 = new UniqueEntityID('test-id');
      const id2 = new UniqueEntityID('test-id');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should not be equal with different values', () => {
      const id1 = new UniqueEntityID('test-id-1');
      const id2 = new UniqueEntityID('test-id-2');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should be equal to itself', () => {
      const id = new UniqueEntityID('test-id');
      expect(id.equals(id)).toBe(true);
    });

    it('should not be equal to null or undefined', () => {
      const id = new UniqueEntityID('test-id');
      expect(id.equals(undefined as any)).toBe(false);
      expect(id.equals(null as any)).toBe(false);
    });

    it('should handle numeric ID equality', () => {
      const id1 = new UniqueEntityID(123);
      const id2 = new UniqueEntityID(123);
      const id3 = new UniqueEntityID(456);

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should convert to string', () => {
      const customId = 'test-id';
      const id = new UniqueEntityID(customId);

      expect(id.toString()).toBe(customId);
    });

    it('should convert numeric ID to string', () => {
      const id = new UniqueEntityID(12345);
      expect(id.toString()).toBe('12345');
    });

    it('should return generated UUID as string', () => {
      const id = new UniqueEntityID();
      const str = id.toString();

      expect(typeof str).toBe('string');
      expect(str.length).toBeGreaterThan(0);
    });
  });

  describe('getValue', () => {
    it('should return original value type', () => {
      const stringId = new UniqueEntityID('test');
      const numberId = new UniqueEntityID(123);

      expect(stringId.getValue()).toBe('test');
      expect(numberId.getValue()).toBe(123);
    });

    it('should return generated UUID', () => {
      const id = new UniqueEntityID();
      const value = id.getValue();

      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    });
  });

  describe('ValueObject Behavior', () => {
    it('should be immutable', () => {
      const id = new UniqueEntityID('test');
      
      // props is frozen
      expect(() => {
        (id as any).props.value = 'changed';
      }).toThrow();
    });

    it('should maintain value integrity', () => {
      const originalValue = 'original-id';
      const id = new UniqueEntityID(originalValue);

      expect(id.getValue()).toBe(originalValue);
      expect(id.toString()).toBe(originalValue);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const id = new UniqueEntityID('');
      expect(id.getValue()).toBe('');
    });

    it('should handle zero', () => {
      const id = new UniqueEntityID(0);
      expect(id.getValue()).toBe(0);
    });

    it('should handle very long strings', () => {
      const longId = 'a'.repeat(1000);
      const id = new UniqueEntityID(longId);
      expect(id.getValue()).toBe(longId);
    });

    it('should handle special characters in string ID', () => {
      const specialId = 'test-id_123!@#$%';
      const id = new UniqueEntityID(specialId);
      expect(id.getValue()).toBe(specialId);
    });
  });
});