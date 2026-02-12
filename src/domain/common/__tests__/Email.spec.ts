import { Email } from '../Email';
import { LocalizationService } from '../../../localization/LocalizationService';
import { en } from '../../../localization/locales/en';
import { tr } from '../../../localization/locales/tr';
import { CoreKeys } from '../../../constants/CoreKeys';

describe('Email ValueObject', () => {
  
  it('should return failure with localized message for invalid email', () => {
    // Türkçe test edelim
    LocalizationService.setLocaleData(tr);
    
    const result = Email.create('invalid-email');
    const expectedMsg = LocalizationService.t(CoreKeys.VALIDATION.INVALID_EMAIL);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Geçersiz e-posta formatı.");
  });

  it('should create email successfully for valid format', () => {
    const validEmail = 'test@example.com';
    const result = Email.create(validEmail);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().getValue()).toBe(validEmail);
  });
});