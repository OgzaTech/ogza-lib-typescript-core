import { Result } from '../Result';
import { CoreKeys } from '../../constants/CoreKeys';
import { LocalizationService } from '../../localization/LocalizationService';
import { en } from '../../localization/locales/en';

// Testler sırasında İngilizce dil dosyasını baz alıyoruz
LocalizationService.setLocaleData(en);

describe('Result Class', () => {

  describe('Success Scenarios', () => {
    it('should create a successful result with a value', () => {
      const result = Result.ok<string>('Operation Successful');
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe('Operation Successful');
      expect(result.error).toBeNull();
    });

    it('should create a successful result without a value (void)', () => {
      const result = Result.ok<void>();
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeUndefined();
    });
  });

  describe('Failure Scenarios', () => {
    it('should create a failed result with an error message', () => {
      const errorMsg = 'Database connection failed';
      const result = Result.fail<string>(errorMsg);
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(errorMsg);
    });

    it('should throw error when accessing value of a failed result', () => {
      const result = Result.fail('Failure');
      // Beklenen hata mesajını Localization servisinden alıyoruz (Hardcoded yazmıyoruz)
      const expectedError = LocalizationService.t(CoreKeys.RESULT.VALUE_ON_ERROR);
      expect(() => result.getValue()).toThrow(expectedError);
    });
  });

  describe('Invalid Usage (Constructor Guards)', () => {
    it('should throw if successful but has error', () => {
      const expectedError = LocalizationService.t(CoreKeys.RESULT.SUCCESS_WITH_ERROR);
      expect(() => {
        // @ts-ignore: Private constructor'a erişim testi
        new Result(true, "Error shouldn't be here", null);
      }).toThrow(expectedError);
    });

    it('should throw if failed but has no error', () => {
      const expectedError = LocalizationService.t(CoreKeys.RESULT.FAIL_WITHOUT_ERROR);
      expect(() => {
        // @ts-ignore: Private constructor'a erişim testi
        new Result(false, null, null);
      }).toThrow(expectedError);
    });
  });
});