import { Result } from "../../logic/Result";
import { IMiddleware, IMiddlewareContext, NextFunction } from "./IMiddleware";
import { ILogger } from "../ILogger";

/**
 * Logging Middleware
 */
export class LoggingMiddleware implements IMiddleware {
  public name = 'LoggingMiddleware';

  constructor(private logger: ILogger) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    const start = Date.now();
    
    this.logger.info('Request started', {
      request: context.request
    });

    // Next middleware
    const result = await next();

    const duration = Date.now() - start;
    
    if (result.isSuccess) {
      this.logger.info('Request completed', { duration });
    } else {
      this.logger.error('Request failed', { 
        error: result.error,
        duration 
      });
    }

    return result;
  }
}

/**
 * Authentication Middleware
 */
export class AuthenticationMiddleware implements IMiddleware {
  public name = 'AuthenticationMiddleware';

  constructor(private validateToken: (token: string) => Promise<any>) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    // Extract token from request (örnek)
    const token = (context.request as any).headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return Result.fail('No authentication token provided');
    }

    try {
      // Validate token
      const user = await this.validateToken(token);
      
      // Store user in context
      context.set('user', user);
      context.set('isAuthenticated', true);

      // Continue
      return next();
    } catch (error) {
      return Result.fail(`Authentication failed: ${error}`);
    }
  }
}

/**
 * Authorization Middleware
 */
export class AuthorizationMiddleware implements IMiddleware {
  public name = 'AuthorizationMiddleware';

  constructor(private requiredRoles: string[]) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    const user = context.get('user');

    if (!user) {
      return Result.fail('User not authenticated');
    }

    // Check roles
    const hasRequiredRole = this.requiredRoles.some(role => 
      user.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return Result.fail(`Insufficient permissions. Required roles: ${this.requiredRoles.join(', ')}`);
    }

    return next();
  }
}

/**
 * Rate Limiting Middleware
 */
export class RateLimitMiddleware implements IMiddleware {
  public name = 'RateLimitMiddleware';
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    // Get client identifier (IP, user ID vb.)
    const clientId = (context.request as any).ip || 'unknown';

    // Get request timestamps
    const now = Date.now();
    const timestamps = this.requests.get(clientId) || [];

    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check limit
    if (validTimestamps.length >= this.maxRequests) {
      return Result.fail('Rate limit exceeded. Please try again later.');
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(clientId, validTimestamps);

    return next();
  }
}

/**
 * Request Validation Middleware
 */
export class ValidationMiddleware<T = any> implements IMiddleware {
  public name = 'ValidationMiddleware';

  constructor(
    private validator: (data: any) => Result<T>
  ) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    const requestData = (context.request as any).body;

    // Validate
    const validationResult = this.validator(requestData);

    if (validationResult.isFailure) {
      return Result.fail(`Validation failed: ${validationResult.error}`);
    }

    // Store validated data
    context.set('validatedData', validationResult.getValue());

    return next();
  }
}

/**
 * Error Handling Middleware
 */
export class ErrorHandlingMiddleware implements IMiddleware {
  public name = 'ErrorHandlingMiddleware';

  constructor(private logger?: ILogger) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    try {
      const result = await next();

      if (result.isFailure) {
        // Log error
        this.logger?.error('Request failed', {
          error: result.error,
          request: context.request
        });

        // Set error response
        (context.response as any).error = result.error;
        (context.response as any).statusCode = 500;
      }

      return result;
    } catch (error) {
      // Catch unexpected errors
      this.logger?.error('Unexpected error', { error });
      
      (context.response as any).error = 'Internal server error';
      (context.response as any).statusCode = 500;

      return Result.fail(`Unexpected error: ${error}`);
    }
  }
}

/**
 * CORS Middleware
 */
export class CorsMiddleware implements IMiddleware {
  public name = 'CorsMiddleware';

  constructor(
    private allowedOrigins: string[] = ['*'],
    private allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE']
  ) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    const response = context.response as any;
    const request = context.request as any;

    // Set CORS headers
    const origin = request.headers?.origin;
    
    if (this.allowedOrigins.includes('*') || this.allowedOrigins.includes(origin)) {
      response.headers = response.headers || {};
      response.headers['Access-Control-Allow-Origin'] = origin || '*';
      response.headers['Access-Control-Allow-Methods'] = this.allowedMethods.join(', ');
      response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      return Result.ok();
    }

    return next();
  }
}

/**
 * Timeout Middleware
 */
export class TimeoutMiddleware implements IMiddleware {
  public name = 'TimeoutMiddleware';

  constructor(private timeoutMs: number = 30000) {}

  async execute(context: IMiddlewareContext, next: NextFunction): Promise<Result<void>> {
    const timeoutPromise = new Promise<Result<void>>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${this.timeoutMs}ms`));
      }, this.timeoutMs);
    });

    try {
      return await Promise.race([
        next(),
        timeoutPromise
      ]);
    } catch (error) {
      return Result.fail(`${error}`);
    }
  }
}