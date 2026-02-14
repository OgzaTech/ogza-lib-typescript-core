import { Guard } from '../Guard';
import { Result } from '../Result';
import { LocalizationService } from '../../localization/LocalizationService';
import { en } from '../../localization/locales/en';

LocalizationService.setLocaleData(en);

describe('Guard.combine', () => {

  describe('All Success', () => {
    it('should return success when all results are successful', () => {
      const results = [
        Guard.againstNullOrUndefined('value', 'field1'),
        Guard.againstNullOrUndefined('value', 'field2'),
        Guard.againstEmptyString('value', 'field3')
      ];

      const combined = Guard.combine(results);
      expect(combined.isSuccess).toBe(true);
    });

    it('should return success for empty array', () => {
      const combined = Guard.combine([]);
      expect(combined.isSuccess).toBe(true);
    });
  });

  describe('Mixed Success/Failure', () => {
    it('should return first failure when one result fails', () => {
      const results = [
        Guard.againstNullOrUndefined('value', 'field1'),   // Success
        Guard.againstNullOrUndefined(null, 'field2'),      // Fail
        Guard.againstNullOrUndefined('value', 'field3')    // Success
      ];

      const combined = Guard.combine(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.error).toContain('field2');
    });

    it('should return first failure even with multiple failures', () => {
      const results = [
        Guard.againstNullOrUndefined('value', 'field1'),   // Success
        Guard.againstNullOrUndefined(null, 'field2'),      // Fail (first)
        Guard.againstNullOrUndefined(null, 'field3')       // Fail (second)
      ];

      const combined = Guard.combine(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.error).toContain('field2');  // İlk hatayı döndürmeli
      expect(combined.error).not.toContain('field3');
    });
  });

  describe('Complex Validations', () => {
    it('should combine different guard types', () => {
      const results = [
        Guard.againstNullOrUndefined('test', 'name'),
        Guard.againstEmptyString('test', 'name'),
        Guard.againstAtLeast(3, 'test', 'name'),
        Guard.againstAtMost(10, 'test', 'name')
      ];

      const combined = Guard.combine(results);
      expect(combined.isSuccess).toBe(true);
    });

    it('should fail on first validation failure in chain', () => {
      const results = [
        Guard.againstNullOrUndefined('ab', 'password'),     // Success
        Guard.againstEmptyString('ab', 'password'),         // Success
        Guard.againstAtLeast(8, 'ab', 'password'),          // Fail - too short
        Guard.againstAtMost(20, 'ab', 'password')           // Would succeed but not evaluated
      ];

      const combined = Guard.combine(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.error).toContain('at least 8');
    });
  });

  describe('Real-world Usage Scenario', () => {
    it('should validate user registration data', () => {
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'SecurePass123';

      const results = [
        Guard.againstNullOrUndefined(name, 'name'),
        Guard.againstEmptyString(name, 'name'),
        Guard.againstNullOrUndefined(email, 'email'),
        Guard.againstEmptyString(email, 'email'),
        Guard.againstNullOrUndefined(password, 'password'),
        Guard.againstAtLeast(8, password, 'password'),
        Guard.againstAtMost(50, password, 'password')
      ];

      const combined = Guard.combine(results);
      expect(combined.isSuccess).toBe(true);
    });

    it('should fail validation with missing required field', () => {
      const name = null;
      const email = 'john@example.com';
      const password = 'SecurePass123';

      const results = [
        Guard.againstNullOrUndefined(name, 'name'),        // Fail here
        Guard.againstEmptyString(email, 'email'),
        Guard.againstAtLeast(8, password, 'password')
      ];

      const combined = Guard.combine(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.error).toContain('name');
    });
  });
});