import { AppError } from '../AppError';

describe('AppError', () => {

  beforeAll(() => {
    // console.error mockla (testlerde gürültü yapmasın)
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('UnexpectedError', () => {
    it('should create from Error instance', () => {
      const originalError = new Error('Something went wrong');
      const result = AppError.UnexpectedError.create(originalError);

      expect(result.isFailure).toBe(true);
      const error = result.getError()!;
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('UNEXPECTED_ERROR');
      expect(error.originalError).toBe(originalError);
    });

    it('should create from string', () => {
      const result = AppError.UnexpectedError.create('Simple error');

      expect(result.isFailure).toBe(true);
      const error = result.getError()!;
      expect(error.message).toBe('Simple error');
      expect(error.originalError).toBe('Simple error');
    });

    it('should create from unknown error type', () => {
      const weirdError = { custom: 'data' };
      const result = AppError.UnexpectedError.create(weirdError);

      expect(result.isFailure).toBe(true);
      const error = result.getError()!;
      expect(error.message).toBe('An unexpected error occurred.');
      expect(error.originalError).toBe(weirdError);
    });

    it('should include details if provided', () => {
      const details = { userId: 123, action: 'updateProfile' };
      const result = AppError.UnexpectedError.create(new Error('Failed'), details);

      const error = result.getError()!;
      expect(error.details).toEqual(details);
    });

    it('should preserve stack trace from Error', () => {
      const originalError = new Error('Test error');
      const result = AppError.UnexpectedError.create(originalError);

      expect(console.error).toHaveBeenCalledWith(
        '[UnexpectedError]',
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });

    it('should have toString representation', () => {
      const result = AppError.UnexpectedError.create(new Error('Test'));
      const error = result.getError()!;
      
      expect(error.toString()).toBe('[UNEXPECTED_ERROR] Test');
    });
  });

  describe('ValidationFailure', () => {
    it('should create with default message', () => {
      const result = AppError.ValidationFailure.create();

      expect(result.isFailure).toBe(true);
      const error = result.getError()!;
      expect(error.message).toBe('Validation failed.');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create with custom message', () => {
      const result = AppError.ValidationFailure.create('Email is invalid');

      const error = result.getError()!;
      expect(error.message).toBe('Email is invalid');
    });

    it('should include validation details', () => {
      const details = {
        email: 'Invalid format',
        password: 'Too short'
      };
      const result = AppError.ValidationFailure.create('Multiple errors', details);

      const error = result.getError()!;
      expect(error.details).toEqual(details);
    });

    it('should have toString representation', () => {
      const result = AppError.ValidationFailure.create('Invalid input');
      const error = result.getError()!;
      
      expect(error.toString()).toBe('[VALIDATION_ERROR] Invalid input');
    });
  });

  describe('Unauthorized', () => {
    it('should create with default message', () => {
      const result = AppError.Unauthorized.create();

      expect(result.isFailure).toBe(true);
      const error = result.getError()!;
      expect(error.message).toBe('Authentication required.');
      expect(error.code).toBe('UNAUTHORIZED_ERROR');
    });

    it('should create with custom message', () => {
      const result = AppError.Unauthorized.create('Invalid credentials');

      const error = result.getError()!;
      expect(error.message).toBe('Invalid credentials');
    });

    it('should have toString representation', () => {
      const result = AppError.Unauthorized.create('Token expired');
      const error = result.getError()!;
      
      expect(error.toString()).toBe('[UNAUTHORIZED_ERROR] Token expired');
    });
  });

  describe('NotFound', () => {
    it('should create with resource name', () => {
      const result = AppError.NotFound.create('User');

      expect(result.isFailure).toBe(true);
      const error = result.getError()!;
      expect(error.message).toBe('User not found.');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.resource).toBe('User');
    });

    it('should work with different resource types', () => {
      const resources = ['Product', 'Order', 'Invoice'];

      resources.forEach(resource => {
        const result = AppError.NotFound.create(resource);
        const error = result.getError()!;
        expect(error.message).toBe(`${resource} not found.`);
        expect(error.resource).toBe(resource);
      });
    });

    it('should have toString representation', () => {
      const result = AppError.NotFound.create('Product');
      const error = result.getError()!;
      
      expect(error.toString()).toBe('[NOT_FOUND_ERROR] Product not found.');
    });
  });

  describe('Result Integration', () => {
    it('should work with Result type system', () => {
      const result = AppError.UnexpectedError.create(new Error('Test'));

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(() => result.getValue()).toThrow();
    });

    it('should preserve error type in Result', () => {
      const result = AppError.ValidationFailure.create('Invalid', { field: 'email' });
      const error = result.getError();

      expect(error).toBeDefined();
      expect(error!.code).toBe('VALIDATION_ERROR');
      expect(error!.details).toEqual({ field: 'email' });
    });
  });

  describe('Real-world Usage', () => {
    it('should handle API error gracefully', () => {
      const apiError = new Error('Network timeout');
      const result = AppError.UnexpectedError.create(apiError, {
        endpoint: '/api/users',
        method: 'POST'
      });

      const error = result.getError()!;
      expect(error.message).toBe('Network timeout');
      expect(error.details.endpoint).toBe('/api/users');
      expect(error.originalError).toBe(apiError);
    });

    it('should handle validation errors in form', () => {
      const validationErrors = {
        email: 'Invalid format',
        password: 'Must be at least 8 characters',
        confirmPassword: 'Passwords do not match'
      };

      const result = AppError.ValidationFailure.create(
        'Form validation failed',
        validationErrors
      );

      const error = result.getError()!;
      expect(error.details).toEqual(validationErrors);
    });

    it('should handle resource not found in repository', () => {
      const userId = '123';
      const result = AppError.NotFound.create('User');

      const error = result.getError()!;
      expect(error.resource).toBe('User');
      expect(error.message).toContain('User not found');
    });
  });
});