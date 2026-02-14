import { ApplicationError } from '../ApplicationError';
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError, 
  ConflictError, 
  ServiceUnavailableError, 
  NotImplementedError, 
  UnexpectedError 
} from '../index'; // index.ts'den çekiyoruz
import { AppError } from '../../../application/AppError';
import { Result } from '../../Result';

import { LocalizationService } from '../../../localization/LocalizationService';
import { en } from '../../../localization/locales/en';

LocalizationService.setLocaleData(en);

// 1. Abstract Class Testi İçin Concrete (Somut) Sınıf
class TestCustomError extends ApplicationError {
  constructor() {
    super("Test Message", "TEST_CODE", { foo: 'bar' });
  }
}

describe('Error Handling Logic', () => {

  describe('ApplicationError (Base Class)', () => {
    it('should correctly set properties when extended', () => {
      const error = new TestCustomError();
      
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test Message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.details).toEqual({ foo: 'bar' });
    });
  });

  describe('Specific Domain Errors', () => {
    
    it('ValidationError should store details', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = new ValidationError('Invalid Input', details);
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid Input');
      expect(error.details).toEqual(details);
    });

    it('ValidationError should use default message if not provided', () => {
      const error = new ValidationError();
      // CoreKeys'den gelen varsayılan mesajın dolu olduğunu kontrol etsek yeter
      expect(error.message).toBeTruthy(); 
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('NotFoundError should format message correctly', () => {
      const error = new NotFoundError('User');
      // Localization çevirisine göre "User not found" veya benzeri bir şey
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.message).toContain('User'); 
    });

    it('UnauthorizedError should have correct code', () => {
      const error = new UnauthorizedError();
      expect(error.code).toBe('UNAUTHORIZED_ERROR');
    });

    it('ForbiddenError should have correct code', () => {
      const error = new ForbiddenError();
      expect(error.code).toBe('FORBIDDEN_ERROR');
    });

    it('ConflictError should have correct code', () => {
      const error = new ConflictError();
      expect(error.code).toBe('CONFLICT_ERROR');
    });

    it('ServiceUnavailableError should have correct code', () => {
      const error = new ServiceUnavailableError();
      expect(error.code).toBe('SERVICE_UNAVAILABLE_ERROR');
    });

    it('NotImplementedError should have correct code', () => {
      const error = new NotImplementedError();
      expect(error.code).toBe('NOT_IMPLEMENTED_ERROR');
    });

    it('UnexpectedError should handle details', () => {
      const error = new UnexpectedError('Boom', { stack: 'trace' });
      expect(error.code).toBe('UNEXPECTED_ERROR');
      expect(error.details).toEqual({ stack: 'trace' });
    });
  });

  describe('AppError Namespace (Factory Methods)', () => {
    
    it('UnexpectedError.create should return a failure Result', () => {
      // Konsol kirlenmesin diye console.error'u mocklayalım
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = AppError.UnexpectedError.create(new Error('System crash'));
      
      expect(result).toBeInstanceOf(Result);
      expect(result.isFailure).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('ValidationFailure.create should return failure with message', () => {
      const result = AppError.ValidationFailure.create('Bad Email');
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Bad Email');
    });

    it('Unauthorized.create should return failure', () => {
      const result = AppError.Unauthorized.create();
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeTruthy();
    });
    
    // Eğer NotFound factory eklediysek:
    if (AppError.NotFound) {
        it('NotFound.create should return failure', () => {
            const result = AppError.NotFound.create('User');
            expect(result.isFailure).toBe(true);
            expect(result.error).toContain('User');
        });
    }
  });
});