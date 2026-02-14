import { FieldRule } from "./IFormValidator";

/**
 * Advanced Validation Rules
 */

/**
 * Credit card validation
 */
export const creditCard = (message?: string): FieldRule => ({
  name: 'creditCard',
  message: message || 'Invalid credit card number',
  validator: (value) => {
    if (!value) return true;
    
    const cleaned = String(value).replace(/\D/g, '');
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
});

/**
 * IBAN validation
 */
export const iban = (message?: string): FieldRule => ({
  name: 'iban',
  message: message || 'Invalid IBAN',
  validator: (value) => {
    if (!value) return true;
    
    const iban = String(value).replace(/\s/g, '').toUpperCase();
    
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return false;
    if (iban.length < 15 || iban.length > 34) return false;
    
    // Move first 4 chars to end
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    
    // Convert letters to numbers
    const numeric = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // Mod 97
    let remainder = numeric;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block) % 97) + remainder.slice(9);
    }
    
    return parseInt(remainder) % 97 === 1;
  }
});

/**
 * Strong password
 */
export const strongPassword = (message?: string): FieldRule => ({
  name: 'strongPassword',
  message: message || 'Password must contain uppercase, lowercase, number and special character',
  validator: (value) => {
    if (!value) return true;
    
    const str = String(value);
    const hasUppercase = /[A-Z]/.test(str);
    const hasLowercase = /[a-z]/.test(str);
    const hasNumber = /\d/.test(str);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(str);
    
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }
});

/**
 * Date in future
 */
export const futureDate = (message?: string): FieldRule => ({
  name: 'futureDate',
  message: message || 'Date must be in the future',
  validator: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date > new Date();
  }
});

/**
 * Date in past
 */
export const pastDate = (message?: string): FieldRule => ({
  name: 'pastDate',
  message: message || 'Date must be in the past',
  validator: (value) => {
    if (!value) return true;
    const date = new Date(value);
    return date < new Date();
  }
});

/**
 * Age validation
 */
export const minAge = (age: number, message?: string): FieldRule => ({
  name: 'minAge',
  message: message || `Must be at least ${age} years old`,
  validator: (value) => {
    if (!value) return true;
    
    const birthDate = new Date(value);
    const today = new Date();
    const userAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return userAge - 1 >= age;
    }
    
    return userAge >= age;
  }
});

/**
 * File size validation
 */
export const maxFileSize = (maxSizeMB: number, message?: string): FieldRule => ({
  name: 'maxFileSize',
  message: message || `File size must be less than ${maxSizeMB}MB`,
  validator: (value) => {
    if (!value) return true;
    
    // For File object
    if (value instanceof File) {
      return value.size <= maxSizeMB * 1024 * 1024;
    }
    
    return true;
  }
});

/**
 * File type validation
 */
export const fileType = (allowedTypes: string[], message?: string): FieldRule => ({
  name: 'fileType',
  message: message || `File type must be one of: ${allowedTypes.join(', ')}`,
  validator: (value) => {
    if (!value) return true;
    
    if (value instanceof File) {
      return allowedTypes.some(type => value.type.includes(type));
    }
    
    return true;
  }
});

/**
 * JSON validation
 */
export const jsonString = (message?: string): FieldRule => ({
  name: 'jsonString',
  message: message || 'Invalid JSON format',
  validator: (value) => {
    if (!value) return true;
    
    try {
      JSON.parse(String(value));
      return true;
    } catch {
      return false;
    }
  }
});

/**
 * IPv4 validation
 */
export const ipv4 = (message?: string): FieldRule => ({
  name: 'ipv4',
  message: message || 'Invalid IPv4 address',
  validator: (value) => {
    if (!value) return true;
    
    const ipv4Regex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
    return ipv4Regex.test(String(value));
  }
});

/**
 * MAC address validation
 */
export const macAddress = (message?: string): FieldRule => ({
  name: 'macAddress',
  message: message || 'Invalid MAC address',
  validator: (value) => {
    if (!value) return true;
    
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(String(value));
  }
});