import { FieldRule } from "./IFormValidator";
import { RegexPatterns } from "../../constants/RegexPatterns";

/**
 * Predefined Validation Rules
 * Sık kullanılan validation kuralları
 */

/**
 * Required field
 */
export const required = (message?: string): FieldRule => ({
  name: 'required',
  message: message || 'This field is required',
  validator: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }
});

/**
 * Email validation
 */
export const email = (message?: string): FieldRule => ({
  name: 'email',
  message: message || 'Invalid email address',
  validator: (value) => {
    if (!value) return true; // Optional validation
    return RegexPatterns.EMAIL.test(String(value));
  }
});

/**
 * Min length
 */
export const minLength = (min: number, message?: string): FieldRule => ({
  name: 'minLength',
  message: message || `Minimum ${min} characters required`,
  validator: (value) => {
    if (!value) return true;
    return String(value).length >= min;
  }
});

/**
 * Max length
 */
export const maxLength = (max: number, message?: string): FieldRule => ({
  name: 'maxLength',
  message: message || `Maximum ${max} characters allowed`,
  validator: (value) => {
    if (!value) return true;
    return String(value).length <= max;
  }
});

/**
 * Min value (number)
 */
export const min = (minValue: number, message?: string): FieldRule => ({
  name: 'min',
  message: message || `Minimum value is ${minValue}`,
  validator: (value) => {
    if (value === null || value === undefined) return true;
    return Number(value) >= minValue;
  }
});

/**
 * Max value (number)
 */
export const max = (maxValue: number, message?: string): FieldRule => ({
  name: 'max',
  message: message || `Maximum value is ${maxValue}`,
  validator: (value) => {
    if (value === null || value === undefined) return true;
    return Number(value) <= maxValue;
  }
});

/**
 * Pattern (regex)
 */
export const pattern = (regex: RegExp, message?: string): FieldRule => ({
  name: 'pattern',
  message: message || 'Invalid format',
  validator: (value) => {
    if (!value) return true;
    return regex.test(String(value));
  }
});

/**
 * URL validation
 */
export const url = (message?: string): FieldRule => ({
  name: 'url',
  message: message || 'Invalid URL',
  validator: (value) => {
    if (!value) return true;
    try {
      new URL(String(value));
      return true;
    } catch {
      return false;
    }
  }
});

/**
 * Phone number (basic)
 */
export const phone = (message?: string): FieldRule => ({
  name: 'phone',
  message: message || 'Invalid phone number',
  validator: (value) => {
    if (!value) return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(String(value)) && String(value).replace(/\D/g, '').length >= 10;
  }
});

/**
 * Numeric
 */
export const numeric = (message?: string): FieldRule => ({
  name: 'numeric',
  message: message || 'Must be a number',
  validator: (value) => {
    if (!value) return true;
    return !isNaN(Number(value));
  }
});

/**
 * Alpha (only letters)
 */
export const alpha = (message?: string): FieldRule => ({
  name: 'alpha',
  message: message || 'Only letters allowed',
  validator: (value) => {
    if (!value) return true;
    return /^[a-zA-Z]+$/.test(String(value));
  }
});

/**
 * Alphanumeric
 */
export const alphanumeric = (message?: string): FieldRule => ({
  name: 'alphanumeric',
  message: message || 'Only letters and numbers allowed',
  validator: (value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9]+$/.test(String(value));
  }
});

/**
 * Confirmed (password confirmation)
 */
export const confirmed = (fieldToMatch: string, message?: string): FieldRule => ({
  name: 'confirmed',
  message: message || 'Fields do not match',
  validator: (value, formData) => {
    if (!formData) return true;
    return value === formData[fieldToMatch];
  }
});

/**
 * Custom validator
 */
export const custom = (
  fn: (value: any, formData?: any) => boolean | string | Promise<boolean | string>,
  message?: string
): FieldRule => ({
  name: 'custom',
  message,
  validator: fn
});

/**
 * Async validator (örnek: API'den kontrol)
 */
export const asyncUnique = (
  checkFn: (value: any) => Promise<boolean>,
  message?: string
): FieldRule => ({
  name: 'asyncUnique',
  message: message || 'This value is already taken',
  validator: async (value) => {
    if (!value) return true;
    const isUnique = await checkFn(value);
    return isUnique;
  }
});