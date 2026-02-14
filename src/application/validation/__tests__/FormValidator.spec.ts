import { FormValidator } from '../FormValidator';
import { FormSchema } from '../IFormValidator';
import { 
  required, 
  email, 
  minLength, 
  maxLength,
  confirmed,
  custom,
  pattern
} from '../ValidationRules';

describe('FormValidator', () => {
  let validator: FormValidator;

  beforeEach(() => {
    validator = new FormValidator();
  });

  describe('Single Field Validation', () => {
    it('should validate required field', async () => {
      const result = await validator.validateField(
        'username',
        '',
        [required()]
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('required');
    });

    it('should pass required validation with value', async () => {
      const result = await validator.validateField(
        'username',
        'john',
        [required()]
      );

      expect(result.isSuccess).toBe(true);
    });

    it('should validate email format', async () => {
      const invalidResult = await validator.validateField(
        'email',
        'invalid-email',
        [email()]
      );

      expect(invalidResult.isFailure).toBe(true);

      const validResult = await validator.validateField(
        'email',
        'test@example.com',
        [email()]
      );

      expect(validResult.isSuccess).toBe(true);
    });

    it('should validate minimum length', async () => {
      const result = await validator.validateField(
        'password',
        '123',
        [minLength(8)]
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('8');
    });

    it('should validate maximum length', async () => {
      const result = await validator.validateField(
        'bio',
        'a'.repeat(300),
        [maxLength(250)]
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('250');
    });
  });

  describe('Multiple Rules', () => {
    it('should validate multiple rules in sequence', async () => {
      const result = await validator.validateField(
        'email',
        'test@example.com',
        [required(), email()]
      );

      expect(result.isSuccess).toBe(true);
    });

    it('should fail on first validation error', async () => {
      const result = await validator.validateField(
        'email',
        '',
        [required('Email is required'), email()]
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Email is required');
    });

    it('should collect all field errors', async () => {
      await validator.validateField(
        'password',
        '123',
        [
          required(),
          minLength(8, 'Too short'),
          pattern(/[A-Z]/, 'Need uppercase')
        ]
      );

      const errors = validator.getFieldErrors('password');
      expect(errors).toHaveLength(2); // minLength & pattern fail
      expect(errors[0]).toContain('Too short');
      expect(errors[1]).toContain('Need uppercase');
    });
  });

  describe('Form Validation', () => {
    it('should validate entire form', async () => {
      const schema: FormSchema = {
        username: {
          rules: [required(), minLength(3)]
        },
        email: {
          rules: [required(), email()]
        },
        password: {
          rules: [required(), minLength(8)]
        }
      };

      const formData = {
        username: 'john',
        email: 'john@example.com',
        password: 'password123'
      };

      const result = await validator.validate(formData, schema);

      expect(result.isSuccess).toBe(true);
      expect(validator.isValid()).toBe(true);
    });

    it('should fail form validation with multiple errors', async () => {
      const schema: FormSchema = {
        username: {
          rules: [required(), minLength(3)]
        },
        email: {
          rules: [required(), email()]
        }
      };

      const formData = {
        username: 'ab', // Too short
        email: 'invalid' // Invalid email
      };

      const result = await validator.validate(formData, schema);

      expect(result.isFailure).toBe(true);
      expect(validator.isValid()).toBe(false);

      const errors = validator.getErrors();
      expect(errors.username).toBeDefined();
      expect(errors.email).toBeDefined();
    });

    it('should validate only defined fields in schema', async () => {
      const schema: FormSchema = {
        username: {
          rules: [required()]
        }
      };

      const formData = {
        username: 'john',
        extraField: 'ignored'
      };

      const result = await validator.validate(formData, schema);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Error Management', () => {
    it('should get field errors', async () => {
      await validator.validateField(
        'email',
        'invalid',
        [email('Invalid email format')]
      );

      const errors = validator.getFieldErrors('email');

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Invalid email format');
    });

    it('should return empty array for field with no errors', () => {
      const errors = validator.getFieldErrors('nonexistent');
      expect(errors).toEqual([]);
    });

    it('should get first error across all fields', async () => {
      const schema: FormSchema = {
        username: {
          rules: [required('Username required')]
        },
        email: {
          rules: [required('Email required')]
        }
      };

      await validator.validate({ username: '', email: '' }, schema);

      const firstError = validator.getFirstError();

      expect(firstError).not.toBeNull();
      expect(firstError!.field).toBeDefined();
      expect(firstError!.message).toBeDefined();
    });

    it('should clear field errors', async () => {
      await validator.validateField('email', 'invalid', [email()]);

      expect(validator.getFieldErrors('email')).toHaveLength(1);

      validator.clearErrors('email');

      expect(validator.getFieldErrors('email')).toEqual([]);
    });

    it('should clear all errors', async () => {
      const schema: FormSchema = {
        field1: { rules: [required()] },
        field2: { rules: [required()] }
      };

      await validator.validate({ field1: '', field2: '' }, schema);

      expect(validator.isValid()).toBe(false);

      validator.clearErrors();

      expect(validator.isValid()).toBe(true);
      expect(validator.getErrors()).toEqual({});
    });
  });

  describe('Confirmed Validation', () => {
    it('should validate password confirmation', async () => {
      const formData = {
        password: 'secret123',
        confirmPassword: 'secret123'
      };

      const result = await validator.validateField(
        'confirmPassword',
        formData.confirmPassword,
        [confirmed('password')],
        formData
      );

      expect(result.isSuccess).toBe(true);
    });

    it('should fail when passwords do not match', async () => {
      const formData = {
        password: 'secret123',
        confirmPassword: 'different'
      };

      const result = await validator.validateField(
        'confirmPassword',
        formData.confirmPassword,
        [confirmed('password', 'Passwords must match')],
        formData
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Passwords must match');
    });
  });

  describe('Custom Validators', () => {
    it('should use custom validation function', async () => {
      const isEven = custom(
        (value) => {
          return Number(value) % 2 === 0;
        },
        'Must be even number'
      );

      const validResult = await validator.validateField('number', 4, [isEven]);
      expect(validResult.isSuccess).toBe(true);

      const invalidResult = await validator.validateField('number', 5, [isEven]);
      expect(invalidResult.isFailure).toBe(true);
    });

    it('should support custom error messages from validator', async () => {
      const rule = custom((value) => {
        if (value === 'admin') {
          return 'Username "admin" is reserved';
        }
        return true;
      });

      const result = await validator.validateField('username', 'admin', [rule]);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Username "admin" is reserved');
    });
  });

  describe('Async Validation', () => {
    it('should handle async validation rules', async () => {
      const asyncRule = {
        name: 'asyncUnique',
        validator: async (value: any) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return value !== 'taken@example.com';
        },
        message: 'Email already taken'
      };

      const validResult = await validator.validateField(
        'email',
        'new@example.com',
        [asyncRule]
      );
      expect(validResult.isSuccess).toBe(true);

      const invalidResult = await validator.validateField(
        'email',
        'taken@example.com',
        [asyncRule]
      );
      expect(invalidResult.isFailure).toBe(true);
      expect(invalidResult.error).toBe('Email already taken');
    });
  });

  describe('Integration Scenarios', () => {
    it('should validate registration form', async () => {
      const schema: FormSchema = {
        username: {
          label: 'Username',
          rules: [
            required('Username is required'),
            minLength(3, 'Username must be at least 3 characters'),
            maxLength(20, 'Username must not exceed 20 characters')
          ]
        },
        email: {
          label: 'Email',
          rules: [
            required('Email is required'),
            email('Invalid email format')
          ]
        },
        password: {
          label: 'Password',
          rules: [
            required('Password is required'),
            minLength(8, 'Password must be at least 8 characters')
          ]
        },
        confirmPassword: {
          label: 'Confirm Password',
          rules: [
            required('Please confirm your password'),
            confirmed('password', 'Passwords do not match')
          ]
        }
      };

      const validData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123'
      };

      const validResult = await validator.validate(validData, schema);
      expect(validResult.isSuccess).toBe(true);

      const invalidData = {
        username: 'jo', // Too short
        email: 'invalid-email', // Invalid format
        password: '123', // Too short
        confirmPassword: '456' // Doesn't match
      };

      const invalidResult = await validator.validate(invalidData, schema);
      expect(invalidResult.isFailure).toBe(true);

      const errors = validator.getErrors();
      expect(Object.keys(errors)).toHaveLength(4); // All fields have errors
    });

    it('should support incremental validation', async () => {
      const schema: FormSchema = {
        email: {
          rules: [required(), email()]
        },
        password: {
          rules: [required(), minLength(8)]
        }
      };

      // Validate fields one by one (like on blur)
      await validator.validateField('email', '', schema.email.rules);
      expect(validator.getFieldErrors('email')).toHaveLength(1);

      await validator.validateField('email', 'test@example.com', schema.email.rules);
      expect(validator.getFieldErrors('email')).toHaveLength(0);

      await validator.validateField('password', '123', schema.password.rules);
      expect(validator.getFieldErrors('password')).toHaveLength(1);
    });
  });
});