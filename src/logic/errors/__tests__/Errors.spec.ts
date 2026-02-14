import { AppError } from '../../../application/AppError';
import { LocalizationService } from '../../../localization/LocalizationService';
import { en } from '../../../localization/locales/en';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ServiceUnavailableError,
  NotImplementedError,
} from '../index';

LocalizationService.setLocaleData(en);

describe('Error Handling Logic', () => {
  
  describe('Error Classes (Direct Instantiation)', () => {
    
    it('ValidationError should have correct properties', () => {
      const error = new ValidationError('Email is invalid', { field: 'email' });
      expect(error.message).toBe('Email is invalid');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'email' });
    });

    it('UnauthorizedError should have correct properties', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
      expect(error.code).toBe('UNAUTHORIZED_ERROR');
    });

    it('NotFoundError should have correct properties', () => {
      const error = new NotFoundError('User');
      expect(error.message).toContain('User');
      expect(error.code).toBe('NOT_FOUND_ERROR');
    });

    it('ForbiddenError should have correct properties', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.code).toBe('FORBIDDEN_ERROR');
    });

    it('ConflictError should have correct properties', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.code).toBe('CONFLICT_ERROR');
    });

    it('ServiceUnavailableError should have correct properties', () => {
      const error = new ServiceUnavailableError();
      expect(error.code).toBe('SERVICE_UNAVAILABLE_ERROR');
    });

    it('NotImplementedError should have correct properties', () => {
      const error = new NotImplementedError();
      expect(error.code).toBe('NOT_IMPLEMENTED_ERROR');
    });
  });

  describe('AppError Namespace (Factory Methods)', () => {
    
    beforeAll(() => {
      // console.error mockla
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('UnexpectedError.create should return Result with error object', () => {
      const result = AppError.UnexpectedError.create(new Error('Test error'));
      
      expect(result.isFailure).toBe(true);
      const error = result.getError();
      expect(error).toBeDefined();
      expect(error!.message).toBe('Test error');
      expect(error!.code).toBe('UNEXPECTED_ERROR');
    });

    it('ValidationFailure.create should return Result with error object', () => {
      const result = AppError.ValidationFailure.create('Bad Email');
      
      expect(result.isFailure).toBe(true);
      const error = result.getError();
      expect(error).toBeDefined();
      expect(error!.message).toBe('Bad Email');
      expect(error!.code).toBe('VALIDATION_ERROR');
    });

    it('Unauthorized.create should return failure', () => {
      const result = AppError.Unauthorized.create();
      expect(result.isFailure).toBe(true);
      expect(result.getError()!.code).toBe('UNAUTHORIZED_ERROR');
    });

    it('NotFound.create should return failure with resource', () => {
      const result = AppError.NotFound.create('User');
      
      expect(result.isFailure).toBe(true);
      const error = result.getError();
      expect(error).toBeDefined();
      expect(error!.resource).toBe('User');
      expect(error!.message).toContain('User');
    });
  });
});