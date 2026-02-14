import { Result } from "../../logic/Result";

/**
 * Config Validator Interface
 * Environment variable'ları validate eder (Backend)
 * 
 * Uygulama başlarken çevre değişkenlerinin doğru olduğundan emin ol
 */

/**
 * Validation Rule
 */
export interface ValidationRule {
  /**
   * Zorunlu mu?
   */
  required?: boolean;
  
  /**
   * Tip kontrolü
   */
  type?: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'port';
  
  /**
   * Pattern (regex)
   */
  pattern?: RegExp;
  
  /**
   * Enum (allowed values)
   */
  enum?: string[];
  
  /**
   * Min değer (number için)
   */
  min?: number;
  
  /**
   * Max değer (number için)
   */
  max?: number;
  
  /**
   * Min uzunluk (string için)
   */
  minLength?: number;
  
  /**
   * Max uzunluk (string için)
   */
  maxLength?: number;
  
  /**
   * Default değer
   */
  default?: any;
  
  /**
   * Transform function (parse etmeden önce)
   */
  transform?: (value: string) => any;
  
  /**
   * Custom validator
   */
  validator?: (value: any) => boolean | string;
  
  /**
   * Açıklama (hata mesajlarında kullanılır)
   */
  description?: string;
}

/**
 * Config Schema
 */
export type ConfigSchema = Record<string, ValidationRule>;

/**
 * Validation Error
 */
export interface ConfigValidationError {
  field: string;
  value: any;
  message: string;
  rule?: string;
}

/**
 * Validation Result
 */
export interface ConfigValidationResult<T = any> {
  isValid: boolean;
  config?: T;
  errors: ConfigValidationError[];
}

/**
 * Config Validator Interface
 */
export interface IConfigValidator {
  /**
   * Config'i validate et
   */
  validate<T = any>(
    config: Record<string, any>,
    schema: ConfigSchema
  ): Result<T>;
  
  /**
   * Tek bir field validate et
   */
  validateField(
    fieldName: string,
    value: any,
    rule: ValidationRule
  ): Result<any>;
  
  /**
   * Environment variable'ları validate et
   */
  validateEnv<T = any>(
    schema: ConfigSchema,
    env?: Record<string, string | undefined>
  ): Result<T>;
}