import { Result } from "../../logic/Result";

/**
 * Form Validator Interface
 * Frontend form validasyonu için (Vue, React, Angular)
 */

/**
 * Validation Rule Function
 */
export type ValidationRuleFn<T = any> = (value: T, formData?: any) => boolean | string | Promise<boolean | string>;

/**
 * Field Validation Rule
 */
export interface FieldRule<T = any> {
  /**
   * Rule adı (hata mesajlarında kullanılır)
   */
  name?: string;
  
  /**
   * Validation fonksiyonu
   * true = geçerli
   * false = geçersiz
   * string = geçersiz + hata mesajı
   */
  validator: ValidationRuleFn<T>;
  
  /**
   * Hata mesajı (validator false dönerse kullanılır)
   */
  message?: string;
  
  /**
   * Trigger (ne zaman validate edilsin)
   */
  trigger?: 'blur' | 'change' | 'submit';
}

/**
 * Field Schema
 */
export interface FieldSchema<T = any> {
  /**
   * Field label (hata mesajlarında kullanılır)
   */
  label?: string;
  
  /**
   * Validation rules
   */
  rules: FieldRule<T>[];
  
  /**
   * Başlangıç değeri
   */
  initialValue?: T;
}

/**
 * Form Schema
 */
export type FormSchema = Record<string, FieldSchema>;

/**
 * Field Error
 */
export interface FieldError {
  field: string;
  message: string;
  rule?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  firstError?: FieldError;
}

/**
 * Form Validator Interface
 */
export interface IFormValidator {
  /**
   * Tüm formu validate et
   */
  validate(formData: Record<string, any>, schema: FormSchema): Promise<Result<boolean>>;
  
  /**
   * Tek bir field validate et
   */
  validateField(
    fieldName: string,
    value: any,
    rules: FieldRule[],
    formData?: Record<string, any>
  ): Promise<Result<boolean>>;
  
  /**
   * Validation hatalarını al
   */
  getErrors(): Record<string, string[]>;
  
  /**
   * Tek bir field'in hatalarını al
   */
  getFieldErrors(fieldName: string): string[];
  
  /**
   * İlk hatayı al
   */
  getFirstError(): FieldError | null;
  
  /**
   * Hataları temizle
   */
  clearErrors(fieldName?: string): void;
  
  /**
   * Form valid mi?
   */
  isValid(): boolean;
}