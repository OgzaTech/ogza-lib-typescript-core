import { Email } from '../Email';
import { LocalizationService } from '../../../localization/LocalizationService';
import { en } from '../../../localization/locales/en';
import { tr } from '../../../localization/locales/tr';
import { CoreKeys } from '../../../constants/CoreKeys';

LocalizationService.setLocaleData(en);

describe('Email ValueObject', () => {

  describe('Valid Email Creation', () => {
    it('should create email with valid format', () => {
      const result = Email.create('test@example.com');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('TEST@EXAMPLE.COM');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const result = Email.create('  test@example.com  ');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('test@example.com');
    });

    it('should accept email with subdomain', () => {
      const result = Email.create('user@mail.example.com');
      expect(result.isSuccess).toBe(true);
    });

    it('should accept email with plus sign', () => {
      const result = Email.create('user+tag@example.com');
      expect(result.isSuccess).toBe(true);
    });

    it('should accept email with numbers', () => {
      const result = Email.create('user123@example.com');
      expect(result.isSuccess).toBe(true);
    });

    it('should accept email with dash and underscore', () => {
      const result = Email.create('user-name_test@example.com');
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Invalid Email Rejection', () => {
    it('should fail when email is null', () => {
      const result = Email.create(null as any);
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('null or undefined');
    });

    it('should fail when email is undefined', () => {
      const result = Email.create(undefined as any);
      expect(result.isFailure).toBe(true);
    });

    it('should fail when email has no @ symbol', () => {
      const result = Email.create('invalidemail.com');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid email');
    });

    it('should fail when email has no domain', () => {
      const result = Email.create('user@');
      expect(result.isFailure).toBe(true);
    });

    it('should fail when email has no local part', () => {
      const result = Email.create('@example.com');
      expect(result.isFailure).toBe(true);
    });

    it('should fail when email has spaces', () => {
      const result = Email.create('test user@example.com');
      expect(result.isFailure).toBe(true);
    });

    it('should fail when email has multiple @ symbols', () => {
      const result = Email.create('test@@example.com');
      expect(result.isFailure).toBe(true);
    });

    it('should fail when domain has no TLD', () => {
      const result = Email.create('test@example');
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Value Object Equality', () => {
    it('should be equal if emails are same', () => {
      const email1 = Email.create('test@example.com').getValue();
      const email2 = Email.create('test@example.com').getValue();
      expect(email1.equals(email2)).toBe(true);
    });

    it('should be equal after normalization', () => {
      const email1 = Email.create('TEST@EXAMPLE.COM').getValue();
      const email2 = Email.create('  test@example.com  ').getValue();
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal if emails differ', () => {
      const email1 = Email.create('test1@example.com').getValue();
      const email2 = Email.create('test2@example.com').getValue();
      expect(email1.equals(email2)).toBe(false);
    });
  });
});