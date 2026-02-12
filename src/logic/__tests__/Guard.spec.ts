import { Guard } from '../Guard';
import { LocalizationService } from '../../localization/LocalizationService';
import { CoreKeys } from '../../constants/CoreKeys';
import { en } from '../../localization/locales/en';

// Test ortamını İngilizce olarak sabitliyoruz
LocalizationService.setLocaleData(en);

describe('Guard Class', () => {
  
  // 1. againstNullOrUndefined Testleri
  describe('againstNullOrUndefined', () => {
    it('should fail when value is null', () => {
      const result = Guard.againstNullOrUndefined(null, 'field');
      const expectedMsg = LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: 'field' });
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(expectedMsg);
    });

    it('should fail when value is undefined', () => {
      const result = Guard.againstNullOrUndefined(undefined, 'field');
      expect(result.isFailure).toBe(true);
    });

    it('should succeed when value is valid (including falsy values like 0)', () => {
      const result = Guard.againstNullOrUndefined(0, 'field');
      expect(result.isSuccess).toBe(true);
    });
    
    it('should succeed when value is boolean false', () => {
      const result = Guard.againstNullOrUndefined(false, 'field');
      expect(result.isSuccess).toBe(true);
    });
  });

  // 2. againstNullOrUndefinedBulk Testleri
  describe('againstNullOrUndefinedBulk', () => {
    it('should succeed if list is empty', () => {
      // Boş liste geçerlidir, hata yok demektir
      const result = Guard.againstNullOrUndefinedBulk([]);
      expect(result.isSuccess).toBe(true);
    });

    it('should succeed if all arguments are valid', () => {
      const args = [
        { argument: 'valid', argumentName: 'a' },
        { argument: 123, argumentName: 'b' }
      ];
      const result = Guard.againstNullOrUndefinedBulk(args);
      expect(result.isSuccess).toBe(true);
    });

    it('should fail if any argument is null', () => {
      const args = [
        { argument: 'valid', argumentName: 'a' },
        { argument: null, argumentName: 'b' }, // Hata burada
        { argument: 'valid', argumentName: 'c' }
      ];
      const result = Guard.againstNullOrUndefinedBulk(args);
      const expectedMsg = LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: 'b' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(expectedMsg);
    });
  });

  // 3. againstEmptyString Testleri
  describe('againstEmptyString', () => {
    it('should fail if string is empty', () => {
      const result = Guard.againstEmptyString('', 'username');
      const expectedMsg = LocalizationService.t(CoreKeys.GUARD.EMPTY_STRING, { name: 'username' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(expectedMsg);
    });

    it('should fail if string is only spaces (trim check)', () => {
      const result = Guard.againstEmptyString('   ', 'username');
      const expectedMsg = LocalizationService.t(CoreKeys.GUARD.EMPTY_STRING, { name: 'username' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(expectedMsg);
    });

    // KRİTİK TEST: Internal Null Check Coverage
    // againstEmptyString içinde çağrılan againstNullOrUndefined metodunun tetiklendiğini doğrular.
    it('should fail if value is null (via internal check)', () => {
      const result = Guard.againstEmptyString(null, 'username');
      const expectedMsg = LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: 'username' });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(expectedMsg);
    });
    
    it('should fail if value is undefined (via internal check)', () => {
      const result = Guard.againstEmptyString(undefined, 'username');
      expect(result.isFailure).toBe(true);
    });

    it('should succeed if string is valid', () => {
      const result = Guard.againstEmptyString('ValidUser', 'username');
      expect(result.isSuccess).toBe(true);
    });
  });
});