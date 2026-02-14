import { Guard } from '../../logic/Guard';
import { LocalizationService } from '../../localization/LocalizationService';
import { en } from '../../localization/locales/en';

LocalizationService.setLocaleData(en);

describe('Guard Length Validations', () => {

  describe('againstAtLeast', () => {
    it('should succeed when text meets minimum length', () => {
      const result = Guard.againstAtLeast(5, 'hello', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should succeed when text exceeds minimum length', () => {
      const result = Guard.againstAtLeast(5, 'hello world', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should fail when text is shorter than minimum', () => {
      const result = Guard.againstAtLeast(10, 'hello', 'text');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('at least 10');
    });

    it('should fail when text is null', () => {
      const result = Guard.againstAtLeast(5, null as any, 'text');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when text is undefined', () => {
      const result = Guard.againstAtLeast(5, undefined as any, 'text');
      expect(result.isFailure).toBe(true);
    });

    it('should succeed with empty string when minimum is 0', () => {
      const result = Guard.againstAtLeast(0, '', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should use custom argument name in error', () => {
      const result = Guard.againstAtLeast(10, 'short', 'password');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('password');
    });
  });

  describe('againstAtMost', () => {
    it('should succeed when text is within maximum length', () => {
      const result = Guard.againstAtMost(10, 'hello', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should succeed when text equals maximum length', () => {
      const result = Guard.againstAtMost(5, 'hello', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should fail when text exceeds maximum length', () => {
      const result = Guard.againstAtMost(5, 'hello world', 'text');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('at most 5');
    });

    it('should fail when text is null', () => {
      const result = Guard.againstAtMost(10, null as any, 'text');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when text is undefined', () => {
      const result = Guard.againstAtMost(10, undefined as any, 'text');
      expect(result.isFailure).toBe(true);
    });

    it('should use custom argument name in error', () => {
      const result = Guard.againstAtMost(5, 'too long text', 'username');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('username');
    });
  });

  describe('againstRange', () => {
    it('should succeed when text is within range', () => {
      const result = Guard.againstRange(5, 10, 'hello', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should succeed when text equals minimum', () => {
      const result = Guard.againstRange(5, 10, 'hello', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should succeed when text equals maximum', () => {
      const result = Guard.againstRange(5, 10, 'helloworld', 'text');
      expect(result.isSuccess).toBe(true);
    });

    it('should fail when text is shorter than minimum', () => {
      const result = Guard.againstRange(5, 10, 'hi', 'text');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('between 5 and 10');
    });

    it('should fail when text is longer than maximum', () => {
      const result = Guard.againstRange(5, 10, 'hello world!', 'text');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('between 5 and 10');
    });

    it('should fail when text is null', () => {
      const result = Guard.againstRange(5, 10, null as any, 'text');
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Real-world Validation Scenarios', () => {
    it('should validate password length (8-20 chars)', () => {
      const validPassword = 'SecurePass123';
      const tooShort = 'abc';
      const tooLong = 'a'.repeat(21);

      expect(Guard.againstRange(8, 20, validPassword, 'password').isSuccess).toBe(true);
      expect(Guard.againstRange(8, 20, tooShort, 'password').isFailure).toBe(true);
      expect(Guard.againstRange(8, 20, tooLong, 'password').isFailure).toBe(true);
    });

    it('should validate username length (3-15 chars)', () => {
      const validUsername = 'john_doe';
      const tooShort = 'ab';
      const tooLong = 'a'.repeat(16);

      expect(Guard.againstRange(3, 15, validUsername, 'username').isSuccess).toBe(true);
      expect(Guard.againstRange(3, 15, tooShort, 'username').isFailure).toBe(true);
      expect(Guard.againstRange(3, 15, tooLong, 'username').isFailure).toBe(true);
    });

    it('should validate bio text (max 500 chars)', () => {
      const shortBio = 'I love coding!';
      const longBio = 'a'.repeat(600);

      expect(Guard.againstAtMost(500, shortBio, 'bio').isSuccess).toBe(true);
      expect(Guard.againstAtMost(500, longBio, 'bio').isFailure).toBe(true);
    });

    it('should validate OTP code (exactly 6 digits)', () => {
      const validOTP = '123456';
      const shortOTP = '12345';
      const longOTP = '1234567';

      expect(Guard.againstRange(6, 6, validOTP, 'OTP').isSuccess).toBe(true);
      expect(Guard.againstRange(6, 6, shortOTP, 'OTP').isFailure).toBe(true);
      expect(Guard.againstRange(6, 6, longOTP, 'OTP').isFailure).toBe(true);
    });
  });
});