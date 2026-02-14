import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";
import { 
  IConfigValidator, 
  ConfigSchema, 
  ValidationRule, 
  ConfigValidationError 
} from "./IConfigValidator";

/**
 * Config Validator Implementation
 */
export class ConfigValidator implements IConfigValidator {
  
  validate<T = any>(
    config: Record<string, any>,
    schema: ConfigSchema
  ): Result<T> {
    const errors: ConfigValidationError[] = [];
    const validated: any = {};

    // Validate each field in schema
    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = config[fieldName];
      const fieldResult = this.validateField(fieldName, value, rule);

      if (fieldResult.isFailure) {
        errors.push({
          field: fieldName,
          value,
          message: fieldResult.error!
        });
      } else {
        validated[fieldName] = fieldResult.getValue();
      }
    }

    // Check for errors
    if (errors.length > 0) {
      const errorMessages = errors
        .map(e => `${e.field}: ${e.message}`)
        .join(', ');
      return Result.fail(`Config validation failed: ${errorMessages}`);
    }

    return Result.ok<T>(validated as T);
  }

  validateField(
    fieldName: string,
    value: any,
    rule: ValidationRule
  ): Result<any> {
    // Check required
    if (rule.required) {
      const guardResult = Guard.againstNullOrUndefined(value, fieldName);
      if (guardResult.isFailure) {
        // Use default if available
        if (rule.default !== undefined) {
          return Result.ok(rule.default);
        }
        return Result.fail(`${fieldName} is required`);
      }
    }

    // If value is undefined/null and not required, use default
    if ((value === undefined || value === null) && !rule.required) {
      return Result.ok(rule.default);
    }

    // Transform
    let transformedValue = value;
    if (rule.transform) {
      try {
        transformedValue = rule.transform(value);
      } catch (error) {
        return Result.fail(`${fieldName} transform failed: ${error}`);
      }
    }

    // Type validation
    if (rule.type) {
      const typeResult = this.validateType(fieldName, transformedValue, rule.type);
      if (typeResult.isFailure) {
        return typeResult;
      }
      transformedValue = typeResult.getValue();
    }

    // Pattern validation
    if (rule.pattern && typeof transformedValue === 'string') {
      if (!rule.pattern.test(transformedValue)) {
        return Result.fail(`${fieldName} does not match required pattern`);
      }
    }

    // Enum validation
    if (rule.enum && rule.enum.length > 0) {
      if (!rule.enum.includes(transformedValue)) {
        return Result.fail(
          `${fieldName} must be one of: ${rule.enum.join(', ')}`
        );
      }
    }

    // Number range validation
    if (typeof transformedValue === 'number') {
      if (rule.min !== undefined && transformedValue < rule.min) {
        return Result.fail(`${fieldName} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && transformedValue > rule.max) {
        return Result.fail(`${fieldName} must be at most ${rule.max}`);
      }
    }

    // String length validation
    if (typeof transformedValue === 'string') {
      if (rule.minLength !== undefined && transformedValue.length < rule.minLength) {
        return Result.fail(
          `${fieldName} must be at least ${rule.minLength} characters`
        );
      }
      if (rule.maxLength !== undefined && transformedValue.length > rule.maxLength) {
        return Result.fail(
          `${fieldName} must be at most ${rule.maxLength} characters`
        );
      }
    }

    // Custom validator
    if (rule.validator) {
      const validatorResult = rule.validator(transformedValue);
      if (validatorResult === false) {
        return Result.fail(`${fieldName} failed custom validation`);
      }
      if (typeof validatorResult === 'string') {
        return Result.fail(validatorResult);
      }
    }

    return Result.ok(transformedValue);
  }

  validateEnv<T = any>(
    schema: ConfigSchema,
    env: Record<string, string | undefined> = process.env
  ): Result<T> {
    const config: Record<string, any> = {};

    // Extract values from env
    for (const fieldName of Object.keys(schema)) {
      config[fieldName] = env[fieldName];
    }

    return this.validate<T>(config, schema);
  }

  private validateType(
    fieldName: string,
    value: any,
    type: string
  ): Result<any> {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return Result.fail(`${fieldName} must be a string`);
        }
        return Result.ok(value);

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return Result.fail(`${fieldName} must be a number`);
        }
        return Result.ok(num);

      case 'boolean':
        if (typeof value === 'boolean') {
          return Result.ok(value);
        }
        // Parse string to boolean
        const lower = String(value).toLowerCase();
        if (lower === 'true' || lower === '1') {
          return Result.ok(true);
        }
        if (lower === 'false' || lower === '0') {
          return Result.ok(false);
        }
        return Result.fail(`${fieldName} must be a boolean`);

      case 'url':
        try {
          new URL(String(value));
          return Result.ok(String(value));
        } catch {
          return Result.fail(`${fieldName} must be a valid URL`);
        }

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return Result.fail(`${fieldName} must be a valid email`);
        }
        return Result.ok(String(value));

      case 'port':
        const port = Number(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          return Result.fail(`${fieldName} must be a valid port (1-65535)`);
        }
        return Result.ok(port);

      default:
        return Result.ok(value);
    }
  }
}