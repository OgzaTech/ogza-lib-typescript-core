import { Result } from "../logic/Result";

/**
 * Yapılandırılmış hata nesnesi
 */
export interface StructuredError {
  message: string;
  code?: string;
  details?: any;
  originalError?: unknown;
}

export namespace AppError {
  
  /**
   * Beklenmeyen hatalar için
   */
  export class UnexpectedError implements StructuredError {
    public readonly message: string;
    public readonly code: string = "UNEXPECTED_ERROR";
    public readonly originalError: unknown;
    public readonly details?: any;

    private constructor(err: unknown, details?: any) {
      this.originalError = err;
      this.details = details;
      
      // Hata mesajını güvenli şekilde çıkar
      if (err instanceof Error) {
        this.message = err.message;
      } else if (typeof err === 'string') {
        this.message = err;
      } else {
        this.message = "An unexpected error occurred.";
      }
    }

    public static create(err: unknown, details?: any): Result<never, UnexpectedError> {
      const error = new UnexpectedError(err, details);
      console.error('[UnexpectedError]', {
        message: error.message,
        code: error.code,
        originalError: error.originalError,
        stack: err instanceof Error ? err.stack : undefined
      });
      return Result.fail<never, UnexpectedError>(error);
    }

    public toString(): string {
      return `[${this.code}] ${this.message}`;
    }
  }

  /**
   * Validasyon hataları için
   */
  export class ValidationFailure implements StructuredError {
    public readonly message: string;
    public readonly code: string = "VALIDATION_ERROR";
    public readonly details?: any;

    private constructor(message?: string, details?: any) {
      this.message = message || "Validation failed.";
      this.details = details;
    }

    public static create(message?: string, details?: any): Result<never, ValidationFailure> {
      return Result.fail<never, ValidationFailure>(new ValidationFailure(message, details));
    }

    public toString(): string {
      return `[${this.code}] ${this.message}`;
    }
  }

  /**
   * Yetkilendirme hataları için
   */
  export class Unauthorized implements StructuredError {
    public readonly message: string;
    public readonly code: string = "UNAUTHORIZED_ERROR";

    private constructor(message?: string) {
      this.message = message || "Authentication required.";
    }

    public static create(message?: string): Result<never, Unauthorized> {
      return Result.fail<never, Unauthorized>(new Unauthorized(message));
    }

    public toString(): string {
      return `[${this.code}] ${this.message}`;
    }
  }

  /**
   * Not found hataları için
   */
  export class NotFound implements StructuredError {
    public readonly message: string;
    public readonly code: string = "NOT_FOUND_ERROR";
    public readonly resource: string;

    private constructor(resource: string) {
      this.resource = resource;
      this.message = `${resource} not found.`;
    }

    public static create(resource: string): Result<never, NotFound> {
      return Result.fail<never, NotFound>(new NotFound(resource));
    }

    public toString(): string {
      return `[${this.code}] ${this.message}`;
    }
  }
  export class InvalidOperation implements StructuredError {
    public readonly message: string;
    public readonly code: string = 'INVALID_OPERATION';
    public readonly details?: any;

    private constructor(message: string, details?: any) {
      this.message = message;
      this.details = details;
    }

    public static create(message: string, details?: any): Result<never, InvalidOperation> {
      return Result.fail<never, InvalidOperation>(new InvalidOperation(message, details));
    }

    public toString(): string {
      return `[${this.code}] ${this.message}`;
    }
  }

  export class Forbidden implements StructuredError {
    public readonly message: string;
    public readonly code: string = 'FORBIDDEN';
    public readonly details?: any;

    private constructor(message: string, details?: any) {
      this.message = message;
      this.details = details;
    }

    public static create(message: string, details?: any): Result<never, Forbidden> {
      return Result.fail<never, Forbidden>(new Forbidden(message, details));
    }

    public toString(): string {
      return `[${this.code}] ${this.message}`;
    }
  }

}