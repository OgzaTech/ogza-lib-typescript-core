import { Result } from "../../logic/Result";
import { IApiResponse, IApiError, IApiResponseMeta } from "./IApiResponse";

/**
 * API Response Builder
 * Fluent API ile standardize response oluşturma
 */
export class ApiResponse {
  
  /**
   * Create success response
   */
  static success<T>(
    data: T,
    message: string = 'Operation successful',
    code: string = 'SUCCESS'
  ): IApiResponse<T> {
    return {
      success: true,
      code,
      message,
      data,
      errors: null,
      meta: this.createMeta()
    };
  }

  /**
   * Create error response
   */
  static error(
    message: string,
    code: string = 'ERROR',
    errors?: IApiError[]
  ): IApiResponse<null> {
    return {
      success: false,
      code,
      message,
      data: null,
      errors: errors || [{
        code,
        message
      }],
      meta: this.createMeta()
    };
  }

  /**
   * Create validation error response
   */
  static validationError(
    errors: IApiError[],
    message: string = 'Validation failed'
  ): IApiResponse<null> {
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      message,
      data: null,
      errors,
      meta: this.createMeta()
    };
  }

  /**
   * Create from Result monad
   */
  static fromResult<T>(
    result: Result<T>,
    successMessage?: string,
    successCode?: string,
    errorCode?: string
  ): IApiResponse<T | null> {
    if (result.isSuccess) {
      return this.success(
        result.getValue()!,
        successMessage || 'Operation successful',
        successCode || 'SUCCESS'
      );
    } else {
      return this.error(
        result.error!,
        errorCode || 'ERROR'
      );
    }
  }

  /**
   * Create paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully',
    code: string = 'SUCCESS'
  ): IApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      code,
      message,
      data,
      errors: null,
      meta: {
        ...this.createMeta(),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    };
  }

  /**
   * Create not found response
   */
  static notFound(
    resource: string = 'Resource'
  ): IApiResponse<null> {
    return {
      success: false,
      code: 'NOT_FOUND',
      message: `${resource} not found`,
      data: null,
      errors: [{
        code: 'NOT_FOUND',
        message: `${resource} not found`
      }],
      meta: this.createMeta()
    };
  }

  /**
   * Create unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized access'
  ): IApiResponse<null> {
    return {
      success: false,
      code: 'UNAUTHORIZED',
      message,
      data: null,
      errors: [{
        code: 'UNAUTHORIZED',
        message
      }],
      meta: this.createMeta()
    };
  }

  /**
   * Create forbidden response
   */
  static forbidden(
    message: string = 'Forbidden access'
  ): IApiResponse<null> {
    return {
      success: false,
      code: 'FORBIDDEN',
      message,
      data: null,
      errors: [{
        code: 'FORBIDDEN',
        message
      }],
      meta: this.createMeta()
    };
  }

  /**
   * Create created response (201)
   */
  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
    code: string = 'CREATED'
  ): IApiResponse<T> {
    return this.success(data, message, code);
  }

  /**
   * Create no content response (204)
   */
  static noContent(
    message: string = 'Operation completed successfully'
  ): IApiResponse<null> {
    return {
      success: true,
      code: 'NO_CONTENT',
      message,
      data: null,
      errors: null,
      meta: this.createMeta()
    };
  }

  /**
   * Create metadata
   */
  private static createMeta(requestId?: string): IApiResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateRequestId()
    };
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set request ID (from middleware)
   */
  static withRequestId<T>(
    response: IApiResponse<T>,
    requestId: string
  ): IApiResponse<T> {
    return {
      ...response,
      meta: {
        ...response.meta,
        requestId
      }
    };
  }

  /**
   * Set API version
   */
  static withVersion<T>(
    response: IApiResponse<T>,
    version: string
  ): IApiResponse<T> {
    return {
      ...response,
      meta: {
        ...response.meta,
        version
      }
    };
  }
}