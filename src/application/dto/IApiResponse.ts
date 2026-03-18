/**
 * Standardized API Response Interface
 * Tüm API endpoint'leri bu formatı kullanmalı
 */
export interface IApiResponse<T = any> {
  /**
   * Success flag
   */
  success: boolean;
  
  /**
   * Response code (business logic code)
   */
  code: string;
  
  /**
   * Human-readable message
   */
  message: string;
  
  /**
   * Response data (null if error)
   */
  data: T | null;
  
  /**
   * Error details (null if success)
   */
  errors: IApiError[] | null;
  
  /**
   * Response metadata
   */
  meta: IApiResponseMeta;
}

/**
 * API Error Detail
 */
export interface IApiError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Field name (for validation errors)
   */
  field?: string;
  
  /**
   * Additional context
   */
  details?: Record<string, any>;
}

/**
 * Response Metadata
 */
export interface IApiResponseMeta {
  /**
   * Response timestamp (ISO 8601)
   */
  timestamp: string;
  
  /**
   * Unique request ID
   */
  requestId: string;
  
  /**
   * API version (optional)
   */
  version?: string;
  
  /**
   * Pagination info (optional)
   */
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}