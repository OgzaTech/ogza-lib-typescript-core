import { Result } from "../logic/Result";
import { ValidationError, UnauthorizedError, NotFoundError } from "../logic/errors";

export namespace AppError {
  
  export class UnexpectedError {
    public static create(err: any): Result<any> {
      console.error(err);
      return Result.fail("An unexpected error occurred.");
    }
  }

  export class ValidationFailure {
    public static create(message?: string, details?: any): Result<any> {
      // Errors.ValidationError yerine direkt ValidationError kullanıyoruz
      return Result.fail(new ValidationError(message, details).message);
    }
  }

  export class Unauthorized {
    public static create(message?: string): Result<any> {
      return Result.fail(new UnauthorizedError(message).message);
    }
  }

  // İstersen NotFound için de ekleyebilirsin
  export class NotFound {
    public static create(resource: string): Result<any> {
      return Result.fail(new NotFoundError(resource).message);
    }
  }

}